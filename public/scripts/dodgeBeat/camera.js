(function (global) {
    'use strict';

    global.DodgeBeat.Camera = (function () {

        var CAMERA = DodgeBeat.CONFIG.CAMERA,
            SCENE = DodgeBeat.CONFIG.SCENE;

        /**
         * Camera
         * @constructor
         */

        function Camera () {
            Camera.alloc(this, arguments);
        }

        Base.inherit(Camera);

        Camera.prototype.init = function (parent) {

            this.parent = parent;
            this.shakeUpdates = 0;
            this.shakeStart = null;
            this.shakeFactor = 0;

            this.perspectiveCam = new THREE.PerspectiveCamera();
            this.perspectiveCam.position = new THREE.Vector3(0, 0, SCENE.LIMIT);
            this.position = new THREE.Vector3();
            this.offset = new THREE.Vector3();

            this.steering = new DodgeBeat.Steering({
                position: this.position,
                rotation: this.perspectiveCam.rotation,
                roleScalar: 0.3,
                target: new THREE.Vector3(0, 0, SCENE.LIMIT),
                maxSpeed: CAMERA.MAX_SPEED,
                slowingDistance: CAMERA.SLOWING_DIST
            });

            this.parent.scene.add(this.perspectiveCam);
        };

        Camera.prototype.onWindowResize = function () {
            this.perspectiveCam.fov = CAMERA.FOV;
            this.perspectiveCam.aspect = window.innerWidth / window.innerHeight;
            this.perspectiveCam.near = CAMERA.NEAR;
            this.perspectiveCam.far = CAMERA.FAR;
            this.perspectiveCam.updateProjectionMatrix();
        };

        Camera.prototype.update = function (t) {
            var followTarget = new THREE.Vector2(this.tracking.x, this.tracking.y),
                followDistance = followTarget.length();

            followTarget.normalize().multiplyScalar(followDistance * CAMERA.OFFSET);

            this.steering.target.x = followTarget.x;
            this.steering.target.y = followTarget.y;
            this.steering.update(t);
            this.updateShake(t);
            this.perspectiveCam.position.addVectors(this.position, this.offset);
        };

        Camera.prototype.updateShake = function (t) {
            if (this.shakeUpdates > 0) {
                if (this.shakeStart === null) {
                    this.shakeStart = this.shakeUpdates;
                }

                this.shakeFactor = this.shakeUpdates / this.shakeStart;

                this.offset.x = (Math.sin(t * CAMERA.SHAKE_FREQ_X) * CAMERA.SHAKE_SIZE_X) * this.shakeFactor;
                this.offset.y = (Math.sin(t * CAMERA.SHAKE_FREQ_Y) * CAMERA.SHAKE_SIZE_Y +
                                 Math.cos(t * CAMERA.SHAKE_FREQ_Y2) * CAMERA.SHAKE_SIZE_Y2) * this.shakeFactor;

                this.shakeUpdates--;
                if (this.shakeUpdates === 0) {
                    this.offset.set(0, 0, 0);
                    this.shakeStart = null;
                    this.shakeFactor = 0;
                }
            }
        };

        return Camera;

    }());

}(window));