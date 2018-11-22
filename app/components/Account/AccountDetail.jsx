import React from "react";
import BaseComponent from "../BaseComponent";
import AccountImage from "../Layout/AccountImage";
import {Utils} from "../../../lib";
import WalletStore from "../../stores/WalletStore";
import WalletActions from "../../actions/WalletActions";
import SettingsActions from "../../actions/SettingsActions";
import TipsActions from "../../actions/TipsActions";
import LayerOut from "../Layout/LayerOut";
import QRCode from "../Layout/QRCode";
import Button from "../Form/Button";
import WalletUnlockActions from "../../actions/WalletUnlockActions";
import Clipboard from "clipboard";

class AccountDetail extends BaseComponent{
    constructor(){
        super();
        this.state = {
            mark: '',
            showQR: false,
            showPrikey: false,
            QRstr: ''
        };
    }

    componentDidMount(){
        SettingsActions.updateHeader({
            buttonLeft: {
                value: "img_back",
            },
            title: 'detail_account.text_head',
            onBack: this.handleBack.bind(this),
            canBack: false
        });
        let {selectedWallet} = this.props;
        this.setState({mark: selectedWallet.mark});
        new Clipboard(this.refs.copy_btn);
    }

    handleMarkChange(e){
        this.setState({mark: e.target.value});
    }

    handleSaveMark(e){
        let {mark} = this.state;
        if(mark.length > 10) return TipsActions.alert(this.translate('create_account.valid_mark'));
        let {selectedWallet} = this.props;
        if(mark != selectedWallet.mark){
            selectedWallet.mark = mark;
            WalletActions.updateAccount(selectedWallet).then(() => {
                TipsActions.toast(this.translate('detail_account.text_success_update'));
            });
        }
    }

    handleDelete(e){
        let {wallet, selectedWallet, accountList} = this.props;
        WalletActions.fetchAccountListStatistics().then(accountList => {
            if(accountList.find(w => { return w.uid == selectedWallet.yoyow_id }).is_trash){
                // 当前账号废弃时可删
                this.__comfirmDelete(selectedWallet.yoyow_id);
            }else if(wallet.yoyow_id == selectedWallet.yoyow_id){
                // 当前账号有效且为选择的账号是，不可删
                TipsActions.alert(this.translate('detail_account.alert_valid_one'));
            }else{
                if(accountList.filter(w => { return !w.is_trash }).size == 1){
                    // 仅有一个有效账号
                    TipsActions.alert(this.translate('detail_account.alert_only_one'));
                }else{
                    this.__comfirmDelete(selectedWallet.yoyow_id);
                }
            }
        })
    };

    __comfirmDelete(uid){
        TipsActions.confirm(this.translate('manage_account.text_remove_tips'), () => {
            WalletActions.deleteAccount(uid).then (hasValid => {
                let timeout = setTimeout(() => {
                    TipsActions.toast(this.translate('detail_account.text_success_delete'));
                }, 100);
                hasValid ? this.routerBack() : this.routerPush("/index");
            }).catch(err => {
                TipsActions.toast(err.msg);
            });
            return true;
        });
    }

    handleToggleQR(isShow, e){
        this.checkAccountValid(() => {
            let {selectedWallet} = this.props;
            let {showQR, showPrikey} = this.state;
            if(isShow){
                WalletActions.generateQRString().then(QRstr => {
                    this.setState({QRstr});
                });
            }
            this.setState({showQR: isShow});
        });
    }

    handleTogglePrikey(isShow, e){
        this.checkAccountValid(() => {
            let {selectedWallet} = this.props;
            if(selectedWallet.encrypted_owner){
                if(isShow){
                    WalletUnlockActions.checkLock(false, false).then(() => {
                        this.setState({showPrikey: isShow, prikeyHex: WalletStore.getPrivateKey(0)});
                    });
                }
            }else{
                TipsActions.alert(this.translate('detail_account.alert_no_prikey'));
            }
            if(!isShow) this.setState({showPrikey: false});
        });
    }

