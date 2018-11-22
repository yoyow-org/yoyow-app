import React from "react";
import BaseComponent from "../BaseComponent";
import Button from "../Form/Button";
import AccountImage from "../Layout/AccountImage";
import {Utils, Validation} from "../../../lib";
import WalletActions from "../../actions/WalletActions";
import WalletStore from "../../stores/WalletStore";
import SettingsActions from "../../actions/SettingsActions";
import WalletUnlockActions from "../../actions/WalletUnlockActions";
import TipsActions from "../../actions/TipsActions";
import PlatformStore from "../../stores/PlatformStore";
import PlatformActions from "../../actions/PlatformActions";
import Scanner from "../../components/Layout/Scanner";

class ImportAccount extends BaseComponent{
    constructor(){
        super();
        this.state = {
            mark: null,
            isApp:true
        };
    }

    componentDidMount(){
        SettingsActions.updateHeader({
            buttonLeft: {
                value: "img_back",
            },
            title: 'import_account.text_head',
            canBack: false,
            onBack: this.handleBack.bind(this)
        });
        
        this.setState({ isApp: window.cordova ? true : false });
    }

    handleBack(){
        WalletActions.clearBackWallet();
        this.routerBack();
    }
    
    handleImportClick(e){
        let {mark} = this.state;
        let {platform} = this.props;
        if(!Validation.isEmpty(mark) && mark.length > 10){
            TipsActions.alert(this.translate('create_account.valid_mark'));
        }else{
            WalletUnlockActions.checkLock(true, false).then(() => {
                TipsActions.loading(true);
                WalletActions.restore(mark).then(w => {
                    TipsActions.loading(false);
                    TipsActions.toast(this.translate('import_account.text_success'));
                    WalletActions.clearBackWallet();
                    this.routerPush("/index",true);
                }).catch(err => TipsActions.error(err));
            });
        }
    }

    handleToScan(result){
        if(result.cancelled == 0 || result.cancelled == false){
            WalletActions.decompress(result.text).then(bakWallet => {
                PlatformActions.checkAuthority(bakWallet[9]).then().catch(err => {
                    TipsActions.toast(Utils.formatError(err).msg);
                });
            }).catch(err => TipsActions.error(err));
        }
        
        /*
        //TODO: 主网账号
        //let test = 'YYW7biVsne6NzXZtBHKvyemsA43RxsRpnufqwf54aPeLgZrmvJEoLYYW7biVsne6NzXZtBHKvyemsA43RxsRpnufqwf54aPeLgZrmvJEoL3Nx1yPLrKaHiTq38oOVH4OxXZQkP1OaT9GzgrUNdaxlBa0GpWlS4DhjI35Ik5gILB2ZoV/DqFzkpQodeQ1q1zWGAROMVb4n9Dn+zHlcaKxarx+Rs8QHleP0tEdAcd8gicIdGCxLoUIZA++t15j03TAFRJo9p5RqDbOwgWhC1lqJMqEptIwWKyYrQ8jI8xmSfNiWTql8aoqaHDv+dBw5pKU/KVqJKrKHrhtlUQeU95EEaqz8AzURc0zareUWMlcBsycOSJ4C3mpAlxSbiddtdbOdjw1GQy/z5GZJNyByiJBaMaMr5tMlaVuu8pDc6qlWneYxKZegPkTf4XRJH0E9rs3pbSfECvlaI5DfsUsXsYN2CY63YGXBV7e9Ty0VA+CrR1524617595345504252058';
        //TODO: 测试网账号
        let test = 'YYW7biVsne6NzXZtBHKvyemsA43RxsRpnufqwf54aPeLgZrmvJEoLYYW7biVsne6NzXZtBHKvyemsA43RxsRpnufqwf54aPeLgZrmvJEoLBIRu85b9pgqSCHRIgJpTXpq+WHSZo+b1mMMU+h6oOrc0JZ3j6eFNTKsiUZZzGMoVc30gNoJ8kQqRROkOkvPr/nmqaCoUruG/mp9HtTeqylFR53Hfn2xwMyqMR/FXEpuU63SE4qAfLT7F6nprAUJwfnqp0zXmyb94c6lPfztdzleI/TEMAPnOok14pVfaIccP07+Q7kGDWxy4v58du1Fq2BSLRLoMn+PBxK+f2fKI2Ht1sisLngsnyscUGgb6rNHJ8tl8H9cxSz02Y4ayxa5X0+0nk8z+uSZN93B4g1lIcjKAFH2JJME+LhlLbE2W3fP8v/VBAWPZyg9SSVD1RhbyeOtby5VBtIGoq/rUrMiW31qZwwNnOvuuo4FS2gpNDkub1524738419210227906467Y1bGdSXFCNNBY0NkXYQzSXAvjkIjICfyXI1+8+v+IIdIAb82VWGHLrtnXUxXfP1Himark6YO95Lya5pKS5aiH5byA5aeL';
        WalletActions.decompress(test).then(bakWallet => {
            PlatformActions.checkAuthority(bakWallet[9]).then(alreadyAuth => {
                this.setState({alreadyAuth});
            }).catch(err => {
                TipsActions.toast(Utils.formatError(err).msg);
            });
        }).catch(err => TipsActions.error(err));
        */
    }

    handleMarkChange(e){
        this.setState({mark: e.target.value});
    }
    webScan(){
        this.routerPush('/web-scan');
    }
    render(){
        let {mark,isApp} = this.state;
        let {bakWallet, platform} = this.props;
        if(mark == null) mark = bakWallet[11] ? bakWallet[11] : '';
        return (
            <div className="import_account_wrapper">
                {
                    Validation.isEmpty(platform) ? null :
                    <div className="import_auth_head">
                        {this.translate('authority_account.text_tips_1')}
                        <span className="import_auth_font_green">&nbsp;{platform.name}&nbsp;</span>
                        {this.translate('authority_account.text_tips_2')}
                    </div>
                }
                <div className="import_account_head_line">
                    <span>{this.translate('import_account.text_description')}</span>
                    {isApp?<Scanner className="scanning_green_x" callback={this.handleToScan.bind(this)}/>:
                        <button className="create_account_scan greenBtn" onClick={this.webScan.bind(this)}></button>
                    }
                </div>
                {
                    bakWallet.length == 0 ? '' :
                    <div className="import_acccount_content_wrapper">
                        <div className="import_account_desc_line">
                            <div className="import_account_headimg">
                                <AccountImage size={{width: 90, height: 90}} account={bakWallet[9]}/>
                            </div>
                            <div className="import_account_info">
                                <span>#{bakWallet[9]}</span>
                            </div>
                        </div>
                        <div className="import_account_mark_line">
                            <input type="text" placeholder={this.translate('import_account.placeholder_text_mark')} value={mark} onChange={this.handleMarkChange.bind(this)} />
                        </div>
                        <div className="layer_button import_account_layer_button">
                            <Button 
                            value={
                                Validation.isEmpty(platform) ? 
                                this.translate('import_account.button_confirm') : 
                                this.translate('authority_account.button_import_auth')
                            } 
                            onClick={this.handleImportClick.bind(this)}/>
                        </div>
                    </div>
                }
            </div>
        )
    }
}

export default Utils.altConnect(ImportAccount, [WalletStore, PlatformStore]);