import React from 'react';
import {connect} from "alt-react";
import BaseComponent from "../BaseComponent";
import TipsActions from "../../actions/TipsActions";
import SettingsActions from "../../actions/SettingsActions";
import ContactsActions from "../../actions/ContactsActions";
import LinkButton from "../Layout/LinkButton";
import Button from "../Form/Button";
import Input from "../Form/Input";
import LayerOut from "../Layout/LayerOut";
import TipsStore from "../../stores/TipsStore";
import WalletStore from "../../stores/WalletStore";
import ContactsStore from "../../stores/ContactsStore";
import Validation from "../../../lib/utils/Validation";
import AccountImage from "../Layout/AccountImage";
import {img_no_contacts,
        img_un_uid,
        img_radio_false,
        img_radio_true} from "../../assets/img"; 


/**
 * 联系人管理
 */
class ContactsSelect extends BaseComponent{
    constructor(){
        super();
        this.state={
            contact:null,
            selectItem:""
        }
    }

    componentDidMount() {
        let headerData = {
            buttonLeft: {
                value: "img_back",
            },
            title:"contacts.select_title",
            canBack:true
        }
        SettingsActions.updateHeader(headerData);
        ContactsActions.setKeywords("");
        ContactsActions.getContactsList();
    }

    componentWillMount() {
        let {selectItems}= this.props;
        this.setState({selectItem:selectItems});
    }

    /**
     * 添加联系人跳转
     */
    handleAddContact(){
        this.routerPush("/contacts/add",true);
    }
    /**
     * 搜索联系人
     */
    handleSearchContact(){
        this.routerPush("/contacts-select/search",true);
    }

    /**
     * 选中联系人
     * @param {*} inx 
     */
    handleSelectItem(inx,e){
        this.setState({selectItem:inx});
    }

    /**
     * 确认选择联系人
     */
    handleConfimSelect(){
        let {selectItem}=this.state;
        if(selectItem && selectItem.length>0){
            ContactsActions.selectContact(selectItem);
            this.routerBack();
        }
        else{
            TipsActions.alert(this.translate("contacts.select_alert_empty"),"");
        }
    }

    render (){
        let {contacts,layerOutShow} = this.props;
        let {contact,selectItem}=this.state;
        let haveContacts = contacts&&contacts.length>0;
        return(
          <div className="contacts_index bgWhite">
            { haveContacts ?
                (
                    <div className="contacts_havecontent">
                        <div className="contacts_search_button">
                            <div className="search" onClick={this.handleSearchContact.bind(this)}>
                                <span></span>
                                <form action="">
                                    <input type="search" readOnly="readOnly" placeholder={this.translate("contacts.placeholder_filter_account")} />
                                </form>
                            </div>
                        </div>
                        <div className="contacts_list">
                            <dl>                                
                                {
                                    //遍历数据源
                                    contacts.map((item, inx) => {
                                    return (
                                        <dd key={'contact' + inx}>
                                            <div className="contact_select_info">
                                                <AccountImage account={item.uid} size={{width: 90, height: 90}} />
                                                <ul>
                                                    <li className="account">#{item.uid}</li>
                                                    <li className="name">{item.remark}</li>
                                                </ul>
                                                <div className="select_image_box">
                                                    <img data-selected="false" src={selectItem==item.uid?img_radio_true:img_radio_false} onClick={this.handleSelectItem.bind(this,item.uid)} />
                                                </div>
                                            </div>
                                        </dd>
                                        )
                                    })
                                }
                            </dl>
                        </div>
                        <div className="contacts_add_layer">                        
                            <Button value={this.translate("contacts.select_button")} onClick={this.handleConfimSelect.bind(this)} fontSize={26}/>
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
                            <Button value={this.translate("contacts.button_add")} onClick={this.handleAddContact.bind(this)} fontSize={26}/>
                        </div>
                    </div>
                )
            }
          </div>
        )
    }
}


const stores = [ContactsStore, WalletStore,TipsStore];

export default connect(ContactsSelect,{
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