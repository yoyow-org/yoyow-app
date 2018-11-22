import React from "react";
import BaseComponent from "../BaseComponent";
import KeyBoardsStore from "../../stores/KeyBoardsStore"
import {connect} from "alt-react";
import KeyBoardsActions from "../../actions/KeyBoardsActions";
import TipsActions from "../../actions/TipsActions"

class KeyBoards extends BaseComponent {
    constructor() {
        super();
        this.state = {
            val: "",
            isFocus: false,
            valArr: [],
            isInput: true,
            pointNum: 0
        }
        document.onclick = (e) => {

            if (e.target.nodeName != "INPUT" && e.target.nodeName != "LI" && e.target.nodeName != "SPAN" && e.target.className != "layer_key") {
                KeyBoardsActions.setKeyBoardsVisibal(false)
            }
            /*if(document.activeElement.tagName == "BODY"||document.activeElement.tagName=="BUTTON"){
             KeyBoardsActions.setKeyBoardsVisibal(false)
             }*/

        }
    }

    componentWillReceiveProps(nextProps) {
        let curVal = nextProps[0].obj.value ? nextProps[0].obj.value : "";
        let curValArr = curVal.split("")
        if (nextProps[0].obj != this.props[0].obj) {
            this.setState({
                valArr: curValArr,
                isInput: true
            })
        }

    }

    setVal(val, e) {
        e.stopPropagation();
        e.preventDefault()
        let obj = this.props[0].obj;
        let {pointLength} = this.props[0];
        let {valArr} = this.state;
        let arrIndex = obj.selectionStart;
        let valStr = valArr.toString();
        let str = valStr.replace(/,/g, '');
        let curPointLength = str.split(".")[1] ? str.split(".")[1].length : 0;
        let pointLaArr = [];
        let pointFaArr = []
        if (val != "x") {
            arrIndex++
            valArr.splice(arrIndex - 1, 0, val)

        } else if (val == "x" && arrIndex>0) {
            arrIndex--
            valArr.splice(arrIndex, 1)
        }


        if (valArr.lastIndexOf(".") != valArr.indexOf(".")) {
            valArr.splice(valArr.lastIndexOf("."), 1)
        }

        let pointIndex = valArr.indexOf(".")

        pointLaArr = valArr.slice(pointIndex, valArr.length);
        pointFaArr = valArr.slice(0, pointIndex);

        if (pointLaArr.length > pointLength+1) {
            pointLaArr.pop()
        }

        valArr = pointFaArr.concat(pointLaArr)

        let newValStr = valArr.toString();
        let newStr = newValStr.replace(/,/g, '');

        this.setState({
            valArr: valArr,
        })
        let ev = new Event('change', {bubbles: true});
        ev.simulated = true;
        obj.value = newStr;
        obj.dispatchEvent(ev);
        obj.focus();
        obj.setSelectionRange(arrIndex, arrIndex)
        // console.log(document.activeElement.tagName)

    }

    render() {
        let {val, isFocus} = this.state;
        let {isPoint, isShow} = this.props[0];
        return (
            <div className="layer_keyBoards" style={{display: isShow ? "flex" : "none"}}>

                <div className="layer_key">
                    <ul>
                        <li  onClick={this.setVal.bind(this, "1")}><span>1</span></li>
                        <li onClick={this.setVal.bind(this, "2")}><span>2</span></li>
                        <li onClick={this.setVal.bind(this, "3")}><span>3</span></li>
                    </ul>
                    <ul>
                        <li onClick={this.setVal.bind(this, "4")}><span>4</span></li>
                        <li onClick={this.setVal.bind(this, "5")}><span>5</span></li>
                        <li onClick={this.setVal.bind(this, "6")}><span>6</span></li>
                    </ul>
                    <ul>
                        <li onClick={this.setVal.bind(this, "7")}><span>7</span></li>
                        <li onClick={this.setVal.bind(this, "8")}><span>8</span></li>
                        <li onClick={this.setVal.bind(this, "9")}><span>9</span></li>
                    </ul>
                    <ul>
                        <li className={isPoint ? "" : "none"}
                            onClick={this.setVal.bind(this, isPoint ? "." : "")}>{isPoint ? <span>.</span> : ""}</li>
                        <li onClick={this.setVal.bind(this, "0")}><span>0</span></li>
                        <li onClick={this.setVal.bind(this, "x")}><span className="del"></span></li>
                    </ul>
                </div>
            </div>
        )
    }
}
export default connect(KeyBoards, {
    listenTo(){
        return [KeyBoardsStore]
    },
    getProps(){
        return [KeyBoardsStore.getState()];
    }
})