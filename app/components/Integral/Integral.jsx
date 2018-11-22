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
import Utils from "../../../lib/utils/Utils";
import GlobalParams from "../../../lib/conf/GlobalParams";
import WalletUnlockActions from "../../actions/WalletUnlockActions";
import DragBar from "../Form/DragBar";
import ContactsStore from "../../stores/ContactsStore";
import ContactsActions from "../../actions/ContactsActions";
import Apis from "../../../lib/api/ChainApi";


class Integral extends BaseComponent {
    constructor() {
        super();
        this.state = {
            val: "",
            toAccount: "",
            accountEffective: false,
            curID: "",
            curLength: 0,
            memoText: "",
            useCsaf: true,
            useBalance: true,
            targetIntegral: 0,
            validToAccount: false, // 目标账户是否有效
            initSeekbar: false
        }
    }

    componentDidUpdate() {
        let {initSeekbar} = this.state;
        if (initSeekbar) {
            this.setState({initSeekbar: !initSeekbar});
        }
    }

    componentDidMount() {
        // TipsActions.setLoadingGlobalShow();
        TipsActions.loading(true);

        let headerData = {
            buttonLeft: {
                value: "img_back",
            },
            title: "balance.integral.title",
            canBack: true
        }
        let {selectItems} = this.props[1];
        SettingsActions.updateHeader(headerData);
        BalancesActions.getAccountInfo().then(res => {
            this.setState({
                curID: res.yoyow_id,
                toAccount: res.yoyow_id
            })
            if (selectItems != "") {
                BalancesActions.getIntegralByUid(selectItems).then(res => {
                    let integral = res.max_csaf_limit - res.csaf_balance;

                    this.setState({
                        targetIntegral: integral,
                        toAccount: selectItems,
                        accountEffective: true,
                    })
                })

            } else {
                BalancesActions.handleFundsType(true)
                this.setState({
                    toAccount: this.state.curID,
                    accountEffective: true,
                })
            }
            let uid = res.yoyow_id;
            return Promise.all([
                BalancesActions.getBalance(uid),
                BalancesActions.getFeesForCsaf(uid, 0)
            ]).then(res => {
                //TipsActions.setLoadingGlobalHide();
                TipsActions.loading(false);
            })
        })
    }

    handleCheck(e) {
        this.setState({
            useCsaf: e.target.checked
        })
    }

    handleRadio(type, e) {
        let {toAccount, curID} = this.state;
        let {selectItems} = this.props[1];
        let uid = toAccount == "" ? curID : toAccount;
        BalancesActions.getFeesForCsaf(uid, 0)
        if (type == "self") {
            BalancesActions.handleFundsType(true)
            this.setState({
                toAccount: curID
            })
            BalancesActions.getIntegralByUid(curID).then(res => {
                let integral = res.max_csaf_limit - res.csaf_balance;
                this.setState({
                    targetIntegral: integral,
                    accountEffective: true,
                })
            });
        } else {
            BalancesActions.handleFundsType(false)
            if (selectItems != "") {
                uid = selectItems;
                BalancesActions.getIntegralByUid(uid).then(res => {
                    let integral = res.max_csaf_limit - res.csaf_balance;
                    this.setState({targetIntegral: integral});
                });
            } else {
                uid = ""
            }
            this.setState({
                toAccount: uid,
                accountEffective: uid != "",
                validToAccount: uid != ""
            });
        }
        this.setState({
            initSeekbar: true
        });


    }

    handleCsafCollect() {
        this.checkAccountValid(() => {
            let {core_balance, prepaid_balance, fees, transferBalance} = this.props[0];
            let {val, useCsaf, toAccount, targetIntegral} = this.state;

            let fee = useCsaf ? fees.with_csaf_fees : fees.min_fees;
            let msg;
            let balance = transferBalance ? prepaid_balance : core_balance;
            if (toAccount == "") {
                msg = this.translate("balance.public.tips_errors_no_account")
            } else if (!this.state.accountEffective) {
                msg = this.translate("balance.public.tips_errors_err_account")
            } else if (fee > balance) {
                msg = transferBalance ? this.translate("balance.integral.tips_errors_not_enough_prepaid") : this.translate("balance.integral.tips_errors_not_enough_balance")
            } else if (val == "" || val == 0) {
                msg = this.translate("balance.public.tips_errors_err_amount_no_integral")
            } else if (!transferBalance) {
                if (val > targetIntegral) {
                    msg = this.translate("balance.integral.tips_errors_over_max")
                }
            }

            if (!msg) {
                WalletUnlockActions.checkLock(false, transferBalance, null, fees = null).then(() => {
                    // TipsActions.setLoadingGlobalShow();
                    TipsActions.loading(true);

                    BalancesActions.handleCsafCollect(toAccount, Utils.formatAmount((val * GlobalParams.retain_count).toFixed(0) / GlobalParams.csaf_param), transferBalance, useCsaf).then(() => {

                        BalancesActions.getAccountInfo().then(res => {
                            let uid = res.yoyow_id;

                            return Promise.all([
                                BalancesActions.getBalance(uid),
                                BalancesActions.getFeesForCsaf(uid, 0)
                            ]).then(res => {

                                this.setState({
                                    val: ""
                                })
                                // TipsActions.setLoadingGlobalHide();
                                TipsActions.loading(false);
                                let toastVal = this.translate("balance.integral.tips_success_collect");
                                TipsActions.setToastShow(toastVal);
                                if (toAccount != uid) {
                                    ContactsActions.addContact(toAccount, uid)
                                }

                                let times = 0
                                window.addEventListener("animationend", () => {
                                    times++
                                    if (times == 2) {
                                        this.routerBack();
                                    }
                                })

                            }).catch((err) => {
                                TipsActions.loading(false);
                                TipsActions.error(err)
                            })
                        }).catch(er => {
                            TipsActions.loading(false);
                            TipsActions.error(er.msg);
                        })

                    }).catch(err=>{
                        TipsActions.loading(false);
                        TipsActions.error(err.msg);
                    })
                })
            } else {
                TipsActions.alert(msg);
            }
        })


    }

