(function ($) {
    // Init Sensors
    function initSensors() {
        var modal = $('#editSensorModal');
        var form = modal.find('form');

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
            form.find('[name="enabled"]').val(enabled).change();

            modal.modal('show');
        });
    }

    // Init
    $(function () {
        initSensors();
    });
})(jQuery);