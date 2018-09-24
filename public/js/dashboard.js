(function ($) {
    function initCurrentTemp(socket) {
        var tempWrapper = $('#temperature-wrapper');

        socket.on('temperature', function (msg) {
            tempWrapper.html('<span class="text-center">' + msg.name + ': ' + msg.temperature + ' &#8451;</span>');
        });
    }

    function initHistoryChart(socket) {
        var data = [];

        historyArea = Morris.Area({
            element: 'temp-history-chart',
            xkey: 'updatedAt',
            ykeys: ['temperature'],
            labels: ['Temp'],
            resize: true,
            data: []
        });

        socket.on('temperature_history', function (msg) {
            console.log('temp history', msg);

            data = uniq(data.concat(msg.data), '_id');
            data.sort(function (a, b) {
                var result = (a.updatedAt < b.updatedAt) ? -1 : (a.updatedAt > b.updatedAt) ? 1 : 0;
                return result * -1;
            });

            // Decrease Size to max of 1000
            data = data.slice(0, 1000);

            historyArea.setData(data);
        });
    }

    function uniq(a, param) {
        return a.filter(function (item, pos, array) {
            return array.map(function (mapItem) { return mapItem[param]; }).indexOf(item[param]) === pos;
        })
    }

    // Init
    $(function () {
        var socket = io();

        initCurrentTemp(socket);
        initHistoryChart(socket);
    });
})(jQuery);