    handleVal(val) {
        let {curID} = this.state
        //BalancesActions.getFeesForCsaf(curID, val)
        //console.log(val)
        this.setState({
            val: val
        })

    }

    handleToAccount(e) {
        let {curID} = this.state
        let val = e.target.value;
        var regu = /^[1-9]\d*$/;
        if (regu.test(val) || val.length < this.state.toAccount.length) {
            this.setState({
                toAccount: val
            })
            setTimeout(() => {
                let v = this.state.toAccount
                if (v == val) {
                    Apis.getAssetsByUid(val).then(() => {
                        this.setState({
                            toAccount: val,
                            accountEffective: true,
                        });
                        BalancesActions.getIntegralByUid(val).then(res => {
                            let integral = res.max_csaf_limit - res.csaf_balance;
                            this.setState({
                                targetIntegral: integral,
                                validToAccount: true
                            })
                        }).catch(err => {
                            this.setState({targetIntegral: 0, validToAccount: false});
                        })
                    }).catch(() => {
                        this.setState({
                            toAccount: val,
                            accountEffective: false,
                        });
                    })
                }
            }, 500)
        }

        if (val == curID) {
            BalancesActions.handleFundsType(true);
        } else {
            BalancesActions.handleFundsType(false)
        }
    }

    selectContacts() {
        this.routerPush("/contacts-select", true)
    }

    onFocus(isNumber, isPoint, pointLength, ev) {
        let objInput = ev.target;
        let maskObj = ev.target;

        if (window.cordova) {
            Utils.handleKeyBoards(objInput, maskObj, isNumber, isPoint, pointLength);
        }

        //console.log(ev.target.value)
    }

    render() {
        let {core_balance, csaf_balance, max_csaf_limit, csaf_accumulate, csaf_collect, transferBalance, fees} = this.props[0];
        let {selectItems} = this.props[1];
        let {val, curID, toAccount, accountEffective, curLength, memoText, useCsaf, useBalance, validToAccount, targetIntegral, initSeekbar} = this.state;
        let integral;
        if (curID != toAccount) {
            integral = csaf_collect
        } else if (max_csaf_limit - csaf_balance <= csaf_collect) {
            integral = max_csaf_limit - csaf_balance;

        } else {
            integral = csaf_collect
        }

        return (
            <div className="integral_layer flex_column">
                <div className="layer_transfer_type csaf bgWhite">
                    <div>
                        <label>
                            <Checkbox ref="transferBalance" checked={transferBalance} type="radio"
                                      onChange={this.handleRadio.bind(this, "self")}/>
                            <span>{this.translate("balance.integral.text_to_self")}<em>{"#" + curID}</em></span>
                        </label>
                        <label>
                            <Checkbox ref="transferPrepaid" checked={!transferBalance} type="radio"
                                      onChange={this.handleRadio.bind(this, "other")}/>
                            <span>{this.translate("balance.integral.text_to_another")}</span>
                        </label>
                    </div>
                </div>
                <div className="layer_ctr margin_top_20 bgWhite">
                    {transferBalance ? "" :
                        <div className="layer_contacts">
                            <div className="layer_flex">
                                <div className="account_img">
                                    {accountEffective ?
                                        <AccountImage account={toAccount} size={{width: 100, height: 100}}/> :
                                        <AccountImage image={img_un_uid} account={toAccount}
                                                      size={{width: 100, height: 100}}/>
                                    }
                                </div>
                                <div className="toAccount">
                                    <Input onFocus={this.onFocus.bind(this, true, false, 0)}
                                           onClick={this.onFocus.bind(this, true, false, 0)}
                                           onChange={this.handleToAccount.bind(this)}
                                           placeholder={this.translate("balance.public.default_input_text_account")}
                                           value={toAccount} type="text" pattern="[0-9]*"/>
                                </div>
                                <span onClick={this.selectContacts.bind(this)}></span>
                            </div>

                        </div>
                    }
                    <DragBar onChange={this.handleVal.bind(this)} min="0" max={Utils.formatAmount(integral, 4)}
                             needInit={initSeekbar}/>
                    <div className="layer_fees">
                        <span>{this.translate("balance.public.text_fees")}<em>{useCsaf ? fees.with_csaf_fees : fees.min_fees}</em>{this.translate("balance.public.funds_type_YOYO")}</span>
                        {
                            csaf_balance == 0 ? "" :
                                <div>
                                    <label>
                                        <Checkbox type="checkbox" onChange={this.handleCheck.bind(this)}
                                                  checked={this.state.useCsaf}/>

                                        <i>{this.translate("balance.public.text_use")}<em>{Utils.formatAmount(fees.use_csaf * GlobalParams.csaf_param, 4)}</em>{this.translate("balance.public.text_integral_deduction")}
                                        </i>
                                    </label>
                                </div>
                        }
                    </div>
                    <div className="layer_button">
                        <Button onClick={this.handleCsafCollect.bind(this)}
                                value={this.translate("balance.integral.button_text_collect_done")}/>
                    </div>
                </div>
            </div>
        )
    }
}
export default connect(Integral, {
    listenTo(){
        return [BalancesStore, ContactsStore]
    },
    getProps(){
        return [BalancesStore.getState(), ContactsStore.getState()];
    }
})