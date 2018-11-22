import React from "react";
import BaseComponent from "../BaseComponent";
import Button from "../Form/Button";
import Input from "../Form/Input";
import Checkbox from "../Form/Checkbox";
import SettingsActions from "../../actions/SettingsActions";
import Utils from "../../../lib/utils/Utils";
import { Validation } from "../../../lib";
import TipsActions from "../../actions/TipsActions";
import DatePicker from "../../components/DatePicker"
import ResourceStore from "../../stores/ResourceStore";
import ResourceActions from "../../actions/ResourceActions";
import WalletStore from "../../stores/WalletStore";
import WalletUnlockActions from "../../actions/WalletUnlockActions";
class RuleEdit extends BaseComponent {
  constructor(props) {
    super(props)
    this.state = {
      ruleName: '',
      val: "",
      remark: "",
      checked: true,
      nowDate: null,
      minDate: null,
      maxDate: null,
      defaultDate: null,
      validityDate:null
    }
  }
  componentWillMount() {
    let selectRule = this.props.selectRule;
    //获取当前更新时间的毫秒数
    const nowTimeStamp = Date.now();
    //更新时间 
    const now = new Date(nowTimeStamp);
    //可选择最小日期
    let minDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
    //可选择最大日期
    const maxDate = new Date(2050, 11, 31, 23, 59, 59);
    //默认显示传递来的显示日期
    let defaultDate = '';

    let checked = this.state.checked;
    checked = selectRule.expiration_date == 0 ? checked = true : checked = false;
    if(checked) {
        defaultDate = new Date(now.getFullYear(),now.getMonth()+1,now.getDate()+1,23,59,59);
    } else {
      defaultDate = new Date(selectRule.expiration_date);
    }

    this.setState({
      ruleName: selectRule.title,
      val: selectRule.show_amount,
      remark: selectRule.content,
      checked: checked,
      nowDate: now,
      minDate: minDate,
      maxDate: maxDate,
      defaultDate: defaultDate,
      validityDate:null
    })

  }
  componentDidMount() {
    //设置顶部tab
    let headerData = {
      buttonLeft: {
        value: "img_back",
      },
      title: ["transferAutoRestore.transferAutoRestore_list_edit_rule"],
      canBack: true
    }
    SettingsActions.updateHeader(headerData);

  }

  onFocus(isNumber, isPoint, pointLength, ev) {
    let objInput = ev.target;
    let maskObj = ev.target;
    if (window.cordova) {
      Utils.handleKeyBoards(objInput, maskObj, isNumber, isPoint, pointLength)
    }
  }

  /** 确定编辑 */
  handleSubmitEditRuleSuccess() {
    let {selectRule} = this.props;
    let { ruleName, val, remark, checked } = this.state;
    if (ruleName.trim() == "") {
      TipsActions.alert(this.translate("transferAutoRestore.tips_errors_no_ruleName"));
    } else if (ruleName.length > 20) {
      TipsActions.alert(this.translate("transferAutoRestore.tips_errors_rule_length"));
    } else if (!Number(val)) {
      TipsActions.alert(this.translate("transferAutoRestore.tips_errors_err_no_money"));
    } else if (Number(val) > 10000) {
      TipsActions.alert(this.translate("transferAutoRestore.tips_errors_err_reset"));
    } else if (remark.trim() == "") {
      TipsActions.alert(this.translate("transferAutoRestore.tips_errors_no_ruleRemark"));
    }
    let submitDate = null;
    if(this.state.validityDate == null) {
      submitDate = this.state.defaultDate;
    } else {
      submitDate = this.state.validityDate;
    }
    if(checked) submitDate = 0;

    //获取uid
    let res = WalletStore.getWallet();
    let timestamp = 0;
    if(submitDate != null) {
        timestamp = Date.parse(new Date(submitDate));
    }

    WalletUnlockActions.checkLock(false, false).then(() => {
        TipsActions.loading(true);
        ResourceActions.setRule(res.yoyow_id,ruleName,val,remark,WalletStore.getPrivateKey(3),timestamp,selectRule.id).then(res => {
          TipsActions.toast(this.translate("transferAutoRestore.tips_edited_success"));
          let uid = WalletStore.getWallet().yoyow_id;
          let tpTitle = this.props.resources.title;
          ResourceActions.getResources(uid,tpTitle).then(() => {
            TipsActions.loading(false);
            this.routerBack();
          });
        }).catch(err => {
          TipsActions.loading(false);
          TipsActions.error(err);
        });
    });
  }

