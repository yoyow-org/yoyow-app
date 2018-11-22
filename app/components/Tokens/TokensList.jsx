import React from 'react';
import BaseComponent from "../BaseComponent";
import SettingsActions from "../../actions/SettingsActions";
import {Utils} from "../../../lib";
import TokensStore from "../../stores/TokensStore";
import TokensActions from "../../actions/TokensAction";
import Button from "../Form/Button";
import {img_nodata} from "../../assets/img";
import TipsActions from '../../actions/TipsActions';

class TokensList extends BaseComponent{
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
            dataType:0
        }
        return initState;
    }

    componentDidMount() {
        let headerData = {
            buttonLeft: {
                value: "img_back",
            },
            title: ["tokens.tokens_index_title"],
            canBack:true
        }
        SettingsActions.updateHeader(headerData);
        
        TipsActions.loading(true);
        TokensActions.getCreateTokensList()
        .then(res=>{
            TipsActions.loading(false);
        })
        .catch(err=>{
            TipsActions.loading(false);
        });
    }

    handleSubmitToken(){
        this.routerPush("/tokens/add",true);
    }

    render(){
        let {createToken}=this.props;
        return(
            <div className="tokens_index">
                {
                    createToken.length>0?
                    <ul>
                        {
                            createToken.map((item)=>{
                                return(
                                    <li className="tokens_index_list" key={item.asset_id}>
                                        <ul>
                                            <li className="tokens_index_item">
                                                <div className="tokens_index_item_label">{this.translate("tokens.tokens_index_list_code")}</div>
                                                <div className="tokens_index_item_content">{item.symbol}</div>
                                            </li>
                                            <li className="tokens_index_item">
                                                <div className="tokens_index_item_label">{this.translate("tokens.tokens_index_list_count")}</div>
                                                <div className="tokens_index_item_content">{Utils.thousandBit(item.current_supply/Utils.precisionToNum(item.precision))}</div>
                                            </li>
                                            <li className="tokens_index_item">
                                                <div className="tokens_index_item_label">{this.translate("tokens.tokens_index_list_dcimal_digits")}</div>
                                                <div className="tokens_index_item_content">{item.precision}</div>
                                            </li>
                                            <li className="tokens_index_item">
                                                <div className="tokens_index_item_label">{this.translate("tokens.tokens_index_list_remark")}</div>
                                                <div className="tokens_index_item_content">{item.description}</div>
                                            </li>
                                        </ul>
                                    </li>
                                )
                            })
                        }
                    </ul>
                    :
                    <div className="tokens_index_undata">
                        <img src={img_nodata} /><br />
                        <span>{this.translate("history.no_relevant_data")}</span>
                    </div>
                }
                <div className="tokens_index_add_box">
                    <Button value={this.translate("tokens.tokens_index_distribute_button")} onClick={this.handleSubmitToken.bind(this)}  fontSize={26}/>
                </div>
            </div>
        );
    }
}

export default Utils.altConnect(TokensList, [TokensStore]);