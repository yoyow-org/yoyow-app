import React from "react";
import BaseComponent from "../BaseComponent";
import Mask from "../Layout/Mask";
import TipsActions from "../../actions/TipsActions"

class LayerOut extends BaseComponent{
    constructor(){
        super();
        this.state={
            isShow:false,
            closeBtn:true
        }
    }
    componentWillReceiveProps(nextProps){
        let closeBtn;
        if(nextProps.closeBtn === undefined){
            closeBtn = true
        }else if(nextProps.closeBtn === false){
            closeBtn = false
        }else if(nextProps.closeBtn === true){
            closeBtn = true
        }
        this.setState({
            isShow:nextProps.isShow,
            closeBtn:closeBtn
        })
    }
    closeLayerOut(){
        let {onClose} = this.props;
        if(onClose) onClose();
        this.setState({
            isShow:false
        })
    }
    render(){
        let {isShow,closeBtn} = this.state;
        let {className} = this.props;
        return (
            <div ref="LayerOut" className="layer_out" style={{visibility:isShow?"visible":"hidden"}}>

                <Mask />
                <div className={`content_layer_out ${className ? className : ''}`} >
                    {closeBtn?<span className="close" onClick={this.closeLayerOut.bind(this)}></span>:""}
                    {this.props.children}
                </div>
            </div>
        )
    }
}
export default LayerOut