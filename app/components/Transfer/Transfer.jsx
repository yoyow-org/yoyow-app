import React from "react";
import BaseComponent from "../BaseComponent";
import SettingsActions from "../../actions/SettingsActions";
import Input from "../Form/Input";
import Checkbox from "../Form/Checkbox";
import BalancesStore from "../../stores/BalanceStore";
import AccountImage from "../Layout/AccountImage";
import Button from "../Form/Button";
import {ChainValidation} from "yoyowjs-lib";
import {img_un_uid} from "../../assets/img/index";
import BalancesActions from "../../actions/BalancesActions";
import TipsActions from "../../actions/TipsActions";
import Utils from "../../../lib/utils/Utils";
import GlobalParams from "../../../lib/conf/GlobalParams";
import WalletUnlockActions from "../../actions/WalletUnlockActions";
import ContactsStore from "../../stores/ContactsStore";
import ContactsActions from "../../actions/ContactsActions";
import TokensStore from "../../stores/TokensStore";
import TokensActions from "../../actions/TokensAction";
import Mask from "../Layout/Mask";
import {Validation} from "../../../lib";
import Apis from "../../../lib/api/ChainApi";

class Transfer extends BaseComponent {
    constructor() {
        super();
        this.state = {
            val: 0,
            transferBalance: true,
            toAccount: "",
            accountEffective: false,
            firstEnter: false,
            curID: "",
            curLength: 0,
            memoText: "",
            useCsaf: true,
            useBalance: true,
            isWait: false,
            isApp:true
        }

    }

    componentDidMount() {
        let {transferBalance} = this.props
        let isLoad = this.props.router.location.state;

        if(!isLoad){
            TipsActions.loading(true)
        }
        if(window.cordova){
            this.setState({isApp:true})
        }else{
            this.setState({isApp:false})
        }
        let {transferHeadTitle,tokenInfo,selectItems} = this.props;
        if (selectItems != "") {
            this.setState({
                toAccount: selectItems,
                accountEffective: true,
            })
        }
        let _this=this;
        let headerData = {
            buttonLeft: {
                value: "img_back",
            },
            title: transferHeadTitle,
            buttonRight: {
                value: "img_scanning",
                callback: this.handleScanner.bind(this)
            },
            canBack:false,
            onBack:function(){
                _this.routerBack();
            }
        }
        SettingsActions.updateHeader(headerData);
        let type = tokenInfo!=null?"asset":(transferBalance ? "fromBalance" : "fromPrepaid");

        BalancesActions.getAccountInfo().then(res => {
            this.setState({
                curID: res.yoyow_id
            })
            let uid = res.yoyow_id;
            if(tokenInfo==null){
                return Promise.all([
                    BalancesActions.getBalance(uid),
                    BalancesActions.getFees(uid, 0, "", type)
                ]).then(res => {
                   // TipsActions.setLoadingGlobalHide();
                   TipsActions.loading(false);
                })
            }
            else{
                return Promise.all([
                    TokensActions.getTokenByAssetId(tokenInfo.asset_id),
                    BalancesActions.getFees(uid, 0, "", type)
                ]).then(res => {
                   // TipsActions.setLoadingGlobalHide();
                   TipsActions.loading(false);
                })
            }
        });
        if (!localStorage.firstEnterTransfer) {
            this.setState({
                firstEnter: true
            });
            localStorage.firstEnterTransfer = false;
        }
    }

    handleScanner(msg) {
        let {isApp} = this.state;
        if(isApp){
            let erro
            if (msg.text.indexOf("YYW") == 0) {
                erro = this.translate("balance.public.scanner_error_QRreceive");
                TipsActions.alert(erro);

            } else {
                let msgJson = JSON.parse(msg.text)
                if (msg.state) {
                    if (msgJson.type == "transfer-for-fix") {
                        let headTitle=["$"+(msgJson.tokenInfo==null?"YOYOW":msgJson.tokenInfo.symbol),"balance.transfer_for_fix.text_transfer"];
                        BalancesActions.setHeadTitle(headTitle);
                        BalancesActions.setTokenInfo(msgJson.tokenInfo);
                        BalancesActions.setAccount(msgJson.toAccount);
                        BalancesActions.setAmount(msgJson.amount)
                        BalancesActions.setMemo(msgJson.memoText);
                        BalancesActions.setCanMemo(msgJson.canMemo);
                        BalancesActions.handleFundsType(true);

                        this.routerPush("/"+msgJson.type)
                    } else {
                        let msg = this.translate("balance.public.scanner_error_QRreceive");
                        TipsActions.alert(msg);

                    }
                }
            }
        }else{
            this.routerPush('/web-scan',true);
        }
    }

