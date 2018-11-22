import React from "react";
import BaseComponent from "../BaseComponent";
import Checkbox from "../Form/Checkbox";
import Scanner from "../Layout/Scanner";
import WalletActions from "../../actions/WalletActions";
import WalletStore from "../../stores/WalletStore";
import TipsActions from "../../actions/TipsActions";
import SettingsActions from "../../actions/SettingsActions";
import PrivateKeyActions from "../../actions/PrivateKeyActions";
import {Validation, Utils} from "../../../lib";
import {
    img_main_logo,
    img_back, 
    img_guide_create_1, 
    img_guide_create_2, 
    img_guide_create_3,
    img_guide_create_en_1, 
    img_guide_create_en_2, 
    img_guide_create_en_3,
} from "../../assets/img";
import PlatformActions from "../../actions/PlatformActions";
import PlatformStore from "../../stores/PlatformStore";
import Mask from "../Layout/Mask";
import IntlStore from "../../stores/IntlStore";

class CreateAccount extends BaseComponent{
    constructor(){
        super();
        this.state = {
            pwdFocus: false,
            mark: '',
            isRead: false,
            message: '',
            level: 0,
            isApp:false
        };
    }

    componentDidMount(){
        SettingsActions.updateHeader(null);
        WalletActions.fetchAccountListStatistics();
        if(window.cordova){
            this.setState({isApp:true})
        }else{
            this.setState({isApp:false})
        }
    }

    createAccount(){
        let {platform, pwd, repwd} = this.props;
        let {mark, isRead, level} = this.state;
        let needAuth = !Validation.isEmpty(platform);

        if(isRead && level >= 0 && this.__validPassword(pwd) && this.__validRepassword(pwd, repwd) && this.__validMark(mark)){
            TipsActions.loading(true);
            WalletActions.createAccount(pwd, pwd, mark, needAuth).then(yoyow_uid => {
                if(needAuth){
                    // 创建同时授权
                    PlatformActions.doAuthority(yoyow_uid).then(() => {
                        TipsActions.loading(false);
                        PlatformActions.sendAuthority();
                        PlatformActions.clearSignStr();
                        this.routerPush("/create-success");
                    }).catch(err => {
                        TipsActions.toast(err.msg);
                        TipsActions.loading(false);
                        PlatformActions.clearSignStr();
                    });
                }else{
                    // 仅创建
                    this.routerPush("/create-success");
                    TipsActions.loading(false);
                }
                WalletActions.clearPassword();
                PrivateKeyActions.cleanKey();
                PrivateKeyActions.loadDbData();
            }).catch(e => {
                TipsActions.toast(this.translate('create_account.text_fail') + '\n' + (e.indexOf('您操作太过频繁') >=0 ? e : ''));
                TipsActions.loading(false);
            });
        }
    }

    handleHeaderBack(e){
        let {needBack} = this.props;
        PlatformActions.clearSignStr();
        if(needBack){
            this.context.router.goBack();
        }
    }

