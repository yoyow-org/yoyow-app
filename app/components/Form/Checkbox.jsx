import React from "react";
import BaseComponent from "../BaseComponent";
import {concat} from "lodash";

class Checkbox extends BaseComponent{
    constructor(){
        super();
        this.state = {
            classNames: ['check_box']
        }
    }

    render(){
        let {classNames} = this.state;
        let {checked, type, onChange} = this.props;
        return(
            <input type="checkbox" className={classNames.concat([`${type}_${checked?true:false}`]).join(' ')} checked={checked} onChange={onChange?onChange:null} />
        )
    }
}

export default Checkbox;