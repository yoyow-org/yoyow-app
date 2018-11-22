import React from "react";
import BaseComponent from "../BaseComponent";
import {connect} from "alt-react";
import PlatformActions from "../../actions/PlatformActions";
import PlatformStore from "../../stores/PlatformStore";
import Search from "../Form/Search";
import SettingsActions from "../../actions/SettingsActions";
import Button from "../../components/Form/Button";
import {Utils, Validation} from "../../../lib";
import TipsActions from "../../actions/TipsActions";
import WalletUnlockActions from "../../actions/WalletUnlockActions";
import WalletActions from "../../actions/WalletActions";
import WalletStore from "../../stores/WalletStore";
import {img_nodata,img_aubot_logo} from "../../assets/img";

class PlatformContainer extends BaseComponent{
    constructor(){
        super();
    }

    componentDidMount(){
        // TODO: 本页扫码后跳转到授权平台相关页面
        let {keywords} = this.props;
        SettingsActions.updateHeader({
            buttonLeft: {
                value: "img_back",
            },
            buttonRight: !Validation.isEmpty(keywords) ? null : {
                value: "img_scanning",
                callback: this.handleScanning.bind(this)
            },
            title: Validation.isEmpty(keywords) ? 'platform.text_head' : 'platform.text_head_result',
            canBack: true
        });
        this.__getPlatforms();
        WalletActions.addSubscribe(this.__walletChange.bind(this));
    }

    componentWillUnmount(){
        WalletActions.removeSubscribe(this.__walletChange.bind(this));
    }
    
    __walletChange(){
        this.__getPlatforms();
    }

    __getPlatforms(){
        TipsActions.loading(true);
        PlatformActions.getPlatforms().then(res => {
            TipsActions.loading(false);
        }).catch(err => {
            TipsActions.loading(false);
            TipsActions.alert(err.msg);
        });
    }

    /**
     * 解除授权
     * @param {*} platform 
     * @param {*} e 
     */
    cancelAuthority(platform, e){
        this.checkAccountValid(() => {
            PlatformActions.cancelAuthority(platform.owner, true, false).then(fees => {
                WalletUnlockActions.checkLock(true, false, this.translate('platform.text_descript'), fees).then(useCsaf => {
                    TipsActions.loading(true);
                    PlatformActions.cancelAuthority(platform.owner, useCsaf, true).then(res => {
                        this.__getPlatforms();
                        TipsActions.loading(false);
                        TipsActions.toast(this.translate('platform.text_success'));
                    }).catch(err => {
                        TipsActions.loading(false);
                        TipsActions.alert(err.msg);
                    })
                }).catch(err => {
                    TipsActions.alert(err.msg);
                });
            }).catch(err => {
                TipsActions.alert(err.msg);
            });
        });
    }

    /**
     * 授权平台
     * @param {*} platform 
     * @param {*} e 
     */
    handleAuthority(platform,e){
        PlatformActions.setPlatform(platform);
        this.routerPush("/import-auth",true);
    }
    
    toSearch(){
        this.checkAccountValid(() => {
            if(!this.props.keywords){
                PlatformActions.setKeywords('');
                this.routerPush('/platform/search',true);
            }
        })
    }

    handleScanning(result, e){
        if(window.cordova){
            let {platforms} = this.props;
            if(result.cancelled == 0 || result.cancelled == false){
                PlatformActions.checkSign(result.text).then(platform => {
                    let findP = platforms.find(p => { return platform.owner == p.owner });
                    if(findP && !findP.is_auth){
                        WalletActions.setNeedBack(true);
                        this.routerPush('/import-auth');
                    }else{
                        TipsActions.alert(this.translate('platform.text_already_auth'));
                    }
                }).catch(err => TipsActions.error(err));
            }
        }else{
            this.routerPush('/web-scan',true);
        }


        // let sign = {"sign":"204db821c906691e6338d7fa815899909d81ef467ac54f5460763e15a71d5a81a58630495971bc58bb0786eb6a22ac3507929eac40d95c37bf294bab18","time":"1522664514790","platform":"217895094"}
        // let {accountList} = this.props;
        // PlatformActions.checkSign(JSON.stringify(sign)).then(res => {
        //     if(accountList.filter(w => { return !w.is_trash }).size > 0)
        //         this.routerPush('/import-auth');
        //     else
        //         this.routerPush('/create-auth');
        // }).catch(err => TipsActions.error(err));
    }


