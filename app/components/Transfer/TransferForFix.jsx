import React from "react";
import {connect} from "alt-react";
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
import GlobalParams from "../../../lib/conf/GlobalParams";
import WalletUnlockActions from "../../actions/WalletUnlockActions";
import ContactsStore from "../../stores/ContactsStore";
import ContactsActions from "../../actions/ContactsActions";
import {Utils,Validation} from "../../../lib";
import TokensStore from "../../stores/TokensStore";
import TokensActions from "../../actions/TokensAction";

class TransferForFix extends BaseComponent {
    constructor() {
        super();
        this.state = {
            val:0,
            transferBalance: true,
            accountEffective: true,
            curID: "",
            curLength: 0,
            memoText: "",
            useCsaf: true,
            useBalance: true,
        }
    }

    componentWillMount() {
        let isLoad = this.props.router.location.state;

        if(!isLoad){
            TipsActions.loading(true)
        }
        let {transferHeadTitle,transferBalance, receiveMemo,tokenInfo} = this.props
        // let headerData = {
        //     buttonLeft: {
        //         value: "img_back",
        //     },
        //     title: transferHeadTitle,
        //     buttonRight: {
        //         value: ""
        //     },
        //     canBack: true
        // }
        // SettingsActions.updateHeader(headerData);
        let type = tokenInfo!=null?"asset":(transferBalance ? "fromBalance" : "fromPrepaid");
        BalancesActions.getAccountInfo().then(res => {
            this.setState({
                curID: res.yoyow_id,
                curLength: receiveMemo.length
            })
            let uid = res.yoyow_id;
            if(tokenInfo==null){
                return Promise.all([
                    BalancesActions.getBalance(uid),
                    BalancesActions.getFees(uid, 0, "", type)
                ]).then(res => {
                    //TipsActions.setLoadingGlobalHide();
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
        })
    }
    componentDidMount(){
        let {transferHeadTitle} = this.props
        let headerData = {
            buttonLeft: {
                value: "img_back",
            },
            title: transferHeadTitle,
            buttonRight: {
                value: ""
            },
            canBack: true
        }
        SettingsActions.updateHeader(headerData);
    }
    
    handleScanner(msg) {
        let erro
        if(msg.text.indexOf("YYW")==0){
            erro = this.translate("balance.public.scanner_error_QRreceive");
            TipsActions.alert(erro);
        }else{
            let msgJson = JSON.parse(msg.text)

            if (msg.state) {
                if (msgJson.type == "transfer-for-fix") {
                    BalancesActions.setTokenInfo(msgJson.tokenInfo);
                    BalancesActions.setAccount(msgJson.toAccount);
                    BalancesActions.setAmount(msgJson.amount)
                    BalancesActions.setMemo(msgJson.memoText);
                    BalancesActions.setCanMemo(msgJson.canMemo);
                    BalancesActions.handleFundsType(msgJson.transferBalance);
                    this.routerPush("/"+msgJson.type)
                } else {
                   let msg= this.translate("balance.public.scanner_error_QRreceive");
                    TipsActions.alert(msg);
                }
            }
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
        let val =(e.target.value).trim();
        if(/^[1-9]\d*$/.test(val) || val.length < this.state.toAccount.length){
            this.setState({
                toAccount: val,
                accountEffective: ChainValidation.is_account_uid(val)
            })
        }
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
        let {canMemo} = this.props;
        let {val} = this.state;
        let {transferBalance, toAccount, receiveMemo} = this.props;
        let type = "fromBalance";
        if (!transferBalance) {
            type = "fromPrepaid";
        }
        let inputVal = e.target.value;
        if(canMemo){
            let memoLen=Utils.charCounter(inputVal);
            if(memoLen<=100){
                this.setState({
                    curLength: memoLen,
                    memoText:inputVal
                })
                BalancesActions.setMemo(inputVal);
                BalancesActions.getFees(toAccount, val, inputVal, type)
            }
        }
    }

    handleCheck(e) {
        this.setState({
            useCsaf: e.target.checked
        })
    }

    handleTransfer() {
        this.checkAccountValid(()=>{
            let {core_balance,curAccountInfo, prepaid_balance, receiveMemo, canMemo,fees, transferBalance, toAccount, receiveAmount,tokenInfo,tokenVal} = this.props;
            let {val, useCsaf, curID} = this.state;
            let fee = useCsaf ? fees.with_csaf_fees : fees.min_fees;
            let amount = canMemo?val:receiveAmount;
            let balance = tokenInfo!=null?(tokenVal):(transferBalance ? core_balance : prepaid_balance);
            
            if (amount == "" || amount == 0) {
                TipsActions.alert(this.translate("balance.public.tips_errors_err_amount_no_fix"));
                return false;
            } 
            
            if (toAccount == "" ) {
                TipsActions.alert(this.translate("balance.public.tips_errors_no_account"));
                return false;
            }
            
            if(!ChainValidation.is_account_uid(toAccount)){
                TipsActions.alert(this.translate("balance.public.tips_errors_err_account"));
                return false;
            }
            
            if (curID == toAccount) {
                TipsActions.alert(this.translate("balance.public.tips_errors_err_toSelf"));
                return false;
            }

            //非核心资产转账
            if(tokenInfo!=null){
                if(parseFloat(amount)>balance){
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
            //核心资产余额或零钱转账
            if (parseFloat(amount) + fee > balance) {
                if(transferBalance){
                    TipsActions.alert(this.translate("balance.public.tips_errors_not_enough_balance"));
                    return false;
                }else{
                    TipsActions.alert(this.translate("balance.public.tips_errors_not_enough_prepaid"));
                    return false;
                }
            }
            

            let type = transferBalance ? "fromBalance" : "fromPrepaid";
            WalletUnlockActions.checkLock(false, !transferBalance, null, fees = null).then(() => {
                //TipsActions.setLoadingGlobalShow();
                TipsActions.loading(true);
                BalancesActions.handleTransfer(toAccount, amount, receiveMemo, type, transferBalance, useCsaf, true).then(() => {
                    //TipsActions.setLoadingGlobalHide();
                    TipsActions.loading(false);
                    let toastVal = this.translate("balance.public.tips_success_transfer");
                    ;
                    TipsActions.setToastShow(toastVal);
                    ContactsActions.addContact(toAccount,curAccountInfo.wallet.yoyow_id);
                    let times = 0
                    window.addEventListener("animationend", () => {
                        times++
                        if (times == 2) {
                            this.routerPush("/index")
                        }
                    })

                }).catch(err => {
                   // TipsActions.setLoadingGlobalHide();
                   TipsActions.loading(false);
                    TipsActions.toast(err.msg);
                })
            });
        })


    }
    onFocus(isNumber,isPoint,pointLength,ev) {
        let objInput = ev.target;
        let maskObj = ev.target;
        if(window.cordova){
            Utils.handleKeyBoards(objInput,maskObj,isNumber,isPoint,pointLength);
        }
    }

    render() {
        let {fees, core_balance, prepaid_balance, csaf_balance, receiveMemo, transferBalance, toAccount, receiveAmount, canMemo,tokenInfo,tokenVal} = this.props;
        let {val,memoText, accountEffective, curLength, useCsaf} = this.state;
        let memoShow = true;
        if(!canMemo&&receiveMemo==""){
            memoShow = false;
        }
        return (
            <div id="layerContent" className="layer_transfer_index flex_column">
                <div className="layer_contacts bgWhite margin_top_20">
                    <div className="layer_flex">
                    <div className="account_img">
                        {accountEffective ?
                            <AccountImage account={toAccount} size={{width: 100, height: 100}}/> :
                            <AccountImage image={img_un_uid} account={toAccount} size={{width: 100, height: 100}}/>
                        }
                    </div>
                    <div className="toAccount">
                        <div className="amount_fix">
                            <div>{this.translate("balance.transfer_for_fix.text_to")}<i>#{toAccount}</i>{this.translate("balance.transfer_for_fix.text_transfer")}
                            </div>
                            {(receiveAmount!="" && receiveAmount!=0)? <div><em>{receiveAmount}</em>{tokenInfo==null?"YOYO":tokenInfo.symbol}</div> : "" }
                        </div>
                    </div>
                    </div>
                </div>
                {(receiveAmount!="" && receiveAmount!=0) ? ""
                    :
                    <div className="layer_input_balance bgWhite margin_top_20">

                        <div className="input_layer">
                            <Input onFocus={this.onFocus.bind(this,true,true,5)}
                                   onClick={this.onFocus.bind(this,true,true,5)}
                                   placeholder={this.translate("balance.public.default_input_text_amount")}
                                   type="text" fontSize={38}
                                   decimal="true" pattern="[0-9]*"
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
                }
                {memoShow?

                    canMemo?
                        <div className="layer_memo bgWhite margin_top_20">
                            <div className="layer_textArea">
                                <textarea onFocus={this.onFocus.bind(this,false,false)} readOnly={!canMemo} placeholder="转账备注" onChange={this.handleMemo.bind(this)} value={memoText}></textarea>
                                <div className="length"><em>{curLength}</em>/100</div>
                            </div>
                        </div>
                        :
                        <div className="layer_memo bgWhite margin_top_20">
                            <div className="layer_receive"><span>{this.translate("balance.QR_receive.receiveMemo")}:</span>{receiveMemo}</div>
                        </div>
                    :
                    ""
                }
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
                        <Button onClick={this.handleTransfer.bind(this)}
                                value={this.translate("balance.public.button_text_transfer")}/>
                    </div>
                </div>
            </div>
        )
    }
}

export default Utils.altConnect(TransferForFix, [BalancesStore, ContactsStore, TokensStore]);