(function ($) {
    function initWS() {
        var socket = io();
    }

    // Init
    $(function () {
        initWS();
    });
})(jQuery);