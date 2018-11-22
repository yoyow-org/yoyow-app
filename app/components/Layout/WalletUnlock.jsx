import React from "react"
import {connect} from "alt-react";
import Mask from "./Mask"
import WalletUnlockStore from "../../stores/WalletUnlockStore";
import WalletUnlockActions from "../../actions/WalletUnlockActions";
import BaseComponent from "../BaseComponent";
import Button from "../Form/Button";
import Input from "../Form/Input";
import Checkbox from "../Form/Checkbox";
import {Validation, GlobalParams, Utils} from "../../../lib";
import TipsActions from "../../actions/TipsActions";
import Util from "../../../lib/utils/Utils"
class WalletUnlock extends BaseComponent{
    constructor(){
        super();
    }

    componentWillReceiveProps(next){
        let nShow = next.isShow;
        let cShow = this.props.isShow;
        if(nShow && nShow != cShow){
           setTimeout(() => {
               this.refs.passwordInput.focus();
               this.onfocus();
           },200)
        }
    }

    close(){
        WalletUnlockActions.close(false)
    }

    doUnlock(){
        let {password} = this.props;
        if(Validation.isEmpty(password)){
            TipsActions.alert(this.translate('walletUnlock.valid_password'));
            return ;
        }
            
        TipsActions.loading(true);
        setTimeout(() => {
            WalletUnlockActions.unlock().then( ({resolve, useCsaf}) => {
                if(resolve) resolve(useCsaf);
                TipsActions.loading(false);
            }).catch(err => {
                if(__DEBUG__) console.log(err);
                TipsActions.alert(err.msg);
                TipsActions.loading(false);
            });
        }, 360);
    }

    handlePwdChange(e){
        WalletUnlockActions.passwordChange(e.target.value);
    }

    handleUseCsafChange(e){
        WalletUnlockActions.setUseCsaf(e.target.checked);
    }
    onfocus(ev){
        let obj = this.refs.layer_unlock_dialog;
        if(window.cordova){
            Util.handleMask(obj)
        }

    }
    render(){
        let {isShow, isShort, password, descript, fees} = this.props

        return (

            <div className="dialog" style={{display: isShow ? 'block' : 'none'}}>
                <Mask/>
                <div ref="layer_unlock_dialog" className="box_dialog">
                    {descript?<div className="title wallet_unlock_title">{descript}</div>:""}
                    <div className="content wallet_unlock_input">
                        <span>{this.translate('walletUnlock.text_password')}</span>
                        <input onFocus={this.onfocus.bind(this)}  ref="passwordInput" className="input" type="password" autoComplete="off" onChange={this.handlePwdChange.bind(this)} value={password}/>
                    </div>
                    {
                        Validation.isEmpty(fees) ? '' :
                        <div className="content wallet_unlock_fees_line">
                            <div>
                                <span>{this.translate('walletUnlock.text_fees')}</span>
                                <span className="wallet_unlock_font_red">{fees.useCsaf ? fees.with_csaf_fees : fees.min_fees}</span>
                                <span>{this.translate("balance.public.funds_type_YOYO")}</span>
                            </div>
                            {
                                fees.use_csaf == 0 ? null :
                                <div>
                                    <label>
                                        <Checkbox type="checkbox" checked={fees.useCsaf} onChange={this.handleUseCsafChange.bind(this)}/>
                                        <span>{this.translate('walletUnlock.text_use')}</span>
                                        <span className="wallet_unlock_font_red">{Utils.formatAmount(fees.use_csaf * GlobalParams.csaf_param, 4)}</span>
                                        <span>{this.translate('walletUnlock.text_csaf')}</span>
                                    </label>
                                </div>
                            }
                        </div>
                    }
                    <div className="layer_button padding_0">
                        <Button value={this.translate('form.button_cancel')}
                            bg="#fff"
                            color="#666"
                            borderRadius="none"
                            size={34}
                            fontSize={32}
                            onClick={this.close.bind(this)}/>
                        <Button value={this.translate('form.button_confirm')}
                            bg={"#2E7EFE"}
                            color="#fff"
                            size={34}
                            fontSize={32}
                            borderRadius="none"
                            onClick={this.doUnlock.bind(this)}/>
                    </div>
                </div>
            </div>
        )
    }
}
export default connect(WalletUnlock,{
    listenTo(){
        return [WalletUnlockStore];
    },
    getProps(){
        return WalletUnlockStore.getState();
    }
})