import React from "react";
import BaseComponent from "../BaseComponent";
import Button from "../Form/Button";
import SettingsActions from "../../actions/SettingsActions";
import { Utils } from "../../../lib";
import ResourceStore from "../../stores/ResourceStore";
import WalletStore from "../../stores/WalletStore";
import ResourceActions from "../../actions/ResourceActions";
import WalletUnlockActions from "../../actions/WalletUnlockActions";
import TipsActions from "../../actions/TipsActions";

class SelectTransferRestoreList extends BaseComponent {
  constructor(props) {
    super(props)
    this.state = {
      title: '',
      dataList: []
    }
  }

  componentDidMount() {
    let headerData = {
      buttonLeft: {
        value: "img_back",
      },
      title: "selectTransferRestore.selectTransferRestore_list_title",
      canBack: true
    }
    SettingsActions.updateHeader(headerData);
  }

  handleShowClick(el) {
    TipsActions.loading(true);
    let uid = WalletStore.getWallet().yoyow_id;
    ResourceActions.buyRule(uid, el.id, true).then(res => {
      TipsActions.loading(false);
      this.routerPush("/autoRestoreTransfer", true);
    }).catch(err => {
      TipsActions.loading(false);
      TipsActions.error(err);
    });
  }

  render() {
    let { resources } = this.props;
    let content;
    let title = '';
    let now = Date.now();
    if (resources.data && resources.data.length > 0) {
      title = resources.title;
      content = resources.data.map((el) => {
        let fmt = el.expiration_date_format;
        fmt = fmt.split(' ')[0].replace(/-/g,'/');
        return (el.expiration_date >= now || el.expiration_date == 0) ? 
        (
          <li
            className="selectTransferRestore_list_item"
            key={el.id}
            onClick={this.handleShowClick.bind(this, el)}
          >
            <div className="selectTransferRestore_list_item_title">
              {el.title}
            </div>
            <div className="selectTransferRestore_list_item_status">
              <div className="price"><strong>{el.show_amount}</strong>{el.symbol}</div>
              <div className="date">
                <em>{
                  el.expiration_date == 0 ?
                    <div>{this.translate('selectTransferRestore.valid')}</div> : fmt
                }</em>
                <span>{el.dateState}</span>
              </div>
            </div>
          </li>
        ) : null
      })
    }
    return (
      <div className="selectTransferRestore">
        <div className="selectTransferRestore_info">
          <p>{title}</p>
        </div>
        <ul className="selectTransferRestore_list">
          {content}
        </ul>
      </div>
    )
  }
}

export default Utils.altConnect(SelectTransferRestoreList, [ResourceStore, WalletStore]);