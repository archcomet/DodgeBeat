//noinspection ThisExpressionReferencesGlobalObjectJS
(function (global) {
    'use strict';

    global.DodgeBeat.CubeVisualizer = (function () {

        var CUBES = DodgeBeat.CONFIG.CUBES,
            SCENE = DodgeBeat.CONFIG.SCENE;

        /**
         * CubeVisualizer
         * Creates a new CubeVisualizer
         * @param parent
         * @constructor
         */

        function CubeVisualizer(parent) {
            return CubeVisualizer.alloc(this, arguments);
        }

        DodgeBeat.Visualizer.inherit(CubeVisualizer);

        /**
         * init
         * @returns {*}
         */

        CubeVisualizer.prototype.init = function (parent) {
            DodgeBeat.Visualizer.prototype.init.apply(this, arguments);

            var i, cube, material, mesh;

            this.meshes = [];
            this.parent = parent;
            this.sqrBoundingRadius = sqr(CUBES.SIZE) * 2;

            cube = new THREE.CubeGeometry(CUBES.SIZE, CUBES.SIZE, CUBES.SIZE);
            material = new THREE.MeshPhongMaterial({
                ambient: 0x333333,
                color: 0xffffff,
                specular: 0xffffff,
                shininess: 50
            });

            for (i = 0; i < CUBES.COUNT; i += 1) {
                mesh = new THREE.Mesh(cube, material);
                mesh.position.x = Math.random() * 2 * SCENE.WIDTH - SCENE.WIDTH;
                mesh.position.y = Math.random() * 2 * SCENE.HEIGHT - SCENE.HEIGHT;
                mesh.position.z = -(SCENE.LIMIT) + (i * (SCENE.LENGTH) / CUBES.COUNT);

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
            var i, n, mesh, velocity = this.parent.velocity;

            for (i = 0, n = this.meshes.length; i < n; i += 1) {
                mesh = this.meshes[i];
                mesh.rotation.x += mesh.spin.x;
                mesh.rotation.y += mesh.spin.y;
                mesh.rotation.z += mesh.spin.z;

                mesh.position.z += velocity;
                if (mesh.position.z >= SCENE.LIMIT) {
                    mesh.position.z -= SCENE.LENGTH;
                    this.positionCube(mesh, t);
                }

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

        CubeVisualizer.prototype.positionCube = function (mesh, t) {
            var x1, y1, s = (t - this.parent.lastPhaseChange) / (this.parent.nextPhaseChange - this.parent.lastPhaseChange);

            var traveled = this.parent.traveled,
                camera = this.parent.camera.position,
                r1 = this.parent.r1,
                r2 = this.parent.r2,
                r3 = this.parent.r3,
                r4 = this.parent.r4;

            switch (this.parent.phase) {

                // Wave Plane
                case 5:
                    mesh.position.x = (t * r1 % (SCENE.WIDTH * 2)) - SCENE.WIDTH;
                    mesh.position.y = (Math.sin((mesh.position.x + t * 2) / (SCENE.WIDTH * r2)) * SCENE.HEIGHT * r3) +
                                      (Math.sin(traveled/r4) * SCENE.HEIGHT * 0.1);

                    mesh.rotation.x = 0;
                    mesh.rotation.y = 0;
                    mesh.rotation.z = 0;

                    mesh.spin.x = 0;
                    mesh.spin.y = 0;
                    mesh.spin.z = 0;
                    break;

                // Funnel
                case 4:
                    s = 1 - s;
                    x1 = camera.x + (Math.cos(traveled/r1) * SCENE.WIDTH * r2);
                    y1 = camera.y + (Math.sin(traveled/r1) * SCENE.HEIGHT * r2);

                    mesh.position.x = x1 + Math.cos(t) * SCENE.WIDTH * (0.1 + r3 * s);
                    mesh.position.y = y1 + Math.sin(t) * SCENE.HEIGHT * (0.1 + r3 * s);

                    mesh.rotation.x = 0;
                    mesh.rotation.y = 0;
                    mesh.rotation.z = t;

                    mesh.spin.x = 0;
                    mesh.spin.y = 0;
                    mesh.spin.z = 0.01;

                    break;

                // Tunnel
                case 3:
                    x1 = camera.x + (Math.cos(traveled/r1) * SCENE.WIDTH * r2) * s;
                    y1 = camera.y + (Math.sin(traveled/r1) * SCENE.HEIGHT * r2) * s;

                    mesh.position.x = x1 + Math.cos(t) * SCENE.WIDTH * r3;
                    mesh.position.y = y1 + Math.sin(t) * SCENE.HEIGHT * r3;

                    mesh.rotation.x = 0;
                    mesh.rotation.y = 0;
                    mesh.rotation.z = t;

                    mesh.spin.x = 0;
                    mesh.spin.y = 0;
                    mesh.spin.z = 0;

                    break;

                // Star Field
                default:
                    mesh.position.x = Math.random() * 2 * SCENE.WIDTH - SCENE.WIDTH;
                    mesh.position.y = Math.random() * 2 * SCENE.HEIGHT - SCENE.HEIGHT;

                    mesh.rotation.x = Math.random() * Math.PI;
                    mesh.rotation.y = Math.random() * Math.PI;
                    mesh.rotation.z = Math.random() * Math.PI;

                    mesh.spin.x = Math.random() * (200 - 100) / 10000;
                    mesh.spin.y = Math.random() * (200 - 100) / 10000;
                    mesh.spin.z = Math.random() * (200 - 100) / 10000;

                    break;
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
            if (offset.x < boxMin.x) { dMin += sqr(offset.x - boxMin.x); } else
            if (offset.x > boxMax.x) { dMin += sqr(offset.x - boxMax.x); }

            if (offset.y < boxMin.y) { dMin += sqr(offset.y - boxMin.y); } else
            if (offset.y > boxMax.y) { dMin += sqr(offset.y - boxMax.y); }

            if (offset.z < boxMin.z) { dMin += sqr(offset.z - boxMin.z); } else
            if (offset.x > boxMax.x) { dMin += sqr(offset.z - boxMax.z); }

            return dMin <= sqrRadius;
        };

        function sqr (a) {
            return a * a;
        }

        return CubeVisualizer;

    }());

}(this));
