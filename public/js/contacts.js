(function ($) {
    function initContacts() {
        var modal = $('#addContactModal');
        var form = modal.find('form');

        // On modal close
        modal.on('hidden.bs.modal', function () {
            form.forms('reset');

            // Reset back to normal values
            modal.find('#addContactModalLabel').text('Add Contact');
            form.attr('action', form.data('default-action'));
            modal.find('.btn-submit').text('Create');
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

        // Edit Contact
        $('body').on('click', '.btn-edit-contact', function (e) {
            e.preventDefault();

            var btn = $(this);
            var row = btn.closest('tr');
            var contactid = row.data('contactid');

            $.ajax({
                url: '/contacts/' + contactid,
                type: 'GET',
                dataType: 'JSON',
                success: function (resp) {
                    if (resp.status) {
                        modal.find('#addContactModalLabel').text('Update Contact');
                        form.attr('action', form.data('default-action') + '/' + contactid);
                        modal.find('.btn-submit').text('Save');

                        var d = resp.data;

                        modal.find('[name="firstName"]').val(d.firstName).change();
                        modal.find('[name="lastName"]').val(d.lastName).change();

                        // Check mobile
                        if (d.mobile && libphonenumber.isValidNumber(d.mobile)) {
                            var parsedMobile = libphonenumber.parseNumber(d.mobile);

                            modal.find('[name="mobile"]').val(parsedMobile.phone).change();
                            modal.find('[name="mobile-region"]').val(parsedMobile.country).change();
                        }

                        // Check landline
                        if (d.landline && libphonenumber.isValidNumber(d.landline)) {
                            var parsedLandline = libphonenumber.parseNumber(d.landline);

                            modal.find('[name="landline"]').val(parsedLandline.phone).change();
                            modal.find('[name="landline-region"]').val(parsedLandline.country).change();
                        }

                        modal.modal('show');
                    } else {
                        swal("Oh No!", resp.message || 'Something went wrong!', "error");
                    }
                },
                error: function () {
                    swal("Oh No!", "Something went wrong!", "error");
                }
            });
        });

        // Delete Contact
        $('body').on('click', '.btn-del-contact', function (e) {
            e.preventDefault();

            var btn = $(this);
            var row = btn.closest('tr');
            var contactid = row.data('contactid');

            swal({
                title: 'Warning',
                text: 'Are you sure you want to delete this contact?',
                type: 'warning',
                showCancelButton: true,
                closeOnConfirm: false,
                showLoaderOnConfirm: true
            }, function () {
                $.ajax({
                    url: '/contacts/' + contactid,
                    type: 'DELETE',
                    dataType: 'JSON',
                    success: function (resp) {
                        console.log('Resp', resp);
                        if (resp.status) {
                            row.remove();
                            swal({
                                title: 'Success',
                                text: resp.message,
                                type: 'success'
                            });
                        } else {
                            swal("Oh No!", resp.message || 'Something went wrong!', "error");
                        }
                    },
                    error: function () {
                        swal("Oh No!", "Something went wrong!", "error");
                    }
                });
            });
        });
    }

    // Init
    $(function () {
        initContacts();
    });
})(jQuery);