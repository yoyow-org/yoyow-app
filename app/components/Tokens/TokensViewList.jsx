import React from 'react';
import BaseComponent from "../BaseComponent";
import SettingsActions from "../../actions/SettingsActions";
import {Utils} from "../../../lib";
import TokensStore from "../../stores/TokensStore";
import TokensActions from "../../actions/TokensAction";
import {img_nodata} from "../../assets/img";
import TipsActions from '../../actions/TipsActions';

class TokensViewList extends BaseComponent{
    constructor(){
        super();
        this.state = this.__initState();
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
            buttonLeft: {
                value: "img_back",
            },
            title: ["tokens.token_view"],
            canBack:false,
            onBack: this.handleOnBack.bind(this)
        }
        SettingsActions.updateHeader(headerData);
        TokensActions.changeKeyword("");

        
        TipsActions.loading(true);
        TokensActions.getAccountTokensList()
        .then(res=>{
            this.setState({tokenView:res});
            TipsActions.loading(false);
        })
        .catch(err=>{
            TipsActions.loading(false);
        });
    }

    handleSearchToken(e){
        this.routerPush("/tokens/search",true);
    }

    handleOnBack(){
        this.routerBack("/index");
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

    componentWillUnmount(){
        this.setState({tokenView:[]});
    }

    render(){
        let {tokenView}=this.state;
        let isAndroid  = Utils.checkPlatform() //判断搜索框根据平添加class=anzhuo
        return(
            <div className="tokens_index">
                <div className="token_search_botton">
                    <div className="search" onClick={this.handleSearchToken.bind(this)}>
                        <span></span>
                        <input type="search" readOnly="readOnly" placeholder={this.translate("tokens.token_view_search_placeholder")}  className={isAndroid ==='ios'?"":"anzhuo"}/>
                        <div style={{
                            //解决苹果触发input键盘事件
                            position:'absolute',
                            left:'0',
                            top:'0',
                            bottom:'0',
                            right:'0',
                            //backgroundColor:'red',
                             opacity:0
                            }}>
                        </div>
                    </div>
                </div>
                {
                tokenView.length>0?
                <ul className="tokens_view_list">
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

export default Utils.altConnect(TokensViewList, [TokensStore]);