//noinspection ThisExpressionReferencesGlobalObjectJS
(function(global) {
    'use strict';

    global.DodgeBeat.config = {

        cubes: {
            size: 50,
            count: 500
        },

        particles: {
            maxSize: 80,
            count: 1000
        },

        scene: {
            fogColor: 0x000000,
            fogRate: 0.0005,
            width: 1500,
            height: 1500,
            length: 4000
        },

        camera: {
            fov: 75,
            near: 1,
            far: 4000,
            depth: 2000, // deprecated
            range: 1500, // deprecated
            movePeriod: 4000,
            moveDistance: 500,
            maxVelocity: 5
        },

        kicks: {
            peak: {
                frequency: [0, 90],
                threshold: 0.5,
                decay: 0.04
            },
            high: {
                frequency: [0, 200],
                threshold: 0.25,
                decay: 0.03
            },
            mid: {
                frequency: [0, 300],
                threshold: 0.05,
                decay: 0.02
            },
            low: {
                frequency: [0, 400],
                threshold: 0.005,
                decay: 0.002
            },
            faint: {
                frequency: [0, 500],
                threshold: 0.0001,
                decay: 0.005
            }
        }

    };

}(this));