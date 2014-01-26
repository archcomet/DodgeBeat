//noinspection ThisExpressionReferencesGlobalObjectJS
(function(global){
    'use strict';

    global.TestCasePrototype = function () {
        return {
            setUp: function () {
            },

            tearDown: function () {
                if (jstestdriver.assertCount === 0) {
                    fail('Test must have at least one asserts');
                }
            }
        };
    };

}(window));