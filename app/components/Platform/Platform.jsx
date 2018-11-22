import React from "react";
import BaseComponent from "../BaseComponent";
import Button from "../Form/Button";
import PlatformActions from "../../actions/PlatformActions";
import { Utils } from "../../../lib";
import PlatformStore from "../../stores/PlatformStore";
import { img_nodata, img_aubot_logo } from "../../assets/img";
import TipsActions from "../../actions/TipsActions";
import WalletUnlockActions from "../../actions/WalletUnlockActions";
import SettingsActions from "../../actions/SettingsActions";
import ResourceActions from "../../actions/ResourceActions";
import WalletActions from "../../actions/WalletActions";
import WalletStore from "../../stores/WalletStore";
import ResourceStore from "../../stores/ResourceStore";
import TipsStore from "../../stores/TipsStore";

let tim = null
let recordTimeInval;
class Platform extends BaseComponent {
    constructor() {
        super()
        this.state = {
            isApp: true,
            indexplatforms:[]
        }
    }
    
    componentWillMount() {
        this.checkAccountValid(() => {
            tim = setTimeout(()=>{
                this.__getPlatforms();
            },210)
            this.setState({ isApp: window.cordova ? true : false });
        });
    }

    componentDidMount() {
        let { isApp } = this.state;
        let headerData = {
            buttonLeft: null,
            title: "platform.text_head",
            buttonRight: {
                value: "img_scanning",
                callback: isApp ? this.handleScanning.bind(this) : this.webScan.bind(this)
            },
            canBack: false,
        }

        SettingsActions.updateHeader(headerData);
        WalletActions.setNeedBack(false)

    }

    __getPlatforms() {
        let isLoad = this.props.isLoadingShow;
        if (isLoad) {
            TipsActions.loading(true)
        }
        PlatformActions.getPlatformsForIndex()
        .then((res)=>{
            TipsActions.loading(false);
            let platformInit = res.slice(0,5);
            let platformEnd = res.slice(5);
            this.setState({
                indexplatforms:platformInit
            });
            let t = setTimeout(()=>{
                this.setState({
                    indexplatforms:platformInit.concat(platformEnd)
                })
                clearTimeout(t)
            },100);

            ResourceActions.checkLife().then(()=>{
                ResourceActions.getRecords(WalletStore.getWallet().yoyow_id);
            });

            if(recordTimeInval){
                clearInterval(recordTimeInval);
            }

            recordTimeInval=setInterval(()=>{
                ResourceActions.checkLife().then(()=>{
                    ResourceActions.getRecords(WalletStore.getWallet().yoyow_id);
                });
            },10000);

        }).catch(err => {
            TipsActions.loading(false);
            TipsActions.error(err)
        });
    }

    componentWillUnmount() {
        if(tim){
            clearTimeout(tim);
        }

        if(recordTimeInval){
            clearInterval(recordTimeInval);
        }
    }


    handleScanning(result, e) {
        if (result.cancelled == 0 || result.cancelled == false) {
            PlatformActions.checkSign(result.text).then(platform => {
                this.routerPush('/import-auth', true);
            }).catch(err => TipsActions.error(err));
        }
    }

    webScan() {
        this.routerPush('/web-scan', true);
    }

    toSearch() {
        PlatformActions.setKeywords('');
        this.routerPush('/platform/search', true);
    }

    cancelAuthority(platform, e) {
        this.checkAccountValid(() => {
            PlatformActions.cancelAuthority(platform.owner, true, false).then(fees => {
                WalletUnlockActions.checkLock(true, false, this.translate('platform.text_descript'), fees)
                    .then(useCsaf => {

                        TipsActions.loading(true);
                        PlatformActions.cancelAuthority(platform.owner, useCsaf, true).then(res => {
                            this.__getPlatforms();
                            TipsActions.loading(false);
                            TipsActions.toast(this.translate('platform.text_success'));
                        }).catch(err => {
                            TipsActions.loading(false);
                            TipsActions.error(err);
                        })
                    }).catch(err => {
                        TipsActions.error(err);
                    });
            }).catch(err => {
                TipsActions.error(err);
            });
        });
    }

    handleAuthority(platform, e) {
        this.checkAccountValid(() => {
            PlatformActions.setPlatform(platform);
            this.routerPush("/import-auth", true);
        });
    }

    handleJumpToUrl(data) {
        if (Utils.checkPlatform() == "ios" && data.urlscheme && data.urlscheme.length > 0) {

            PlatformActions.iosJump(data);
            return false;
        }

        if (Utils.checkPlatform() == "android" && data.packagename && data.packagename.length > 0) {

            PlatformActions.androidJump(data);
            return false;
        }
        PlatformActions.h5Jump(data.h5url);
    }

    showIndex(addr, prevUrl) {
        this.routerPush(addr, prevUrl, false);
    }

