
//noinspection ThisExpressionReferencesGlobalObjectJS
(function (global) {
    'use strict';

    global.app = global.app || {};

    global.app.ErrorControl = can.Control({
        init: function (element, options) {
            this.view = can.view('views/error.tmpl', {
                error: options.error
            });
            this.element.hide().html(this.view).fadeIn();
        }
    });

}(this));