    handleReadChange(e){
        let checked = e.target.checked;
        this.setState({isRead: checked});
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

    handleBack(e){
        WalletActions.clearPassword();
        WalletActions.setNeedBack(false);
        this.routerBack();
    }

    handleScanning(result){
        
        if(result.cancelled == 0 || result.cancelled == false){
            if(result.text.indexOf('YYW') === 0){
                // TODO: 扫描账号备份二维码
                WalletActions.decompress(result.text).then(res => {
                    this.routerPush('/import-account',true);
                }).catch(err => TipsActions.error(err));
            }else{
                PlatformActions.checkSign(result.text).then(res => {
                    let {accountList} = this.props;
                    if(accountList.filter(w => { return !w.is_trash }).size > 0)
                        this.routerPush('/import-auth',true);
                    else
                        this.routerPush('/create-auth',true);
                }).catch(err => TipsActions.error(err));
            }
        }

        // TODO:模拟导入账号

        // 主网账号
        // let text = 'YYW7biVsne6NzXZtBHKvyemsA43RxsRpnufqwf54aPeLgZrmvJEoLYYW7biVsne6NzXZtBHKvyemsA43RxsRpnufqwf54aPeLgZrmvJEoL3Nx1yPLrKaHiTq38oOVH4OxXZQkP1OaT9GzgrUNdaxlBa0GpWlS4DhjI35Ik5gILB2ZoV/DqFzkpQodeQ1q1zWGAROMVb4n9Dn+zHlcaKxarx+Rs8QHleP0tEdAcd8gicIdGCxLoUIZA++t15j03TAFRJo9p5RqDbOwgWhC1lqJMqEptIwWKyYrQ8jI8xmSfNiWTql8aoqaHDv+dBw5pKU/KVqJKrKHrhtlUQeU95EEaqz8AzURc0zareUWMlcBsycOSJ4C3mpAlxSbiddtdbOdjw1GQy/z5GZJNyByiJBaMaMr5tMlaVuu8pDc6qlWneYxKZegPkTf4XRJH0E9rs3pbSfECvlaI5DfsUsXsYN2CY63YGXBV7e9Ty0VA+CrR1524617595345504252058';
        // 测试网账号
        // let text = 'YYW7biVsne6NzXZtBHKvyemsA43RxsRpnufqwf54aPeLgZrmvJEoLYYW7biVsne6NzXZtBHKvyemsA43RxsRpnufqwf54aPeLgZrmvJEoLWEHU2t/UqdhTjRkLK/yETqGXV9aY9lyg7Hn/OYGCT8hl2gBNxw1xTEbouhtn6KM43r5IAEH5Y9LMYiZIvvDpEFygZG0+mAxsCyKwXjTp5R81lEFB0llO7cw+TL43C1UHHnAlcpNYPqbwVGM9px3j8rXVLpYDuLAyYBpiO95YNhtpgFekhx0yZelMlfKsvS9uNzeuCLr4pCp/wALw0fnpSzbVv75ETph7e77qoUq79UPCR9ybZAo+EVjLPS3GmILQDxmn2EescgO5C7SnZLTQC5YR6X86JPdQHUUUGF+PL2n0rauE7PGmDUN5DWQlOetLTh988lFIuWmgZDFIWp0EUW80jCi1JagdM2b94dsEpX9bNrG8+MSPTNgksuWOlg7+1525398216836217895094';
        // WalletActions.decompress(text).then(res => {
        //     this.routerPush('/import-account');
        // }).catch(err => {
        //     TipsActions.alert(err.msg);
        // });

        // TODO:模拟平台授权

        // let sign = {"sign":"204db821c906691e61bcf69ba338d7fa815899909d81ef467ac54f5460763e15a71d5a81a58630495971bc58bb0786eb6a22ac3507929eac40d95c37bf294bab18","time":"1522664514790","platform":"217895094"}
        // let {accountList} = this.props;
        // PlatformActions.checkSign(JSON.stringify(sign)).then(res => {
        //     if(accountList.filter(w => { return !w.is_trash }).size > 0)
        //         this.routerPush('/import-auth');
        //     else
        //         this.routerPush('/create-auth');
        // }).catch(err => {
        //     console.log(err);
        //     TipsActions.alert(err.msg);
        // });
    }

    handleToImport(e){
        this.routerPush('/import-account',true);
    }

    handleToProtocol(e){
        this.routerPush('/about/service-terms',true);
    }

    handlePasswordFocus(e){
        this.setState({pwdFocus: true});
        this.__validPassword(this.props.pwd);
        this.onFocus()
    }

    handleReadGuide(e){
        let {guideInx} = this.props;
        guideInx++;
        WalletActions.guideNext(guideInx);
        SettingsActions.changeSetting({setting: 'createAccountGuide', value: guideInx});
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

    onFocus(e) {
        Utils.handleMask(this.refs.layer_input)
    }
    webScan(){
        this.routerPush('/web-scan',true);
    }
    render(){
        let { mark, isRead, message, level, pwdFocus,isApp} = this.state;
        let {pwd, repwd, platform, needBack, guideInx, accountList, currentLocale} = this.props;
        let is_auth = !Validation.isEmpty(platform);
        let levelText, levelClass,msg_level;
        let is_zh = currentLocale == 'zh';
        if(level == 0){
            levelText = this.translate('create_account.text_weak');
            levelClass = 'create_account_level_low';
            msg_level='create_account_message'
        }else if(level == 1){
            levelText = this.translate('create_account.text_general');
            levelClass = 'create_account_level_mid';
            msg_level='create_account_message_mid'
        }else if(level == 2){
            levelText = this.translate('create_account.text_strong');
            levelClass = 'create_account_level_high';
            msg_level='create_account_message_height'
        }else if(level == 3){
            levelText = this.translate('create_account.text_fine');
            levelClass = 'create_account_level_per';
            msg_level='create_account_message_height'
        }

        return (
            <div id="layerContent" className={`create_account_bg ${is_auth ? 'create_account_bg_with_auth' : ''}`}>
                {
                    guideInx > 0 && guideInx < 4 ?
                        <div className="create_account_guide">
                            <Mask/>
                            {guideInx == 1 ? <div className="img_layer"><img onClick={this.handleReadGuide.bind(this)} className="img_guide_create_1" src={is_zh ? img_guide_create_1 : img_guide_create_en_1}/> </div>: null}
                            {guideInx == 2 ? <div className="img_layer"><img onClick={this.handleReadGuide.bind(this)} className="img_guide_create_2" src={is_zh ? img_guide_create_2 : img_guide_create_en_2}/> </div>: null}
                            {guideInx == 3 ? <div className="img_layer"><img onClick={this.handleReadGuide.bind(this)} className="img_guide_create_3" src={is_zh ? img_guide_create_3 : img_guide_create_en_3}/> </div>: null}
                        </div> : null
                }
                {
                    !is_auth ? null :
                    <div className="header">
                        <button className="img_back" onClick={this.handleHeaderBack.bind(this)}></button>
                        <h1>{this.translate('authority_account.text_head')}</h1>
                        <button></button>
                    </div>
                }
                {
                    is_auth ? null : 
                    <div className="create_account_header">
                        { needBack ? <img src={img_back} className="create_account_back" onClick={this.handleBack.bind(this)}/> : null }
                        {isApp?<Scanner callback={this.handleScanning.bind(this)} className="create_account_scan"></Scanner>:
                            <button className="create_account_scan" onClick={this.webScan.bind(this)}></button>
                        }

                    </div>
                }

                <div style={{opacity:is_auth?"0":"1"}} className="create_account_logo_wrapper"><img src={img_main_logo} className="create_account_logo"/></div>

                <div className="create_account_input_wrapper_x" ref="layer_input">
                    <div className="create_account_input_line_wrapper">
                        {/* <div className="brick"></div> */}
                        <div className="create_account_input_line">
                            <input type="password" autoComplete="off" placeholder={this.translate('create_account.placeholder_pwd')} value={pwd} onClick={this.onFocus.bind(this)} onChange={this.handlePwdChange.bind(this)} onFocus={this.handlePasswordFocus.bind(this)}/>
                            {
                                Validation.isEmpty(message) ? null: <div className={['level_brick', levelClass].join(' ')}></div>
                            }

                        </div>
                    </div>
                    {
                        message ? <div className={['create_account_message',msg_level].join(' ')}>{message}</div> : null
                    }
                    <div className="create_account_input_line_wrapper">
                        {/* <div className="brick"></div> */}
                        <div className="create_account_input_line">
                            <input type="password" autoComplete="off" placeholder={this.translate('create_account.placeholder_repwd')} onClick={this.onFocus.bind(this)} onFocus={this.onFocus.bind(this)} value={repwd} onChange={this.handleRepwdChange.bind(this)}/>
                        </div>
                    </div>
                </div>

                <div className="create_account_protocol_wrapper">
                    <label>
                        <Checkbox type="checkbox" checked={isRead} onChange={this.handleReadChange.bind(this)}/>
                        <span className="create_account_readed">{this.translate('create_account.text_agree_on')}</span>
                    </label>
                    <span className="create_account_protocol" onClick={this.handleToProtocol.bind(this)}>{this.translate('create_account.text_protocol')}</span>
                </div>
                <div className="create_account_layer_button">
                    <input type="button" className={isRead ? "create_account_button_useable" : ""} value={is_auth ? this.translate('authority_account.button_create_auth') : this.translate('create_account.button_create')} onClick={this.createAccount.bind(this)} />
                </div>
                <div className="create_account_import_wrapper">
                    <span className="create_account_import" onClick={this.handleToImport.bind(this)}>
                        {is_auth ? this.translate('authority_account.button_import_auth') : this.translate('create_account.button_import')}
                    </span>
                </div>
                <div className="crate_account_bottom_wrapper">
                    <div className="create_account_bottom">
                        {/* <img src={img_light} className="create_account_bottom_light"/><br/> */}
                        <span className="crate_account_bottom_tips">{this.translate('create_account.text_tips_1')}</span><br/>
                        <span className="crate_account_bottom_tips">{this.translate('create_account.text_tips_2')}</span>
                        {is_auth ? <span className="crate_account_bottom_tips">{this.translate('authority_account.text_tips_1')}<span className="create_account_font_green">&nbsp;{platform.name}&nbsp;</span>{this.translate('authority_account.text_tips_2')}</span> : null}
                    </div>
                </div>

            </div>
        )
    }
}

export default Utils.altConnect(CreateAccount, [WalletStore, PlatformStore, IntlStore]);