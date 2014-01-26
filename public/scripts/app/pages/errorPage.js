
//noinspection ThisExpressionReferencesGlobalObjectJS
(function (global) {
    'use strict';

    global.app = global.app || {};

    global.app.ErrorPage = app.PageControl({
        defaults: {
            view: 'views/error.tmpl'
        }
    }, {});


}(this));