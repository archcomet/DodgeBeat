//noinspection ThisExpressionReferencesGlobalObjectJS
(function (global) {
    'use strict';

    var THREE = global.THREE,
        Visualizer = global.DodgeBeat.Visualizer;

    global.DodgeBeat.CubeVisualizer = (function () {

        /**
         * CubeVisualizer
         * Creates a new CubeVisualizer
         * @param scene
         * @constructor
         */

        function CubeVisualizer(scene) {
            return CubeVisualizer.alloc(this, arguments);
        }

        Visualizer.inherit(CubeVisualizer);

        /**
         * init
         * @returns {*}
         */

        CubeVisualizer.prototype.init = function (scene) {
            Visualizer.prototype.init.apply(this, arguments);

            var i, cube, material, mesh, cubeSize, cubeCount, range, depth;

            cubeSize = global.DodgeBeat.config.cubes.size;
            cubeCount = global.DodgeBeat.config.cubes.count;
            depth = global.DodgeBeat.config.camera.depth;
            range = global.DodgeBeat.config.camera.range;

            this.meshes = [];
            this.scene = scene;

            cube = new THREE.CubeGeometry(cubeSize, cubeSize, cubeSize);
            material = new THREE.MeshPhongMaterial({
                ambient: 0x333333,
                color: 0xffffff,
                specular: 0xffffff,
                shininess: 50
            });

            for (i = 0; i < cubeCount; i += 1) {
                mesh = new THREE.Mesh(cube, material);
                mesh.position.x = Math.random() * 2 * range - range;
                mesh.position.y = Math.random() * 2 * range - range;
                mesh.position.z = -depth + (i * (2 * depth) / cubeCount);

                mesh.rotation.x = Math.random() * Math.PI;
                mesh.rotation.y = Math.random() * Math.PI;
                mesh.rotation.z = Math.random() * Math.PI;

                mesh.spin = new THREE.Vector3(
                    Math.random() * (200 - 100) / 10000,
                    Math.random() * (200 - 100) / 10000,
                    Math.random() * (200 - 100) / 10000
                );

                mesh.updateMatrix();

                this.meshes.push(mesh);
                this.scene.add(mesh);
            }
            return this;
        };

        CubeVisualizer.prototype.update = function (t) {
            var i, mesh, velocity, cubeCount, depth;

            velocity = global.DodgeBeat.config.camera.maxVelocity;
            cubeCount = global.DodgeBeat.config.cubes.count;
            depth = global.DodgeBeat.config.camera.depth;

            for (i = 0; i < cubeCount; i += 1) {
                mesh = this.meshes[i];
                if (mesh.position.z >= depth) {
                    mesh.position.z -= 2 * depth;
                }

                mesh.rotation.x += mesh.spin.x;
                mesh.rotation.y += mesh.spin.y;
                mesh.rotation.z += mesh.spin.z;
                mesh.position.z += velocity;
            }
        };

        return CubeVisualizer;

    }());

}(this));
