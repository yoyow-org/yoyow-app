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
import Validation from "../../../lib/utils/Validation";

/**
 * 搜索联系人
 */
class ContactsSelectSearch extends BaseComponent{
    constructor(){
        super();
        this.handleTextChangeEvent=this.handleTextChangeEvent.bind(this);
        this.handleClearCallBack=this.handleClearCallBack.bind(this);
    }

    componentDidMount() {
        let headerData = {
            search: {
                type: "search",
                value: "contacts.placeholder_filter_account"
            },
            buttonRight: {
                value: "",
            },
            canBack:true,
            textChangeEvent:this.handleTextChangeEvent,
            onSubmit:this.handelSearchSubmit.bind(this)
        }
        SettingsActions.updateHeader(headerData);
        ContactsActions.setKeywords("");
        ContactsActions.getHistroys(WalletStore.getWallet().yoyow_id);        
    }

    /**
     * 删除查询历史记录
     * @param {} inx 
     */
    handleDeleteHistroy(inx,e){
        if(e){
            e.stopPropagation();
        }
        ContactsActions.delHistroy(inx);
        ContactsActions.getHistroys(WalletStore.getWallet().yoyow_id);
    }
    
    /**
     * 批量删除查询历史记录
     */
    handleBatchDeleteHistroys(){
        ContactsActions.setKeywords("");
        let {histroys} = this.props;
        histroys.map((histroy)=>{
            this.handleDeleteHistroy(histroy.inx);
        });
    }

    /**
     * 查询文本改变事件
     * @param {*} e 
     */
    handleTextChangeEvent(e){
        let kw=e.target.value;
        ContactsActions.setKeywords(kw);
    }
    
    /**
     * 查询文本框清空回调
     */
    handleClearCallBack(){
        ContactsActions.setKeywords("");
    }

    /**
     * 提交查询
     * 由输入法查询按钮触发
     **/
    handelSearchSubmit(item){
        let {searchKeywords}=this.props;
        let keyword=(Validation.isEmpty(item))?searchKeywords:item.keyword; 
        ContactsActions.setKeywords(keyword);

        if(!Validation.isEmpty(keyword))
        {
            let histroy={
                keyword:keyword,
                master:WalletStore.getWallet().yoyow_id,
                last_modify:new Date()
            }
            ContactsActions.setHistroy(histroy);            
            this.routerPush("/contacts-select/search/result",true);
        }
    }

    render (){
        let {histroys} = this.props;
        return(
          <div className="contacts_search_index bgWhite">
            <div className="contacts_search_title">{this.translate("contacts.search_title")} &nbsp;<button onClick={this.handleBatchDeleteHistroys.bind(this)}></button></div>
            <div className="contacts_search_list">
                <ul>
                    {
                        histroys.map((item)=>{
                           return(
                                    <li key={'histroy' + item.inx} onClick={this.handelSearchSubmit.bind(this,item)}>{item.keyword} <button onClick={this.handleDeleteHistroy.bind(this,item.inx)}></button></li>
                                ) 
                        })
                    }
                </ul>
            </div>
          </div>
        )
    }
}

export default connect(ContactsSelectSearch,{
    listenTo(){
        return [ContactsStore];
    },
    getProps(){
        return ContactsStore.getState();
    }
})