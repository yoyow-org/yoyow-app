import React from 'react';
import {connect} from "alt-react";
import BaseComponent from "../BaseComponent";
import TipsActions from "../../actions/TipsActions";
import SettingsActions from "../../actions/SettingsActions";
import ContactsActions from "../../actions/ContactsActions";
import BalancesActions from "../../actions/BalancesActions";
import LinkButton from "../Layout/LinkButton";
import Button from "../Form/Button";
import Input from "../Form/Input";
import TipsStore from "../../stores/TipsStore";
import WalletStore from "../../stores/WalletStore";
import ContactsStore from "../../stores/ContactsStore";
import AccountImage from "../Layout/AccountImage";
import {Utils, Validation} from "../../../lib";

/**
 * 联系人搜索结果
 */
class ContactsSearchResult extends BaseComponent{
    constructor(){
        super();
    }

    componentDidMount() {
        let headerData = {
            buttonLeft: {
                value: "img_back",
            },
            title: "contacts.search_result_title",
            canBack:true
        }
        SettingsActions.updateHeader(headerData);
        
        ContactsActions.getContactsList();
    }

   
    /**删除联系人 */
    handleDeleteContact(contact,e){
        let successMsg=this.translate("contacts.success_delete_contact");
        let errorMsg=this.translate("contacts.error_delete_contact");
        TipsActions.confirm(this.translate("contacts.alert_delete_contact"),function(){
            ContactsActions.delContact(contact.inx)
            .then((e)=>{
                TipsActions.toast(successMsg);
            })
            .catch((e)=>{
                TipsActions.toast(errorMsg);
            });
            return true;
        });
        e.stopPropagation();
    }

    /**
     * 转账操作
     */
    transferContact(item, e){
        let {selectItems}=this.props;
        selectItems=item.uid;
        BalancesActions.setAmount("");
        BalancesActions.setMemo("");
        BalancesActions.setCanMemo(true);
        BalancesActions.setAccount(item.uid);
        this.routerPush('/transfer-for-fix');
    }

    render (){
        let {contacts,searchKeywords} = this.props;
        return(
          <div className="contacts_search_result">
            <div className="contacts_search_result_head">
                <div className="contacts_search_result_head_left">
                    {this.translate("contacts.search_result_title_begin")}:<span>{searchKeywords}</span>
                </div>
                <div className="contacts_search_result_head_right">
                    <span>{contacts.length}</span>{this.translate("contacts.search_result_title_end")}
                </div>
            </div>
            <div className="contacts_search_result_list">
                <dl>                                
                    {
                        //遍历数据源
                        contacts.map((item, inx) => {
                        return (
                            <dd key={'contact' + inx}>
                                <div className="contact_info">
                                    <AccountImage account={item.uid} size={{width: 90, height: 90}} />
                                    <ul>
                                        <li className="account">#{item.uid}</li>
                                        <li className="name">{item.remark}</li>
                                    </ul>
                                </div>
                                <div className="contact_oprate">
                                    <div className="contact_oprate_button">
                                        <Button value={this.translate("contacts.op_delete")} onClick={this.handleDeleteContact.bind(this,item)} bg="#fff" border="green" color="green"  fontSize={26} size={18} />
                                    </div>
                                </div>
                            </dd>
                            )
                        })
                    }
                </dl>
            </div>
          </div>
        )
    }
}

export default Utils.altConnect(ContactsSearchResult, [ContactsStore]);