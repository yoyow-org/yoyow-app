import React from 'react';
import BaseComponent from "../BaseComponent";
import TipsActions from "../../actions/TipsActions";
import SettingsActions from "../../actions/SettingsActions";
import {Utils, Validation} from "../../../lib";
import TokensStore from "../../stores/TokensStore";
import TokensBar from "../Form/TokensBar";
import Button from "../Form/Button";
import TokensActions from "../../actions/TokensAction";
import BalancesActions from "../../actions/BalancesActions";
import WalletUnlockActions from "../../actions/WalletUnlockActions";
import BalancesStore from "../../stores/BalanceStore";
import WalletStore from "../../stores/WalletStore";

let timeOut;
class TokensAdd extends BaseComponent{
    constructor(){
        super();
        this.state = this.__initState();
    }

    /**
     * 初始化状态
     */
    __initState(){
        let initState = {
            maxLen:100,//备注最大长度
            curLength:0,
            initSeekbar:2,
            amount:"",
            description:"",
            precision:2,
            symbol:""
        }
        return initState;
    }

    componentDidMount() {
        let headerData = {
            buttonLeft: {
                value: "img_back",
            },
            buttonRight: {
                value: "img_help",
                textValue: this.translate('tokens.tokens_index_title_tips')
            },
            title: ["tokens.tokens_add_title"],
            canBack:true
        }
        SettingsActions.updateHeader(headerData);
        BalancesActions.getBalance(WalletStore.getWallet().yoyow_id);
        this.__getFees();
    }

    onFocus(ev) {
        let obj = ev.target;
        Utils.handleMask(obj)
    }

    handleVal(type,e){
        let val=e.target.value;
        switch(type){
            case "symbol":
                if(val.length>0){
                    let reg=/^[A-Za-z]+$/;
                    if(reg.test(val)){
                        this.setState({symbol:val.toUpperCase()});
                        this.__getFees();
                    }
                }else{
                    this.setState({symbol:val.toUpperCase()});
                    this.__getFees();
                }
                break;
            case "amount":
                if(val.length>0)
                {
                    if(Validation.isNumber(val)){
                        var regu = /^[1-9]\d*$/;
                        if (regu.test(val)) {
                            this.setState({amount:val});
                            this.__getFees();
                        }
                    }
                }else{
                    this.setState({amount:val});
                }
                break;
            case "precision":
                this.setState({precision:5});
                break;
            case "description":
                let txtlen=this._getContentLength(val);
                if(txtlen<=this.state.maxLen){
                    this.setState({curLength:txtlen,description:val});
                    this.__getFees();
                }
                break;
        }
    }

    /**
     * 获取发行资产费用
     */
    __getFees(){
        if(timeOut){
            clearTimeout(timeOut);
        }
        timeOut=setTimeout(()=>{
            //资产发行数据
            let {symbol,amount,precision,description}=this.state;
            let data={
                symbol:symbol,
                amount:amount||0,
                precision:precision,
                description:description
            }
            TokensActions.getCreateFee(data);
            //TokensActions.issueFee(data);
        },1000);
    }

