(function ($) {
    function initSaveDetails() {
        var form = $('#userDetailsForm');

        form.forms({
            onSuccess: function (resp) {
                swal({
                    title: 'Success',
                    text: resp.message,
                    type: 'success',
                    closeOnConfirm: false
                }, function () {
                    window.location.reload(true);
                });
            }
        });
    }

    function initSavePassword() {
        var form = $('#userPasswordForm');
        var errorDiv = form.find('.err-msg');

        form.forms({
            onSuccess: function (resp) {
                swal({
                    title: 'Success',
                    text: resp.message,
                    type: 'success',
                    closeOnConfirm: false
                }, function () {
                    window.location.reload(true);
                });
            }
        });
    }

    // Init
    $(function () {
        initSaveDetails();
        initSavePassword();
    });
})(jQuery);