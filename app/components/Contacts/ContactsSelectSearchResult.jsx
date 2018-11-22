import React from 'react';
import {connect} from "alt-react";
import BaseComponent from "../BaseComponent";
import TipsActions from "../../actions/TipsActions";
import SettingsActions from "../../actions/SettingsActions";
import ContactsActions from "../../actions/ContactsActions";
import LinkButton from "../Layout/LinkButton";
import Button from "../Form/Button";
import Input from "../Form/Input";
import TipsStore from "../../stores/TipsStore";
import WalletStore from "../../stores/WalletStore";
import ContactsStore from "../../stores/ContactsStore";
import AccountImage from "../Layout/AccountImage";
import {img_no_contacts,
        img_un_uid,
        img_radio_false,
        img_radio_true} from "../../assets/img";

/**
 * 联系人搜索结果
 */
class ContactsSelectSearchResult extends BaseComponent{
    constructor(){
        super();
        this.state={
            selectItem:""
        }
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
    
    componentWillMount() {
        let {selectItems}= this.props;
        this.setState({selectItem:selectItems});
    }
    /**
     * 选中联系人
     * @param {*} inx 
     */
    handleSelectItem(inx,e){
        this.setState({selectItem:inx});
    }

    /**
     * 确定选择联系人
     */
    handleConfimSelect(){        
        let {selectItem}=this.state;
        if(selectItem && selectItem.length>0){
            ContactsActions.selectContact(selectItem);
            this.routerPush("/transfer");
        }
        else{
            TipsActions.alert(this.translate("contacts.select_alert_empty"),"");
        }
    }
    render (){
        let {contacts,searchKeywords} = this.props;
        let {selectItem}=this.state;
        return(
          <div className="contacts_search_result bgWhite">
            <div className="contacts_select_search_result_head">
                <div className="contacts_search_result_head_left">
                    {this.translate("contacts.search_result_title_begin")}:<span>{searchKeywords}</span>
                </div>
                <div className="contacts_search_result_head_right">
                    <span>{contacts.length}</span>{this.translate("contacts.search_result_title_end")}
                </div>
            </div>
            <div className="contacts_select_search_result_list">
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
        {
            contacts&&contacts.length>0?
            (<div className="contacts_select_search_comfire">                        
                <Button value={this.translate("contacts.select_button")} onClick={this.handleConfimSelect.bind(this)} fontSize={26}/>
            </div>)
            :""

        }
          </div>
        )
    }
}

export default connect(ContactsSelectSearchResult,{
    listenTo(){
        return [ContactsStore];
    },
    getProps(){
        return ContactsStore.getState();
    }
})