    handleSubmit(){
        //资产发行数据
        let {symbol,amount,precision,description}=this.state;
        let {createFee,issueFee,core_balance}=this.props;
        //let totalFee=(createFee && issueFee)?(createFee.min_fees+issueFee.min_fees):"0";
        let totalFee=(createFee && issueFee)?(createFee.min_fees):"0";
        if(symbol.length==0)
        {
            TipsActions.alert(this.translate('tokens.token_add_alert_symbol_empty'));
            return false;
        }
        if(symbol.length<3)
        {
            TipsActions.alert(this.translate('tokens.token_add_alert_symbol_enough'));
            return false;
        }
        if(symbol.length>8)
        {
            TipsActions.alert(this.translate('tokens.token_add_alert_symbol_over'));
            return false;
        }

        if(amount.length>0){
            let quotaAmount=Math.pow(10,10);
            if(!Validation.isNumber(amount))
            {
                TipsActions.alert(this.translate('tokens.token_add_alert_amount_empty'));
                return false;
            }

            if(amount>quotaAmount){
                TipsActions.alert(this.translate('tokens.token_add_alert_amount_transboundary'));
                return false;
            }
        }else{
            TipsActions.alert(this.translate('tokens.token_add_alert_amount_empty'));
            return false;
        }

        if(!Validation.isNumber(precision))
        {
            TipsActions.alert(this.translate('tokens.token_add_alert_precision_empty'));
            return false;
        }

        let amountPrecision=amount*Utils.precisionToNum(precision);
        let max_supply=Math.pow(10,16);
        if(amountPrecision>=max_supply){
            TipsActions.alert(this.translate('errors.1019'));
            return false;
        }

        if(description.length==0)
        {
            TipsActions.alert(this.translate('tokens.token_add_alert_description_empty'));
            return false;
        }

        //判断手续费
        if(totalFee>core_balance){
            TipsActions.alert(this.translate('tokens.token_add_alert_not_enough_balance'));
            return false;
        }

        let data={
            symbol:symbol,
            amount:amount,
            precision:precision,
            description:description
        }
        this.checkAccountValid(() => {
            WalletUnlockActions.checkLock(false, false)
            .then(() => {
                TipsActions.loading(true);
                TokensActions.createToken(data)
                .then(()=>{
                    TipsActions.loading(false);
                    TipsActions.toast(this.translate('tokens.token_add_success'));
                    this.routerBack();
                })
                .catch((err)=>{
                    TipsActions.loading(false);
                    TipsActions.error(err);
                });
            })
            .catch(err => {
                TipsActions.error(err);
            });

        });
    }

    /**
     * 获取字符长度，中文占2个
     * @param {*} str 
     */
    _getContentLength(str){
        let reg = /[\u4e00-\u9fa5]/g;
        let re=str.match(reg);
        let matchLen = re?re.length:0;
        return matchLen * 2 + (str.length - matchLen);
    }

    /**
     * 设置精度
     * @param {*} val 
     */
    _setBarValue(val){
        this.setState({precision:val});
    }

    render(){
        let {amount,description,precision,symbol,curLength,maxLen}=this.state;
        let {createFee,issueFee}=this.props;
        let totalFee=(createFee && issueFee)?(createFee.min_fees):"0";
        return(
            <div className="tokens_add bgWhite">
                <ul className="form">
                    <li>
                        <input type="text" maxLength="8" 
                        onChange={this.handleVal.bind(this,"symbol")} 
                        value={symbol} placeholder={this.translate("tokens.token_add_placeholder_code")} />
                    </li>
                    <li>
                        <input type="tel" maxLength="20" 
                        onChange={this.handleVal.bind(this,"amount")} 
                        value={amount} placeholder={this.translate("tokens.token_add_placeholder_count")} />
                    </li>
                    <li className="tokens_draw_bar">
                        <TokensBar onChange={this._setBarValue.bind(this)} min="2" max="5"/>
                    </li>
                    <li className="token_memo">
                        <div className="layer_textArea">
                        <textarea onFocus={this.onFocus.bind(this)}
                                placeholder={this.translate("tokens.token_add_placeholder_memo")}
                                value={description}
                                onChange={this.handleVal.bind(this,"description")}></textarea>
                            <div className="length"><em>{curLength}</em>/{maxLen}</div>
                        </div>
                    </li>
                </ul>

                <div className="tokens_add_free">
                    {this.translate("tokens.token_add_fee_title")}<span className="free">{totalFee}</span>YOYO
                </div>
                <div className="tokens_add_submit_box">
                    <Button value={this.translate("tokens.token_add_button_submit")} onClick={this.handleSubmit.bind(this)}  fontSize={30}/>
                </div>
            </div>
        );
    }
}

export default Utils.altConnect(TokensAdd, [TokensStore,BalancesStore]);