    render() {
        let { isApp ,indexplatforms} = this.state;
        let { records } = this.props;
        let isAndroid  = Utils.checkPlatform() //判断搜索框根据平添加class=anzhuo
        let msg_flag = false;
        let msgCount = 0;
        for (let i in records) {
            if (records[i].is_view == 0) {
                msgCount += 1;
            }
        }
        if (msgCount > 0) {
            msg_flag = true;
        }
        return (
            <div id="layerContent" className="layer_transfer_index flex_column">
                <div ref="layer_platform_index" className="layer_platform_index">

                    <div className="platform_search_button_layer">
                        <div className="search" onClick={this.toSearch.bind(this)}>
                            <span></span>
                            <form action="">
                                <input type="search" readOnly="readOnly" placeholder={this.translate("platform.placeholder_search")} className={isAndroid ==='ios'?"":"anzhuo"}/>
                            </form>
                            <div style={{
                                //解决苹果触发input键盘事件
                                position:'absolute',
                                left:'0',
                                top:'0',
                                bottom:'0',
                                right:'0',
                                //backgroundColor:'red',
                                opacity:0
                                }}>
                            </div>
                        </div>
                        {/* <Search readOnly={true} placeholder={this.translate('platform.placeholder_search')} /> */}
                    </div>
                    <div className="platform_content_wrapper pdb">
                        {
                            indexplatforms.length > 0
                                ?
                                <ul className="platform_list" ref="list">
                                    {
                                        indexplatforms.map((p, inx) => {
                                            let isJump = false;
                                            let extr_data_json = {};
                                            if (p.extra_data && Utils.isJSON(p.extra_data)) {
                                                extr_data_json = JSON.parse(p.extra_data);
                                                if (extr_data_json.h5url && extr_data_json.h5url.length > 0) {
                                                    isJump = true;
                                                }
                                                if (extr_data_json.packagename && extr_data_json.packagename.length > 0) {
                                                    isJump = true;
                                                }
                                                if (extr_data_json.urlscheme && extr_data_json.urlscheme.length > 0) {
                                                    isJump = true;
                                                }
                                            }
                                            return (
                                                <li key={`platform_inx_${inx}`}>
                                                    <div className="platform_list_item">
                                                        <div className="platform_list_item_content">
                                                            <div className="platform_list_item_content_head">
                                                                <img
                                                                    src={extr_data_json.image ? extr_data_json.image : img_aubot_logo} />
                                                            </div>
                                                            <div className="platform_list_item_content_list">
                                                                <div
                                                                    className={`platform_list_item_content_info${isJump ? "" : " un_background"}`}
                                                                    onClick={isJump ? this.handleJumpToUrl.bind(this, extr_data_json) : ""}>
                                                                    <span
                                                                        className="platform_color_black">{p.name}</span>
                                                                    <div className="platform_votes">
                                                                        <span
                                                                            className="platform_color_green">{Utils.realCount(p.total_votes)}</span>
                                                                        <span>{this.translate('platform.text_platform_votes')}</span>
                                                                    </div>
                                                                </div>
                                                                <div
                                                                    className="platform_list_item_content_list_remark">
                                                                    {p.extra_data.description ? p.extra_data.description : ""}
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div
                                                            className="platform_list_item_status platform_border_top">
                                                            <span
                                                                className={`platform_status ${p.is_auth ? 'platform_color_red' : 'platform_color_gray'}`}>{this.translate(`platform.text_authorized.${p.is_auth ? 'yes' : 'no'}`)}</span>
                                                            {p.is_auth ?
                                                                <Button
                                                                    value={this.translate('platform.text_relieve')}
                                                                    bg="#fff" border="#2E7EFE" color="#2E7EFE"
                                                                    fontSize={26} size={18}
                                                                    onClick={this.cancelAuthority.bind(this, p)} />
                                                                :
                                                                <Button
                                                                    value={this.translate('platform.text_authorize')}
                                                                    bg="#fff" border="#cccccc" color="#333333"
                                                                    fontSize={26} size={18}
                                                                    onClick={this.handleAuthority.bind(this, p)} />
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
                <div className="index_layer_native">
                    <ul>
                        <li className="asset" onClick={this.showIndex.bind(this, "/index", true)}>
                            <span>

                                <button></button>
                            </span>
                            <label>{this.translate("balance.index.index_title")}</label>
                        </li>
                        <li className="platform active">
                            <span>
                                <button></button>
                            </span>
                            <label>{this.translate("platform.text_head")}</label>

                        </li>
                        <li className="mine" onClick={this.showIndex.bind(this, "/myaccount", true)}>
                            <span>
                                <button></button>
                                {
                                    msg_flag ? <em className="badge-dot"></em> : <em></em>
                                }
                            </span>
                            <label>{this.translate("mine.head_text")}</label>
                        </li>
                    </ul>
                </div>
            </div>
        )
    }
}
export default Utils.altConnect(Platform, [PlatformStore, ResourceStore,TipsStore]);
