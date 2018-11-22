import React from 'react';
import {connect} from "alt-react";
import counterpart from "counterpart";
import {Utils} from "../../../lib";
import BaseComponent from "../BaseComponent";
import TipsActions from "../../actions/TipsActions";
import SettingsActions from "../../actions/SettingsActions";

/**
*版本日志
*/
class AboutVersionLog extends BaseComponent{
    constructor(){
        super();
        this.state={
            logContent:[]
        }
    }

    componentDidMount() {
        let headerData = {
            buttonLeft: {
                value: "img_back",
            },
            title: "about.about_version.title",
            canBack:true
        }
        SettingsActions.updateHeader(headerData);
        
        let versionLog=Utils.getVersionUpdateLogContent();
        this.setState({logContent:versionLog})
    }

    render(){
        let {logContent}=this.state;
        return (
            <div className="about_version_box bgWhite">
                {
                    logContent?logContent.map((item,i)=>{
                        return (<div key={Math.random()} className="about_version_log">
                                    <h1>{item.version}</h1>
                                    <ul>
                                    {
                                        item.content.map((contents)=>{
                                                return (<li key={Math.random()}>{contents.item}</li>)
                                        })
                                    }
                                    </ul>
                                </div>
                                )
                    }):""
                }
            </div>
        )
    }
}
export default AboutVersionLog;