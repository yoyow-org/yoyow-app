import React from 'react';
import counterpart from "counterpart";
import BaseComponent from "../BaseComponent";
import TipsActions from "../../actions/TipsActions";
import SettingsActions from "../../actions/SettingsActions";

/**
*服务条款
*/
let req = require.context("../../assets/locales", true, /\.md/);
function split_into_sections(str) {
    let sections = str.split(/\[#\s?(.+?)\s?\]/);
    if (sections.length === 1) return sections[0];
    if (sections[0].length < 4) sections.splice(0, 1);
    sections = reduce(sections, (result, n) => {
        let last = result.length > 0 ? result[result.length - 1] : null;
        if (!last || last.length === 2) {
            last = [n];
            result.push(last);
        }
        else last.push(n);
        return result;
    }, []);
    return zipObject(sections);
}

class AboutServiceTerms extends BaseComponent{
    constructor(){
        super();
    }

    componentDidMount() {
        let headerData = {
            buttonLeft: {
                value: "img_back",
            },
            title: "about.about_service.title",
            canBack:true
        }
        SettingsActions.updateHeader(headerData);

    }

    setVars(str) {
        return str.replace(/(\{.+?\})/gi, (match, text) => {
            let key = text.substr(1, text.length - 2);
            let value = this.props[key] !== undefined ? this.props[key] : text;
            if (value.date) value = Utils.formatDate(value.date);
            if (value.time) value = Utils.formatDate(value.time);
            return value;
        });
    }

    render(){
        let locale = this.props.locale || counterpart.getLocale() || "zh";
        let content =split_into_sections(req(`./service-${locale}.md`));
        return (
            <div className="about_service_terms bgWhite">
                <div dangerouslySetInnerHTML={{__html: this.setVars(content)}}/>
            </div>
        )
    }
}
export default AboutServiceTerms;