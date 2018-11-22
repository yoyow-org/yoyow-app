import React from "react";
import BaseComponent from "../BaseComponent";
import {Utils, Validation} from "../../../lib";
import WalletStore from "../../stores/WalletStore";
import WalletActions from "../../actions/WalletActions";
import SettingsActions from "../../actions/SettingsActions";
import Button from "../Form/Button";
import TipsActions from "../../actions/TipsActions";

class ChangePassword extends BaseComponent{
    constructor(){
        super();
        this.state = {
            old: '',
            pwd: '',
            repwd: '',
            message: '',
            level: 0
        };
    }

    componentDidMount(){
        SettingsActions.updateHeader({
            buttonLeft: {
                value: "img_back",
            },
            title: 'change_password.text_head',
            canBack: true
        });
    }

    handleConfirm(e){
        let {old, pwd, repwd} = this.state;
        let _this=this;
        if(this.__validRequire(old, pwd, repwd) && this.__validRepassword(pwd, repwd) && this.__validPassword(pwd) && this.__validUnchange(old, pwd)){
            WalletActions.checkPassword(old).then(() => {
                WalletActions.changePassword(old, pwd).then(() => {

                    _this.routerBack();
                    //this.context.router.goBack();

                    let timeout = setTimeout(() => {
                        TipsActions.toast(this.translate('change_password.text_success'));
                        clearTimeout(timeout);
                    }, 100);
                }).catch(err => {
                    TipsActions.alert(Utils.formatError(err).msg);
                });
            }).catch(err => {
                TipsActions.alert(Utils.formatError(err).msg);
            });
        }
    }

    handleOldChange(e){
        this.setState({old: e.target.value});
    }

    handlePwdChange(e){
        let pwd = e.target.value;
        this.__validPassword(pwd);
        this.setState({pwd});
    }

    handleRePwdChange(e){
        this.setState({repwd: e.target.value});
    }

    __validRequire(old, pwd, repwd){
        let flag = false;
        if(Validation.isEmpty(old))
            TipsActions.alert(this.translate('change_password.placeholder_text_old'));
        else if(Validation.isEmpty(pwd))
            TipsActions.alert(this.translate('change_password.placeholder_text_pwd'));
        else if(Validation.isEmpty(repwd))
            TipsActions.alert(this.translate('change_password.placeholder_text_re'));
        else flag = true;
        return flag;
    }

    __validPassword(pwd){
        let level = -1;
        let length = pwd.length;
        let longReg = /.{15,}$/;
        let numReg = /[0-9]/;
        let enReg = /[A-Za-z]/;
        let spReg = /(?=[\x21-\x7e]+)[^A-Za-z0-9]/;
        if(length >= 12){
            level = 0;
            if(longReg.test(pwd))
                level ++; // 长度大于15字节 等级 +1
            if(numReg.test(pwd) && enReg.test(pwd) && spReg.test(pwd))
                level += 2; // 含三种类型 等级 +2
            else if( (numReg.test(pwd) && enReg.test(pwd)) || (numReg.test(pwd) && spReg.test(pwd)) || (enReg.test(pwd) && spReg.test(pwd)) )
                level ++; // 含任意两种类型 等级 +1
            this.setState({message: this.translate('create_account.text_characters', {length}),level});
        }else if(length < 12 ){
            this.setState({message: this.translate('create_account.valid_message'), level: -1});
        }
        return level >= 0;
    }

    __validRepassword(pwd, repwd){
        let flag = pwd === repwd;
        if(!flag)
            TipsActions.alert(this.translate('create_account.valid_repwd'));
        return flag;
    }

    __validUnchange(old, pwd){
        let flag = old !== pwd;
        if(!flag)
            TipsActions.alert(this.translate('change_password.valid_text_same'));
        return flag;
    }

    render(){
        let {old, pwd, repwd, message, level} = this.state;
        let levelText, levelClass
        if(level == 0){
            levelText = this.translate('create_account.text_weak');
            levelClass = 'create_account_level_low';
        }else if(level == 1){
            levelText = this.translate('create_account.text_general');
            levelClass = 'create_account_level_mid';
        }else if(level == 2){
            levelText = this.translate('create_account.text_strong');
            levelClass = 'create_account_level_high';
        }else if(level >= 3){
            levelText = this.translate('create_account.text_fine');
            levelClass = 'create_account_level_high';
        }
        return (
            <div className="change_password_wrapper">
                <div className="change_password_form_wrapper">
                    <div className="change_password_input_line">
                        <input value={old} type="password" autoComplete="off" onChange={this.handleOldChange.bind(this)} placeholder={this.translate('change_password.placeholder_text_old')} />
                    </div>
                    <div className={`change_password_input_line ${Validation.isEmpty(message) ? '' : 'change_password_clear_padding'}`}>
                        <input value={pwd} type="password" autoComplete="off" onChange={this.handlePwdChange.bind(this)} placeholder={this.translate('change_password.placeholder_text_pwd')} />
                        {
                            Validation.isEmpty(message) ? '' :
                            <div className={[levelClass, 'create_account_level_wrapper'].join(' ')}>
                            <span className="create_account_level_show">{levelText}</span>
                            <ul className="create_account_level">
                                <li className={level>=3?'level_active':''}>&nbsp;</li>
                                <li className={level>=2?'level_active':''}>&nbsp;</li>
                                <li className={level>=1?'level_active':''}>&nbsp;</li>
                                <li className={level>=0?'level_active':''}>&nbsp;</li>
                            </ul>
                        </div>
                        }
                    </div>
                    {
                        Validation.isEmpty(message) ? '' : 
                        <div className={[levelClass, 'create_message_panel'].join(' ')}>{message}</div>
                    }
                    <div className="change_password_input_line">
                        <input value={repwd} type="password" autoComplete="off" onChange={this.handleRePwdChange.bind(this)} placeholder={this.translate('change_password.placeholder_text_re')} />
                    </div>
                </div>
                <div className="change_password_button">
                    <Button onClick={this.handleConfirm.bind(this)} value={this.translate('change_password.button_text')} />
                </div>
            </div>
        )
    }
}

export default Utils.altConnect(ChangePassword, [WalletStore]);