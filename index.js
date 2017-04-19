// const config = {
//     entry_files: '/*/**/*.{html,shtml}',
//     amd: true,
//     relative: false,
//     minimum: false,
//     hash: true,
//     domain: false,
//     code_config: {
//         //API请求默认服务器，例如//api.umsoft.cn
//         host: '//wx-associator.wb.n.umsoft.cn',
//     },
//     not_mod_files: ['{global,$lib}/**.js'],
//     loader_libs: {
//         html: ['/3rd/global/web.js']
//     },
//     package: [{
//         files: '/(*)/({_,$,})(*)/**.{js,htm,tpl}',
//         to: '/$1/asset/$3.js'
//     }, {
//         files: '/(*)/({_,$,})(*)/**.{css,less}',
//         to: '/$1/asset/$3.css'
//     }, {
//         files: '/3rd/**',
//         to: false
//     }]
//     replace: [{
//         files: '*.{html,js}',
//         rules: [{search: /time/g, 'time'}]
//     }],
//     release: [{
//         files: '/(*)/({_,$})(**)',
//         to: "/$1/$3"
//     }],
// }

module.exports = function (config) {
    var fis = require('fis3');
    var _ = require('lodash');

    fis.require.prefixes.unshift('fis-um');
    fis.cli.name = 'fis-um';
    fis.set('project.ignore', ['/config.js']);

    var conf = {
        entry_files: '*.html',
        amd: false,
        relative: false,
        minimum: false,
        hash: false,
        domain: false,
        loader_libs: {
            html: [],
            shtml: []
        },
        code_config: {},
        not_mod_files: [],
        replace: [],
        release: [],
        package: []
    };

    config.forEach(function (c) {
        conf = _.extend(conf, c);
    });

    //处理入口文件
    fis.set('project.files', conf.entry_files);

    //处理部署相对路径和绝对路径
    if (config.relative) {
        fis.hook('relative');
        fis.match("*", {
            relative: true,
            deploy: [fis.plugin('skip-packed'), fis.plugin('local-deliver', {to: '../rd'})],
            release: "/$0"
        });
        conf.release && conf.release.forEach(function (v) {
            fis.match(v.files, {
                release: v.to
            })
        })
    } else {
        fis.match('*', {
            deploy: [fis.plugin('skip-packed'), fis.plugin('local-deliver', {to: '../'})],
            release: "/rd/$0"
        });
        conf.release && conf.release.forEach(function (v) {
            fis.match(v.files, {
                release: '/rd' + v.to
            })
        })
    }

    //处理rs目录路径，code_config文件
    fis.match('*.{html,js,css,less,htm,tpl}', {
        parser: fis.plugin('replace', {
            rules: [{search: /\/rs\//g, replace: "/"}, {
                search: '$$CODE_CONFIG',
                replace: "'" + JSON.stringify(conf.code_config || {}) + "'"
            }]
        })
    });

    //处理replace
    if (conf.replace) {
        conf.replace.forEach(function (v) {
            fis.match(v.files, {
                parser: fis.plugin('replace', {rules: v.rules}, 'append')
            })
        })
    }

    //处理amd
    if (conf.amd) {
        fis.hook('amd');

        fis.match('*.js', {
            isMod: true
        });

        fis.match('::package', {
            postpackager: fis.plugin('loader', {
                resourceType: 'amd', useInlineMap: false
            })
        });

        conf.not_mod_files && conf.not_mod_files.forEach(function (v) {
            fis.match(v, {
                isMod: false
            })
        });

        conf.package && conf.package.forEach(function (v) {
            fis.match(v.files, {
                packTo: v.to
            })
        })
    }


    //处理各类型资源
    fis.match('*.html', {
        parser: fis.plugin('extract-inline', {libs: conf.loader_libs.html}, "append")
    });
    fis.match('*.shtml', {
        parser: fis.plugin('extract-inline', {libs: conf.loader_libs.shtml}, "append")
    });
    fis.match('*.js', {
        preprocessor: fis.plugin('js-require-css')
    });
    fis.match('*.{htm,tpl}', {
        isHtmlLike: true,
        postprocessor: fis.plugin('tpl2js'),
        rExt: '.js'
    });
    fis.match('*.less', {
        parser: fis.plugin('less-2.x', null, "append"),
        rExt: '.css'
    });

    if (conf.minimum) {
        fis.set("settings.packager.map", {useTrack: false});
        fis.match('*.{css,less}', {
            optimizer: fis.plugin('clean-css', {keepSpecialComments: 0})
        });
        fis.match('*.js', {
            optimizer: fis.plugin('uglify-js', {comments: false})
        });
        fis.match('*.{html,xml}', {
            useHash: false
        });
    }

    if (conf.hash) {
        fis.match("*", {
            useHash: true
        });
        fis.match('*.{html,xml}', {
            useHash: false
        });
    }

    if (conf.domain) {
        fis.match("*", {
            domain: conf.domain
        });
    }

    return fis;
};