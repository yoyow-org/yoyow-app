import React from "react";
import BaseComponent from "./BaseComponent";
import BalancesActions from "../actions/BalancesActions";
import BalancesStore from "../stores/BalanceStore";
import TipsActions from "../actions/TipsActions";
import SettingsActions from "../actions/SettingsActions";
import AccountImage from "./Layout/AccountImage";
import Button from "./Form/Button";
import Mask from "./Layout/Mask";
import LayerOut from "./Layout/LayerOut";
import WalletActions from "../actions/WalletActions";
import WalletUnlockActions from "../actions/WalletUnlockActions";
import ContactsActions from "../actions/ContactsActions";
import QRCode from "./Layout/QRCode";
import PlatformActions from "../actions/PlatformActions";
import Clipboard from "clipboard";
import {Utils} from "../../lib";
import WalletStore from "../stores/WalletStore";
import TokensAction from "../actions/TokensAction";
import TokensStore from "../stores/TokensStore";
import ResourceStore from "../stores/ResourceStore";
import ResourceActions from "../actions/ResourceActions";
import TipsStore from "../stores/TipsStore"
import {filter} from "lodash";

let time,recordTimeInval;
class Index extends BaseComponent {
    constructor() {
        super();
        this.state = {
            navShow: true,
            isValid: false,
            firstEnter: false,
            qrShow: false,
            acountList: [],
            qrData: {
                type: "addContact",
                uid: ""
            },
            qrWidth: 0,
            pageClass: {
                assetTabClass: "asset active",
                platformTabClass: "platform",
                mineTabClass: "mine"
            },
            layerStyle: {},
            headerData: [],
            isApp: false,

            reStoreList: [], //自动回复列表
            tokens:[],
            resourceInterval: null,
            showPrikey: false, //私钥查看警告
        }
    }


    __getInfo() {
        BalancesActions.getAccountInfo().then((res) => {
            let uid = res.yoyow_id;
            this.setState({
                qrData: {
                    type: "addContact",
                    uid: uid
                }
            });
            
            let localActivePubKey = res.encrypted_active.pubkey;
            BalancesActions.getChainAccountInfo(uid).then(res=>{
                let chainActivePubKey = res.active.key_auths[0][0];
                if ((localActivePubKey + "") != (chainActivePubKey + "")) {
                    this.setState({
                        isValid: true
                    });
                } else {
                    this.setState({
                        isValid: false
                    });

                }
                return Promise.all([
                    BalancesActions.getChainAccountInfo(uid),
                    BalancesActions.getAccountInfoList(),
                    WalletActions.fetchAccountListStatistics(),
                    BalancesActions.getBalance(uid),
                    TokensAction.getAccountTokensListForIndex(uid)
                ]).then(res => {
                    TipsActions.loading(false);

                    this.setState({
                        acountList: res[2]._tail.array,
                        tokens:res[4]
                    });

                    ResourceActions.checkLife().then(()=>{
                        ResourceActions.getRecords(uid);
                    });

                    if(recordTimeInval){
                        clearInterval(recordTimeInval);
                    }

                    recordTimeInval=setInterval(()=>{
                        ResourceActions.checkLife().then(()=>{
                            ResourceActions.getRecords(uid);
                        });
                    },10000);

                    if (!localStorage.firstEnterIndex) {
                        this.setState({
                            firstEnter: true
                        })
                        localStorage.firstEnterIndex = false
                    }
                }).catch(err => {
                    TipsActions.loading(false);
                    TipsActions.error(err);
                });
            }).catch(err => {
                TipsActions.loading(false);
                TipsActions.error(err);
            })

        }).catch(err => {
            TipsActions.loading(false);
            TipsActions.error(err);
        })
    }

    componentWillMount() {
        WalletStore.getWallet();// TODO: 检查是否查看过上帝私钥

        let qrWidth = 160
        this.setState({
            qrWidth: qrWidth
        })
        let isLoad = this.props.isLoadingShow;
        if (isLoad) {
            TipsActions.loading(true)
        }

        time = setTimeout(()=>{
            this.__getInfo()
        },210);
        this.setState({ isApp: window.cordova ? true : false });
        if (!localStorage.firstEnterIndex) {
            this.setState({
                firstEnter: true
            })
            localStorage.firstEnterIndex = false
        }
    }

