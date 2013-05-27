//noinspection ThisExpressionReferencesGlobalObjectJS
(function (global) {
    'use strict';

    var THREE = global.THREE,
        Visualizer = global.DodgeBeat.Visualizer;

    global.DodgeBeat.CubeVisualizer = (function () {

        /**
         * CubeVisualizer
         * Creates a new CubeVisualizer
         * @param parent
         * @constructor
         */

        function CubeVisualizer(parent) {
            return CubeVisualizer.alloc(this, arguments);
        }

        Visualizer.inherit(CubeVisualizer);

        /**
         * init
         * @returns {*}
         */

        CubeVisualizer.prototype.init = function (parent) {
            Visualizer.prototype.init.apply(this, arguments);

            var i, config, cube, material, mesh, cubeSize, cubeCount, range, depth;

            config = global.DodgeBeat.config;
            cubeSize = config.cubes.size;
            cubeCount = config.cubes.count;
            depth = config.camera.depth;
            range = config.camera.range;

            this.meshes = [];
            this.parent = parent;
            this.sqrBoundingRadius = sqr(cubeSize) * 2;

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

                mesh.contact = false;
                mesh.updateMatrix();

                this.meshes.push(mesh);
                this.parent.scene.add(mesh);
            }
            return this;
        };

        CubeVisualizer.prototype.update = function (t) {
            var i, n, mesh, velocity, depth;

            velocity = this.parent.velocity;
            depth = global.DodgeBeat.config.camera.depth;

            for (i = 0, n = this.meshes.length; i < n; i += 1) {
                mesh = this.meshes[i];
                if (mesh.position.z >= depth) {
                    mesh.position.z -= 2 * depth;
                }

                mesh.rotation.x += mesh.spin.x;
                mesh.rotation.y += mesh.spin.y;
                mesh.rotation.z += mesh.spin.z;
                mesh.position.z += velocity;

                if (this.intersectsPlayer(mesh)) {
                    if (!mesh.contact) {
                        mesh.contact = true;
                        this.parent.player.contact = true;
                    }
                } else if (mesh.contact) {
                    mesh.contact = false;
                }
            }
        };


        CubeVisualizer.prototype.intersectsPlayer = function (mesh) {

            var dMin, boxMax, boxMin, rotationMatrix,
                sqrRadius = sqr(this.parent.player.radius),
                offset = this.parent.player.position.clone().sub(mesh.position);

            // bounding check between player and cube
            if (offset.lengthSq() > sqrRadius + this.sqrBoundingRadius) {
                return false;
            }

            // translate player to the cube's local space
            rotationMatrix = mesh.matrix.clone();
            rotationMatrix.elements[12] = 0;
            rotationMatrix.elements[13] = 0;
            rotationMatrix.elements[14] = 0;
            offset.applyMatrix4(rotationMatrix);

            boxMax = mesh.geometry.vertices[0];
            boxMin = mesh.geometry.vertices[6];
            dMin = 0;

            // calculate squared Euclidean distance
            if (offset.x < boxMin.x) {
                dMin += sqr(offset.x - boxMin.x);
            } else if (offset.x > boxMax.x) {
                dMin += sqr(offset.x - boxMax.x);
            }

            if (offset.y < boxMin.y) {
                dMin += sqr(offset.y - boxMin.y);
            } else if (offset.y > boxMax.y) {
                dMin += sqr(offset.y - boxMax.y);
            }

            if (offset.z < boxMin.z) {
                dMin += sqr(offset.z - boxMin.z);
            } else if (offset.x > boxMax.x) {
                dMin += sqr(offset.z - boxMax.z);
            }

            return dMin <= sqrRadius;
        };

        function sqr (a) {
            return a * a;
        }

        return CubeVisualizer;

    }());

}(this));