    handleRadio(type, e) {
        let bType
        if (type == "balance") {
            bType = true
        } else {
            bType = false
        }
        BalancesActions.handleFundsType(bType)
    }

    handleToAccunt(e) {
        let val = e.target.value;
        if (/^[1-9]\d*$/.test(val) || val.length < this.state.toAccount.length) {
            this.setState({
                toAccount: val,
            })
            setTimeout(() => {
                let v = this.state.toAccount
                if (v == val) {
                    this.__handleAccountEffective(val)
                }
            }, 500)
        }
    }

    __handleAccountEffective(val) {
        Apis.getAssetsByUid(val).then(() => {
            this.setState({
                accountEffective: true
            })
        }).catch(() => {
            this.setState({
                accountEffective: false
            })
        })

    }

    hideGuild() {
        this.setState({
            firstEnter: false
        })
    }

    setValue(e) {
        let val = e.target.value;
        let {tokenInfo}=this.props;
        if (Validation.isNumber(val)) {
            if(tokenInfo==null){
                val = Utils.formatAmount(val);
            }else{
                val = Utils.formatAmount(val,tokenInfo.precision+1);
            }
            this.setState({val: val});
        }
    }

    handleMemo(e) {
        let {toAccount, val} = this.state;
        let {transferBalance} = this.props;
        let type = "fromBalance";
        if (!transferBalance) {
            type = "fromPrepaid";
        }
        let memoVal = e.target.value;
        let memoLen=Utils.charCounter(memoVal);
        if (memoLen <= 100) {
            this.setState({
                memoText: memoVal,
                curLength: memoLen,
            })
            setTimeout(() => {
                let v = this.state.memoText
                if (v == memoVal) {
                    BalancesActions.getFees(toAccount, val, memoVal, type)
                }
            }, 500)

        }

    }

    handleCheck(e) {
        this.setState({
            useCsaf: e.target.checked
        })
    }

    handleTransfer() {
        this.checkAccountValid(() => {
            let {curAccountInfo, core_balance, prepaid_balance, fees, transferBalance,tokenInfo,tokenVal} = this.props;
            let {val, useCsaf, toAccount, memoText, curID} = this.state;
            let fee = useCsaf ? fees.with_csaf_fees : fees.min_fees;
            let balance = tokenInfo!=null?(tokenVal):(transferBalance ? core_balance : prepaid_balance);

            if (toAccount == "") {
                TipsActions.alert(this.translate("balance.public.tips_errors_no_account"));
                return false;
            } 
            
            if (!ChainValidation.is_account_uid(toAccount)) {
                TipsActions.alert(this.translate("balance.public.tips_errors_err_account"));
                return false;
            } 

            if (val == "" || val == 0) {
                TipsActions.alert(this.translate("balance.public.tips_errors_err_amount_no_fix"));
                return false;
            } 
            
            if (curID == toAccount) {
                TipsActions.alert(this.translate("balance.public.tips_errors_err_toSelf"));
                return false;
            }

            if(tokenInfo!=null){
                if(parseFloat(val)>balance){
                    //资产不足
                    TipsActions.alert(this.translate("balance.public.tips_errors_not_enough_asset",{symbol:tokenInfo.symbol}));
                    return false;
                }

                if(fee>core_balance){
                    //余额不足支付手续费
                    TipsActions.alert(this.translate("balance.public.tips_errors_not_enough_balance_fee"));
                    return false;
                }
            }
            else if(parseFloat(val) + fee > balance){
                if (transferBalance) {
                    TipsActions.alert(this.translate("balance.public.tips_errors_not_enough_balance"));
                    return false;
                } else {
                    TipsActions.alert(this.translate("balance.public.tips_errors_not_enough_prepaid"));
                    return false;
                }
            }
            
            let type = transferBalance ? "fromBalance" : "fromPrepaid";
            WalletUnlockActions.checkLock(false, !transferBalance, null, fees = null).then(() => {
               // TipsActions.setLoadingGlobalShow()
               TipsActions.loading(true);
                BalancesActions.handleTransfer(toAccount, val, memoText, type, transferBalance, useCsaf, true).then(() => {
                   // TipsActions.setLoadingGlobalHide();
                   TipsActions.loading(false);
                    let toastVal = this.translate("balance.public.tips_success_transfer");
                    TipsActions.setToastShow(toastVal);
                    ContactsActions.addContact(toAccount, curAccountInfo.wallet.yoyow_id);
                    let times = 0;
                    window.addEventListener("animationend", () => {
                        times++;
                        if (times == 2) {
                            this.routerBack();
                        }
                    });
                }).catch(err => {
                  //  TipsActions.setLoadingGlobalHide();
                  TipsActions.loading(false);
                    TipsActions.error(err);
                });
            });
        });
    }

