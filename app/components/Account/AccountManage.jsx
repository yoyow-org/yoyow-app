import React from "react";
import BaseComponent from "../BaseComponent";
import AccountImage from "../Layout/AccountImage";
import Checkbox from "../Form/Checkbox";
import {Utils} from "../../../lib";
import WalletStore from "../../stores/WalletStore";
import WalletActions from "../../actions/WalletActions";
import SettingsActions from "../../actions/SettingsActions";
import IntlStore from "../../stores/IntlStore";
import TipsActions from "../../actions/TipsActions";
import WalletUnlockActions from "../../actions/WalletUnlockActions";

class AccountManage extends BaseComponent{
    constructor(){
        super();
    }

    componentDidMount(){
        SettingsActions.updateHeader({
            buttonLeft: {
                value: "img_back",
            },
            title: 'manage_account.text_head',
            //onBack: this.handleOnBack.bind(this),
            canBack: true
        });
        let isLoad = this.props.router.location.state;

        if(!isLoad){
            TipsActions.loading(true)
        }
        WalletActions.fetchAccountListStatistics().then(() => {
            TipsActions.loading(false);
        }).catch(err => {
            TipsActions.alert(Utils.formatError(err).msg);
            TipsActions.loading(false);
        });
        WalletActions.clearSelected();
    }

    componentWillMount(){
        this.checkAccountValid();
    }

    // componentWillUpdate(nextProps){
    //     let {accountList} = nextProps;
    //     if(accountList.filter(w => { return !w.is_trash }).size == 0) this.context.router.replace('/');
    // }

    handleOnBack(){
        this.routerBack();
    }

    handleToCreate(e){
        WalletActions.setNeedBack(true);
        this.routerPush('/create-account',true);
    }

    handleToImport(e){
        this.routerPush('/import-account',true);
    }

    handleToDetail(acc, e){
        if(!acc.is_trash){
            WalletActions.selectAccount(acc.uid).then(() => {
                this.routerPush('/account-detail',true);
            });
        }
    }

    handleDelete(uid, e){
        TipsActions.confirm(this.translate('manage_account.text_remove_tips'), () => {
            WalletActions.deleteAccount(uid).then(() => {
                WalletActions.fetchAccountListStatistics();
                TipsActions.toast(this.translate('detail_account.text_success_delete'));
            }).catch(err => {
                TipsActions.toast(err.msg);
            });
            return true;
        });
    }

    handleChangeAccount(uid, e){
        let {wallet} = this.props;
        if(wallet.yoyow_id != uid){
            TipsActions.loading(true);
            WalletActions.changeAccount(uid).then(() => {
                WalletActions.fetchAccountListStatistics().then(() => {
                    TipsActions.loading(false);
                }).catch(err => TipsActions.loading(false));
            }).catch(err => {
                TipsActions.loading(false);
                TipsActions.toast(err.msg);
            });
        }
    }

    render(){
        let {accountList, wallet, currentLocale} = this.props;
        let cUid = wallet ? wallet.yoyow_id : null;
        let failureImg = `account_manage_failure_${currentLocale}`;
        return(
            <div className="account_manage_wrapper flex_column">
                <div className="layer_account_flex">
                {
                    accountList.map((a, inx) => {
                        return (
                            <div className="account_manage_line_wrapper" key={`account_manage_inx_${inx}`}>
                                <div className={`account_manage_account_line ${a.is_trash ? failureImg : ''}`} onClick={this.handleToDetail.bind(this, a)}>
                                    <div className="account_manage_headimg">
                                        <AccountImage account={a.uid + ''} size={{width: 90, height: 90}}/>
                                    </div>
                                    <div className="account_manage_desc">
                                        <span>{`#${a.uid}`}</span>
                                        <span>{a.is_trash ? '' : a.mark}</span>
                                    </div>
                                </div>
                                <div className="account_manage_detail_line">
                                    {
                                        a.is_trash ? <label onClick={this.handleDelete.bind(this, a.uid)} className="account_manage_font_red">{this.translate('manage_account.button_text_remove')}</label>
                                        :<label>
                                            <Checkbox type="checkbox" checked={cUid == a.uid} onChange={this.handleChangeAccount.bind(this, a.uid)}/>
                                            <span>{this.translate(cUid == a.uid ? 'manage_account.text_current_use' : 'manage_account.text_set_use')}</span>
                                        </label>
                                    }
                                    
                                    <label>
                                        <span>{this.translate('manage_account.text_total_balance')}</span>
                                        <span className="account_manage_balance">{Utils.formatAmount(a.balance + a.prepaid)}</span>
                                    </label>
                                </div>
                                <div className="account_manage_stone"></div>
                            </div>
                        )
                    })
                }
                </div>
                <div className="account_manage_btn_zone">
                    <div onClick={this.handleToCreate.bind(this)} className="account_manage_btn_white">{this.translate('manage_account.button_text_create')}</div>
                    <div onClick={this.handleToImport.bind(this)} className="account_manage_btn_green">{this.translate('manage_account.button_text_import')}</div>
                </div>
            </div>
        )
    }
}

export default Utils.altConnect(AccountManage, [WalletStore, IntlStore]);