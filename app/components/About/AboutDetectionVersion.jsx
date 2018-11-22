import React from 'react';
import BaseComponent from "../BaseComponent";
import TipsActions from "../../actions/TipsActions";
import SettingsActions from "../../actions/SettingsActions";

/**
 * 检测版本
 */
class AboutDetectionVersion extends BaseComponent{
    constructor(){
        super();
    }

    componentDidMount() {
        let headerData = {
            buttonLeft: {
                value: "img_back",
            },
            title: "about.about_detection.title",
            canBack:true
        }
        SettingsActions.updateHeader(headerData);
    }

    render(){

        return (
            <div className="about_detection_version">
                
            </div>
        )
    }
}
export default AboutDetectionVersion;