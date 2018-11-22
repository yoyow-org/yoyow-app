import React from "react";
import BaseComponent from "../BaseComponent";
import {connect} from "alt-react";
import PlatformActions from "../../actions/PlatformActions";
import PlatformStore from "../../stores/PlatformStore";
import SettingsActions from "../../actions/SettingsActions";
import Button from "../../components/Form/Button";
import {Utils, WalletDatabase, Validation} from "../../../lib";
import TipsActions from "../../actions/TipsActions";
import WalletUnlockActions from "../../actions/WalletUnlockActions";
import WalletActions from "../../actions/WalletActions";
import WalletStore from "../../stores/WalletStore";
import {img_clear_box, img_input_clear} from "../../assets/img";

class PlatformSearch extends BaseComponent{
    constructor(){
        super();
        this.state = { keywords: '' }
    }

    componentDidMount(){
        SettingsActions.updateHeader({
            search: {
                type: "search",
                value: 'platform.placeholder_search'
            },
            canBack:false,
            textChangeEvent:this.handleTextChange.bind(this),
            onSubmit: this.handleSubmit.bind(this),
            onBack: this.handleCloseSearch.bind(this)
        });
        PlatformActions.selectHistory();
    }

    handleTextChange(e){
        this.setState({ keywords: e.target.value });
    }

    handleSubmit(e){
        let keywords = this.state.keywords;
        if(!Validation.isEmpty(keywords)){
            this.__search(keywords);
        }
    }

    handleClearAll(e){
        PlatformActions.deleteHistory();
    }

    handleHistoryClick(keywords, e){
        this.__search(keywords);
    }

    __search(keywords){
        PlatformActions.addHistory(keywords);
        PlatformActions.setKeywords(keywords);
        this.routerPush('/platform',true);
    }

    handleHistoryRemove(h, e){
        PlatformActions.deleteHistory(h.inx);
    }

    handleCloseSearch(e){
        PlatformActions.setKeywords('');
        this.routerBack();
    }

    render(){
        let {searchHistory} = this.props;
        return (
            <div className="platform_full">
                <div className="platform_search_button_layer">
                    <div className="platform_search_result_wrapper">
                        <div className="platform_search_result">
                            <span>{this.translate('platform.text_search_history')}</span>
                        </div>
                        <div className="platform_search_result">
                            <img onClick={this.handleClearAll.bind(this)} src={img_clear_box} />
                        </div>
                    </div>
                </div>
                <div className="platform_content_wrapper platform_bg_white">
                    <div className="platform_history_wrapper">
                        {
                            searchHistory.map((h, inx) => {
                                return (
                                    <div key={`platform_history_inx_${inx}`} className="platform_history_line">
                                        <span onClick={this.handleHistoryClick.bind(this, h.keyword)}>{h.keyword}</span>
                                        <img onClick={this.handleHistoryRemove.bind(this, h)} src={img_input_clear} />
                                    </div>
                                )
                            })
                        }
                    </div>
                </div>
            </div>
        )
    }
}

export default Utils.altConnect(PlatformSearch, [PlatformStore, WalletStore]);