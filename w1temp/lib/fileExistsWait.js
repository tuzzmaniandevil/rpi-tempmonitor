'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = fileExistsWait;

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function fileExistsWait(file) {
  var maxMsWait = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 20000;

  return new Promise(function (resolve, reject) {
    var endTime = +new Date() + maxMsWait;

    var check = function check() {
      _fs2.default.stat(file, function (err, stats) {
        if (stats && stats.isFile()) {
          resolve();
        } else if (err && err.code === 'ENOENT' && endTime > +new Date()) {
          setTimeout(check, 1000);
        } else {
          reject();
        }
      });
    };

    check();
  });
}