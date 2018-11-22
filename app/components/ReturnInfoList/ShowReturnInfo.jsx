import React from "react";
import BaseComponent from "../BaseComponent";
import Button from "../Form/Button";
import SettingsActions from "../../actions/SettingsActions";
import TipsActions from "../../actions/TipsActions";
import ResourceActions from "../../actions/ResourceActions";
import ResourceStore from "../../stores/ResourceStore";
import WalletStore from "../../stores/WalletStore";
import Clipboard from "clipboard";
import { Utils } from "../../../lib";

class ShowReturnInfo extends BaseComponent {
  constructor() {
    super();
  }

  componentDidMount() {
    let headerData = {
      buttonLeft: {
        value: "img_back",
      },
      title: "transferAutoRestore.transferAutoRestore_list_resotre_info_title",
      onBack: this.handleBack.bind(this),
      canBack: false
    }
    SettingsActions.updateHeader(headerData);

    new Clipboard('#copy_btn');

  }

  handleBack(){
    let {selectRecord} = this.props;
    TipsActions.loading(true);
    ResourceActions.getRecords(selectRecord.buyer).then(() => {
      TipsActions.loading(false);
      this.routerBack();
    })
  }

  handlerCopySuccess() {
    TipsActions.alert(this.translate("returninfoList.copy_success"));
  }

  handleDeletedButtonClick(){
    TipsActions.confirm(this.translate("returninfoList.tips_deleted_button"), ()=>{
      let {selectRecord} = this.props;
      TipsActions.loading(true);
      ResourceActions.removeRecord(selectRecord.order_id).then(res => {
        ResourceActions.getRecords(selectRecord.buyer).then(() => {
          TipsActions.loading(false);
          TipsActions.toast(this.translate("returninfoList.tips_deleted_success"));
          this.routerBack();
        })
      }).catch(err => {Utils.formatError(err);TipsActions.loading(false);});
      return true;
      }
    );
  }

  render() {
    let {selectRecord} = this.props;
    return (
      <div className="showReturnInfo">
        <div className="showReturnInfoCon">
          <div className="showReturnInfo_detail">
            {selectRecord.decrypt_content}
          </div>
        </div>
        <div className="showReturnInfo_button">
            <Button
              className="deleted"
              value={this.translate("returninfoList.returninfoList_delte_text")}
              onClick={this.handleDeletedButtonClick.bind(this)}
            />
            <Button
              id="copy_btn"
              clipboard={selectRecord.decrypt_content}
              className="copy"
              value={this.translate("returninfoList.returninfoList_copy_text")}
              onClick={this.handlerCopySuccess.bind(this)}
            />
          </div>
      </div>
    )
  }
}

export default Utils.altConnect(ShowReturnInfo,[ResourceStore,WalletStore]);