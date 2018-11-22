import React from "react";
import BaseComponent from "../BaseComponent";
import {Utils, WalletDatabase, Validation} from "../../../lib";
import SettingsStore from "../../stores/SettingsStore";
import SettingsActions from "../../actions/SettingsActions";
import IntlActions from "../../actions/IntlActions";

class Language extends BaseComponent{
    constructor(){
        super();
    }

    componentDidMount(){
        SettingsActions.updateHeader({
            buttonLeft: {
                value: "img_back",
            },
            title: 'settings.text_language_head',
            canBack: true
        });
    }

    handleChangeLocale(l, e){
        IntlActions.switchLocale(l);
        this.context.router.goBack();
    }   
    
    render(){
        let languages = this.props.defaults.locale;
        let current = this.props.settings.get('locale');
        return(
            <div className="setting_layer bgWhite">
                {
                    languages.map((l, inx) => {
                        return (
                            <div key={`settings_language_inx_${inx}`} onClick={this.handleChangeLocale.bind(this, l)} className={`settings_link_line ${current == l ? 'settings_select_active' : ''}`}>
                                <label className="list">
                                    <span className="settings_left_span">{this.translate(`languages.${l}`)}</span>
                                    <span className="settings_right_span"></span>
                                </label>
                            </div>
                        )
                    })
                }
            </div>
        )
    }
}

export default Utils.altConnect(Language, [SettingsStore])