    selectContacts() {
        this.routerPush("/contacts-select",true);
    }

    onFocus(isNumber,isPoint,pointLength,ev) {
        let objInput = ev.target;
        let maskObj = ev.target;

        if(window.cordova){
            Utils.handleKeyBoards(objInput,maskObj,isNumber,isPoint,pointLength)
        }
    }

    render() {
        let isZh = this._reactInternalInstance._context.intl.locale == "zh" ? true : false
        let {fees,tokenVal, core_balance, prepaid_balance, transferBalance, csaf_balance,tokenInfo} = this.props;
        let {val, toAccount, accountEffective, curLength, memoText, useCsaf, useBalance} = this.state;
        return (
            <div id="layerContent" className="layer_transfer_index flex_column">
                {this.state.firstEnter ?
                    <div className="guide_transfer">
                        <Mask/>
                        <div className={isZh ? "layer_bg_transfer" : "layer_bg_transfer layer_bg_transfer_en"}
                             onClick={this.hideGuild.bind(this)}></div>
                    </div> : ""}
                <div className="layer_contacts bgWhite">
                    <div className="layer_flex">
                        <div className="account_img">
                            {accountEffective ?
                                <AccountImage account={toAccount} size={{width: 100, height: 100}}/> :
                                <AccountImage image={img_un_uid} account={toAccount} size={{width: 100, height: 100}}/>
                            }
                        </div>
                        <div className="toAccount">
                            <Input onFocus={this.onFocus.bind(this,true,false,0)}
                                onClick={this.onFocus.bind(this,true,false,0)}
                                placeholder={this.translate("balance.public.default_input_text_account")}
                                value={toAccount} type="text"
                                pattern="[0-9]*"
                                onChange={this.handleToAccunt.bind(this)} fontSize={30}
                                maxLength={12}/>
                        </div>
                        <span onClick={this.selectContacts.bind(this)}></span>
                    </div>
                </div>
                <div className="layer_input_balance bgWhite margin_top_20">
                    <div className="input_layer">
                        <Input onFocus={this.onFocus.bind(this,true,true,5)}
                               onClick={this.onFocus.bind(this,true,true,5)}
                               placeholder={this.translate("balance.public.default_input_text_amount")}
                               className="input input_font_size_38" type="text"
                               value={val} onChange={this.setValue.bind(this)}/>
                    </div>
                    {
                        tokenInfo!=null?
                        (<div className="balance">
                            <span>{this.translate("balance.public.text_canUse")}</span>
                            <span className="amount">{tokenVal}</span>
                            <span>{tokenInfo.symbol}</span>
                        </div>)
                        :(<div className="balance">
                            <span>{this.translate("balance.public.text_canUse")}</span>
                            <span className="amount">{transferBalance ? core_balance : prepaid_balance}</span>
                            <span>YOYO</span>
                        </div>)
                    }
                    
                </div>
                <div ref="layer" className="layer_memo  bgWhite margin_top_20">
                    <div className="layer_textArea">
                        <textarea onFocus={this.onFocus.bind(this,false,false,0)}
                                  onClick={this.onFocus.bind(this,false,false,0)}
                                  placeholder={this.translate("balance.public.default_input_text_memo")} value={memoText}
                                  onChange={this.handleMemo.bind(this)}></textarea>
                        <div className="length"><em>{curLength}</em>/100</div>
                    </div>
                </div>
                <div className="layer_info margin_top_20 bgWhite">
                    <div className="layer_fees">
                        <span>{this.translate("balance.public.text_fees")}<em>{useCsaf ? fees.with_csaf_fees : fees.min_fees}</em>{this.translate("balance.public.funds_type_YOYO")}</span>
                        {
                            csaf_balance == 0 ? "" :
                                <div>
                                    <label>
                                        <Checkbox type="checkbox" onChange={this.handleCheck.bind(this)} checked={this.state.useCsaf}/>
                                        <i>{this.translate("balance.public.text_use")}<em>{Utils.formatAmount(fees.use_csaf * GlobalParams.csaf_param, 4)}</em>{this.translate("balance.public.text_integral_deduction")}
                                        </i>
                                    </label>
                                </div>
                        }
                    </div>
                    <div className="layer_button">
                        <Button 
                            onClick={this.handleTransfer.bind(this)} 
                            value={this.translate("balance.public.button_text_transfer")}
                            bg={"#2E7EFE"}
                        />
                    </div>
                </div>
            </div>
        )
    }
}

export default Utils.altConnect(Transfer, [BalancesStore, ContactsStore, TokensStore]);