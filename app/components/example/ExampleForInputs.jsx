import React from "react";
import BaseComponent from "../BaseComponent";
import TipsActions from "../../actions/TipsActions"
import SettingsActions from "../../actions/SettingsActions"

import Input from "../Form/Input"

class ExampleForInputs extends BaseComponent {
    constructor() {
        super();
        this.state={
            val:5
        }
    }

    componentDidMount() {
        let headerData = {
            buttonLeft: {
                value: "img_back",
            },
            title: "输入框",
            canBack: true
        }
        SettingsActions.updateHeader(headerData);
        setTimeout(this.hideLoading, 2000);
    }

    hideLoading() {
        TipsActions.setLoadingGlobalHide();
    }

    onChange(e) {
        console.log(e.target.value)
    }

    render() {
        return (
            <div className="cover_full">
                <div className="bgWhite">
                    <div className="input_layer">
                        <Input placeholder="测试" type="input" onChange={this.onChange.bind(this)} fontSize={30} value={this.state.val}/>
                    </div>
                    <div className="input_layer">
                        <Input placeholder="测试" type="input" onChange={this.onChange.bind(this)} fontSize={30}/>
                    </div>
                    <div className="input_layer input_layer_last">
                        <Input placeholder="测试" type="input" onChange={this.onChange.bind(this)} fontSize={30}/>
                    </div>
                </div>
                <div className="bgWhite test_for_layer_link margin_top_20">
                    <div className="input_layer  ">
                        <span className="input_name_label">金额：</span>
                        <Input placeholder="测试" type="number" onChange={this.onChange.bind(this)} fontSize={38}/>
                        <span className="input_name_class">YOYO</span>
                    </div>
                </div>
            </div>

        )
    }
}
export default ExampleForInputs