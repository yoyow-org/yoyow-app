import React from "react";
import {Utils} from "../../lib";
import BaseComponent from "./BaseComponent";
import UpdaterStore from "../stores/UpdaterStore";
import UpdaterActions from "../actions/UpdaterActions";
import TipsActions from "../actions/TipsActions";
import Mask from "./Layout/Mask";

class Updater extends BaseComponent{
    constructor() {
        super();
    }
    
    componentDidMount() {
        let _this=this;
        localStorage.checkUpdate=true;
        UpdaterActions.checkUpdate()
        .then(({code,verLog,config})=>{
            if(code==0){
                TipsActions.alert(verLog,_this.translate("updater.updater_confirm_title"),false,()=>{
                    UpdaterActions.installUpdate();
                    return true;
                });
            }else if(code==1){
                UpdaterActions.installUpdate();
            }else if(code==2){
                let platforms="";
                //壳子版本低的时候下载壳子
                var ua = navigator.userAgent.toLowerCase();	
                if(/iphone|ipad|ipod/.test(ua)) {
                    platforms= "ios";
                }else if(/android/.test(ua)) {
                    platforms= "android";	
                }
                if(platforms=="ios") {
                    let url="itms-services://?action=download-manifest&url="+config.ios_download_url;
                    location.href=url;
                    // iOS端 直接弹窗提示升级，点击ok后自动跳转
                    //chcp.requestApplicationUpdate(dialogMessage, this.userWentToStoreCallback, this.userDeclinedRedirectCallback);
                }else if(platforms=="android") {
                    // Android端 提示升级下载最新APK文件
                    TipsActions.alert(verLog,_this.translate("updater.updater_confirm_title"),false,()=>{
                        UpdaterActions.setUpdaterStatus(true);
                        var permissions = cordova.plugins.permissions;
                        if (permissions) {
                            //判断是否拥有权限
                            permissions.hasPermission(permissions.WRITE_EXTERNAL_STORAGE, function (status) {
                                if (status.hasPermission) {
                                    //创建存储文件夹
                                    UpdaterActions.createStroesFile().then((fileEntry)=>{
                                        //下载APK文件
                                        UpdaterActions.downLoadFile(fileEntry,config.android_download_url)
                                        .then((fileEntry)=>{
                                            //打开文件
                                            UpdaterActions.setUpdaterStatus(false);
                                            UpdaterActions.openDownLoadFile(fileEntry,config.android_download_url).then(()=>{

                                            })
                                            .catch((err)=>{
                                                TipsActions.alert(err);
                                            });
                                        }).catch(()=>{
                                            UpdaterActions.setUpdaterStatus(false);
                                            TipsActions.alert(_this.translate("updater.updater_download_faild"));
                                        });
                                    }).catch(()=>{
                                        UpdaterActions.setUpdaterStatus(false);
                                        TipsActions.alert(_this.translate("updater.updater_faild"));
                                    });
                                }else{
                                    permissions.requestPermission(permissions.WRITE_EXTERNAL_STORAGE,
                                        function (status) {
                                            //设置成功后 返回状态
                                            if (status.hasPermission) {
                                                //创建存储文件夹
                                                UpdaterActions.createStroesFile().then((fileEntry)=>{
                                                    //下载APK文件
                                                    UpdaterActions.downLoadFile(fileEntry,config.android_download_url)
                                                    .then((fileEntry)=>{
                                                        //打开文件
                                                        UpdaterActions.setUpdaterStatus(false);
                                                        UpdaterActions.openDownLoadFile(fileEntry,config.android_download_url).then(()=>{

                                                        })
                                                        .catch((err)=>{
                                                            TipsActions.alert(_this.translate("updater.updater_error"));
                                                        });
                                                    }).catch(()=>{
                                                        UpdaterActions.setUpdaterStatus(false);
                                                        TipsActions.alert(_this.translate("updater.updater_download_faild"));
                                                    });
                                                }).catch(()=>{
                                                    UpdaterActions.setUpdaterStatus(false);
                                                    TipsActions.alert(_this.translate("updater.updater_faild"));
                                                });
                                            }else {
                                                UpdaterActions.setUpdaterStatus(false);
                                                TipsActions.alert(_this.translate('updater.updater_no_permission'));
                                            }
                                        },
                                        function (error) {
                                            UpdaterActions.setUpdaterStatus(false);
                                            TipsActions.alert(_this.translate('updater.updater_no_permission'));
                                        });
                                }
                            });
                        }

                        return true;
                    });
                }
            }else{
                localStorage.checkUpdate=false;
                setTimeout(()=>{
                    _this._checkCertificate();
                },2000);
            }
        }).catch(err=>{
            localStorage.checkUpdate=false;
        });
    }

    /**
     * 验证签名
     */
    _checkCertificate() {
        /**验证签名 */
        Utils.checkCertificate()
        .then().catch(err=>{
            setTimeout(()=>{
                // navigator.app.exitApp();
            },2000);
        });
    }

    render() {
        let {showUpdater,downloadProgress}=this.props;
        let progressContent=downloadProgress+"%";
        return (
            <div className="updater-index" style={{display:showUpdater?"block":"none"}}>
                {
                    showUpdater?(
                        <div className="updater-progress">
                            <Mask />
                            <div className="updater-progress-layer">
                                <div className="updater-progress-percentage">{progressContent}</div>
                                <div className="updater-progress-box">
                                    <div className="updater-progress-bar" style={{width:progressContent}}></div>
                                </div>
                                <div className="updater-progress-title">{this.translate("updater.updater_download_progress")}</div>
                            </div>
                        </div>
                        ):""
                }
            </div>
        )
    }
}

export default Utils.altConnect(Updater, [UpdaterStore]);