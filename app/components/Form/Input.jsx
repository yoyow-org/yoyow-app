import React from "react";
import BaseComponent from "../BaseComponent";

class Input extends BaseComponent {
    constructor() {
        super();
        window.addEventListener('contextmenu', function(e){
            e.preventDefault();
            setTimeout(()=>{
                if(window.cordova){
                    cordova.plugins.Keyboard.close();
                }
            },10)
        });
    }

    componentDidMount() {
        let {type,pattern} = this.props;
        if(type == "text" && window.navigator.appVersion.indexOf("iPhone")>= 0 && window.cordova){
            if(this.props.decimal == "true"){
                this.refs.input.setAttribute("decimal","true");
            }
            this.refs.input.setAttribute("type","text");
            this.refs.input.setAttribute("pattern",pattern)
        }

    }

    render() {
        let {type, onChange, placeholder,size,fontSize,value,min,max,pattern,ref,onFocus,onClick,maxLength} = this.props;
        let content;
        if(fontSize==38){
            return content = (
                <input className="input input_font_size_38" ref="input"
                       onFocus={onFocus}  type={type}
                       placeholder={placeholder}
                       onChange={onChange} value={value}
                       onClick = {onClick}
                />
            )
        }else if(fontSize==30){
            return content = (
                <input className="input input_font_size_30" ref="input" maxLength={maxLength}  onClick = {onClick} onFocus={onFocus}  type={type} placeholder={placeholder} onChange={onChange} value={value}/>
            )
        }else {
            return content = (
                <input className="input" ref="input" type={type} onClick = {onClick} onFocus={onFocus} pattern={pattern}  min={min} max={max} placeholder={placeholder} onChange={onChange} value={value}/>
            )
        }
        return (
            {content}

        )
    }
}
export default Input;