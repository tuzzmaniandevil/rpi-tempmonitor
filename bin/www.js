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

var db = require('./db');

var appFunc = require('../app');
var http = require('http');
var tempSensors = require('./tempMonitor');
var TemperatureLog = require('../schemas/temperature');

var server, app, io;

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
    var port = normalizePort(process.env.PORT || '3000');
    app.set('port', port);

    /**
     * Create HTTP server.
     */
    server = http.createServer(app);

    /**
     * Create Websocket server.
     */
    io = require('socket.io')(server);

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
  }
});

/**
 * Normalize a port into a number, string, or false.
 */

function normalizePort(val) {
  var port = parseInt(val, 10);

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

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening() {
  var addr = server.address();
  var bind = typeof addr === 'string'
    ? 'pipe ' + addr
    : 'port ' + addr.port;
  console.log('Listening on ' + bind);
}

/**
 * Temp Sensor
 */

var temSensor = new tempSensors();

temSensor.on('change', (id, temp) => {
  console.log('Temp change', id, temp);

  // Log temperature into DB
  TemperatureLog.create({
    temperature: temp,
    deviceId: id
  }, (err, tempLog) => {
    if (err) {
      console.error('Error storing TemperatureLog', err);
    } else {
      // process temperature to see if we need to send any alerts
    }
  });
});

temSensor.start().catch(err => {
  console.error('Error starting temperature sensor', err);
  process.exit(1)
});