    componentDidMount() {
        let {isApp} = this.state;
        let headerData = {
            buttonLeft: {
                value: "tokens",

            },
            title:"",
            buttonRight: {
                value: "img_scanning",
                callback: isApp?this.handleScanner.bind(this):this.webScan.bind(this)
            },
            canBack:false,
            onBack:this.handleRoute.bind(this, "TokenView", "", null)
        }
        SettingsActions.updateHeader(headerData);
        WalletActions.setNeedBack(false)
        let scrWidth = document.documentElement.clientWidth;
        let bl = scrWidth / 750;
        let rem = bl * 40
        let maxHeight = document.documentElement.clientHeight * 0.6;
        let accountInfoListHeight
        accountInfoListHeight = maxHeight - this.refs.layer_info.offsetHeight - 40 / 40 * rem + "px";
        this.refs.accountInfoList.style.maxHeight = accountInfoListHeight;
        new Clipboard(this.refs.copy_btns);
        new Clipboard(this.refs.copy_key);
    }

    componentWillUnmount() {
        this.setState({tokens:[]});
        if(time){
            clearTimeout(time);
        }
        if(recordTimeInval){
            clearInterval(recordTimeInval);
        }
    }

    handleJudgment(type) {
        let msg = ""
        let {core_balance, prepaid_balance, curAccountInfo, csaf_balance} = this.props;
        BalancesActions.getFees(curAccountInfo.wallet.yoyow_id, 1, "", type).then(res => {
            if (type == "toPrepaid") {
                if (core_balance + csaf_balance < res.min_fees) {
                    msg = this.translate(`balance.public.tips_errors_not_enough_balance`);
                }
            } else {
                if (prepaid_balance + csaf_balance < res.min_fees) {
                    msg = this.translate(`balance.public.tips_errors_not_enough_prepaid`);
                }
            }
            if (msg == "") {
                if (type == "toPrepaid") {
                    this.routerPush("/transfer-for-self/toPrepaid",true);
                } else {
                    this.routerPush("/transfer-for-self/toBalance",true);
                }
            } else {
                TipsActions.alert(msg);
            }
        }).catch(err => TipsActions.error(err))

    }

    handleRoute(addr, parms, tokenInfo, e) {
        let uid = WalletStore.getWallet().yoyow_id;
        if (addr == "toPrepaid" || addr == "toBalance") {
            this.checkAccountValid(() => {
                BalancesActions.setTokenInfo(null);
                this.handleJudgment(addr);
            });
        } else if (addr == "fromPrepaid") {
            this.checkAccountValid(() => {
                ContactsActions.selectContact("");
                BalancesActions.handleFundsType(false);
                BalancesActions.setTokenInfo(null);
                BalancesActions.setHeadTitle(parms);
                this.routerPush("/transfer",true);
            });
        } else if (addr == "fromBalance") {
            this.checkAccountValid(() => {
                ContactsActions.selectContact("");
                BalancesActions.handleFundsType(true);
                BalancesActions.setTokenInfo(null);
                BalancesActions.setHeadTitle(parms);
                this.routerPush("/transfer",true);
            });
        } else if (addr == "QRForBalance") {
            this.checkAccountValid(() => {
                BalancesActions.handleFundsType(true);
                if (tokenInfo != null) {
                    delete tokenInfo.description;
                }
                BalancesActions.setTokenInfo(tokenInfo);
                let assetId = tokenInfo == null ? 0 : tokenInfo.asset_id;
                BalancesActions.getQRReceive(assetId);
                this.routerPush("/QRReceive",true);
            });
        } else if (addr == "QRForPrepaid") {
            this.checkAccountValid(() => {
                BalancesActions.handleFundsType(false);
                BalancesActions.setTokenInfo(null);
                this.routerPush("/QRReceive",true);
            });
        } else if (addr == "create-account") {
            WalletActions.setNeedBack(true);
            this.routerPush("/create-account",true);
        } else if (addr == "customer") {
            this.checkAccountValid(() => {
                ContactsActions.selectContact("");
                BalancesActions.setHeadTitle(parms);
                BalancesActions.handleFundsType(true);
                BalancesActions.setTokenInfo(tokenInfo);
                this.routerPush("/transfer",true);
            });
        } else if (addr == "TokenView") {
            this.checkAccountValid(() => {
                this.routerPush("/tokens/view",true);
            });
        } else if (addr == 'automaticTransfer') {
            TipsActions.loading(true);
            ResourceActions.getResources(uid)
            .then(() => {
                TipsActions.loading(false);
                this.routerPush("/" + addr,true);
            })
            .catch(()=>{
                //无效二维码
                TipsActions.alert(this.translate("errors.1022"));
                TipsActions.loading(false);
            });
        } else if (addr == 'returnInfoList') {
            TipsActions.loading(true);
            ResourceActions.getRecords(uid).then(() => {
                TipsActions.loading(false);
                this.routerPush("/" + addr,true);
            });
        } else {
            this.routerPush("/" + addr,true);
        }
    }

