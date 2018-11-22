import React from 'react';
import {connect} from "alt-react";
import counterpart from "counterpart";
import BaseComponent from "../BaseComponent";
import TipsActions from "../../actions/TipsActions";
import SettingsActions from "../../actions/SettingsActions";
import ContactsActions from "../../actions/ContactsActions";
import LinkButton from "../Layout/LinkButton";
import Button from "../Form/Button";
import Input from "../Form/Input";
import Mask from "../Layout/Mask";
import WalletStore from "../../stores/WalletStore";
import ContactsStore from "../../stores/ContactsStore";
import Validation from "../../../lib/utils/Validation";
import AccountImage from "../Layout/AccountImage";
import {img_un_uid} from "../../assets/img";
import Utils from "../../../lib/utils/Utils"

/**
 * 新建联系人
 */
class ContactsAdd extends BaseComponent{
    constructor(props){
        super(props);
        this.state={
            uid:"",
            remark:"",
            isValid:true,
            firstEnter:false
        }
    }

    componentDidMount() {
        let headerData = {
            buttonLeft: {
                value: "img_back",
            },
            title: "contacts.add_title",
            canBack:true
        }
        SettingsActions.updateHeader(headerData);
        TipsActions.setLoadingGlobalHide();
        
        let {uid}=this.props;
        if(uid.length>0){
            ContactsActions.ValidationAccent(uid)
            .then(re=>{
                this.setState({isValid:false});
            }).catch((err)=>{
                    this.setState({isValid:true});
            });
        }
    }

    componentWillUnmount(){
        ContactsActions.setQRcodeUid("");
    }

    /**
     * 编号变化赋值 
     * */
    handleAccountChange(e){

        let uid=e.target.value;
        var regu = /^[1-9]\d*$/;
        if(uid.length>0){
            if (regu.test(uid)) {
                ContactsActions.ValidationAccent(uid)
                .then(re=>{
                    this.setState({isValid:false});
                }).catch((err)=>{
                        this.setState({isValid:true});
                });
                ContactsActions.setQRcodeUid(uid);
            }
        }
        else{
            ContactsActions.setQRcodeUid(uid);
        }
    }
    
    /**
     * 备注变化赋值 
     * */
    handleRemarkChange(e){
        let remark=e.target.value.replace(/(^\s*)|(\s*$)/g, "");
        this.setState({remark:remark});
    }

    /**
     * 新增联系人 
     * */
    handleSubmitContact(){
        let {uid} = this.props;
        let master = WalletStore.getWallet().yoyow_id;
        let {inx, remark, method,isValid} = this.state;
        if(Validation.isEmpty(uid)){
            TipsActions.alert(this.translate("contacts.add_alert_empty_uid"),"");
            return false;
        }

        if(isValid){
            TipsActions.alert(this.translate("contacts.add_error_invalid_uid"),"");
            return false;
        }
        
        if(master == uid){
            TipsActions.alert(this.translate("contacts.add_alert_not_self"),"");
            return false;
        }
        if(!Validation.isEmpty(remark) && remark.length>10){
            TipsActions.alert(this.translate("contacts.add_alert_memo_length"),"");
            return false;
        }
        let contact = {
            uid:uid,
            master:master,
            remark:this.state.remark,
            head_img:"",
            last_modify:Date.now()
        };
        ContactsActions.setContact(contact)
        .then(r=>{
            TipsActions.toast(this.translate("contacts.add_success"));
            this.routerBack();
        }).catch(r=>{
            let msg=this.translate("contacts.add_faild");
            switch(r){
                case -2:
                    //不是有效账号
                    msg=this.translate("contacts.add_error_invalid_uid");
                    break;
                case -3:
                    //联系人账号已存在
                    msg=this.translate("contacts.add_error_already_added");
                    break;
                default:
                    //添加联系人错误
                    msg=this.translate("contacts.add_faild");
                    break;
            }
            TipsActions.alert(msg,"");
        });
    }
        
    /**
     * 接收来自扫码器的回调信息
     * @param {} msg 
     */
    handleCallBack(result){
        try{
            if(result.state && result.text.length>0){
                let info=JSON.parse(result.text);
                if(info.type && info.type=="contacts"){
                    let account=info.toAccount;
                    if(account && account.length>0){
                        ContactsActions.ValidationAccent(account)
                        .then(()=>{
                            ContactsActions.setQRcodeUid(account);
                            this.setState({isValid:false});                        
                        })
                        .catch(()=>{
                            this.setState({isValid:true});
                        });
                    }else{
                        TipsActions.alert(this.translate("contacts.sacnner_data_error"),"");
                    }
                }else{
                    TipsActions.alert(this.translate("contacts.sacnner_data_error"),"");
                }
            }
        }
        catch(err){
            TipsActions.alert(this.translate("contacts.sacnner_data_error"),"");
        }
    }
    onFocus(isNumber,isPoint,pointLength,ev) {
        let objInput = ev.target;
        let maskObj = ev.target;
        if(window.cordova){
            Utils.handleKeyBoards(objInput,maskObj,isNumber,isPoint,pointLength)
        }
        //TipsActions.consoleText(objInput.selectionStart);

    }
    render (){
        let {remark,isValid,firstEnter} =this.state;
        let {uid}=this.props;
        let locale=counterpart.getLocale() || "zh";
         return(
          <div className="contacts_add bgWhite">
            <div className="contacts_add_form_account">                
                {
                    isValid?<img className={isValid} src={img_un_uid} />:<AccountImage account={uid} size={{width: 90, height: 90}} />
                }
                <Input placeholder={this.translate("contacts.add_placeholder_account")}
                       value={uid}
                       onChange={this.handleAccountChange.bind(this)}
                       onFocus={this.onFocus.bind(this,true,false,0)}
                       onClick={this.onFocus.bind(this,true,false,0)}
                       type="text" fontSize={30}/>
            </div>
            <div className="contacts_add_form_remark">                
                <Input placeholder={this.translate("contacts.add_placeholder_memo")} value={remark} onChange={this.handleRemarkChange.bind(this)} type="input" fontSize={30}/>
            </div>
            <div className="contacts_add_form_button">                
                <Button value={this.translate("form.button_confirm")} onClick={this.handleSubmitContact.bind(this)}  fontSize={26}/>
            </div>
          </div>
        )
    }
}


export default connect(ContactsAdd,{
    listenTo(){
        return [ContactsStore];
    },
    getProps(){
        return ContactsStore.getState();
    }
})