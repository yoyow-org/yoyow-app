import React from "react"
import {connect} from "alt-react";
import Mask from "./Mask";
import BaseComponents from "../BaseComponent";
import TipsStore from "../../stores/TipsStore";
import TipsActions from "../../actions/TipsActions"

class LoadingGlobal extends BaseComponents {
    constructor() {
        super();
    }
    componentDidMount() {

    }
    render() {
        var list = (length) => {
            var res = [];
            for (var i = 0; i < length; i++) {
                res.push(<li key={i}></li>)
            }
            return res
        }
        let {loadingGlobalShow} = this.props;

        return (
            <div ref = "loading_global" className="loading_global z_index_30" style={{display:loadingGlobalShow?"block":"none"}}>
                <Mask/>
                <div className="box_loading_global">

                </div>
            </div>
        )
    }
}
export default connect(LoadingGlobal,{
    listenTo(){
        return [TipsStore];
    },
    getProps(){
        return TipsStore.getState();
    }
})