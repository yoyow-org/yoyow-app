import React from "react";
import BaseComponent from "../BaseComponent";
import { connect } from "alt-react";
import Button from "../Form/Button";
import Input from "../Form/Input";
import { img_bg_transfer_restore_no_rule } from "../../assets/img";
import TipsActions from "../../actions/TipsActions";
import SettingsActions from "../../actions/SettingsActions";
import NoRule from './NoRule'
import WalletUnlockActions from "../../actions/WalletUnlockActions";
import { Utils } from "../../../lib";
import WalletStore from "../../stores/WalletStore";
import ResourceStore from "../../stores/ResourceStore";
import ResourceActions from "../../actions/ResourceActions";
//转账自动回复首页 
class AutomaticTransferList extends BaseComponent {
  constructor(props) {
    super(props)
  }

  handleSetTitle(e) {
    let title =e.target.value.trim();
    ResourceActions.changeTitle(title);
  }

  handleAddRule() {
    if(this.props.resources == null) {
      return false;
    }
    let num = this.props.resources.data.length;
    if (num >= 20) {
      TipsActions.alert(this.translate("transferAutoRestore.tips_errors_rules_maximum_length"));
      return false;
    }
    this.routerPush("/automaticTransfer/add", true);
  }

  handleEditRule(el) {
    let res = this.props.resources;
    if(res != undefined && res.data.length > 0) {

      //获取uid
    let res = WalletStore.getWallet();

    WalletUnlockActions.checkLock(false, false).then(() => {
        TipsActions.loading(true);
        ResourceActions.selectRule(res.yoyow_id,el.id,WalletStore.getPrivateKey(3)).then(() => {
            TipsActions.loading(false);
            this.routerPush("/automaticTransfer/edit", true);
        });
    });
    }
  }

  /**
   * 查看回复信息
   */
  handleRebakInfo(el) {
    WalletUnlockActions.checkLock(false, true, null, null).then(() => {
      TipsActions.loading(true);
      let uid = WalletStore.getWallet().yoyow_id;
      ResourceActions.selectRule(uid,el.id,WalletStore.getPrivateKey(3)).then(() => {
        TipsActions.loading(false);
        this.routerPush("/automaticTransfer/showRestoreInfo", true);
      }).catch(err => {
        TipsActions.loading(false);
        TipsActions.error(err);
      });
    });
  }

  handleShowQRCode() {
    let title_value = this.props.resources.title;
    if (title_value === '') {
      TipsActions.alert(this.translate("transferAutoRestore.tips_errors_err_restore_title"))
      return false;
    } else if (title_value.length > 20) {
      TipsActions.alert(this.translate("transferAutoRestore.tips_errors_err_restore_title_maximum_length"));
      return false;
    } else if (this.props.resources != null && this.props.resources.data.length <= 0) {
      TipsActions.alert(this.translate("transferAutoRestore.tips_errors_err_restore_title_minimum_length"));
      return false;

    }


    if(this.props.resources.data.length <= 0) {
      TipsActions.alert(this.translate("transferAutoRestore.tips_errors_err_restore_title_maximum_length"));
      return false;
    }

    let title = this.props.resources.title;
    let res = WalletStore.getWallet();
    ResourceActions.setTitle(res.yoyow_id,title_value).then(() => {
      this.routerPush("/automaticTransfer/restoreQRR", true);
    }).catch(err => TipsActions.error(err));
  }

  componentDidMount() {
    //设置顶部tab
    let _this=this;
    let headerData = {
      buttonLeft: {
        value: "img_back",
      },
      title: "transferAutoRestore.transferAutoRestore_list_title",
      canBack: false,
      onBack:function(){
        _this.routerBack();
     }
    }
    SettingsActions.updateHeader(headerData);
  }

  render() {

    let response = this.props.resources;
    let content;
    if (response.data != undefined && response.data.length > 0) {
      let data = response.data;
      content = data.map((el) => {
        //过期的情况
        if(el.expiration_date != 0 && el.expiration_date - Date.now() < 0) {
          return (
            <li className="restoreList_item" key={el.id}>
              <div className="restoreList_info">
                <div className="restoreList_info_title">
                  <span>{el.title}</span>
                  <em
                    className="restoreList_info_icon"
                    onClick={this.handleRebakInfo.bind(this,el)}
                  >
                  </em>
                </div>
                <div className="restoreList_info_status">
                  <span className="price">
                    <strong style={{color:'#999'}}>{el.show_amount}</strong>
                    {el.symbol}
                  </span>
                  <em>
                    <strong><span>{this.translate('selectTransferRestore.expiration')}</span></strong>
                  </em>
                </div>
              </div>
              <div
                className="restoreList_edit"
                onClick={this.handleEditRule.bind(this,el)}
              >
              </div>
            </li>
          )
        } else {
          let timeFmt = el.expiration_date_format;
          timeFmt = timeFmt.split(' ')[0].replace(/-/g,'/');
          return (
            <li className="restoreList_item" key={el.id}>
              <div className="restoreList_info">
                <div className="restoreList_info_title">
                  <span>{el.title}</span>
                  <em
                    className="restoreList_info_icon"
                    onClick={this.handleRebakInfo.bind(this,el)}
                  >
                  </em>
                </div>
                <div className="restoreList_info_status">
                  <span className="price">
                    <strong>{el.show_amount}</strong>
                    {this.translate("transferAutoRestore.funds_type_YOYO")}
                  </span>
                  <em>
                    <strong>
                    {
                      el.expiration_date == 0 ? <span>{this.translate('selectTransferRestore.valid')}</span> : 
                        el.expiration_date - Date.now() > 0 ? (this.translate("transferAutoRestore.transferAutoRestore_list_indate") )+ timeFmt : ''
                    }
                    </strong>
                  </em>
                </div>
              </div>
              <div
                className="restoreList_edit"
                onClick={this.handleEditRule.bind(this,el)}
              >
              </div>
            </li>
          )
        }
      })
    } else {
      content = (<NoRule
        src={img_bg_transfer_restore_no_rule}
        text={this.translate("transferAutoRestore.transferAutoRestore_list_no_rule")}
      />)
    }

    return (
      < div className="transferAutoRestore">
        <div className="create_auto_restore">
          <h3>
            {this.translate("transferAutoRestore.transferAutoRestore_list_create_title")}</h3>
          <p>
            <Input
              value={response.title}
              placeholder={this.translate("transferAutoRestore.transferAutoRestore_list_add_placeholder")}
              type="text" 
              fontSize={30}
              onChange={this.handleSetTitle.bind(this)}
            />
          </p>
        </div>
        <div className="transferAutoRestore_List">
          <div className="restoreList">
            <ul>
              {content}
            </ul>
          </div>

        </div>
        <div className="transferAutoRestore_btns">
          <Button
            value={this.translate("transferAutoRestore.transferAutoRestore_list_show_qr")}
            onClick={this.handleShowQRCode.bind(this)}
          />
          <Button
            value={this.translate("transferAutoRestore.transferAutoRestore_list_add_rule")}
            onClick={this.handleAddRule.bind(this)}
          />
        </div>

      </div>
    )
  }
}

export default  Utils.altConnect(AutomaticTransferList,[ResourceStore,WalletStore]);
