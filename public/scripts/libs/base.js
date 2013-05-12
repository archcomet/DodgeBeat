//noinspection ThisExpressionReferencesGlobalObjectJS
(function (global) {
    'use strict';

    // Object.create polyfill for older browsers to make them more ES5 like
    if (!Object.create) {
        /**
         * @see https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Object/create/
         */
        Object.create = function (o) {
            if (arguments.length > 1) {
                throw new Error('Object.create implementation only accepts the first parameter.');
            }
            function F() {}
            F.prototype = o;
            return new F();
        };
    }

    global.Base = (function () {

        /**
         * Base Constructor
         * @returns {Function|*|Function|Function|Function|Function}
         * @constructor
         */

        function Base() {
            if (!(this instanceof Base)) {
                throw 'Constructor called without using keyword new.';
            }
            return this.init.apply(this, arguments);
        }

        /**
         * init
         * Function that is called by the Base constructor.
         * Intended to be overridden.
         * @returns {*}
         */

        Base.prototype.init = function () {
            // Not implemented in base
        };

        /**
         * deinit
         * Function that is called at the start of dispose.
         * Intended to be overridden.
         */

        Base.prototype.deinit = function () {
            // Not implemented in base
        };

        /**
         * dispose
         * Sets all properties to null to allow garbage collection.
         * @returns {*}
         */

        Base.prototype.dispose = function () {
            var property;
            this.deinit();
            for (property in this) {
                if (this.hasOwnProperty(property)) {
                    this[property] = null;
                }
            }
            return this;
        };

        /**
         * inherit
         * Creates prototype chain between parent and target.
         * Parent must be an instance of Base constructor.
         * If parent is not specified, Base will be the parent.
         * @param target
         * @param [parent]
         * @returns {*}
         */

        Base.inherit = function (target, parent) {
            if (parent === undefined) {
                parent = Base;
            }

            target.prototype = Object.create(parent.prototype);
            target.prototype.constructor = target;
            target.parent = parent.prototype;

            target.alloc = function (thisArg, argArray) {
                return parent.prototype.constructor.apply(thisArg, argArray);
            };

            target.inherit = function (child) {
                return Base.inherit(child, target);
            };

            return target;
        };

        /**
         * Checks that object is inherited from Base or a Base object.
         * @param obj
         * @returns {boolean}
         */

        Base.instanceofBase = function (obj) {
            return (obj instanceof Base);
        };

        /**
         * isFunction
         * Checks that the object is a function object.
         * @param obj
         * @returns {*|boolean}
         */

        Base.isFunction = function (obj) {
            return obj && Object.prototype.toString.call(obj) === '[object Function]';
        };

        /**
         * isString
         * Checks that the object is a string.
         * @param obj
         * @returns {boolean}
         */

        Base.isString = function (obj) {
            return obj && Object.prototype.toString.call(obj) === '[object String]';
        };

        /**
         * disposeAll
         * Calls dispose on all objects in an array or hash,
         * and removes all references from the collection.
         * @param objects
         */

        Base.disposeAll = function (objects) {
            var key, n;
            if ($.isArray(objects)) {
                for (key = 0, n = objects.Length; key < n; key += 1) {
                    if ($.isFunction(objects[key].dispose)) {
                        objects[key].dispose();
                    }
                }
                objects.Length = 0;
            } else {
                for (key in objects) {
                    if (objects.hasOwnProperty(key) && $.isFunction(objects[key].dispose)) {
                        objects[key].dispose();
                        objects[key] = null;
                    }
                }
            }
        };

        return Base;

    }());

}(this));
