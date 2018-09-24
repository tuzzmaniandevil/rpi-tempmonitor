(function ($) {
    function Forms(element, options) {
        var $this = this;

        $this.$elem = $(element);
        $this.$options = $.extend({}, $.fn.forms.defaults, options);

        $this.$errorDiv = $this.$elem.find('.err-msg');
        if ($this.$errorDiv.length < 1) {
            $this.$errorDiv = $($this.$options.errorDivTemplate);
            $this.$elem.prepend($this.$errorDiv);
        }
    }

    Forms.prototype.reset = function () {
        var $this = this;

        $this.$elem.trigger('reset');
        $this.resetValidation.call($this);
    };

    Forms.prototype.resetValidation = function () {
        var $this = this;

        $this.$errorDiv.hide();
        $this.$errorDiv.empty();

        $this.$elem.find('.has-error').removeClass('has-error');
    };

    Forms.prototype.enable = function () {
        var $this = this;

        $this.$elem.find('button').attr('disabled', false);
        $this.$elem.find('input, select, textarea').prop('readonly', false);
    };

    Forms.prototype.disable = function () {
        var $this = this;

        $this.$elem.find('button').attr('disabled', true);
        $this.$elem.find('input, select, textarea').prop('readonly', true);
    };

    Forms.prototype._INTERNAL = {
        init: function () {
            var $this = this;

            $this.$elem
                .off('submit')
                .on('submit', function (e) {
                    e.preventDefault();
                    e.stopPropagation();

                    $this.resetValidation.call($this);

                    $this._INTERNAL.postForm.call($this);

                    return false;
                });
        },
        postForm: function () {
            var $this = this;

            // Serialize Form
            var isMultipart = false;
            var enc = $this.$elem.attr('enctype');
            var data;
            if (/.*multipart\/form-data.*/gmi.test(enc)) {
                data = $this.$elem.serializeWithFiles();
                isMultipart = true;
            } else {
                data = $this.$elem.serialize();
            }

            // Get URL
            var url = $this.$elem.attr('action') || window.location.pathname;

            // Get method type
            var methodType = $this.$elem.attr('method') || 'POST';

            $this.disable.call($this);

            var ajaxOpts = {
                type: methodType,
                url: url,
                data: data,
                dataType: 'JSON',
                success: function (resp) {
                    $this.enable.call($this);

                    if (resp && resp.status) {
                        if ($.isFunction($this.$options.onSuccess)) {
                            $this.$options.onSuccess.call($this, resp);
                        }
                    } else {
                        if ($.isFunction($this.$options.onFail)) {
                            $this.$options.onFail.call($this, resp);
                        }
                    }
                },
                error: function (jqXHR, textStatus, errorThrown) {
                    $this.enable.call($this);

                    if ($.isFunction($this.$options.onError)) {
                        $this.$options.onError.call($this, jqXHR, textStatus, errorThrown);
                    }
                },
                beforeSend: function (xhr, options) {
                    options.data = data;

                    /**
                     * You can use https://github.com/francois2metz/html5-formdata for a fake FormData object
                     * Only work with Firefox 3.6
                     */
                    if (data.fake) {
                        xhr.setRequestHeader('Content-Type', 'multipart/form-data; boundary=' + data.boundary);
                        // with fake FormData object, we must use sendAsBinary
                        xhr.send = function (data) {
                            xhr.sendAsBinary(data.toString());
                        }
                    }
                }
            };

            if (isMultipart) {
                ajaxOpts.processData = false;
                ajaxOpts.contentType = false;
            }

            if ($.isFunction($this.$options.onProgress)) {
                ajaxOpts.xhr = function () {
                    var xhr = new window.XMLHttpRequest();
                    //Upload progress
                    xhr.upload.addEventListener("progress", function (evt) {
                        if (evt.lengthComputable) {
                            var percentComplete = (evt.loaded / evt.total) * 100;
                            $this.$options.onProgress.call($this, percentComplete);
                        }
                    }, false);
                    return xhr;
                };
            }

            $.ajax(ajaxOpts);
        }
    };

    $.fn.forms = function (options) {
        if (typeof options === 'string' && this.data('__forms')) {
            var data = this.data('__forms');
            var optionalArgs = Array.prototype.slice.call(arguments, 1);
            return data[options].apply(data, optionalArgs);
        }

        return this.each(function () {
            var $this = $(this),
                data = $this.data('__forms');

            if (!data) {
                $this.data('__forms', (data = new Forms(this, options)));
                data = $this.data('__forms');
                data._INTERNAL.init.call(data);
            }

            if (typeof options === 'string' && typeof data[options] === 'function') {
                var optionalArgs = Array.prototype.slice.call(arguments, 1);
                return data[options].apply(data, optionalArgs);
            }

            return $this;
        });
    };

    $.fn.forms.defaults = {
        errorDivTemplate: '<div class="alert alert-danger err-msg" role="alert" style="display: none;"></div>',
        onSuccess: function (resp) { },
        onFail: function (resp) {
            $this.$errorDiv.text(resp.message || 'An unknown error occurred');
            $this.$errorDiv.show();

            if (resp.fields) {
                for (var i = 0; i < resp.fields.length; i++) {
                    var field = resp.fields[i];

                    $this.$elem.find('input[name=' + field + ']').closest('.form-group').addClass('has-error');
                }
            }
        },
        onError: function (jqXHR, textStatus, errorThrown) { },
        onProgress: function (percentComplete) { }
    };
}(jQuery));

// http://stackoverflow.com/questions/5392344/sending-multipart-formdata-with-jquery-ajax
(function ($) {
    $.fn.serializeWithFiles = function () {
        var form = $(this);

        flog('[jquery.forms] Initializing serializeWithFiles...', form);

        // ADD FILE TO PARAM AJAX
        var formData = new FormData()
        form.find('input[type=file]').each(function (index, input) {
            $.each(input.files, function (i, file) {
                formData.append(input.name, file);
            });
        });

        var params = form.serializeArray();
        $.each(params, function (i, val) {
            formData.append(val.name, val.value);
        });

        return formData;
    };

})(jQuery);

/**
 * Emulate FormData for some browsers
 * MIT License
 * (c) 2010 François de Metz
 */
(function (w) {
    if (w.FormData)
        return;
    function FormData() {
        this.fake = true;
        this.boundary = "--------FormData" + Math.random();
        this._fields = [];
    }
    FormData.prototype.append = function (key, value) {
        this._fields.push([key, value]);
    }
    FormData.prototype.toString = function () {
        var boundary = this.boundary;
        var body = "";
        this._fields.forEach(function (field) {
            body += "--" + boundary + "\r\n";
            // file upload
            if (field[1].name) {
                var file = field[1];
                body += "Content-Disposition: form-data; name=\"" + field[0] + "\"; filename=\"" + file.name + "\"\r\n";
                body += "Content-Type: " + file.type + "\r\n\r\n";
                body += file.getAsBinary() + "\r\n";
            } else {
                body += "Content-Disposition: form-data; name=\"" + field[0] + "\";\r\n\r\n";
                body += field[1] + "\r\n";
            }
        });
        body += "--" + boundary + "--";
        return body;
    }
    w.FormData = FormData;
})(window);