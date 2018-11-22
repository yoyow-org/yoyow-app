import React from "react";
import BaseComponent from "../BaseComponent";
import TipsActions from "../../actions/TipsActions";
import SettingsActions from "../../actions/SettingsActions";
import DrawBar from "../Form/DragBar"


class ExampleForDrawBar extends BaseComponent {
    constructor() {
        super()
    }

    componentDidMount() {
        let headerData = {
            buttonLeft: {
                value: "img_back",
            },
            title: "拖动",
            canBack: true
        }
        SettingsActions.updateHeader(headerData);
        setTimeout(this.hideLoading, 2000);
    }

    hideLoading() {
        TipsActions.setLoadingGlobalHide();
    }

    onChange(e) {

    }

    render() {
        return (
            <div className="cover_full bgWhite">
                <DrawBar max="20000"/>
            </div>

        )
    }
}
export default ExampleForDrawBar