    handleChangeAccount(uid, e) {
        TipsActions.loading(true)
        WalletActions.changeAccount(uid).then(() => {
            this.__getInfo();
        }).catch(err => {
                TipsActions.loading(false);
                TipsActions.error(err);
            }
        );
    }

    hideGuild() {
        this.setState({
            firstEnter: false
        })
    }

    qrShow(bool, e) {
        this.setState({
            qrShow: bool
        });
    }

    handleRouterJump(title, url, tokenInfo) {
        this.checkAccountValid(() => {
            BalancesActions.setHeadTitle(title);
            BalancesActions.setTokenInfo(tokenInfo);
            this.routerPush(url,true);
        });
    }

    /**
     * 解除授权
     * @param {*} result
     * @param {*} e
     */
    handleScanning(result, e) {
        TipsActions.toast("result"+result.text)
        if (result.cancelled == 0 || result.cancelled == false) {
            PlatformActions.checkSign(result.text).then(platform => {
                this.routerPush('/import-auth',true);
            }).catch(err => TipsActions.error(err));
        }


    }

    handleScanner(msg) {
        this.checkAccountValid(() => {
            if (msg.cancelled == 0 || msg.cancelled == false) {
                if (msg.text.indexOf("YYW") == 0) {
                    WalletActions.decompress(msg.text).then(() => {
                        this.routerPush("/import-account",true)
                    }).catch(err => {
                        TipsActions.error(err);
                    });
                } else if (msg.text.indexOf('SC') === 0) {
                    let uid = msg.text.substring(2);
                    TipsActions.loading(true);
                    ResourceActions.getResources(uid).then(() => {
                        TipsActions.loading(false);
                        this.routerPush('/selectTransferRestoreList',true)
                    });
                } else {
                    if (Utils.isJSON(msg.text)) {
                        if (msg.state) {
                            let msgJson = JSON.parse(msg.text);
                            if (msgJson.type == "transfer-for-fix") {
                                let headTitle = ["$" + (msgJson.tokenInfo == null ? "YOYOW" : msgJson.tokenInfo.symbol), "balance.transfer_for_fix.text_transfer"];
                                BalancesActions.setHeadTitle(headTitle);
                                BalancesActions.setTokenInfo(msgJson.tokenInfo);
                                BalancesActions.setAccount(msgJson.toAccount);
                                BalancesActions.setAmount(msgJson.amount)
                                BalancesActions.setMemo(msgJson.memoText);
                                BalancesActions.setCanMemo(msgJson.canMemo);
                                BalancesActions.handleFundsType(msgJson.transferBalance);
                                this.routerPush("/" + msgJson.type,true)
                            } else if (msgJson.type == "contacts") {
                                ContactsActions.setQRcodeUid(msgJson.toAccount);
                                this.routerPush("/contacts/add",true)
                            } else {
                                PlatformActions.checkSign(msg.text).then(res => {
                                    WalletActions.setNeedBack(true);
                                    this.routerPush('/import-auth',true);
                                }).catch(err => TipsActions.error(err));
                            }
                        }
                    } else {
                        TipsActions.error(1011);
                    }
                }
            }
        })
    }

    /**
     * 页面切换
     * @param {int} 索引
     * @param {bool} 是否动画
     * @param {*} e
     */
    showIndex(addr, prevUrl) {
        this.routerPush(addr, false,false);
    }

    /**
     * 授权平台
     * @param {*} platform
     * @param {*} e
     */
    handleAuthority(platform, e) {
        this.checkAccountValid(() => {
            PlatformActions.setPlatform(platform);
            this.routerPush("/import-auth",true);
        });
    }

    /**
     * 跳转url
     * @param {*} url
     */
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

    webScan() {
        this.routerPush('/web-scan', true);
    }

    //查看私钥
    handleTogglePrikey(isShow) {
        if (isShow) {
            let wallet = WalletStore.getWallet();
            if (wallet.encrypted_owner) {
                WalletUnlockActions.checkLock(false, false).then(() => {
                    if (!this.props.keyTip) WalletActions.setViewKeyTip(wallet.yoyow_id);
                    this.setState({showPrikey: isShow, privKeyHex: WalletStore.getPrivateKey(0)});
                });
            } else {
                TipsActions.alert(this.translate('detail_account.alert_no_prikey'));
            }
        } else {
            this.setState({showPrikey: isShow, privKeyHex: ''});
        }
    }

