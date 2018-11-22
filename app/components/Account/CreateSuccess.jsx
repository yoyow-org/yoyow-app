import React from "react";
import BaseComponent from "../BaseComponent";
import {connect} from "alt-react";
import Button from "../Form/Button";
import WalletActions from "../../actions/WalletActions";
import WalletStore from "../../stores/WalletStore";
import TipsActions from "../../actions/TipsActions";
import SettingsActions from "../../actions/SettingsActions";
import {Validation, Utils} from "../../../lib";
import {img_create_success} from "../../assets/img";

class CreateSuccess extends BaseComponent{
    constructor(){
        super();
    }

    componentDidMount(){
        SettingsActions.updateHeader({
            title: 'create_account.text_success_title',
        });     
    }

    toHome(){
        this.routerPush("/index",true,true);
    }

    render(){
        let {wallet} = this.props;
        let uid = wallet ? wallet.yoyow_id : '';
        return (
            <div className="cover_full create_success_bg">
               
                <div className="create_success_info">
                <img className="create_success_img" src={img_create_success}/>
                    <span className="create_success_msg_1">{this.translate('create_account.text_success')}</span>
                    <span className="create_success_msg_2">{this.translate('create_account.text_yoyow', {uid})}</span>
                </div>
                <div className="layer_button create_success_complate_layer">
                    <Button value={this.translate('create_account.button_complete')} onClick={this.toHome.bind(this)}/>
                </div>
            </div>
        )
    }

}

export default Utils.altConnect(CreateSuccess, [WalletStore]);