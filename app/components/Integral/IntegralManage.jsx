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
import ContactsActions from "../../actions/ContactsActions"
class IntegralManage extends BaseComponent{
    constructor(){
        super();

    }
    componentDidMount() {
       // TipsActions.setLoadingGlobalShow();
       TipsActions.loading(true);
        let headerData = {
            buttonLeft: {
                value: "img_back",
            },
            title: "balance.integral_manage.title",
            canBack: true
        }
        SettingsActions.updateHeader(headerData);
        BalancesActions.getAccountInfo().then(res => {
            this.setState({
                curID: res.yoyow_id
            })
            let uid = res.yoyow_id
            return Promise.all([
                BalancesActions.getBalance(uid),
            ]).then(res => {
               // TipsActions.setLoadingGlobalHide();
               TipsActions.loading(false);
            }).catch(err=>{
                TipsActions.loading(false);
                TipsActions.error(err);
            })
        })
    }
    handleRoute(){
        ContactsActions.selectContact("");
        this.routerPush("/integral",true);
    }
    render(){
        let {core_balance,
            csaf_balance,
            max_csaf_limit,
            csaf_accumulate,
            csaf_collect,
            max_accoumulate_csaf} = this.props;
        let integral;
        if (max_csaf_limit - csaf_balance <= csaf_collect) {
            integral = max_csaf_limit - csaf_balance;

        } else {
            integral = csaf_collect
        }
        return (
            <div className="integral_layer bgWhite">
                <div className="tips_integral">{this.translate("balance.integral_manage.tips")}</div>
                <ul className="info_integral">
                    <li>{this.translate("balance.integral_manage.text_YOYO_balance")}<em>{core_balance}</em></li>
                    <li>{this.translate("balance.integral_manage.text_YOYO_csaf_balance")}<em>{Utils.formatAmount(csaf_balance,4)}</em></li>
                    <li>{this.translate("balance.integral_manage.text_YOYO_max_csaf_limit")}<em>{max_csaf_limit}</em></li>
                    <li>{this.translate("balance.integral_manage.text_YOYO_csaf_accumulate")}<em>{Utils.formatAmount(csaf_accumulate,4)}</em>/{this.translate("balance.integral_manage.text_day")}</li>
                    <li>{this.translate("balance.integral_manage.text_YOYO_max_accoumulate_csaf")}<em>{Utils.formatAmount(max_accoumulate_csaf, 4)}</em></li>
                    <li>{this.translate("balance.integral_manage.text_YOYO_csaf_collect")}<em>{Utils.formatAmount(integral,4)}</em></li>
                </ul>
                <div className="layer_button">
                    <Button onClick={this.handleRoute.bind(this)}  value={this.translate("balance.integral_manage.button_text_collect")}/>
                </div>
            </div>
        )
    }
}
export default connect(IntegralManage, {
    listenTo(){
        return [BalancesStore]
    },
    getProps(){
        return BalancesStore.getState();
    }
})