    /**
     * 跳转url
     * @param {*} data 
     */
    handleJumpToUrl(data){
        if(Utils.checkPlatform()=="ios" && data.urlscheme && data.urlscheme.length>0){
            PlatformActions.iosJump(data);
            return false;
        }

        if(Utils.checkPlatform()=="android" && data.packagename && data.packagename.length>0){
            PlatformActions.androidJump(data);
            return false;
        }
        PlatformActions.h5Jump(data.h5url);
    }
    render(){
        let {platforms, keywords} = this.props;
        return(
            <div className="platform_full">
                <div className="platform_search_button_layer" onClick={this.toSearch.bind(this)}>
                    {
                        !keywords ? <Search readOnly={true} placeholder={this.translate('platform.placeholder_search')} />
                        : <div className="platform_search_result_wrapper">
                            <div className="platform_search_result">
                                <span>{this.translate('platform.text_search')}</span>
                                <span className="platform_color_green">{keywords}</span>
                            </div>
                            <div className="platform_search_result">
                                <span className="platform_color_green">{platforms.length}</span>
                                <span>{this.translate('platform.text_result')}</span>
                            </div>
                        </div>
                    }
                </div>
                <div className="platform_content_wrapper">
                    {
                        platforms.length > 0
                        ?
                        <ul className="platform_list">
                        {
                            platforms.map((p, inx) => {
                                let isJump=false;
                                let extr_data_json={};
                                if(p.extra_data && Utils.isJSON(p.extra_data)){
                                    extr_data_json=JSON.parse(p.extra_data);
                                    if(extr_data_json.h5url&&extr_data_json.h5url.length>0){
                                        isJump=true;
                                    }
                                    if(extr_data_json.packagename&&extr_data_json.packagename.length>0){
                                        isJump=true;
                                    }
                                    if(extr_data_json.urlscheme&&extr_data_json.urlscheme.length>0){
                                        isJump=true;
                                    }
                                }
                                return (
                                    <li key={`platform_inx_${inx}`} >
                                        <div className="platform_list_item">
                                            <div className="platform_list_item_content">
                                                <div className="platform_list_item_content_head">
                                                    <img src={extr_data_json.image?extr_data_json.image:img_aubot_logo} />
                                                </div>
                                                <div className="platform_list_item_content_list">
                                                        <div className={`platform_list_item_content_info${isJump?"":" un_background"}`} onClick={isJump?this.handleJumpToUrl.bind(this,extr_data_json):""}>
                                                        <span className="platform_color_black">{p.name}</span>
                                                        <div className="platform_votes">
                                                            <span className="platform_color_green">{Utils.realCount(p.total_votes)}</span>
                                                            <span>{this.translate('platform.text_platform_votes')}</span>
                                                        </div>
                                                    </div>
                                                    <div className="platform_list_item_content_list_remark">
                                                        {p.extra_data.description?p.extra_data.description:""}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="platform_list_item_status platform_border_top">
                                                <span className={`platform_status ${p.is_auth ? 'platform_color_red' : 'platform_color_gray'}`}>{this.translate(`platform.text_authorized.${p.is_auth?'yes':'no'}`)}</span>
                                                {p.is_auth ? 
                                                <Button value={this.translate('platform.text_relieve')} bg="#fff" border="#2E7EFE" color="#2E7EFE" fontSize={26} size={18} onClick={this.cancelAuthority.bind(this, p)}/>
                                                : 
                                                <Button value={this.translate('platform.text_authorize')} bg="#fff" border="#cccccc" color="#333333" fontSize={26} size={18} onClick={this.handleAuthority.bind(this, p)}/>
                                                }
                                            </div>
                                        </div>
                                    </li>
                                )
                            })
                        }
                        </ul>
                        :
                        <div className="platform_nodata">
                            <img src={img_nodata} />
                            <span>{this.translate('platform.text_nodata')}</span>
                        </div>
                    }
                </div>
            </div>
        );
    }
}

export default Utils.altConnect(PlatformContainer, [PlatformStore, WalletStore]);