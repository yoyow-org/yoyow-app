import React from "react";
import BaseComponent from "./BaseComponent";
import BalancesActions from "../actions/BalancesActions";
import BalancesStore from "../stores/BalanceStore";
import ContactsActions from "../actions/ContactsActions";
import ContactsStore from "../stores/ContactsStore";
import WalletActions from "../actions/WalletActions";
import WalletStore from "../stores/WalletStore";
import ResourceActions from "../actions/ResourceActions";
import TipsActions from "../actions/TipsActions";
import {Utils} from "../../lib";
import PlatformStore from "../stores/PlatformStore";
import TokensStore from "../stores/TokensStore";
import ResourceStore from "../stores/ResourceStore";
import SettingsActions from "../actions/SettingsActions";
import {img_bg_transfer_auto_restore, img_bg_mes_show} from "../assets/img";
import { filter } from "lodash";
import TipsStore from "../stores/TipsStore"

class MyAccount extends BaseComponent{
    constructor(){
        super();
    }

    componentDidMount(){
        let headerData = {
            title: "mine.head_text",
            canBack:false,

        }
        SettingsActions.updateHeader(headerData);
        WalletActions.setNeedBack(false)
    }

    componentWillMount() {
        let isLoad = this.props.isLoadingShow;
        if (isLoad) {
            TipsActions.loading(true)
        }
        this.checkAccountValid(() => {
            TipsActions.loading(false)
            ResourceActions.checkLife().then(()=>{
                ResourceActions.getRecords(WalletStore.getWallet().yoyow_id);
            })
            .catch();
            let resourceInterval = setInterval(() => {
                ResourceActions.checkLife().then(()=>{
                    ResourceActions.getRecords(WalletStore.getWallet().yoyow_id);
                })
                .catch();
            }, 10000);
            this.setState({ resourceInterval });
        });
    }

    componentWillUnmount() {
        if(this.state){
            let { resourceInterval } = this.state;
            if (resourceInterval) clearInterval(resourceInterval);
        }

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
            ResourceActions.getResources(uid).then(() => {
                TipsActions.loading(false);
                this.routerPush("/" + addr,true);
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
    
    showIndex(addr, prevUrl) {
        this.routerPush(addr, prevUrl,false);
    }

    render(){
        let {available, records} = this.props;
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
                <div ref="layer_mine_index" className="layer_mine_index">
                    <div className="layer_mine_head">

                        <div className="layer_mine_head_list">
                            <ul>
                                <li className="wallet" onClick={this.handleRoute.bind(this, "account-manage")}>
                                    <button></button>
                                    <label>{this.translate("mine.nav_text_account_manage")}</label>
                                </li>
                                <li className="integral" onClick={this.handleRoute.bind(this, "integral-manage")}>
                                    <button></button>
                                    <label>{this.translate("mine.nav_text_integral_manage")}</label>
                                </li>
                            </ul>
                        </div>
                    </div>
                    <div className="bgWhite margin_top_20">
                        <ul>
                            <li className="link_list contacts" onClick={this.handleRoute.bind(this, "contacts")}>
                                {this.translate("mine.nav_text_contacts_manage")}
                            </li>
                            <li className="link_list asset" onClick={this.handleRoute.bind(this, "tokens")}>
                                Token
                            </li>
                        </ul>
                    </div>
                    <div className="bgWhite margin_top_20">
                        <ul>
                            <li className="link_list systemSet" onClick={this.handleRoute.bind(this, "settings")}>
                                {this.translate("mine.nav_text_system_settings")}
                            </li>
                            <li className="link_list aboutUs" onClick={this.handleRoute.bind(this, "about")}>
                                {this.translate("mine.nav_text_about_us")}
                            </li>
                        </ul>
                    </div>

                    {
                        available == true ?
                            <div className="bgWhite margin_top_20">
                                <div className="third_server">
                                    <div className="third_server_title">
                                        <div className="line"></div>
                                        <h3>
                                            {this.translate("mine.nav_text_third_party_service")}
                                        </h3>
                                    </div>
                                    <ul className="third_server_con">
                                        <li
                                            onClick={this.handleRoute.bind(this, "automaticTransfer")}
                                        >
                                            <img src={img_bg_transfer_auto_restore}/>
                                            <span>
                          {this.translate("mine.nav_text_autoMatic_transfer_of_transfer")}
                        </span>
                                        </li>
                                        <li
                                            onClick={this.handleRoute.bind(this, "returnInfoList")}
                                        >
                                            <img src={img_bg_mes_show}/>
                                            <span>
                          {this.translate("mine.nav_text_replay_infomation_view")}
                        </span>
                                            {
                                                msg_flag ? <div className="list_extra">{filter(records, r => {
                                                    return r.is_view == 0
                                                }).length}</div> : <div></div>
                                            }
                                        </li>
                                    </ul>
                                </div>
                            </div>
                            :
                            <div></div>

                    }
                </div>
                <div className="index_layer_native">
                    <ul>
                        <li className="asset" onClick={this.showIndex.bind(this, "/index", true)}>
                              <span>

                                <button></button>
                              </span>
                            <label>{this.translate("balance.index.index_title")}</label>
                        </li>
                        <li className="platform" onClick={this.showIndex.bind(this, "/platformindex", true)}>
                              <span>
                                <button></button>
                              </span>
                            <label>{this.translate("platform.text_head")}</label>

                        </li>
                        <li className="mine active" >
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
export default Utils.altConnect(MyAccount, [BalancesStore, ContactsStore, PlatformStore, WalletStore, TokensStore, ResourceStore,TipsStore]);
