module.exports = [{
    // 入口文件 *.html 或 /*/**/*.{html,shtml}
    entry_files: '*.html',
    // src文件夹
    path_src: 'rs',
    // dist文件夹
    path_dist: 'rd',
    // 部署文件夹
    path_deploy: '',
    // 是否启用amd
    amd: false,
    // 是否是相对路径
    relative: false,
    // 是否压缩
    minimum: false,
    // 是否加hash
    hash: true,
    // 资源域名
    domain: false,
    // 代码配置，会将该配置直接替换全局
    code_config: {
        //API请求默认服务器，例如//api.umsoft.cn
        host: '//adas.umdev.cn',
    },
    // 不生成mod的文件
    not_mod_files: ['{global,$lib}/**.js'],
    // 在html中附件全局资源
    loader_libs: {
        '*.html': ['/3rd/global/web.js']
    },
    // 自定义打包规则
    package: [{
        files: '/(*)/({_,$,})(*)/**.{js,htm,tpl}',
        to: '/$1/asset/$3.js'
    }, {
        files: '/(*)/({_,$,})(*)/**.{css,less}',
        to: '/$1/asset/$3.css'
    }, {
        files: '/3rd/**',
        to: false
    }],
    // 全局替换
    replace: [{
        files: '*.{html,js}',
        rules: [{search: /time/g, replace: 'time'}]
    }],
    // 发布目录
    release: [{
        files: '/(*)/({_,$})(**)',
        to: "/$1/$3"
    }]
}];
