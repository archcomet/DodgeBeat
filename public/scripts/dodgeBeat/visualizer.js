//noinspection ThisExpressionReferencesGlobalObjectJS
(function (global) {
    'use strict';

    global.DodgeBeat.Visualizer = (function () {

        /**
         * Visualizer
         * Creates a new Visualizer
         * @returns {*}
         * @constructor
         */

        function Visualizer() {
            return Visualizer.alloc(this, arguments);
        }

        Base.inherit(Visualizer);

        /**
         * init
         * @returns {*}
         */

        Visualizer.prototype.init = function () {
            this.mag = {};
            this.kicks = {};
            return this;
        };

        /**
         * update (callback)
         * Called by DodgeBeat on each frame
         * @param t
         */

        Visualizer.prototype.update = function (t) {
            // Base implementation does nothing.
        };

        /**
         * onKick (callback)
         * Called by DodgeBeat when a kick is triggered
         * @param kickName
         * @param on
         * @param mag
         */

        Visualizer.prototype.onKick = function (kickName, on, mag) {
            this.mag[kickName] = mag;
            this.kicks[kickName] = on;
        };

        return Visualizer;

    }());

}(this));
