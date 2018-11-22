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
import ResourceActions from "../../actions/ResourceActions";
import WalletStore from "../../stores/WalletStore";
import WalletUnlockActions from "../../actions/WalletUnlockActions";
import ResourceStore from "../../stores/ResourceStore";
class RuleAdd extends BaseComponent {
  constructor(props) {
    super(props)
    this.state = {
      ruleName: '',
      val:"",
      remark: "",
      checked: true,
      nowDate:null,
      minDate:null,
      maxDate:null,
      defaultDate:null,
      validityDate:null
    }
  }
  componentWillMount(){
    this.handeInitDatePicker();
  }
  componentDidMount() {
    //设置顶部tab
    let headerData = {
      buttonLeft: {
        value: "img_back",
      },
      title: ["transferAutoRestore.transferAutoRestore_list_add_rule"],
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

  /** 确信新增 */
  handleSubmitAddRuleSuccess() {
    let { ruleName, val,remark ,checked} = this.state;
    if (ruleName.trim() == "") {
      TipsActions.alert(this.translate("transferAutoRestore.tips_errors_no_ruleName"));
      return false;
    } else if (ruleName.length > 20) {
      TipsActions.alert(this.translate("transferAutoRestore.tips_errors_rule_length"));
      return false;
    } else if (!Number(val)) {
      TipsActions.alert(this.translate("transferAutoRestore.tips_errors_err_no_money"));
      return false;
    } else if (Number(val) > 10000) {
      TipsActions.alert(this.translate("transferAutoRestore.tips_errors_err_reset"));
      return false;
    }else if (remark.trim() == "") {
      TipsActions.alert(this.translate("transferAutoRestore.tips_errors_no_ruleRemark"));
      return false;
    }

    let submitDate = 0;
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
      ResourceActions.setRule(res.yoyow_id,ruleName,val,remark,WalletStore.getPrivateKey(3),timestamp).then(res => {
        TipsActions.toast(this.translate("transferAutoRestore.tips_ruleAdded_success"));
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
      ruleName:val
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
  /** 初始化有效期时间
   * defautTimeStamp  Number 可选参数
   */
  handeInitDatePicker(defautTimeStamp){
    
    //当前时间的毫秒数
    const nowTimeStamp = Date.now();
    //当前时间
    const now = new Date(nowTimeStamp);
    let defaultDate;
    if(defautTimeStamp !=undefined){
      defaultDate = new Date(defautTimeStamp)
    }else{
      //默认有效期 当天时间加30天
      defaultDate = new Date(nowTimeStamp+2592000000)
    }
    
    //可选择最小日期
    let minDate = new Date(now.getFullYear(),now.getMonth(),now.getDate(),23,59,59);
    //可选择最大日期 固定为2050年12月31日24点 
    const maxDate = new Date(2050,11,31,23,59,59);
    this.setState({
      nowDate:now,
      minDate:minDate,
      maxDate:maxDate,
      defaultDate:defaultDate
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
    let { val, ruleName, remark, checked,nowDate,minDate,maxDate,defaultDate} = this.state;
    return (
      <div className="rule_add">
        <div className="rule_add_ruleName">
          <Input
            placeholder={this.translate("transferAutoRestore.transferAutoRestore_list_ruleName_placeholder")}
            value={ruleName}
            onChange={this.setRuleName.bind(this)}
          />
        </div>
        <div className="rule_add_money">
          <Input
            placeholder={this.translate("transferAutoRestore.transferAutoRestore_list_money_placeholder")}
            value={val}
            onChange={this.setValue.bind(this)}
          />
          <p>YOYO</p>
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
            onFocus={this.onFocus.bind(this, true, true, 5)}
            onClick={this.onFocus.bind(this, true, true, 5)}
            onChange={this.setRemark.bind(this)}
          >
          </textarea>
          <p className="length"><em >{remark.length}</em>/200</p>
        </div>

        <div className="rule_add_button">
          <Button
            value={this.translate("transferAutoRestore.transferAutoRestore_list_sure_add")}
            fontSize={26}
            onClick={this.handleSubmitAddRuleSuccess.bind(this)}
          />
        </div>
      
      </div>
    )
  }
}

export default Utils.altConnect(RuleAdd,[ResourceStore, WalletStore]);