import React from "react";
import BaseComponent from "../BaseComponent";
import {Link} from "react-router"

class LinkButton extends BaseComponent {
    constructor() {
        super()
    }

    /*handleAddClass(className, e) {

        let obj_btn = this.refs.link;
        let curClassName = obj_btn.props.className;
        if (curClassName == "") {
            obj_btn.props.className = className
        } else {
            let _index = this.classIndexOf(obj_btn, className);
            if (_index == -1) {
                obj_btn.props.className += " " + className;
            }
        }

    }

    classIndexOf(obj, v) {
        let arrClassName = obj.props.className.split(" ");
        for (let i = 0; i < arrClassName.length; i++) {
            if (arrClassName[i] == v) {
                return i;
            }
        }
        return -1;
    }
*/
   /* componentDidMount() {
        let {type} = this.props;
        switch (type) {
            case "noBorder":
                break;
        }
    }*/

    render() {
        let {to, text,type} = this.props;
        let content;
        switch (type){
            case "list":
                return content =  (<Link ref="link" className="link list" to={to}>{text}</Link>)
                break;
            case "noBorder":
                return content =  (<Link ref="link" className="link no_border" to={to}>{text}</Link>)
                break;
            case "centerBorder":
                return content =  (<Link ref="link" className="link center_border" to={to}>{text}</Link>)
                break;
        }
        return (
            {content}
        )
    }
}
export default LinkButton