(function ($) {
    // Init Temperature Setpoints
    function initTemperatureSetpoints() {
        var form = $('#temperatureSetpointsForm');

        // Form Submit
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

        // High temp selector
        var highTempAlarmEnabled = form.find('[name="highTempAlarmEnabled"]');
        var highTempAlarm = form.find('[name="highTempAlarm"]');

        highTempAlarmEnabled.on('change', function () {
            var val = highTempAlarmEnabled.val();
            var enabled = val == 'true';
            highTempAlarm.prop('disabled', !enabled);
        });
        highTempAlarmEnabled.change();

        // Low temp selector
        var lowTempAlarmEnabled = form.find('[name="lowTempAlarmEnabled"]');
        var lowTempAlarm = form.find('[name="lowTempAlarm"]');

        lowTempAlarmEnabled.on('change', function () {
            var val = lowTempAlarmEnabled.val();
            var enabled = val == 'true';
            lowTempAlarm.prop('disabled', !enabled);
        });
        lowTempAlarmEnabled.change();
    }

    // Init Message Templates
    function initMessageTemplates() {
        var form = $('#messageTemplatesForm');
        var smsTemplateInp = form.find('textarea[name="smsTemplate"]');
        var voiceTemplateInp = form.find('textarea[name="voiceTemplate"]');

        // Form Submit
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

        // SMS Template Limit
        smsTemplateInp.maxlength({
            alwaysShow: true,
            allowOverMax: true,
            customMaxAttribute: '160',
            placement: 'bottom-right'
        });

        // Voice Template Limit
        voiceTemplateInp.maxlength({
            alwaysShow: true,
            allowOverMax: true,
            customMaxAttribute: '300',
            placement: 'bottom-right'
        });
    }

    // Init Sensors
    function initSensors() {
        var modal = $('#editSensorModal');
        var form = modal.find('form');

        // Click Handler
        $('body').on('click', '.btn-edit-sensor', function (e) {
            e.preventDefault();

            var btn = $(this);
            var row = btn.closest('tr');

            var id = row.data('sensorid');
            var name = row.data('name');
            var enabled = row.data('enabled');

            // Populate fields
            form.find('[name="sensorid"]').val(id);
            form.find('[name="sensorid-display"]').val(id);

            form.find('[name="name"]').val(name);
            form.find('[name="enabled"]').val(enabled ? 'true' : 'false').change();

            modal.modal('show');
        });

        // Form submit Handler
        form.forms({
            onSuccess: function (resp) {
                form.trigger('reset');
                modal.modal('hide');

                swal({
                    title: 'Success',
                    text: resp.message || 'Sensor details successfully updated',
                    type: 'success',
                    closeOnConfirm: false
                }, function () {
                    window.location.reload(true);
                });
            }
        });

        modal.on('hidden.bs.modal', function () {
            form.forms('reset');
        });
    }

    // Init Clicksend Settings
    function initClicksendSettings() {
        var form = $('#clicksendForm');

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

    // Init Notification Settings
    function initNotificationSettings() {
        var modal = $('#addNotificationModal');
        var form = modal.find('form');

        form.forms({
            onSuccess: function (resp) {
                modal.modal('hide');

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

        modal.on('hidden.bs.modal', function () {
            form.forms('reset');

            // Reset back to normal values
            modal.find('#addNotificationModalLabel').text('Add Notification');
            form.attr('action', form.data('default-action'));
            modal.find('.btn-submit').text('Create');
        });

        // Init Edit Button
        $('body').on('click', '.btn-edit-notification', function (e) {
            e.preventDefault();

            var btn = $(this);
            var row = btn.closest('tr');
            var id = row.data('notificationid');

            $.ajax({
                url: '/settings/notifications/' + id,
                type: 'GET',
                dataType: 'JSON',
                success: function (resp) {
                    if (resp.status) {
                        modal.find('#addNotificationModalLabel').text('Update Notification');
                        form.attr('action', form.data('default-action') + '/' + id);
                        modal.find('.btn-submit').text('Save');

                        var d = resp.data;

                        modal.find('[name="contact"]').val(d.contact).change();
                        modal.find('[name="highNotification"]').val(d.highNotification).change();
                        modal.find('[name="lowNotification"]').val(d.lowNotification).change();
                        modal.find('[name="timeBetween"]').val(d.timeBetween).change();

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

        // Init Delete Button
        $('body').on('click', '.btn-delete-notification', function (e) {
            e.preventDefault();

            var btn = $(this);
            var row = btn.closest('tr');
            var id = row.data('notificationid');

            swal({
                title: 'Warning',
                text: 'Are you sure you want to delete this notification?',
                type: 'warning',
                showCancelButton: true,
                closeOnConfirm: false,
                showLoaderOnConfirm: true
            }, function () {
                $.ajax({
                    url: '/settings/notifications/' + id,
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
        initSensors();
        initTemperatureSetpoints();
        initMessageTemplates();
        initClicksendSettings();
        initNotificationSettings();
    });
})(jQuery);