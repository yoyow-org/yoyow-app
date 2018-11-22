import React from 'react';
import counterpart from "counterpart";
import BaseComponent from "../BaseComponent";
import {Utils} from "../../../lib";
import TipsActions from "../../actions/TipsActions";
import SettingsActions from "../../actions/SettingsActions";
import UpdaterStore from "../../stores/UpdaterStore";
import UpdaterActions from "../../actions/UpdaterActions";
import LinkButton from "../Layout/LinkButton";
import {img_aubot_logo} from "../../assets/img";
import WalletActions from "../../actions/WalletActions"

/**
 * 关于我们
 */
class About extends BaseComponent{
    constructor(){
        super();
    }

    componentDidMount() {
        let headerData = {
            buttonLeft: {
                value: "img_back",
            },
            title: "about.about.title",
            canBack:true
        }
        SettingsActions.updateHeader(headerData);
        UpdaterActions.initi();
    }

    handleAlertNew(){
        let _this=this;
        TipsActions.loading(true);
        localStorage.checkUpdate=true;
        UpdaterActions.checkUpdate()
       .then(({code,verLog,config})=>{
            TipsActions.loading(false);
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
                TipsActions.alert(_this.translate("about.about.alert_version_isnew"));
            }
            localStorage.checkUpdate=false;
        }).catch(err=>{
            localStorage.checkUpdate=false;
            TipsActions.loading(false);
        });
    }

    handlePageJump(url){
        if(url == "/about/product-guide"){
            WalletActions.setNeedBack(true)
        }
        this.routerPush(url,true);
    }
    render(){

        return (
            <div className="about_index bgWhite">
                <div className="about_index_head" >
                    <div className="about_index_head_logo">
                        <img src={img_aubot_logo} />
                    </div>
                    <div className="about_index_head_vision">
                    {this.translate("about.about.version")}
                    </div>
                    <div className="about_index_head_content">
                        <p>{this.translate("about.about.content")}</p>
                    </div>
                </div>
                <div className="about_index_bar"></div>
                <div className="about_index_list">
                    <div className="about_index_item" onClick={this.handlePageJump.bind(this,"/about/service-terms")}>
                        <LinkButton type="list" text={this.translate("about.about_service.title")}/>
                    </div>
                    <div className="about_index_item" onClick={this.handlePageJump.bind(this,"/about/version-log")}>
                        <LinkButton type="list" text={this.translate("about.about_version.title")}/>
                    </div>
                    <div className="about_index_item" onClick={this.handlePageJump.bind(this,"/about/product-guide")}>
                        <LinkButton type="list" text={this.translate("about.about_guide.title")}/>
                    </div>
                    <div className="about_index_item" onClick={this.handleAlertNew.bind(this)}>
                        <LinkButton type="list" text={this.translate("about.about_detection.title")}/>
                    </div>
                </div>
            </div>
        )
    }
}

export default Utils.altConnect(About, [UpdaterStore]);