    //复制私钥
    handleCopy(e) {
        TipsActions.toast(this.translate('detail_account.text_copy_right'));
        this.setState({showPrikey: false, privKeyHex: ''});
    }

    render() {
        let isZh = this._reactInternalInstance._context.intl.locale == "zh" ? true : false
        let {curAccountInfo, core_balance, prepaid_balance, records, keyTip, wallet} = this.props;
        let {acountList, isValid, pageClass, tokens, showPrikey, privKeyHex} = this.state;
        let uid = curAccountInfo.wallet ? curAccountInfo.wallet.yoyow_id : "";
        let mark = curAccountInfo.wallet ? curAccountInfo.wallet.mark : "";
        let qrForUid = '{"type" : "contacts","toAccount":"' + uid + '"}';
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
            <div className="cover_full">
                {this.state.firstEnter ?
                    <div className="toast_index">
                        <Mask />
                        <div className={isZh ? "layer_bg" : "layer_bg layer_bg_en"}
                             onClick={this.hideGuild.bind(this)}></div>
                    </div> : ""}
                <LayerOut isShow={isValid} closeBtn={false}>
                    <div className="layer_handleAccount">
                        <div ref="layer_info" className="layer_info">
                            <h2>{this.translate("balance.index.text_account_invalid")}</h2>
                            <div className="layer_button">
                                <Button value={this.translate("balance.index.button_text_import")}
                                        onClick={this.handleRoute.bind(this, "import-account")}/>
                            </div>
                            <div className="layer_button">
                                <Button value={this.translate("balance.index.button_text_create")}
                                        onClick={this.handleRoute.bind(this, "create-account")}/>
                            </div>
                            <h2 className="useOther">{this.translate("balance.index.text_use_another")}</h2>
                        </div>
                        <ul ref="accountInfoList">
                            {
                                acountList.map((item, i) => {
                                    return (<li style={{display: item.is_trash ? "none" : "block"}} key={i}
                                                onClick={this.handleChangeAccount.bind(this, item.uid)}>
                                        <dl>
                                            <dt><AccountImage account={item.uid + ""} size={{width: 120, height: 120}}/>
                                            </dt>
                                            <dd>
                                                <div>{"#" + item.uid} <i>{item.mark}</i></div>
                                                <span>{this.translate("balance.index.text_total_balance_YOYO")}<em>{item.balance + item.prepaid}</em></span>
                                            </dd>
                                        </dl>
                                    </li>)
                                })}

                        </ul>
                    </div>
                </LayerOut>

                {/* 新增查看账号私钥 start */}
                <LayerOut
                    isShow={showPrikey}
                    onClose={this.handleTogglePrikey.bind(this, false)}
                    className="home_account_prinkey">
                    <div className="home_account_prinkey_wrap">
                        <div className="home_account_detail_prikey_head">
                            {this.translate('detail_account.text_prikey_head')}
                        </div>
                        <div className="home_account_detail_prikey_title">
                            {this.translate('detail_account.text_prikey_title')}
                        </div>
                        <div className="home_account_detail_prikey_content">
                            <span>{privKeyHex}</span>
                        </div>
                        <div className="home_account_detail_prikey_button">
                            <input
                                ref="copy_key"
                                data-clipboard-text={privKeyHex}
                                type="button"
                                onClick={this.handleCopy.bind(this)}
                                value={this.translate('detail_account.button_copy')}/>
                        </div>
                    </div>
                </LayerOut>
                {/* 新增查看账号私钥 end */}

                <div ref="layer_asset_index" className="layer_asset_index pdb">
                    <LayerOut isShow={this.state.qrShow} closeBtn={true} onClose={this.qrShow.bind(this)}>
                        <div className="title_index_qr">{this.translate('balance.index.text_mine_qrcode')}</div>
                        <div className="layer_QR"><QRCode level="M" account={uid} size={this.state.qrWidth}
                                                          value={qrForUid}/></div>
                        <div className="layer_copy">
                            <div>
                                <span>#{uid}</span>
                                <button ref="copy_btns" data-clipboard-text={uid}
                                        onClick={this.handleCopy.bind(this)}>{this.translate("balance.public.button_copy")}
                                </button>
                            </div>
                        </div>
                    </LayerOut>

                    <div className="layer_header_index index_margin_top">
                        {/*<div className="layer_top_ctr">*/}
                        {/*<h1></h1>*/}
                        {/*{isApp ? <Scanner callback={this.handleScanner.bind(this)}></Scanner> :*/}
                        {/*<button className="create_account_scan" onClick={this.webScan.bind(this)}></button>*/}
                        {/*}*/}
                        {/*</div>*/}
                        <dl>
                            <dt>
                                {!keyTip && wallet.encrypted_owner ?
                                    (<div
                                        onClick={this.handleTogglePrikey.bind(this, true)}
                                        className="privateKey_tip">!</div>) : ''
                                }
                                <AccountImage account={uid} size={{width: 180, height: 180}}/>

                            </dt>
                            <dd className="my_account">
                                <strong>
                                    #{uid}
                                </strong>
                                <span className="qrcode"
                                      onClick={this.handleRoute.bind(this, "QRForBalance", "", null)}></span>
                            </dd>

                            <dd className="my_account_text">
                                {mark}
                            </dd>
                        </dl>
                        {/*<span className="tokens"*/}
                        {/*onClick={this.handleRoute.bind(this, "TokenView", "", null)}></span>*/}
                        {/* <span className="qrcode" onClick={this.handleRoute.bind(this, "QRForBalance","",null)}></span> */}
                    </div>
                    <div className="layer_content_index">
                        <div className="assets_info">
                            <div className="layer_assets_button"
                                 onClick={this.handleRouterJump.bind(this, null, "/history", null)}>
                                <div className="assets_quantity">{core_balance}</div>
                                <div className="assets_title">
                                    {this.translate("balance.public.text_yoyo_balance")}
                                </div>

                            </div>
                            <div className="layer_trans_button">
                                <Button
                                    onClick={this.handleRoute.bind(this, "fromBalance", [ "balance.transfer.title","detail_account.text_yoyo_balance"], null)}
                                    value={this.translate("balance.public.button_text_transfer")} bg="#fff"
                                />
                                <Button onClick={this.handleRoute.bind(this, "toPrepaid")}
                                        value={this.translate("balance.public.button_text_toPrepaid")} bg="#fff"
                                />
                            </div>
                        </div>
                        <div className="assets_info">
                            <div className="layer_assets_button"
                                 onClick={this.handleRouterJump.bind(this, null, "/history/1", null)}>
                                <div className="assets_quantity">{prepaid_balance}</div>
                                <div className="assets_title">
                                    {this.translate("balance.public.text_yoyo_prepaid")}
                                </div>

                            </div>
                            <div className="layer_trans_button">
                                <Button
                                    onClick={this.handleRoute.bind(this, "fromPrepaid", [ "balance.transfer.title","detail_account.text_yoyo_prepaid"], null)}
                                    value={this.translate("balance.public.button_text_transfer")} bg="#fff"
                                    border="#ccc" color="#333" fontSize={26} size={18}/>
                                <Button onClick={this.handleRoute.bind(this, "toBalance")}
                                        value={this.translate("balance.public.button_text_toBalance")} bg="#fff"
                                        border="#2E7EFE" color="#2E7EFE" fontSize={26} size={18}/>
                            </div>
                        </div>
                        {
                            tokens.length > 0 ? tokens.map((item) => {
                                return (
                                    <div className="assets_info" key={item.asset_id}>
                                        <div className="layer_assets_button"
                                             onClick={this.handleRouterJump.bind(this, ["$" + item.symbol,"history.op_title_Suffix"], "/history", item)}>
                                            <div
                                                className="assets_quantity">{item.amount / Utils.precisionToNum(item.precision)}</div>
                                            <div className="assets_title">
                                                {item.symbol}
                                            </div>
                                        </div>
                                        <div className="layer_trans_button">
                                            <Button
                                                onClick={this.handleRoute.bind(this, "customer", ["balance.transfer.title","$" + item.symbol], item)}
                                                value={this.translate("balance.public.button_text_transfer")}
                                                bg="#fff"
                                                border="#2E7EFE" color="#333" fontSize={26} size={18}/>

                                            <Button value={this.translate("balance.index.button_text_QRreceive")}
                                                    onClick={this.handleRoute.bind(this, "QRForBalance", "", item)}
                                                    bg="#fff"
                                                    border="#2E7EFE"
                                                    color="#2E7EFE"
                                                    fontSize={26}
                                                    size={18}/>
                                        </div>
                                    </div>
                                )

                            }) : ""
                        }
                    </div>
                </div>
                {/* tabBar  */}
                <div className="index_layer_native">
                    <ul>
                        <li className="asset active" >
                              <span>

                                <button></button>
                              </span>
                            <label>{this.translate("balance.index.index_title")}</label>
                        </li>
                        <li className={pageClass.platformTabClass} onClick={this.showIndex.bind(this, "/platformindex", true)}>
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

export default Utils.altConnect(Index, [BalancesStore, WalletStore, TokensStore, ResourceStore,TipsStore]);


