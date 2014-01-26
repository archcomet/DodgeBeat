
//noinspection ThisExpressionReferencesGlobalObjectJS
(function (global) {
    'use strict';

    global.app = global.app || {};

    global.app.SelectionControl = can.Control({
        init: function (element, options) {
            this.view = can.view('views/selection.tmpl', options.track);
            this.element.hide().html(this.view).fadeIn();
        },

        'button.start click': function (elem) {

        }

    });

}(this));