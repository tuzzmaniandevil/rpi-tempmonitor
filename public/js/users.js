(function ($) {
    function initAddUser() {
        console.log('initAddUser');

        var modal = $('#addUserModal');
        var form = modal.find('form');
        var errorDiv = modal.find('.err-msg');

        // On modal close
        modal.on('hidden.bs.modal', function () {
            form.trigger('reset');

            // Reset Errors
            errorDiv.hide();
            errorDiv.empty();

            form.find('.has-error').removeClass('has-error');
        });

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
                            modal.modal('hide');

                            swal({
                                title: 'Success',
                                text: resp.message || 'User has successfully been added',
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

    function initDelUser() {
        $('body').on('click', '.btn-del-user', function (e) {
            e.preventDefault();

            var btn = $(this);
            var row = btn.closest('tr');
            var userId = row.data('userid');

            swal({
                title: "Are you sure?",
                text: "Your will not be able to recover this user!",
                type: "warning",
                showCancelButton: true,
                confirmButtonClass: "btn-danger",
                confirmButtonText: "Yes",
                closeOnConfirm: false,
                showLoaderOnConfirm: true
            },
                function () {
                    $.ajax({
                        type: 'DELETE',
                        url: '/users/' + userId,
                        dataType: 'JSON',
                        success: function (resp) {
                            if (resp.status) {
                                swal({
                                    title: 'Success',
                                    text: resp.message || 'User has successfully been deleted',
                                    type: 'success',
                                    closeOnConfirm: false
                                }, function () {
                                    window.location.reload(true);
                                });
                            } else {
                                swal("Oh No!", resp.message || "An unknown error occurred", "wanrning");
                            }
                        },
                        error: function () {
                            swal("Oh No!", "An unknown error occurred", "wanrning");
                        }
                    });
                });
        });
    }

    // Init
    $(function () {
        initAddUser();
        initDelUser();
    });
})(jQuery);