module.exports = function (config) {
    var mode = 'default', fis = require('fis3');

    mode = config.mode ? config.mode : mode;

    fis.require.prefixes.unshift('fis-um');
    fis.cli.name = 'fis-um';

    fis.set('project.ignore', ['/config.js']);

    if (mode == 'replace' && config.config) {
        config.config(fis);
        return fis;
    }

    var config_str = "'" + JSON.stringify(config) + "'";

    //一般模式部署规则
    fis.set('project.files', '/*/*/*.html')
        .hook('amd')
        .match('*', {
            deploy: [fis.plugin('skip-packed'), fis.plugin('local-deliver', {to: '../'})],
            release: "/rd/$0"
        })
        //打包路径处理
        .match('/(*)/({_,$})(**)', {
            release: "/rd/$1/$3"
        })
        .match('/(*)/({_,$,})(*)/**.{js,htm,tpl}', {
            packTo: '/$1/asset/$3.js'
        })
        .match('/(*)/({_,$,})(*)/**.{css,less}', {
            packTo: '/$1/asset/$3.css'
        })
        .match('/3rd/**', {
            packTo: false
        })
        //各类型资源处理
        .match('*.{html,js,css,less,htm,tpl}', {
            parser: fis.plugin('replace',
                {rules: [{search: /\/rs\//g, replace: "/"}, {search: '$$CONFIG', replace: config_str}]}
            )
        })
        .match('*.html', {
            parser: fis.plugin('extract-inline', {libs: config.libs}, "append")
        })
        .match('*.js', {
            isMod: true,
            preprocessor: fis.plugin('js-require-css')
        })
        .match('{global,$lib}/**.js', {
            isMod: false
        })
        .match('*.{htm,tpl}', {
            isHtmlLike: true,
            postprocessor: fis.plugin('tpl2js'),
            rExt: '.js'
        })
        .match('*.less', {
            parser: fis.plugin('less-2.x', null, "append"),
            rExt: '.css'
        })
        .match('::package', {
            postpackager: fis.plugin('loader', {
                resourceType: 'amd', useInlineMap: false
            })
        });

    // APP模式部署规则
    if (config.isApp) {
        fis.set('project.files', '*.{html,xml}')
            .hook('relative')
            .match("*", {
                relative: true,
                deploy: [fis.plugin('skip-packed'), fis.plugin('local-deliver', {to: '../rd'})],
                release: "/$0"
            })
            .match('/(*)/({_,$})(**)', {
                release: "/$1/$3"
            });
    }

    //上线部署模式
    if (config.isMin) {
        fis.set('project.md5Length', 6)
            .set("settings.packager.map", {useTrack: false})
            .match("*", {
                domain: config.cdn,
                useHash: true
            })
            .match('*.{css,less}', {
                optimizer: fis.plugin('clean-css', {keepSpecialComments: 0})
            })
            .match('*.js', {
                optimizer: fis.plugin('uglify-js', {comments: false})
            })
            .match('*.png', {
                optimizer: fis.plugin('png-compressor')
            })
            .match('*.{html,xml}', {
                useHash: false
            });
    }

    if (mode == 'append' && config.config)
        config.config(fis);

    return fis;
};