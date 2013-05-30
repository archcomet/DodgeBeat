//noinspection ThisExpressionReferencesGlobalObjectJS
(function(global) {
    'use strict';

    global.DodgeBeat.Steering = (function () {

        /**
         * Steering
         * @param options
         * @constructor
         */

        function Steering (options) {
            Steering.alloc(this, arguments);
        }

        Base.inherit(Steering);

        Steering.prototype.init = function (options) {
            this.maxSpeed = options.maxSpeed || 0;
            this.rotation = options.rotation || null;
            this.roleScalar = options.roleScalar || 0.25;
            this.slowingDistance = options.slowingDistance || 0;

            this.position = options.position || new THREE.Vector3();
            this.velocity = options.velocity || new THREE.Vector3();
            this.target = options.target || new THREE.Vector3();

            this.steering = new THREE.Vector3();
            this.offset = new THREE.Vector3();
            this.jerk = new THREE.Vector3();
        };

        Steering.prototype.update = function (t) {
            var distance, rampedSpeed, clippedSpeed;
            this.offset.subVectors(this.target, this.position);

            distance = this.offset.length();
            if (distance !== 0) {
                rampedSpeed = this.maxSpeed * (distance / this.slowingDistance);
                clippedSpeed = Math.min(rampedSpeed, this.maxSpeed);
                this.jerk.copy(this.offset);
                this.jerk.multiplyScalar(clippedSpeed / distance);
                this.steering.subVectors(this.jerk, this.velocity);
            }

            this.velocity.add(this.steering);
            this.position.add(this.velocity);

            if (this.rotation) {
                this.rotation.z = -Math.sin((this.velocity.x / this.maxSpeed) * Math.PI * this.roleScalar);
            }
        };

        return Steering;

    }());

}(this));