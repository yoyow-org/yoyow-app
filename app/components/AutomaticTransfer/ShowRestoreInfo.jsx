import React from "react";
import BaseComponent from "../BaseComponent";
import Button from "../Form/Button";
import SettingsActions from "../../actions/SettingsActions";
import TipsActions from "../../actions/TipsActions";
import { Utils } from "../../../lib";
import ResourceStore from "../../stores/ResourceStore";
import Clipboard from "clipboard";

class ShowRestoreInfo extends BaseComponent {
  constructor() {
    super();

    this.state = {
      //模拟数据
      content:''
    }
  }
  
  componentDidMount() {
    //设置顶部tab
    let headerData = {
      buttonLeft: {
        value: "img_back",
      },
      title: ["transferAutoRestore.transferAutoRestore_list_resotre_info_title"],
      canBack: true
    }
    SettingsActions.updateHeader(headerData);
    new Clipboard('#copy_btn');
  }
  componentWillMount(){
    
  }

  handlerCopySucess(){
    TipsActions.alert(this.translate("transferAutoRestore.transferAutoRestore_list_copy_success"));
  }

  render() {
    let {content } = this.state;
    let selectRule = this.props.selectRule;
    return (
      <div className="showRestoreInfo">
        <div className="showRestoreInfo_con">
          <div className="showRestoreInfo_detail">
            {selectRule != null ? selectRule.content:''}
           </div>
           <div className="showRestoreInfo_button">
            <Button
              id="copy_btn"
              clipboard={selectRule.content}
              value={this.translate("transferAutoRestore.transferAutoRestore_list_resotre_copy")}
              onClick = {this.handlerCopySucess.bind(this)}
            />
          </div>
        </div>
      </div>
    )
  }
}

export default Utils.altConnect(ShowRestoreInfo,[ResourceStore]);