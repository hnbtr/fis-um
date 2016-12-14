#!/usr/bin/env node

var Liftoff = require('liftoff');
var argv = require('minimist')(process.argv.slice(2));

var cli = new Liftoff({
    name: 'fis-um',
    processTitle: 'fis-um',
    moduleName: 'fis-um',
    configName: 'config',
    extensions: {
        '.js': null
    }
});

cli.launch({
    cwd: argv.r || argv.root,
    configPath: argv.f || argv.file
}, function (env) {
    var fis, config;

    try {
        config = require(env.configPath);
    } catch (e) {
        throw new Error('can not find config.js');
    }
    fis = require('../')(config);

    if (config.isMin)
        argv.w = false;

    process.title = this.name + ' ' + process.argv.slice(2).join(' ') + ' [ ' + env.cwd + ' ]';
    fis.cli.name = this.name;
    fis.cli.run(argv, env);
});
