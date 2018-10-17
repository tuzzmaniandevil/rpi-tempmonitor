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

                        // Check phoneNumber
                        if (d.phoneNumber && libphonenumber.isValidNumber(d.phoneNumber)) {
                            var parsedPhoneNumber = libphonenumber.parseNumber(d.phoneNumber);

                            modal.find('[name="phoneNumber"]').val(parsedPhoneNumber.phone).change();
                            modal.find('[name="phoneNumber-region"]').val(parsedPhoneNumber.country).change();
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