(function () {
    'use strict';

    // Modules
    var fs = require('fs'),
        path = require('path'),

        // Get the config json
        configPath = path.join(__dirname, '..', 'config.json'),
        configJson = JSON.parse(fs.readFileSync(configPath, 'utf8')),

        // Get the current environment
        env = process.env.NODE_ENV || 'development';

    // Return the config for the current environment
    module.exports = configJson[env];

}());