  /** 收款金额  */
  setValue(e) {
    let val = e.target.value;
    if (Validation.isNumber(val)) {
      val = Utils.formatAmount(val);
      this.setState({ val: val });
    }
  }
  /** 规则名称  */
  setRuleName(e) {
    let val = e.target.value.trim();
    this.setState({
      ruleName: val
    })

  }
  /** 添加备注  */
  setRemark(e) {
    let reMarkValue = e.target.value;
    reMarkValue = reMarkValue.substring(0, 200);
    this.setState({
      remark: reMarkValue
    });
    
  }

  /** 有效期状态切换  */
  handleSelectDate() {
    let { checked } = this.state;
    this.setState({
      checked: !checked
    })
  }


  handleDeletButton() {
    let {data} = this.props.resources;
    if(null != data && data.length <= 1) {
      TipsActions.alert(this.translate("transferAutoRestore.tips_edited_rule_min"));
      return false;
    }
    let {selectRule} = this.props;
    TipsActions.confirm(this.translate("transferAutoRestore.tips_deleted_button"), () => {
      TipsActions.loading(true);
      ResourceActions.removeRule(selectRule.id).then(res => {
        let uid = WalletStore.getWallet().yoyow_id;
        TipsActions.toast(this.translate("transferAutoRestore.tips_deleted_success"));
        let tpTitle = this.props.resources.title;
        ResourceActions.getResources(uid,tpTitle).then(() => {
          TipsActions.loading(false);
          this.routerBack();
        });
      }).catch(err => {
        TipsActions.loading(false);
        TipsActions.error(err);
      });
      return true;
    })

  }
  //设置有效期 
  handleSetValidityDate(val){
    val = val.getTime();
    this.setState({
      validityDate:val
    })
  }
  render() {
    let selectRule = this.props.selectRule;
    let { val, ruleName, remark, checked, nowDate, minDate, maxDate, defaultDate } = this.state;
    return (
      <div className="rule_add">
        <div className="rule_add_ruleName">
          <Input
                  placeholder={this.translate("transferAutoRestore.transferAutoRestore_list_ruleName_placeholder")}
                  value={ruleName}
                  onChange={this.setRuleName.bind(this)}
                  onFocus={this.onFocus.bind(this, false, false, 0)}
                  onClick={this.onFocus.bind(this, true, true, 0)}
          />
        </div>
        <div className="rule_add_money">
          <div>
                <Input
                  placeholder={this.translate("transferAutoRestore.transferAutoRestore_list_money_placeholder")}
                  value={val}
                  onChange={this.setValue.bind(this)}
                  />
            <p>{selectRule.symbol}</p>
          </div> 
        </div>
        <div className="rule_add_select_date">
          <div className="rule_add_select_date_item">
            <labe
              className={checked ? 'checkbox' + ' checkbox_seleted' : 'checkbox'}
              onClick={this.handleSelectDate.bind(this)}
            >
              <span>
                {this.translate("transferAutoRestore.transferAutoRestore_list_long_effective")}
              </span>
            </labe>
          </div>
          <div className="rule_add_select_date_item">
            <labe
              className={checked ? 'checkbox' : 'checkbox' + ' checkbox_seleted'}
              onClick={this.handleSelectDate.bind(this)}
            >
              <span>
                {this.translate("transferAutoRestore.transferAutoRestore_list_indate")}
                :
              </span>
            </labe>
            <div className="set-date">
              {(<DatePicker
                nowDate={nowDate}
                minDate={minDate}
                maxDate={maxDate}
                defaultDate={defaultDate}
                SetValidityDate={this.handleSetValidityDate.bind(this)}
              />)}
              <i></i>
            </div>
          </div>
        </div>
        <div className="add_remark">
          <textarea maxLength="200"
            placeholder={this.translate("transferAutoRestore.add_remark_placeholder")}
            value={remark}
            onFocus={this.onFocus.bind(this, false, false, 0)}
            onClick={this.onFocus.bind(this, true, true, 0)}
            onChange={this.setRemark.bind(this)}
          >
          </textarea>
          <p className="length"><em >{remark.length}</em>/200</p>
        </div>

        <div className="rule_edit_button">
          <Button
            value={this.translate("transferAutoRestore.transferAutoRestore_list_deleted")}
            fontSize={26}
            onClick={this.handleDeletButton.bind(this)}

          />
          <Button
            value={this.translate("transferAutoRestore.transferAutoRestore_list_sure_edit")}
            fontSize={26}
            onClick={this.handleSubmitEditRuleSuccess.bind(this)}
          />
        </div>

      </div>
    )
  }
}

export default Utils.altConnect(RuleEdit,[ResourceStore,WalletStore]);
