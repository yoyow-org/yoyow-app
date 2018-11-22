import counterpart from "counterpart";
import alt from "../altInstance";
import BaseStore from "./BaseStore";
import UpdaterActions from "../actions/UpdaterActions";
import SettingsStore from "../stores/SettingsStore";

class UpdaterStore extends BaseStore {
    constructor() {
        super();
        this.bindActions(UpdaterActions);
        
        this.state = {
            showUpdater:false,
            downloadProgress:0
          };
    }

    /**
     * 初始化
     */
    onIniti(){
        this.setState({showUpdater:false,downloadProgress:0});
    }
    /**
     * 检查更新
     * 1.热更新；2.下载APP；3.无更新
     */
    onCheckUpdate({resolve, reject}){
        let locale = counterpart.getLocale() || "zh";
        if(window.chcp){
            window.chcp.fetchUpdate(function(error, data){
                let newData=typeof(data.config)=="object"?data.config:JSON.parse(data.config);
                let log=locale==="zh"?newData.ver_log_zh:newData.ver_log_en;
                if(!error) {
                    if(newData.display_log){
                        resolve({code:0,verLog:log,config:[]});
                    }else{
                        resolve({code:1,verLog:[],config:[]});
                    }
                }else if(error.code==-2){
                    resolve({code:2,verLog:log,config:newData});
                }else{
                    resolve({code:3,verLog:[],config:[]});
                }
            });
        }else{
            resolve({code:3,verLog:[],config:[]});
        }
    }

    /**
     * 安装更新
     */
    onInstallUpdate(){
        navigator.splashscreen.show();
        window.chcp.installUpdate(function(err){
            setTimeout(()=>{
                navigator.splashscreen.hide();
                window.location.reload(true);
            },500);
        });
        return true;
    }

    /**
     * 创建存储文件加
     */
    onCreateStroesFile({resolve, reject}){
        if(window.cordova){
            var permissions = cordova.plugins.permissions;
            if (permissions) {
                //判断是否拥有权限
                permissions.hasPermission(permissions.WRITE_EXTERNAL_STORAGE, function (status) {
                    if (status.hasPermission) {
                        window.resolveLocalFileSystemURL(cordova.file.externalDataDirectory,
                            function(fileEntry) {
                                fileEntry.getDirectory("yoyow", {
                                    create: true,
                                    exclusive: false
                                }, 
                                function(fileEntry) {
                                    resolve(fileEntry);
                                }, 
                                function(err) {
                                    reject(err);
                                });
                            }
                        );
                    }
                    else {
                        //没有权限就添加权限
                        permissions.requestPermission(permissions.WRITE_EXTERNAL_STORAGE,
                            function (status) {
                                //设置成功后 返回状态
                                if (status.hasPermission) {
                                    //保存二维码
                                    window.resolveLocalFileSystemURL(cordova.file.externalDataDirectory,
                                        function(fileEntry) {
                                            fileEntry.getDirectory("yoyow", {
                                                create: true,
                                                exclusive: false
                                            }, 
                                            function(fileEntry) {
                                                resolve(fileEntry);
                                            }, 
                                            function(err) {
                                                reject(err);
                                            });
                                        }
                                    );
                                } else {
                                    TipsActions.alert(_this.translate('updater.updater_no_permission'));
                                }
                            },
                            function (error) {
                                TipsActions.alert(_this.translate('updater.updater_no_permission'));
                            });
                    }
                });
                return true;
            }
        }
    }

    /**
     * 下载文件
     */
    onDownLoadFile({fileEntry,downLoadUrl,resolve, reject}){
        this.setState({showUpdater:true});
        let fileName=this._getFileName(downLoadUrl);
        //下载代码
        var fileTransfer = new FileTransfer();
        let url=encodeURI(downLoadUrl);
        fileTransfer.download(url, 
            fileEntry.toInternalURL() + fileName,
            function(entry) {
                // 打开下载下来的APP
                resolve(fileEntry);
            }, 
            function(err) {
                reject(err);
            }, 
        true);

        //进度
        fileTransfer.onprogress = function(progressEvent) {
            window.setTimeout(function() {
                var downloadProgress = Math.floor((progressEvent.loaded / progressEvent.total) * 100);
                UpdaterActions.setDownloadProgress(downloadProgress);
                
                if (downloadProgress > 99) {
                    this.setState({downloadProgress:downloadProgress});
                }
            });
        };
    }

    /**
     * 打开下载文件
     */
    onOpenDownLoadFile({fileEntry,downLoadUrl,resolve, reject}){
        let fileName=this._getFileName(downLoadUrl);
        cordova.plugins.fileOpener2.open(
            fileEntry.toInternalURL() + fileName, //下载文件保存地址
            'application/vnd.android.package-archive', { //以APK文件方式打开
                error: function(err) {
                    reject(err);
                },
                success: function() {
                    resolve();
                    //TipsActions.alert("下载成功,请安装后重新打开应用!");
                }
        });
    }

    /**
     * 设置更新器状态
     * @param {*} val 
     */
    onSetUpdaterStatus(val){
        this.setState({showUpdater:val});
    }

    /**
     * 设置下载进度
     * @param {*} val 
     */
    onSetDownloadProgress(val){
        this.setState({downloadProgress:val});
    }

    /**
     * 获取文件名
     * @param {} downloadFile 
     */
    _getFileName(downloadFile){
        let fileName="yoyow.apk";
        if(downloadFile &&downloadFile.length>0){
            let inx=downloadFile.lastIndexOf("\/");
            fileName=downloadFile.substring(inx+1,downloadFile.length);
        }
        return fileName;
    }
}
export default alt.createStore(UpdaterStore, "UpdaterStore");