    handleCopy(e){
        TipsActions.toast(this.translate('detail_account.text_copy_right'));
        this.setState({showPrikey: false});
    }

    handleToChangePwd(e){
        this.checkAccountValid(() => {
            this.routerPush('/change-password',true);
        });
    }

    handleBack(){
        this.checkAccountValid(() => {
            this.routerBack();
        })
    }

    render(){
        let {mark, showQR, showPrikey, prikeyHex, QRstr} = this.state;
        let {selectedWallet, accountList} = this.props;
        let selectedBalances = accountList.find(a => { return a.uid == selectedWallet.yoyow_id });
        if(!selectedBalances) selectedBalances = {};
        if(!mark) mark = '';
        return (
            <div className="account_detail_wrapper">
                <div className="account_detail_head_line">
                    <div className="account_detail_headimg">
                        <AccountImage account={selectedWallet.yoyow_id} size={{width: 140, height: 140}}/>
                    </div>
                    <div className="account_detail_desc">
                        <span>{`#${selectedWallet.yoyow_id}`}</span>
                        <span>{selectedWallet.mark}</span>
                    </div>
                </div>

                <div className="account_detail_balances">
                    <div className="account_detail_balance_line">
                        <span>{selectedBalances.balance}</span>
                        <span>{this.translate('detail_account.text_yoyo_balance')}</span>
                    </div>
                    <div className="account_detail_balance_line">
                        <span>{selectedBalances.prepaid}</span>
                        <span>{this.translate('detail_account.text_yoyo_prepaid')}</span>
                    </div>
                </div>

                <div className="account_manage_stone"></div>

                <div className="account_detail_ctrl_wrapper">
                    <div>
                        <span>{this.translate('detail_account.text_account_name')}</span>
                        <span><input type="text" value={mark} onChange={this.handleMarkChange.bind(this)} placeholder={this.translate('detail_account.placeholder_input_name')}/></span>
                    </div>
                    <div onClick={this.handleToChangePwd.bind(this)}><span>{this.translate('detail_account.text_update_pwd')}</span></div>
                    <div onClick={this.handleToggleQR.bind(this, true)}><span>{this.translate('detail_account.text_check_qrcode')}</span></div>
                    <div onClick={this.handleTogglePrikey.bind(this, true)}><span>{this.translate('detail_account.text_check_owner')}</span></div>
                </div>

                <div className="account_manage_btn_zone">
                    <div className="account_manage_btn_white" onClick={this.handleSaveMark.bind(this)}>{this.translate('detail_account.button_text_save')}</div>
                    <div className="account_manage_btn_green" onClick={this.handleDelete.bind(this)}>{this.translate('detail_account.button_text_delete')}</div>
                </div>

                <LayerOut isShow={showQR} onClose={this.handleToggleQR.bind(this, false)}>
                    <div className="account_detail_rqcode_wrapper">
                        <span>{this.translate('detail_account.text_qrcode_title')}</span>
                        <div className="account_detail_rqcode">
                            <QRCode value={QRstr} size={500} />
                        </div>
                    </div>
                </LayerOut>

                <LayerOut isShow={showPrikey} onClose={this.handleTogglePrikey.bind(this, false)}>
                    <div className="account_detail_prikey_wrapper">
                        <div className="account_detail_prikey_head">{this.translate('detail_account.text_prikey_head')}</div>
                        <div className="account_detail_prikey_title">{this.translate('detail_account.text_prikey_title')}</div>
                        <div className="account_detail_prikey_content"><span id="priKey">{prikeyHex}</span></div>
                        <div className="account_detail_prikey_button"><input ref="copy_btn" data-clipboard-text={prikeyHex} type="button" onClick={this.handleCopy.bind(this)} value={this.translate('detail_account.button_copy')} /></div>
                    </div>
                </LayerOut>
            </div>
        )
    }
}

export default Utils.altConnect(AccountDetail, [WalletStore]);