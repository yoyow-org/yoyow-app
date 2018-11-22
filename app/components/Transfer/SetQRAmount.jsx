import React from "react";
import BaseComponent from "../BaseComponent";
import SettingsActions from "../../actions/SettingsActions";
import Input from "../Form/Input";
import BalancesStore from "../../stores/BalanceStore";
import Button from "../Form/Button";
import BalancesActions from "../../actions/BalancesActions";
import TipsActions from "../../actions/TipsActions";
import {Utils,Validation} from "../../../lib";
import TokensStore from "../../stores/TokensStore";

class SetQRAmount extends BaseComponent {
    constructor() {
        super();
        this.state = {
            val: "",
            transferBalance: true,
            toAccount: "",
            accountEffective: false,
            curID:"",
            curLength:0,
            memoText:"",
            useCsaf:true,
            useBalance:true,
        }
    }

    componentDidMount() {
        let headerData = {
            buttonLeft: {
                value: "img_back",
            },
            title: "balance.QR_receive.set_amount",

            canBack: true
        }
        SettingsActions.updateHeader(headerData);
        BalancesActions.setCanMemo(true);
    }

    setValue(e) {
        let val = e.target.value;
        let {tokenInfo}=this.props;
        if (Validation.isNumber(val)) {
            if(tokenInfo==null){
                val = Utils.formatAmount(val);
            }else{
                val = Utils.formatAmount(val,tokenInfo.precision+1);
            }
            this.setState({val: val});
        }
    }

    handleMemo(e){
        let {toAccount,val} = this.state;
        let {transferBalance} = this.props;
        let type = "fromBalance";
        if(!transferBalance){
            type = "fromPrepaid";
        }
        let memoText = e.target.value;
        let memoLen=Utils.charCounter(memoText);
        if(memoLen <= 100){
            this.setState({
                memoText:memoText,
                curLength:memoLen,
            })
        }
        BalancesActions.setMemo(memoText)
        //BalancesActions.getFees(toAccount,val,memoText,type)
    }

    routeBack(){
        let {tokenInfo} =this.props;
        let {memoText,val} = this.state;
        if(val==0||val==""){
            TipsActions.alert(this.translate('balance.public.alert_amount_enter'));
            return false;
        }
        
        if(val>10000){
            TipsActions.alert(this.translate('balance.public.alert_amount_reset'));
            return false;
        }

        BalancesActions.setAmount(val);
        BalancesActions.setMemo(memoText);
        BalancesActions.setCanMemo(false);
        BalancesActions.setSymbol(tokenInfo!=null?tokenInfo.symbol:"YOYO");

        let obj_QRReceive={
            uid:0,
            assetId:tokenInfo==null?0:tokenInfo.asset_id,
            receiveAmount:val+"",
            receiveMemo:memoText,
            receiveSymbol:tokenInfo==null?"YOYO":tokenInfo.symbol,
            last_modify:Date.now()
        }
        
        BalancesActions.addQRReceive(obj_QRReceive)
        .then(()=>{
            this.routerBack();
        })
        .catch((err)=>{
            TipsActions.error(err);
        });
    }
    onFocus(isNumber,isPoint,pointLength,ev) {
        let objInput = ev.target;
        let maskObj = ev.target;
        if(window.cordova){
            Utils.handleKeyBoards(objInput,maskObj,isNumber,isPoint,pointLength);
        }
    }
    render() {
        let {val,curLength,memoText,} = this.state;
        let {tokenInfo}=this.props;
        return (
            <div className="layer_set_amount bgWhite">
                <div className="layer_input_balance bgWhite">
                    <div className="input_layer sp_input_wrapper">
                        <span className="input_name_label">{this.translate("balance.QR_receive.text_amount")}</span>
                        <Input placeholder={this.translate("balance.public.default_input_text_amount")}
                               decimal="true" pattern="[0-9]*"
                               onFocus={this.onFocus.bind(this,true,true,5)}
                               onClick={this.onFocus.bind(this,true,true,5)}
                               type="text" value={val}
                               onChange={this.setValue.bind(this)} fontSize={30}/>
                        <span className="input_name_class">{this.translate(tokenInfo==null?"balance.public.funds_type_YOYO":("$"+tokenInfo.symbol))}</span>
                    </div>
                </div>
                <div className="layer_memo bgWhite">
                    <div className="layer_textArea">
                    <textarea placeholder={this.translate("balance.public.default_input_text_memo")} value={memoText}
                              onChange={this.handleMemo.bind(this)}></textarea>
                        <div className="length"><em>{curLength}</em>/100</div>
                    </div>
                </div>
                <div className="layer_info bgWhite">
                    <div className="layer_button">
                        <Button 
                            onClick={this.routeBack.bind(this)}
                            value={this.translate("balance.QR_receive.button_text_done")}
                            bg={"#2E7EFE"}
                        />
                    </div>
                </div>
            </div>
        )
    }
}

export default Utils.altConnect(SetQRAmount, [BalancesStore,TokensStore]);