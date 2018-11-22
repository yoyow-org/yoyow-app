import React from "react";
import BaseComponent from "../BaseComponent";
import {connect} from "alt-react";
import BalancesActions from "../../actions/BalancesActions";
import BalancesStore from "../../stores/BalanceStore";
import TipsActions from "../../actions/TipsActions";
import SettingsActions from "../../actions/SettingsActions";
import AccountImage from "../Layout/AccountImage";
import LinkButton from "../Layout/LinkButton";
import Button from "../Form/Button";
import Mask from "../Layout/Mask";
import LayerOut from "../Layout/LayerOut";
import Input from "../Form/Input";
import Checkbox from "../Form/Checkbox";
import Utils from "../../../lib/utils/Utils";
import GlobalParams from "../../../lib/conf/GlobalParams";
import WalletUnlockActions from "../../actions/WalletUnlockActions";
import {Validation} from "../../../lib";

class TransferForSelf extends BaseComponent {
    constructor() {
        super();
        this.state = {
            useCsaf: true,
            useBalance: true,
            val: 0,
            curID: ""
        }
    }

    componentDidMount() {
        let {params} = this.props
        let headerData = {
            buttonLeft: {
                value: "img_back",
            },
            title: params.type == "toPrepaid" ? "balance.public.button_text_toPrepaid" : "balance.public.button_text_toBalance",

            canBack: true
        }
        SettingsActions.updateHeader(headerData);
        this.__getCurAccountInfo()
    }

    __getCurAccountInfo() {
        let {params} = this.props;
        BalancesActions.getAccountInfo().then(res => {
            this.setState({
                curID: res.yoyow_id
            })
            let uid = res.yoyow_id
            return Promise.all([
                BalancesActions.getBalance(uid),
                BalancesActions.getFees(uid, 0, "", params.type)
            ]).then(res => {
                if (params.type != "toPrepaid") {
                    this.setState({
                        useBalance: false
                    })
                }
            })
        })

    }

    setValue(e) {
        let val = e.target.value;
        if (Validation.isNumber(val)) {
            val = Utils.formatAmount(val);
            this.setState({val: val});
        }
    }

    handleCheck(e) {

        this.setState({
            useCsaf: e.target.checked
        })
    }

    handleTransfer() {
        this.checkAccountValid(()=>{
            let {core_balance, prepaid_balance, params, fees} = this.props;
            let {val, useCsaf, useBalance, curID} = this.state;
            let fee = useCsaf ? fees.with_csaf_fees : fees.min_fees;
            let msg;
            let balance = params.type == "toPrepaid" ? core_balance : prepaid_balance;
            if (parseFloat(val) + fee > balance) {
                if(params.type == "toPrepaid"){
                    msg = this.translate("balance.public.tips_errors_not_enough_balance")
                }else{
                    msg = this.translate("balance.public.tips_errors_not_enough_prepaid")
                }
            } else if (val == "" || val == 0) {
                if(params.type == "toPrepaid"){
                    msg = this.translate("balance.public.tips_errors_err_amount_toPrepaid")
                }else{
                    msg = this.translate("balance.public.tips_errors_err_amount")
                }

            }
            if (!msg) {
                WalletUnlockActions.checkLock(false, !useBalance, null, fees = null).then(() => {
                   // TipsActions.setLoadingGlobalShow()
                   TipsActions.loading(true);
                    BalancesActions.handleTransfer(curID, val, "", params.type, useBalance, useCsaf, true).then(() => {
                        BalancesActions.getAccountInfo().then(res => {
                            let uid = res.yoyow_id
                            return Promise.all([
                                BalancesActions.getBalance(uid),
                                BalancesActions.getFees(uid, 0, "", params.type)
                            ]).then(res => {
                                this.setState({
                                    val: ""
                                })
                                if (params.type != "toPrepaid") {
                                    this.setState({
                                        useBalance: false,
                                    })
                                }
                                //TipsActions.setLoadingGlobalHide();
                                TipsActions.loading(false);
                                let toastVal = params.type == "toPrepaid" ?this.translate("balance.public.tips_success_transfer_toPrepaid"):this.translate("balance.public.tips_success_transfer_toBalance");
                                TipsActions.setToastShow(toastVal);
                                let times = 0
                                window.addEventListener("animationend",()=>{
                                    times++
                                    if(times == 2){
                                        this.routerPush("/index")
                                    }
                                })
                            })
                        })

                    }).catch(err => {
                      //  TipsActions.setLoadingGlobalHide();
                        TipsActions.loading(false);
                        TipsActions.toast(err.msg);
                    })
                })
            } else {
                TipsActions.alert(msg);
            }
        })


    }
    onFocus(isNumber,isPoint,pointLength,ev) {
        let objInput = ev.target;
        let maskObj = ev.target;
        if(window.cordova){
            Utils.handleKeyBoards(objInput,maskObj,isNumber,isPoint,pointLength)
        }

        //console.log(ev.target.value)
    }
    render() {
        let {core_balance, prepaid_balance, params, fees, csaf_balance} = this.props;
        let {useCsaf} = this.state;
        return (
            <div className="layer_transfer_index">
                <div className="layer_input bgWhite">
                    <div className="input_layer">
                        <Input
                            onFocus={this.onFocus.bind(this,true,true,5)}
                            onClick={this.onFocus.bind(this,true,true,5)}
                            placeholder={this.translate("balance.public.default_input_text_amount")} 
                            type="text" onChange={this.setValue.bind(this)} fontSize={38}
                            value={this.state.val}/>
                    </div>
                    <div className="balance">
                        {params.type == "toPrepaid" ?this.translate("balance.public.text_yoyo_balance") : this.translate("balance.public.text_yoyo_prepaid")}
                        <em>{params.type == "toPrepaid" ? core_balance : prepaid_balance}</em>
                    </div>
                </div>
                <div className="layer_info margin_top_20 bgWhite">
                    <div className="layer_fees">
                        <span>{this.translate("balance.public.text_fees")}<em>{useCsaf ? fees.with_csaf_fees : fees.min_fees}</em>{this.translate("balance.public.funds_type_YOYO")}</span>
                        {
                            csaf_balance == 0 ? "" :
                                <div>
                                    <label>
                                        <Checkbox type="checkbox" onChange={this.handleCheck.bind(this)}
                                                  checked={this.state.useCsaf}/>

                                        <i>{this.translate("balance.public.text_use")}<em>{Utils.formatAmount(fees.use_csaf * GlobalParams.csaf_param, 4)}</em>{this.translate("balance.public.text_integral_deduction")}</i>
                                    </label>
                                </div>
                        }
                    </div>
                    <div className="layer_button">
                        <Button onClick={this.handleTransfer.bind(this)} 
                        value={this.translate("balance.public.button_text_transfer")}
                        bg={"#2E7EFE"}
                        />
                    </div>
                </div>
            </div>
        )
    }
}


export default connect(TransferForSelf, {
    listenTo(){
        return [BalancesStore]
    },
    getProps(){
        return BalancesStore.getState();
    }
})