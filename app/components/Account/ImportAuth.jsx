import React from "react";
import BaseComponent from "../BaseComponent";
import AccountImage from "../Layout/AccountImage";
import {Utils} from "../../../lib";
import WalletStore from "../../stores/WalletStore";
import WalletActions from "../../actions/WalletActions";
import PlatfromStore from "../../stores/PlatformStore";
import PlatformActions from "../../actions/PlatformActions";
import SettingsActions from "../../actions/SettingsActions";
import IntlStore from "../../stores/IntlStore";
import TipsActions from "../../actions/TipsActions";
import WalletUnlockActions from "../../actions/WalletUnlockActions";
import Mask from "../Layout/Mask";

class ImportAuth extends BaseComponent{
    constructor(){
        super();
        this.state = {
            isShow: false,
            alreadyAuth: false
        };
    }

    componentDidMount(){
        let {wallet, platform} = this.props;
        let current = wallet.yoyow_id;
        SettingsActions.updateHeader({
            buttonLeft: {
                value: "img_back",
            },
            buttonRight: {
                value: "img_help",
                textValue: this.translate('create_account.text_authority_create')
            },
            title: "authority_account.text_head",
            onBack: this.handleOnBack.bind(this),
            canBack: false,
        });
        WalletActions.fetchAccountListStatistics();
        this.__checkAuthority(current);
        this.setState({current});
    }

    handleOnBack(e){
        WalletActions.clearSelected();
        PlatformActions.clearSignStr();
        this.routerBack();
    }

    handleLogin(e){
        let {platform} = this.props;
        let {current, alreadyAuth} = this.state;
        // TODO: 授权完成后 登陆后 清空平台对象
        
        WalletUnlockActions.checkLock(true, false).then(() => {
            TipsActions.loading(true);
            if(alreadyAuth){
                PlatformActions.sendAuthority().then(() => {
                    this.__tipsAndGo('authority_account.text_success_login', {pname: platform.name});
                }).catch(err => {
                    this.__tipsAndGo('errors.'+err.code, null, false);
                });
            }else{
                PlatformActions.doAuthority(current).then(() => {
                    this.__checkAuthority(current);
                    PlatformActions.sendAuthority().then(() => {
                        this.__tipsAndGo('authority_account.text_success_auth', {pname: platform.name});
                    }).catch(err => {
                        this.__tipsAndGo('authority_account.text_success_auth_unlogin', {pname: platform.name});
                    });
                }).catch(err => {
                    TipsActions.loading(false);
                    TipsActions.error(err);
                });
            }
        });
    }

    __tipsAndGo(localKey, param, jump = true){
        TipsActions.loading(false);
        TipsActions.toast(this.translate(localKey, param));
        if(jump) {
            WalletActions.clearSelected();
            PlatformActions.clearSignStr();
            this.routerBack();
        }
    }

    handleOpenSelect(){
        this.setState({isShow: true});
    }

    handleCloseSelect(e){
        this.setState({isShow: false});
    }

    handleAccountSelected(uid, e){
        let {current} = this.state;
        this.__checkAuthority(uid);
        this.setState({current: uid, isShow: false});
        WalletActions.selectAccount(uid);
    }

    __checkAuthority(current){
        let {platform} = this.props;
        PlatformActions.checkAuthority(current).then(alreadyAuth => {
            this.setState({alreadyAuth});
        }).catch(err => {
            TipsActions.toast(Utils.formatError(err).msg);
        });
    }

    render(){
        let {isShow, current, alreadyAuth} = this.state;
        let {platform, accountList, currentLocale} = this.props;
        let {wallet} = this.props;
        let selectedBalances = accountList.find(a => { return a.uid == wallet.yoyow_id });
        return(
            <div className="import_auth_full_wrapper">
                <div className="import_auth_wrapper">
                    <div className="import_auth_head">
                        {this.translate('authority_account.text_tips_1')}
                        <span className="import_auth_font_green">&nbsp;{platform.name}&nbsp;</span>
                        {this.translate('authority_account.text_tips_2')}
                    </div>
                    {
                        accountList.filter(w => { return !w.is_trash }).size > 1 ?
                        <div onClick={this.handleOpenSelect.bind(this)} className="import_auth_select">
                            <span>{this.translate('authority_account.button_select_account')}</span>
                            <span>{`#${current}`}</span>
                        </div> : 
                        <div className="import_auth_single_account">
                            <div className="import_auth_headimg">
                                <AccountImage size={{width: 90, height: 90}} account={wallet.yoyow_id} />
                            </div>
                            <div className="import_auth_desc">
                                <div>
                                    <span className="import_auth_desc_uid">{`#${wallet.yoyow_id}`}</span>
                                    <span className="import_auth_desc_mark">{wallet.mark}</span>
                                </div>
                                <div>
                                    <span className="import_auth_desc_total">{this.translate('authority_account.text_total')}</span>
                                    <span className="import_auth_desc_count">{Utils.formatAmount(selectedBalances.balance + selectedBalances.prepaid)}</span>
                                </div>
                            </div>
                        </div>
                    }
                    
                    <div className="import_auth_button_wrapper">
                        <input type="button" onClick={this.handleLogin.bind(this)} value={alreadyAuth ? this.translate('authority_account.button_already_auth') : this.translate('authority_account.button_login_auth')} />
                    </div>

                    <div className={`import_auth_dialog_wrapper`} style={{display: isShow ? 'block' : 'none'}}>
                        <Mask onClick={this.handleCloseSelect.bind(this)}/>
                        <div className={`import_auth_select_account_wrapper ${isShow ? 'import_auth_select_enter' : 'import_auth_select_leave'}`}>
                            {
                                accountList.map((a, inx) => {
                                    return (a.is_trash ? null :
                                    <div onClick={(current == a.uid || a.is_trash) ? null : this.handleAccountSelected.bind(this, a.uid)} 
                                        className={`import_auth_single_account ${current == a.uid ? 'account_auth_selected' : ''} ${a.is_trash ? 'account_manage_failure_' + currentLocale : ''}`} 
                                        key={`import_auth_single_inx_${inx}`}>
                                        <div className="import_auth_headimg">
                                            <AccountImage size={{width: 90, height: 90}} account={a.uid + ''} />
                                        </div>
                                        <div className="import_auth_desc">
                                            <div>
                                                <span className="import_auth_desc_uid">{`#${a.uid}`}</span>
                                                <span className="import_auth_desc_mark">{a.mark}</span>
                                            </div>
                                            <div>
                                                <span className="import_auth_desc_total">{this.translate('authority_account.text_total')}</span>
                                                <span className="import_auth_desc_count">{Utils.formatAmount(a.balance + a.prepaid)}</span>
                                            </div>
                                        </div>
                                    </div>
                                    )
                                })
                            }
                            
                        </div>
                    </div> 
                </div>
            </div>
        )
    }
}

export default Utils.altConnect(ImportAuth, [WalletStore, PlatfromStore, IntlStore]);