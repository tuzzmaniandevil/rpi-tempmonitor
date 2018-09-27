'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _events = require('events');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Sensor = function (_EventEmitter) {
  _inherits(Sensor, _EventEmitter);

  function Sensor(file) {
    var enablePolling = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;

    _classCallCheck(this, Sensor);

    var _this = _possibleConstructorReturn(this, (Sensor.__proto__ || Object.getPrototypeOf(Sensor)).call(this));

    _this.file = file;
    _this.lastTemp = false;

    if (enablePolling) {
      setInterval(function () {
        var newTemp = _this.getTemperature();

        if (_this.lastTemp !== newTemp) {
          _this.lastTemp = newTemp;
          _this.emit('change', newTemp);
        }
      }, 500);
    }
    return _this;
  }

  _createClass(Sensor, [{
    key: 'getTemperature',
    value: function getTemperature() {
      try {
        var data = _fs2.default.readFileSync(this.file, 'utf8');
        var match = data.match(/t=(-?\d+)/);

        if (data.indexOf('YES') !== -1 && match) {
          var temp = parseInt(match[1], 10) / 1000;
          return temp;
        }
      } catch (err) {}

      return false;
    }
  }, {
    key: 'getTemperatureAsync',
    value: function getTemperatureAsync() {
      var _this2 = this;

      return new Promise(function (resolve, reject) {
        _fs2.default.readFile(_this2.file, 'utf8', function (err, data) {
          if (err) {
            reject(err);
            return;
          }
          var match = data.match(/t=(-?\d+)/);

          if (!match) {
            reject(new Error('Unable to parse sensor data'));
            return;
          }
          if (data.indexOf('YES') === -1) {
            reject(new Error('CRC mismatch'));
            return;
          }
          var temp = parseInt(match[1], 10) / 1000;
          resolve(temp);
        });
      });
    }
  }]);

  return Sensor;
}(_events.EventEmitter);

exports.default = Sensor;