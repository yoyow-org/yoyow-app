import React from "react";
import BaseComponent from "../BaseComponent";
import {Utils, Validation} from "../../../lib";
import SettingsActions from "../../actions/SettingsActions";
import PlatformActions from "../../actions/PlatformActions";
import PlatformStore from "../../stores/PlatformStore";
import WalletActions from "../../actions/WalletActions";
import WalletStore from "../../stores/WalletStore";
import Checkbox from "../../components/Form/Checkbox";
import TipsActions from "../../actions/TipsActions";

class CreateAuth extends BaseComponent{
    constructor(){
        super();
        this.state = {
            pwdFocus: false,
            mark: '',
            isRead: false,
            message: '',
            level: 0
        }
    }

    componentDidMount(){
        SettingsActions.updateHeader({
            buttonLeft: {
                value: "font",
            },
            buttonRight: {
                value: "img_help",
                textValue: this.translate('create_account.text_authority_create')
            },
            title: "authority_account.text_head",
            onBack: this.handleOnBack.bind(this),
            canBack: false,
        });
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

    __validMark(mark){
        let flag = mark.length <= 10;
        if(!flag)
            TipsActions.alert(this.translate('create_account.valid_mark'));
        return flag;
    }

    handleOnBack(e){
        PlatformActions.clearSignStr();
        WalletActions.clearPassword();
        this.routerBack();
    }

    handleReadChange(e){
        let checked = e.target.checked;
        this.setState({isRead: checked});
    }

    handleToProtocol(e){
        this.routerPush('/about/service-terms');
    }

    handleToImport(e){
        this.routerPush('/import-account');
    }

    handlePwdChange(e){
        let pwd = e.target.value;
        let repwd = this.props.repwd;
        this.__validPassword(pwd);
        WalletActions.setPassword(pwd, repwd);
    }

    handleRepwdChange(e){
        let pwd = this.props.pwd;
        let repwd = e.target.value;
        WalletActions.setPassword(pwd, repwd);
    }

    handleMarkChange(e){
        let mark = e.target.value;
        this.setState({mark});
    }

    handlePasswordFocus(e){
        this.setState({pwdFocus: true});
        this.__validPassword(this.props.pwd);
    }

    createAccount(e){
        let {platform, pwd, repwd} = this.props;
        let {mark, isRead, level} = this.state;
        
        if(isRead && level >= 0 && this.__validPassword(pwd) && this.__validRepassword(pwd, repwd) && this.__validMark(mark)){
            TipsActions.loading(true);
            WalletActions.createAccount(pwd, pwd, mark, true).then(yoyow_uid => {
                // 创建同时授权
                PlatformActions.doAuthority(yoyow_uid).then(() => {
                    TipsActions.loading(false);
                    PlatformActions.sendAuthority();
                    PlatformActions.clearSignStr();
                    this.routerPush('/create-success');
                }).catch(err => {
                    TipsActions.toast(err.msg);
                    TipsActions.loading(false);
                    PlatformActions.clearSignStr();
                });
                WalletActions.clearPassword();
            }).catch(e => {
                TipsActions.toast(this.translate('create_account.text_fail')+'\n ' + (e.message ? e.message : e));
                TipsActions.loading(false);
            });
        }
    }

    render(){
        let {isRead, message, level} = this.state;
        let {pwd, repwd, platform} = this.props;
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
        }else if(level == 3){
            levelText = this.translate('create_account.text_fine');
            levelClass = 'create_account_level_high';
        }
        return(
            <div className="create_auth_wrapper">
                <div className="create_auth_desc">
                    <span className="crate_auth_bottom_tips">{this.translate('create_account.text_tips_1')}</span><br/>
                    <span className="crate_auth_bottom_tips">{this.translate('create_account.text_tips_2')}</span>
                    <span className="crate_auth_bottom_tips">
                        {this.translate('authority_account.text_tips_1')}
                        <span className="create_auth_font_green">&nbsp;{platform.name}&nbsp;</span>
                        {this.translate('authority_account.text_tips_2')}
                    </span>
                </div>
                <div className="create_auth_form">
                    <div className="create_auth_input_line create_auth_lock">
                        <input type="password" autoComplete="off" value={pwd} placeholder={this.translate('create_account.placeholder_pwd')} onFocus={this.handlePasswordFocus.bind(this)} onChange={this.handlePwdChange.bind(this)}/>
                        {
                            Validation.isEmpty(message) ? null:
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
                    {Validation.isEmpty(message) ? null: <div className={[levelClass, 'create_message_panel'].join(' ')}>{message}</div>}
                    <div className="create_auth_input_line create_auth_lock">
                        <input type="password" autoComplete="off" value={repwd} placeholder={this.translate('create_account.placeholder_repwd')} onChange={this.handleRepwdChange.bind(this)}/>
                    </div>
                    <div className="create_auth_input_line create_auth_mark">
                        <input type="text" placeholder={this.translate('create_account.placeholder_mark')} onChange={this.handleMarkChange.bind(this)}/>
                    </div>
                </div>
                <div className="create_auth_protocol_wrapper">
                    <label>
                        <Checkbox type="checkbox" checked={isRead} onChange={this.handleReadChange.bind(this)}/>
                        <span className="create_auth_readed">{this.translate('create_account.text_agree_on')}</span>
                    </label>
                    <span className="create_auth_protocol" onClick={this.handleToProtocol.bind(this)}>{this.translate('create_account.text_protocol')}</span>
                </div>
                <div className="create_auth_layer_button">
                    <input type="button" className={isRead ? "create_auth_button_useable" : ""} value={this.translate('authority_account.button_create_auth')} onClick={this.createAccount.bind(this)} />
                </div>
                <div className="create_auth_import_wrapper">
                    <span className="create_auth_import" onClick={this.handleToImport.bind(this)}>
                        {this.translate('authority_account.button_import_auth')}
                    </span>
                </div>
            </div>
        )
    }
}

export default Utils.altConnect(CreateAuth, [WalletStore, PlatformStore]);