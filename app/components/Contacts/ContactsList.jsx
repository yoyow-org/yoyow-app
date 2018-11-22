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
import LayerOut from "../Layout/LayerOut";
import TipsStore from "../../stores/TipsStore";
import WalletStore from "../../stores/WalletStore";
import ContactsStore from "../../stores/ContactsStore";
import Validation from "../../../lib/utils/Validation";
import AccountImage from "../Layout/AccountImage";
import {img_no_contacts,img_un_uid} from "../../assets/img";
import { Utils } from "../../../lib";

/**
 * 联系人管理
 */
class ContactsList extends BaseComponent{
    constructor(){
        super();
        this.state={
            contact:null,
            layoutState:false,
            newRemark:""
        }
    }

    addContact(){
        this.routerPush("/contacts/add",true);
    }

    searchContact(){
        this.routerPush("/contacts/search",true);
    }

    componentDidMount() {
        let _this=this;
        let headerData = {
            buttonLeft: {
                value: "img_back",
            },
            title:"contacts.title",
            canBack:false,
            onBack:function(){
                _this.routerBack();
            }
        }
        SettingsActions.updateHeader(headerData);
        ContactsActions.setKeywords("");
        
        TipsActions.loading(true);
        ContactsActions.getContactsList()
        .then(res=>{
            TipsActions.loading(false);
        })
        .catch(err=>{
            TipsActions.loading(false);
        });
    }

    /**修改备注 */
    handleEditRemark(item){
        this.setState({contact:item,newRemark:item.remark,layoutState:true});
    }

    /**修改联系人 */
    handleSubmitEditContact(){
        let {contact,newRemark} = this.state;
        if(!Validation.isEmpty(newRemark) && newRemark.length>10){
            TipsActions.alert(this.translate("contacts.add_alert_memo_length"),"");
            return false;
        }
        contact.remark=newRemark;
        contact.last_modify=Date.now();
        
        ContactsActions.setContact(contact,"put")
        .then(r=>{
            TipsActions.toast(this.translate("contacts.edit_success"));
            this.setState({layoutState:false});          
        }).catch(r=>{
            TipsActions.alert(r,"");
        });
        
    }

    /**
     * 关闭浮动
     */
    handleCloseEditContact(){
        this.setState({layoutState:false});
    }

    /**备注改变 */
    changeRemark(e){
        this.setState({newRemark:e.target.value});
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
        let {contacts,layerOutShow} = this.props;
        let {contact,newRemark}=this.state;
        let haveContacts = contacts&&contacts.length>0;
        let isAndroid  = Utils.checkPlatform() //判断搜索框根据平添加class=anzhuo
        return(
          <div className="contacts_index">
            <LayerOut isShow={this.state.layoutState} closeBtn="false">
                <div className="contacts_edit_remark">
                    <div className="contacts_edit_remark_item">
                        <div className="description">
                            {this.translate("contacts.edit_remark_label")}
                        </div>
                        <div className="input_box">
                            <Input placeholder={this.translate("contacts.edit_placeholder_memo")} value={newRemark} onChange={this.changeRemark.bind(this)} type="input" fontSize={30}/>
                        </div>
                    </div>
                    <div className="contacts_edit_remark_item">
                            <Button onClick={this.handleCloseEditContact.bind(this)} value={this.translate("form.button_cancel")}  bg="#fff" color="#333" fontSize={32} size={18}/>
                        
                            <Button onClick={this.handleSubmitEditContact.bind(this)} value={this.translate("form.button_confirm")} bg="#2E7EFE" color="#fff"  fontSize={32} size={18}/>
                        
                    </div>
                </div>
            </LayerOut>
            { haveContacts ?
                (
                    <div className="contacts_havecontent">
                        <div className="contacts_search_button">
                            <div className="search" onClick={this.searchContact.bind(this)}>
                                <span></span>
                                <form action="">
                                    <input type="search" readOnly="readOnly" placeholder={this.translate("contacts.placeholder_filter_account")} className={isAndroid ==='ios'?"":"anzhuo"}/>
                                </form>
                                <div style={{
                                    //解决苹果触发input键盘事件
                                    position:'absolute',
                                    left:'0',
                                    top:'0',
                                    bottom:'0',
                                    right:'0',
                                    //backgroundColor:'red',
                                    opacity:0
                                    }}>
                                </div>
                            </div>
                        </div>
                        <div className="contacts_list">
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
                                                    <li className="name">{item.remark} <button onClick={this.handleEditRemark.bind(this,item)}>&nbsp;</button></li>
                                                </ul>
                                            </div>
                                            <div className="contact_oprate">
                                                <div className="contact_oprate_button">
                                                    <Button value={this.translate("contacts.op_delete")} onClick={this.handleDeleteContact.bind(this,item)} bg="#fff" border="green" color="#2E7EFE"  fontSize={26} size={18} />
                                                </div>
                                            </div>
                                        </dd>
                                        )
                                    })
                                }
                            </dl>
                        </div>
                        <div className="contacts_add_layer">                        
                            <Button value={this.translate("contacts.button_add")} onClick={this.addContact.bind(this)} fontSize={26}/>
                        </div>
                    </div>
                )
                :
                (
                    <div className="contacts_nocontent">
                        <div className="contacts_no_contacts">
                            <img src={img_no_contacts} /><br />
                            <span>{this.translate("contacts.text_empty_contacts")}</span>
                        </div>
                        <div className="contacts_add_layer">                        
                            <Button value={this.translate("contacts.button_add")} onClick={this.addContact.bind(this)} fontSize={26}/>
                        </div>
                    </div>
                )
            }
          </div>
        )
    }
}


const stores = [ContactsStore, WalletStore,TipsStore];

export default connect(ContactsList,{
    listenTo(){
        return stores;
    },
    getProps(){
        let result = {};
        for(let store of stores){
            for(let props in store.getState()){
                result[props] = store.getState()[props];
            }
        }
        return result;
    }
})