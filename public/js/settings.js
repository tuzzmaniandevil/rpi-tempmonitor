(function ($) {
    // Init Temperature Setpoints
    function initTemperatureSetpoints() {
        var form = $('#temperatureSetpointsForm');

        // Form Submit
        form.forms({
            onSuccess: function () {
                form.forms('reset');

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

    // Init Sensors
    function initSensors() {
        var modal = $('#editSensorModal');
        var form = modal.find('form');
        var errorDiv = form.find('.err-msg');

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
                        modal.modal('hide');

                        swal({
                            title: 'Success',
                            text: resp.message || 'Sensor details successfully updated',
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

    // Init
    $(function () {
        initSensors();
        initTemperatureSetpoints();
    });
})(jQuery);