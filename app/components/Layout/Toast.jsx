import React from "react"
import {connect} from "alt-react";
import TipsStore from "../../stores/TipsStore";
import TipsActions from "../../actions/TipsActions";

class Toast extends React.Component{
    constructor(){
        super();
    }
    componentWillReceiveProps(nextProps){
        if(nextProps.toastShow){
            this.refs.toast.style.display = "block"
            this.refs.toast.style.animation = "toastShow 0.5s";
            this.refs.toast.style.animationIterationCount = 1;
            this.refs.toast.addEventListener("animationend",()=>{
                if(this.refs.toast.style.animation.indexOf("toastShow") > -1 ){
                    this.refs.toast.style.opacity = 1;
                    let t = setTimeout(this.hideComponent.bind(null,this.refs.toast), 1000);
                }

            })
        }
    }
    hideComponent(ele){
        let element = ele.className?ele:ele.target;
        element.style.animation = "toastHide 0.5s";
        element.addEventListener("animationend",()=>{
            if(element.style.animation.indexOf("toastHide") > -1 ){
                element.style.opacity = 0;
                element.style.animation = "";
                element.style.display = "none";
                TipsActions.setToastHide();
            }

        })

    }
    render(){
        let {toastShow,toastTextValue} = this.props;
        return (
            <div onClick={this.hideComponent.bind(this)} ref="toast" className={"toast"}>{toastTextValue}</div>
        )
    }
}
export default connect(Toast,{
    listenTo(){
        return [TipsStore];
    },
    getProps(){
        return TipsStore.getState();
    }
})