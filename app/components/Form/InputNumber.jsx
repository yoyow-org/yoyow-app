import React from "react";
import BaseComponent from "./BaseComponent";

class InputNumber extends BaseComponent {
    constructor() {
        super();
        this.state={
            val:"",
            isFocus:false
        }
    }

    componentDidMount() {


    }

    render() {
        let {val,isFocus} = this.state
        return (
            <div className="input_number">
                {val}
                {isFocus?<span></span>:""}
            </div>
        )
    }
}
export default InputNumber;