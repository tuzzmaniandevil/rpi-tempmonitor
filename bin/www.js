#!/usr/bin/env node

/**
 * Config
 */
const mongoHost = process.env.MONGO_DB_HOST || 'localhost';
const mongoPort = normalizePort(process.env.MONGO_DB_PORT || 27017);
const mongoDbName = process.env.MONGO_DB_NAME || 'tempmonitor';
const mongoDbAuthDB = process.env.MONGO_DB_AUTHDB || 'admin';
const mongoDbUsername = process.env.MONGO_DB_USERNAME || 'root';
const mongoDbPassword = process.env.MONGO_DB_PASSWORD || 'example';

/**
 * Module dependencies.
 */

const db = require('./db');

const GlobalEvents = require('./GlobalEvents');
const globalEvents = GlobalEvents.get();
const appFunc = require('../app');
const http = require('http');
const tempSensors = require('./tempMonitor');
const Settings = require('../schemas/settings');
const TemperatureLog = require('../schemas/temperature');

/* Managers */
const socketioManager = require('../managers/socketioManager');
const temperatureManager = require('../managers/temperatureManager');

var server, app, io, port;

/**
 * First connect to DB then start web-server if DB connection was successful
 */

db.connect({
  host: mongoHost,
  port: mongoPort,
  dbName: mongoDbName,
  username: mongoDbUsername,
  password: mongoDbPassword,
  authdb: mongoDbAuthDB
}, function (err) {
  if (err) {
    // Eeek!!! Run!
    console.error('Unable to connect to Mongo.', err)
    process.exit(1);
  } else {
    // Start our server!
    var connection = db.get();
    app = appFunc(connection);

    /**
     * Get port from environment and store in Express.
     */
    port = normalizePort(process.env.PORT || '3000');
    app.set('port', port);

    /**
     * Create HTTP server.
     */
    server = http.createServer(app);

    /**
     * Create Websocket server.
     */
    io = require('socket.io')(server);
    io.on('connection', function (socket) {
      // Get Settings
      Settings.getOrCreateSettings((err, settings) => {
        if (err) {
          console.error('Error getting settings', err);
        } else {
          // Get latest temp readings for ID
          if (app.locals.sensors && app.locals.sensors.length > 0) {

            app.locals.sensors.forEach(sensorid => {
              // Get Sensor Setting
              var sensorSetting = settings.findSensorSetting(sensorid);

              if (sensorSetting && sensorSetting.enabled) {
                // Get Latest Record
                TemperatureLog.findLatestByDevice(sensorid, (err, log) => {
                  if (err) {
                    console.error('Error getting latest log for ' + sensorid, err);
                  } else if (log) {
                    socket.emit('temperature', {
                      id: sensorid,
                      name: sensorSetting.name || sensorid,
                      temperature: log.temperature
                    });
                  }
                });

                // Get History
                TemperatureLog.findHistoryByDevice(sensorid, 500, (err, logs) => {
                  if (err) {
                    console.error('Error getting logs for ' + sensorid, err);
                  } else {
                    socket.emit('temperature_history', { data: logs });
                  }
                });
              }
            });
          } else {
            socket.emit('temperature_history', { data: [] });
          }
        }
      });
    });

    /**
     * Listen on provided port, on all network interfaces.
     */
    server.on('error', onError);
    server.on('listening', () => {
      var addr = server.address();
      var bind = typeof addr === 'string'
        ? 'pipe ' + addr
        : 'port ' + addr.port;
      console.log('Listening on ' + bind);
    });

    server.listen(port);

    /**
     * Temp Sensor
     */
    var temSensor = new tempSensors();

    temSensor.on('change', (id, temp) => {
      globalEvents.emit('tempChange', id, temp);
    });

    temSensor
      .start()
      .then((ids) => {
        console.log('Sensor IDS', ids);
        app.locals.sensors = ids;
      })
      .catch(err => {
        console.error('Error starting temperature sensor', err);
        process.exit(1)
      });

    /**
     * Start Dependencies
     */
    socketioManager.start(io);
    temperatureManager.start();
  }
});

/**
 * Normalize a port into a number, string, or false.
 */

function normalizePort(val) {
  let port = parseInt(val, 10);

  if (isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
}

/**
 * Event listener for HTTP server "error" event.
 */

function onError(error) {
  if (error.syscall !== 'listen') {
    throw error;
  }

  var bind = typeof port === 'string'
    ? 'Pipe ' + port
    : 'Port ' + port;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(bind + ' is already in use');
      process.exit(1);
      break;
    default:
      throw error;
  }
}