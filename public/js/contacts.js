(function ($) {
    function initAddContact() {
        var modal = $('#addContactModal');
        var errorDiv = modal.find('.err-msg');
        var form = modal.find('form');

        // On modal close
        modal.on('hidden.bs.modal', function () {
            form.trigger('reset');

            // Reset Errors
            errorDiv.hide();
            errorDiv.empty();

            form.find('.has-error').removeClass('has-error');
        });

        // On Form Submit
        form.forms({
            onSuccess: function (resp) {
                form.forms('reset');
                modal.modal('hide');

                swal({
                    title: 'Success',
                    text: resp.message || 'Contact has successfully been added',
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
        initAddContact();
    });
})(jQuery);