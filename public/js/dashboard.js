(function ($) {
    function initCurrentTemp(socket) {
        var tempWrapper = $('#temperature-wrapper');

        socket.on('temperature', function (msg) {
            tempWrapper.html('<span class="text-center">' + msg.name + ': ' + msg.temperature + ' &#8451;</span>');
        });
    }

    function initHistoryChart(socket) {
        historyArea = Morris.Area({
            element: 'temp-history-chart',
            data: []
        });

        socket.on('temperature_history', function (msg) {
            console.log('temp history', data);

            var newData = [].concat(msg.data);


        });

        // Morris.Area({
        //     element: 'temp-history-chart',
        //     xkey: 'timestamp',
        //     ykeys: ['iphone', 'ipad', 'itouch'],
        //     labels: ['iPhone', 'iPad', 'iPod Touch'],
        //     pointSize: 2,
        //     hideHover: 'auto',
        //     resize: true
        // });
    }

    // Init
    $(function () {
        var socket = io();

        initCurrentTemp(socket);
        initHistoryChart(socket);
    });
})(jQuery);