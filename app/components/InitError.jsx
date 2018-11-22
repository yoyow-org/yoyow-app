import React from "react";
import {connect} from "alt-react";
import BaseComponent from "./BaseComponent";
import SetttionsActions from "./../actions/SettingsActions";
import {img_init_error} from "../assets/img";
import {ChainStore} from "yoyowjs-lib/es";
import TipsActions from "../actions/TipsActions";

class InitError extends BaseComponent {
    constructor(props) {
        super(props);
    }

    componentDidMount(){
        SetttionsActions.updateHeader({
            title: 'init_error.text_title'
        });
    }

    handleReload(e){
        if(navigator.connection.type == 'none'){
            TipsActions.error(1015);
        }else{
            if(navigator.splashscreen) navigator.splashscreen.show();
            window.location.reload(true);
        }
    }

    render() {
        return (
            <div className="init_error_wrapper">
                <img className="init_error_img" src={img_init_error} />
                <span className="init_error_main">{this.translate('init_error.text_err_msg')}</span>
                <span className="init_error_reason">{this.translate('init_error.text_reason_title')}</span>
                <div className="init_error_reason_wrapper">
                    <span>{this.translate('init_error.text_reason_1')}</span>
                </div>
                <div className="init_error_reason_wrapper">
                    <span>{this.translate('init_error.text_reason_2')}</span>
                </div>
                <div className="init_error_reason_wrapper">
                    <span>{this.translate('init_error.text_reason_3')}</span>
                    <span className="init_error_reload" onClick={this.handleReload.bind(this)}>{this.translate('init_error.button_reload')}</span>
                </div>
            </div>
        )
    }
}

export default InitError;   