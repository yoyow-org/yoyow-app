import React from "react";
import BaseComponent from "../BaseComponent";
import Button from "../Form/Button";
import SettingsActions from "../../actions/SettingsActions";
import { Utils, GlobalParams } from "../../../lib";
import ResourceStore from "../../stores/ResourceStore";
import WalletStore from "../../stores/WalletStore";
import ResourceActions from "../../actions/ResourceActions";
import WalletUnlockActions from "../../actions/WalletUnlockActions";
import TipsActions from "../../actions/TipsActions";

class AutoRestoreTransfer extends BaseComponent {
  constructor(props) {
    super(props)
    this.state = {
      useCsaf: true
    }
  }

  componentDidMount() {
    //设置顶部tab
    let headerData = {
      buttonLeft: {
        value: "img_back",
      },
      title: "autoRestoreTransfer.autoRestoreTransfer_list_title",
      canBack: true
    }
    SettingsActions.updateHeader(headerData);
  }

  handleSureTransfer() {
    WalletUnlockActions.checkLock(false, false).then(() => {
      let { useCsaf } = this.state;
      let { selectRule } = this.props;
      let uid = WalletStore.getWallet().yoyow_id;
      let memoKey = WalletStore.getPrivateKey(3);
      let activeKey = WalletStore.getPrivateKey(1);
      TipsActions.loading(true);
      ResourceActions.buyRule(uid, selectRule.id, useCsaf, memoKey, activeKey, true).then(res => {
        TipsActions.loading(false);
        TipsActions.alert(this.translate('autoRestoreTransfer.alert_success'), null, true, () => {
          this.routerBack();
          return true;
        });
      }).catch(err => {
        TipsActions.loading(false);
        TipsActions.alert(Utils.formatError(err).msg);
      });
    });
  }

  handleCheckBoxClick() {
    this.setState({ useCsaf: !this.state.useCsaf });
  }

  render() {
    let { selectRule, fees } = this.props;
    let { useCsaf } = this.state;
    let { min_fees, min_real_fees, use_csaf, with_csaf_fees } = fees;
    return (
      <div className="autoRestoreTransfer">
        <div className="autoRestoreTransfer_info">
          <div className="transferTo">
            {this.translate("autoRestoreTransfer.autoRestoreTransfer_list_to")}
            <span>#{selectRule.seller}</span>
            {this.translate("selectTransferRestore.transfer_text")}
            <strong>{selectRule.show_amount}</strong>
            {this.translate("autoRestoreTransfer.funds_type_YOYO")}
          </div>
          <div className="gathering_remark">
            {this.translate("autoRestoreTransfer.autoRestoreTransfer_list_remark")}
            :
           <span>{selectRule.title}</span>
          </div>
        </div>
        <div className="poundage">
          <div className="poundage_left">
            <span className="">{this.translate("autoRestoreTransfer.autoRestoreTransfer_list_poundage")}:</span>
            <strong>{Utils.formatNumber((useCsaf ? with_csaf_fees : min_fees), 5, false)}</strong>
            {selectRule.symbol}
          </div>
          <div className="poundage_right"
            onClick={this.handleCheckBoxClick.bind(this)}
          >
            <div className={useCsaf ? 'checkbox' + ' checkbox_true' : 'checkbox'}>
              {this.translate("autoRestoreTransfer.autoRestoreTransfer_list_use")}
              :
                <strong>{Utils.formatNumber(use_csaf * GlobalParams.csaf_param, 3, false)}</strong>
              {this.translate("autoRestoreTransfer.autoRestoreTransfer_list_integral_deduction")}
            </div>
          </div>
        </div>
        <div className="autoRestoreTransfer_button">
          <Button
            value={this.translate("autoRestoreTransfer.autoRestoreTransfer_list_SureTransfer")}
            onClick={this.handleSureTransfer.bind(this)}
          />
        </div>
      </div>
    )
  }
}

export default Utils.altConnect(AutoRestoreTransfer, [ResourceStore, WalletStore]);