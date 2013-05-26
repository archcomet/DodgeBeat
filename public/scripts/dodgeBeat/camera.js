(function (global) {
    'use strict';

    global.DodgeBeat.Camera = (function () {

        var shakeFreqX = 40,
            shakeFreqY = 20,
            shakeFreqY2 = 20,
            shakeSizeX = 30,
            shakeSizeY = 15,
            shakeSizeY2 = 7;

        function Camera () {
            Camera.alloc(this, arguments);
        }

        Base.inherit(Camera);

        Camera.prototype.init = function (parent) {
            var depth = DodgeBeat.config.camera.depth;

            this.parent = parent;
            this.shakeUpdates = 0;
            this.shakeStart = null;
            this.shakeFactor = 0;

            this.perspectiveCam = new THREE.PerspectiveCamera();
            this.perspectiveCam.position = new THREE.Vector3(0, 0, depth);
            this.position = new THREE.Vector3();
            this.offset = new THREE.Vector3();

            this.steering = new DodgeBeat.Steering({
                position: this.position,
                rotation: this.perspectiveCam.rotation,
                target: new THREE.Vector3(0, 0, depth),
                maxSpeed: 30,
                slowingDistance: 500
            });

            this.parent.scene.add(this.perspectiveCam);
        };

        Camera.prototype.onWindowResize = function () {
            this.perspectiveCam.fov = DodgeBeat.config.camera.fov;
            this.perspectiveCam.aspect = window.innerWidth / window.innerHeight;
            this.perspectiveCam.near = DodgeBeat.config.camera.near;
            this.perspectiveCam.far = DodgeBeat.config.camera.depth * -2;
            this.perspectiveCam.updateProjectionMatrix();
        };

        Camera.prototype.update = function (t) {
            var followTarget = new THREE.Vector2(this.tracking.x, this.tracking.y),
                followDistance = followTarget.length();

            followTarget.normalize().multiplyScalar(followDistance * 0.8);

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

                this.offset.x = (Math.sin(t * shakeFreqX) * shakeSizeX) * this.shakeFactor;
                this.offset.y = (Math.sin(t * shakeFreqY) * shakeSizeY +
                                 Math.cos(t * shakeFreqY2) * shakeSizeY2) * this.shakeFactor;

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