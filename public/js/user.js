(function ($) {
    function initSaveDetails() {
        var form = $('#userDetailsForm');
        var errorDiv = form.find('.err-msg');

        form.on('submit', function (e) {
            e.preventDefault();
            e.stopPropagation();

            // Disable buttons
            form.find('button').attr('disabled', true);

            // Reset Errors
            errorDiv.hide();
            errorDiv.empty();

            form.find('.has-error').removeClass('has-error');

            // Submit form :-)
            var datastring = form.serialize();

            $.ajax({
                type: form.attr('method') || 'POST',
                url: form.attr('action') || window.location.pathname,
                dataType: 'JSON',
                data: datastring,
                success: function (resp) {
                    if (resp.status) {
                        form.trigger('reset');

                        swal({
                            title: 'Success',
                            text: resp.message || 'User details successfully updated',
                            type: 'success',
                            closeOnConfirm: false
                        }, function () {
                            window.location.reload(true);
                        });
                    } else {
                        form.find('button').attr('disabled', false);
                        errorDiv.text(resp.message || 'An unknown error occurred');
                        errorDiv.show();

                        if (resp.fields) {
                            for (var i = 0; i < resp.fields.length; i++) {
                                var field = resp.fields[i];

                                form.find('input[name=' + field + ']').closest('.form-group').addClass('has-error');
                            }
                        }
                    }
                },
                error: function () {
                    form.find('button').attr('disabled', false);
                }
            });

            return false;
        });
    }

    function initSavePassword() {
        var form = $('#userPasswordForm');
        var errorDiv = form.find('.err-msg');

        form.on('submit', function (e) {
            e.preventDefault();
            e.stopPropagation();

            // Disable buttons
            form.find('button').attr('disabled', true);

            // Reset Errors
            errorDiv.hide();
            errorDiv.empty();

            form.find('.has-error').removeClass('has-error');

            var password = form.find('input[name=password]');
            var passwordConf = form.find('input[name=password_conf]');

            var p = password.val();
            var p2 = passwordConf.val();

            if (p != p2) {
                errorDiv.text('Passwords do not match');
                errorDiv.show();
                passwordConf.closest('.form-group').addClass('has-error');
                passwordConf.focus();

                form.find('button').attr('disabled', false);
            } else {
                // Submit form :-)
                var datastring = form.serialize();

                $.ajax({
                    type: form.attr('method') || 'POST',
                    url: form.attr('action') || window.location.pathname,
                    dataType: 'JSON',
                    data: datastring,
                    success: function (resp) {
                        if (resp.status) {
                            form.trigger('reset');

                            swal({
                                title: 'Success',
                                text: resp.message || 'User password successfully updated',
                                type: 'success',
                                closeOnConfirm: false
                            }, function () {
                                window.location.reload(true);
                            });
                        } else {
                            form.find('button').attr('disabled', false);
                            errorDiv.text(resp.message || 'An unknown error occurred');
                            errorDiv.show();

                            if (resp.fields) {
                                for (var i = 0; i < resp.fields.length; i++) {
                                    var field = resp.fields[i];

                                    form.find('input[name=' + field + ']').closest('.form-group').addClass('has-error');
                                }
                            }
                        }
                    },
                    error: function () {
                        form.find('button').attr('disabled', false);
                    }
                });
            }

            return false;
        });
    }

    // Init
    $(function () {
        initSaveDetails();
        initSavePassword();
    });
})(jQuery);