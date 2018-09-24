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
            resize: true,
            data: []
        });

        socket.on('temperature_history', function (msg) {
            console.log('temp history', msg);

            data = data.concat(msg.data);
            data.sort(function (a, b) {
                return (a.updatedAt < b.updatedAt) ? -1 : (a.updatedAt > b.updatedAt) ? 1 : 0;
            });

            console.log('New Data', data);

            historyArea.setData(data);
        });
    }

    // Init
    $(function () {
        var socket = io();

        initCurrentTemp(socket);
        initHistoryChart(socket);
    });
})(jQuery);