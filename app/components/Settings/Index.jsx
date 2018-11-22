import React from "react";
import BaseComponent from "../BaseComponent";
import {Utils, WalletDatabase, Validation} from "../../../lib";
import SettingsStore from "../../stores/SettingsStore";
import SettingsActions from "../../actions/SettingsActions";
import {Link} from "react-router";
import counterpart from "counterpart";

class Settings extends BaseComponent{
    constructor(){
        super();
    }

    componentDidMount(){
        SettingsActions.updateHeader({
            buttonLeft: {
                value: "img_back",
            },
            title: 'settings.text_head',
            canBack: true
        });
    }

    handleToLanguage(){
        this.routerPush('/settings/language', true);
    }

    render(){
        return(
            <div className="setting_layer bgWhite">
                <div className="settings_link_line settings_line_arrow">
                    <div className="setting_line_content" onClick={this.handleToLanguage.bind(this)}>
                        <span className="settings_left_span">{this.translate('settings.link_language')}</span>
                        <span className="settings_right_span">{this.translate(`languages.${this.props.settings.get('locale')}`)}</span>
                    </div>
                </div>
            </div>
        )
    }
}

export default Utils.altConnect(Settings, [SettingsStore]);