import React from 'react';
import BaseComponent from "../BaseComponent";
import SettingsActions from "../../actions/SettingsActions";
import {Utils} from "../../../lib";
import TokensStore from "../../stores/TokensStore";
import TokensActions from "../../actions/TokensAction";
import Button from "../Form/Button";
import {img_nodata} from "../../assets/img";
import TipsActions from '../../actions/TipsActions';

let timeOut;
class TokensViewSearchList extends BaseComponent{
    constructor(){
        super();
        this.state = this.__initState();
        this.handleTextChangeEvent=this.handleTextChangeEvent.bind(this);
    }

    /**
     * 初始化状态
     */
    __initState(){
        let initState = {
            curType: 0,
            dataType:0,
            tokenView:[]
        }
        return initState;
    }

    componentDidMount() {
        let headerData = {
            search: {
                type: "search",
                value: "tokens.token_view_search_placeholder"
            },
            buttonRight: {
                value: "",
            },
            canBack:true,
            textChangeEvent:this.handleTextChangeEvent,
            //onSubmit:this.handelSearchSubmit.bind(this),
            claerEvent:this.handleClearText.bind(this)
        }
        SettingsActions.updateHeader(headerData);
        TokensActions.changeKeyword("");

        TipsActions.loading(true);
        TokensActions.getAccountTokensList().then((res)=>{
            this.setState({tokenView:res});
            TipsActions.loading(false);
        }).catch(()=>{
            TipsActions.loading(false);
        });
    }

    /**
     * 查询文本改变事件
     * @param {*} e 
     */
    handleTextChangeEvent(e){
        let kw=e.target.value;
        kw=kw.length>0?kw.toUpperCase():"";
        if(timeOut){
            clearTimeout(timeOut);
        }
        timeOut=setTimeout(()=>{
            TokensActions.changeKeyword(kw);
            TokensActions.getAccountTokensList()
            .then((res)=>{
                this.setState({tokenView:res});
            });
        },1000);
    }

    handleClearText(){
        TokensActions.changeKeyword("");
        TipsActions.loading(true);
        TokensActions.getAccountTokensList().then((res)=>{
            this.setState({tokenView:res});
            TipsActions.loading(false);
        }).catch(()=>{
            TipsActions.loading(false);
        });
    }

    handelSearchSubmit(){
        TipsActions.loading(true);
        TokensActions.getAccountTokensList().then((res)=>{
            this.setState({tokenView:res});
            TipsActions.loading(false);
        }).catch(()=>{
            TipsActions.loading(false);
        });
    }

    /**
     * 改变显示状态
     */
    handleChangeStatus(item,e){
        let data={
            uid:"",
            assetId:item.asset_id,
            last_modify:Date.now()
        }
        TokensActions.changeLocalToken(data)
        .then(({isAdd})=>{
            let {tokenView}=this.state;
            if(isAdd){
                tokenView[tokenView.findIndex(item => item.asset_id == data.assetId)].indexshow=true;
                this.setState({tokenView:tokenView});
            }else{
                tokenView[tokenView.findIndex(item => item.asset_id == data.assetId)].indexshow=false;
                this.setState({tokenView:tokenView});
            }
        });
    }

    render(){
        let {tokenView}=this.state;
        return(
            <div className="tokens_index">
                {
                tokenView.length>0?
                <ul className="tokens_view_list tokens_search_view_list">
                    {
                        tokenView.map((item)=>{
                            return(
                                <li className="tokens_view_list_item" key={Math.random()}>
                                    <div className="token_name">{item.symbol}</div>
                                    <div className="tpken_amount">{item.amount==0?"":(item.amount / Utils.precisionToNum(item.precision))}</div>
                                    <div className="token_botton">
                                    {
                                        item.asset_id>0?
                                        <div className={item.indexshow?"switch turnon":"switch turnoff"} onClick={this.handleChangeStatus.bind(this,item)}></div>
                                        :""
                                    }
                                    </div>
                                </li>)
                        })
                    }
                </ul>
                :
                <div className="tokens_index_undata">
                        <img src={img_nodata} /><br />
                        <span>{this.translate("history.no_relevant_data")}</span>
                    </div>
                }
            </div>
        )
    }
}

export default Utils.altConnect(TokensViewSearchList, [TokensStore]);