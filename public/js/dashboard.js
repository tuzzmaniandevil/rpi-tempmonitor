(function ($) {
    function initWS() {
        var tempWrapper = $('#temperature-wrapper');

        var socket = io();

        socket.on('temperature', function (msg) {
            tempWrapper.html('<span class="text-center">' + msg.id + ' = ' + msg.temperature + ' &#8451;</span>');
        });
    }

    // Init
    $(function () {
        initWS();
    });
})(jQuery);