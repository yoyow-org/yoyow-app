import React from "react";
import BaseComponent from "../BaseComponent";
import {connect} from "alt-react";
import Button from "../Form/Button";
import LayerOut from "../Layout/LayerOut";
import SettingsActions from "../../actions/SettingsActions";
import TipsActions from "../../actions/TipsActions";
import TipsStore from "../../stores/TipsStore"

class ExampleForLayerOut extends BaseComponent {
    constructor() {
        super();
        this.state={
            layerOutShow:false
        }
    }

    componentDidMount() {
        let headerData = {
            buttonLeft: {
                value: "img_back",
            },
            title: "弹窗展示",
            canBack: true
        }
        SettingsActions.updateHeader(headerData);


    }
    openLayerOut(){
        this.setState({
            layerOutShow:true
        })
    }
    render() {
        return (
            <div className="cover_full bgWhite">
                <LayerOut isShow={this.state.layerOutShow}>测试弹窗</LayerOut>
                <div className="layer_button">
                    <Button onClick={this.openLayerOut.bind(this)} value="打开弹窗"/>
                </div>
            </div>
        )
    }
}
export default connect(ExampleForLayerOut, {
    listenTo(){
        return [TipsStore];
    },
    getProps(){
        return TipsStore.getState();
    }
})