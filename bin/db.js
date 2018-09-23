const mongoose = require('mongoose');
var User = require('../schemas/user');

var state = {
    db: null,
}

exports.connect = function (config, done) {
    if (state.db) return done()

    var url = 'mongodb://';

    if (typeof config !== 'object') {
        config = {};
    }

    url += config.host || 'localhost';
    url += ':' + config.port || '27017';
    url += '/' + config.dbName || '';

    var dbConfig = { useNewUrlParser: true };

    if (config.username) {
        dbConfig.user = config.username;
    }

    if (config.password) {
        dbConfig.pass = config.password;
    }

    if (config.authdb) {
        dbConfig.auth = {
            authdb: config.authdb
        };
    }

    mongoose.connect(url, dbConfig).then(
        () => {
            // Make sure at least one use exists
            User.countDocuments({}, function (err, count) {
                if (err) {
                    console.log('Error', err);
                    done(err);
                } else {
                    state.db = mongoose.connection;
                    console.log('There are %d users', count);
                    if (count < 1) {
                        User.create({
                            username: 'admin',
                            firstName: 'Admin',
                            password: 'password8',
                            roles: ['ADMIN']
                        }, function (err, user) {
                            if (err) {
                                console.log('Error creating default user', err);
                                done(err);
                            } else {
                                done()
                            }
                        });
                    } else {
                        done();
                    }
                }
            });
        },
        err => {
            console.log('Error connecting to DB', err);
            done(err);
        }
    ).catch((err) => {
        console.log('Error connecting to DB', err);
        done(err);
    });
}

exports.get = function () {
    return state.db
}

exports.close = function (done) {
    if (state.db) {
        state.db.close(function (err, result) {
            state.db = null
            state.mode = null
            done(err)
        })
    }
}