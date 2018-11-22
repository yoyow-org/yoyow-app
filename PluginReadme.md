插件备注 及 相关配置说明
    cordova-plugin-splashscreen  启动页插件
    配置
    SplashScreenDelay       延时关闭时间
    SplashShowOnlyFirstTime 首次打开加载 android
    FadeSplashScreenDuration 关闭动画执行时长
    ShowSplashScreenSpinner 是否显示加载菊花
    SplashMaintainAspectRatio 是否缩放 android

    cordova-plugin-wkwebview-engine wdwebview 插件
    配置
    <feature name="CDVWKWebViewEngine">         打包进ios
        <param name="ios-package" value="CDVWKWebViewEngine" />
    </feature>      
    <preference name="CordovaWebViewEngine" value="CDVWKWebViewEngine" />      使用wkwebview

    修复wkwebview不能请求本地路径的bug
    cordova plugin add https://github.com/TheMattRay/cordova-plugin-wkwebviewxhrfix

    禁用拉动效果
    <preference name="WebViewBounce" value="false" />
    <preference name="DisallowOverscroll" value="true" />

    禁止手机横屏
    <preference name="orientation" value="portrait" />

    仅仅针对安卓权限控制，哪个操作需要就哪里加
    <plugin name="cordova-plugin-android-permissions" spec="^1.0.0" />
======================================热更新说明=====================================
一、插件及基础配置（ios,android）
    热更新插件（ios,android）
    <plugin name="cordova-hot-code-push-plugin" spec="^1.5.3" />
    文件操作插件（android）
    <plugin name="cordova-plugin-file" spec="^6.0.1" />
    文件传输插件（android）
    <plugin name="cordova-plugin-file-transfer" spec="^1.7.1" />
    文件打开插件（android）
    <plugin name="cordova-plugin-file-opener2" spec="^2.0.19" />
    热更新配置（ios,android）
    <chcp>
        <auto-download enabled="false" />
        <auto-install enabled="false" />
        <native-interface version="1" />
        <config-file url="http://192.168.1.171:8080/www/chcp.json" />
    </chcp>
    配置
    auto-download true 自动下载 false手动下载
    auto-install  true 自动安装 false手动安装
    native-interface version 版本号，用于更新APP壳子
    config-file 自动更新的配置文件地址

二、发布流程
    1、代码打包命令：
    测试版：$npm run build-app-test  (dev分支)
    正式版：$npm run build-app   (master分支)
    
    2、热更新发布流程
        1)、进入平台目录：
        android平台：$ cd app-android
        ios平台：    $ cd app-ios
        2)、设置热更新文件参数
        $ cordova-hcp build
        3)、上传热更新文件
        将app-android或app-ios目录下的www文件夹所含的文件和文件夹上传到更新服务器
    3、壳子更新
        1)、修改壳子版本
        修改app-android或app-ios目录下的cordova-hcp.json文件的"min_native_interface"值，在原有基础上加“1”
        $cordova-hcp build
        修改config.xml文件的android-versionCode值或ios-CFBundleVersion值
        修改config.xml文件的native-interface节点的version值。

        注意：
            min_native_interface，（android-versionCode或ios-CFBundleVersion），native-interface需保持一致
        2)、上传android平台或ios平台下的www文件夹到服务器
    4、打包app：
        1）android：
            正式版：$cordova build android --release
            测试版：$cordova build android --debug
        2）ios：
            正式版：$cordova build ios --release
            测试版：$cordova build ios --debug
            注意：用xcode发布ipa文件

        3）上传打包成功的apk或ipa
            注意：正式版的apk需加固，加固工具为乐固mac版
------------------------------------------------------------------------------------
二维码扫码插件
https://github.com/bulangnisi/phonegap-plugin-barcodescanner.git
已经修改过ios和android的扫码界面
常规方式使用 cordova plugin add https://github.com/bulangnisi/phonegap-plugin-barcodescanner.git 的方式可以引入
不过最近无法这样操作了，于是将替换方法提出
Android ,将插件目录下/src/android/barcodescanner-release.aar  替换到本地目录下 app-android/platforms/android/app/libs/barcodescanner-release-2.1.5.arr

IOS ,将插件目录下/src/ios/CDVBarcodeScanner.mm 替换到本地xcode项目的 plugins 同名文件
     将插件目录下/src/ios/CDVBarcodeScanner.bundle 替换到本地xcode项目 Resources 中的同名文件
