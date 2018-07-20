const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        unique: true,
        required: true,
        trim: true,
        lowercase: true,
        index: true
    },
    firstName: {
        type: String,
        required: true,
        trim: true
    },
    lastName: {
        type: String,
        required: false,
        trim: true
    },
    password_hash: {
        type: String,
        required: true,
    },
    roles: [String]
}, {
        timestamps: true
    });

UserSchema.virtual('password')
    .get(function () {
        return this.__password;
    })
    .set(function (v) {
        this.__password = v;
    });

UserSchema.statics.authenticate = function (username, password, callback) {
    if (typeof username === 'string') {
        username = username.toLowerCase();
    }

    User.findOne({ username: username })
        .exec(function (err, user) {
            if (err) {
                return callback(err)
            } else if (!user) {
                var err = new Error('User not found.');
                err.status = 401;
                return callback(null, false, { message: 'Incorrect username or password.' });
            }
            bcrypt.compare(password, user.password_hash, function (err, result) {
                if (result === true) {
                    return callback(null, user);
                } else {
                    return callback(null, false, { message: 'Incorrect username or password.' });
                }
            })
        });
}

//hashing a password before saving it to the database
UserSchema.pre('validate', function (next) {
    var user = this;

    if (typeof user.password === 'string') {
        bcrypt.hash(user.password, 10, function (err, hash) {
            if (err) {
                return next(err);
            }
            user.password_hash = hash;
            console.log('New password', user.password);
            next();
        })
    }
});

const User = mongoose.model('User', UserSchema);

module.exports = User;