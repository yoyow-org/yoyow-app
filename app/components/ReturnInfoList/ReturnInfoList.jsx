import React from "react";
import BaseComponent from "../BaseComponent";
import SettingsActions from "../../actions/SettingsActions";
import  NoRestore from './NoRestore';
import { img_bg_transfer_restore_no_rule } from "../../assets/img";
import WalletUnlockActions from "../../actions/WalletUnlockActions";
import TipsActions from "../../actions/TipsActions";
import { Utils } from "../../../lib";
import ResourceStore from "../../stores/ResourceStore";
import WalletStore from "../../stores/WalletStore";
import ResourceActions from "../../actions/ResourceActions";

class ReturnInfoList extends BaseComponent{
  constructor(props){
    super(props)
    this.state ={}
  }

  componentDidMount() {
    //设置顶部tab
    let _this=this;
    let headerData = {
     
      buttonLeft: {
        value: "img_back",
      },
      title: ["returninfoList.returninfo_list_header_title"],
      canBack: false,
      onBack:function(){
        _this.routerBack();
     }
    }
    SettingsActions.updateHeader(headerData);
  }

  handleListItemClick(record){
    WalletUnlockActions.checkLock(false, true, null,  null).then(() => {
      TipsActions.loading(true);
      let uid = WalletStore.getWallet().yoyow_id;
      let privKey = WalletStore.getPrivateKey(3);
      ResourceActions.decryptRecord(uid, record.order_id, privKey).then(content => {
        TipsActions.loading(false);
        this.routerPush("/returnInfoList/showReturnInfo",true);
      }).catch((err)=>{
          TipsActions.loading(false);
          TipsActions.error(err);
      });
    });
  }

  render(){
    let {records} = this.props;
    let content ;
    if(records.length>0){
      content = records.map((el)=>{
        let fmt = el.pay_date_format;
        fmt = fmt.split(' ')[0].replace(/-/g,'/');
        return(
          <li className="returnInfo_list_item" key={el.id}>
            <div className="returnInfo_list_item_info">
              <section className="title">
                {el.title}
              </section>
              <section className="status">
                  <span className="price">
                  {this.translate("returninfoList.returninfoList_pay")}
                  <strong>
                    {el.show_amount}
                  </strong>
                  {el.symbol}
                  </span>
                  <span className="date">{fmt}</span>
              </section>
            </div>
            <div className="show_info_detail">
                <button
                  onClick={this.handleListItemClick.bind(this,el)}
                  >
                  {this.translate("returninfoList.show_msg")}
                </button>
                
                {el.is_view == 0?(<div className="badge-dot"></div>):''}
              
            </div>
          </li>
        ) 
      })
    }else{
      {/* 无回复信息 */}  
      content =(<NoRestore 
        src={img_bg_transfer_restore_no_rule}
        text={this.translate("returninfoList.returninfo_list_header_no_restore")}
      />)
    }
    return(
      <div className="returnInfo">
        <ul className="returnInfo_list">
          {content}
        </ul>
      </div>
    )
  }
}

export default Utils.altConnect(ReturnInfoList,[ResourceStore,WalletStore]);