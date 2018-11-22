import React from "react";
import BaseComponent from "../BaseComponent";

class Button extends BaseComponent {
    constructor() {
        super();
    }
    handleAddClass(className,e){
        let obj_btn = this.refs.button;
        let curClassName = obj_btn.className;
        if(curClassName == ""){
            obj_btn.className = className
        }else{
            let _index = this.classIndexOf(obj_btn,className);
            if(_index == -1){
                obj_btn.className += " " + className;
            }
        }

    }
    classIndexOf(obj,v){
        let arrClassName = obj.className.split(" ");
        for(let i=0;i<arrClassName.length;i++){
            if(arrClassName[i] == v){
                return i;
            }
        }
        return -1;
    }
    componentDidMount(){
        let {bg,border,color,size,margin,fontSize,click,borderRadius} = this.props;
        switch(size){
            case 34:
                this.handleAddClass("button_size34")
                break;
            case undefined:
                this.handleAddClass("button_size26")
                break;
            case 26:
                this.handleAddClass("button_size26")
                break;
            case 18:
                this.handleAddClass("button_size18")
                break;
        }
        switch(fontSize){
            case 32:
                this.handleAddClass("button_font_size32")
                break;
            case 28:
                this.handleAddClass("button_font_size28")
                break;
            case undefined:
                this.handleAddClass("button_font_size28")
                break;
            case 26:
                this.handleAddClass("button_font_size26")
                break
        }
        if(borderRadius=="none"){
            this.handleAddClass("button_border_radius_none")
        }
    }
    render() {
        let {value,onClick,bg,border,color, id, clipboard} = this.props
        let curStyle = {
            flex: 1,
            background: !bg?"#2E7EFE":bg,
            border: !border||border=="none"?"none":`1px ${border=="green"?"#2E7EFE":border} solid`,
            color: !color?"#fff":color
        }
        return (
            <button onClick={onClick} style={curStyle} ref="button" type="button" id={id} data-clipboard-text={clipboard}>{value}</button>
        )
    }
}
export default Button;