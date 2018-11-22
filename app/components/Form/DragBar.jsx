import React from "react";
import BaseComponent from "../BaseComponent";
import Input from "../Form/Input";
import {Utils,Validation} from "../../../lib"
class DragBar extends BaseComponent {
    constructor() {
        super();
        this.state = {
            left: 0,
            value: 0,
            per: 0
        }
    }

    start(e) {
        let drawObj = e.target;
        e.preventDefault();
        let totalWidth = this.refs.total.offsetWidth;

    }

    componentWillUpdate(){
        let {needInit} = this.props;
        if(needInit){
            this.setState({
                left: 0,
                value: 0,
                per: 0
            });
        }
    }

    componentDidMount() {
        //console.log(window.getComputedStyle(this.refs.bar)["width"])
    }

    handleInput(e) {
        let {onChange,max} = this.props;
        let val =(e.target.value).trim();

            let {min} = this.props;
            let total = this.refs.total.offsetWidth - this.refs.bar.offsetWidth;
            val == "" ? 0 : val
            let left = val / max * total

            if (val < 0) {
                left = 0;
                val = 0
            } else if (val >= max) {
                val = max;
                left = total
            }
            if (val >= 0 ) {
                if (val.toString().indexOf(".") >= 0) {
                    if (val.toString().split(".")[1].length <= 3) {
                        this.setState({
                            value: val,
                            left: left,
                            per: val / max * 100
                        })
                    }
                } else {
                    this.setState({
                        value: val,
                        left: left,
                        per: val / max * 100
                    })
                }
            }

            if (onChange) {
                onChange(val);
            }
    }

    handleOnChange(e) {
        let {max, onChange} = this.props
        let barObj = this.refs.bar;
        let startX = e.touches[0].pageX;
        let maxMove = this.refs.total.offsetWidth;
        let curLeft = barObj.offsetLeft;
        let moveDistance = 0;
        let barWidth = barObj.offsetWidth;
        barObj.addEventListener("touchmove", (e) => {


            moveDistance = e.touches[0].pageX - startX + curLeft;

            if (moveDistance <= 0) {
                moveDistance = 0;
            } else if (moveDistance >= maxMove - barWidth) {
                moveDistance = maxMove - barWidth;
            }
            let val =  Utils.formatAmount((moveDistance) / (maxMove - barWidth) * max, 4);
            this.setState({
                left: moveDistance,
                value: val,
                //value: Math.ceil((moveDistance) / (maxMove - barWidth) * max),
                per: (moveDistance) / (maxMove - barWidth) * 100
            })
            if (onChange) {

                onChange(this.state.value);
            }
        })

    }
    handleClick(e){
        let {max, onChange} = this.props
        let maxMove = this.refs.total.offsetWidth;
        let barWidth = this.refs.bar.offsetWidth;
        let curLeft = e.touches[0].pageX;
        let margin = window.getComputedStyle(this.refs.layer_draw, null)["padding-left"];
        let moveDistance =curLeft-parseInt(margin);
        if (moveDistance <= 0) {
            moveDistance = 0;
        } else if (moveDistance >= maxMove - barWidth) {
            moveDistance = maxMove - barWidth;
        }
        let val= (moveDistance) / (maxMove - barWidth) * max
        this.setState({
            left: moveDistance,
            value: Utils.formatAmount(val, 4),
            //value: Math.ceil((moveDistance) / (maxMove - barWidth) * max),
            per: (moveDistance) / (maxMove - barWidth) * 100
        })
        if (onChange) {

            onChange(Utils.formatAmount(val, 4));
        }
    }
    onFocus(isNumber,isPoint,pointLength,ev) {
        let objInput = ev.target;
        let maskObj = ev.target;
        if(window.cordova){
            Utils.handleKeyBoards(objInput,maskObj,isNumber,isPoint,pointLength);
        }


        //console.log(ev.target.value)
    }
    render() {
        let {min, max} = this.props;
        //console.log(this.state.left)
        return (
            <div className="layer_draw_bar" ref="layer_draw">
                <div className="title">
                    <span className="tit_num">{this.translate("balance.integral.pickup_quantity")}</span>
                    <span>{this.translate("balance.integral.receive_points")}<em>{max}</em></span>
                </div>
                <div className="bar"  onTouchStart={this.handleClick.bind(this)}>
                    <div ref="total"></div>
                    <div ref="cur" style={{width: this.state.per + "%"}}></div>
                    {/*<span onTouchStart={this.start.bind(this)}></span>*/}
                    <div className="pro"  style={{width: this.state.left+"px"}}></div>
                    <div  ref="bar" className="draw_obj" onTouchStart={this.handleOnChange.bind(this)} style={{left: this.state.left+"px"}}>
                        <span></span>
                    </div>
                </div>
                <div className="number">
                    <Input onFocus={this.onFocus.bind(this,true,true,3)}
                           onClick={this.onFocus.bind(this,true,true,3)}
                           onChange={this.handleInput.bind(this)}
                           type="text" value={this.state.value}/>
                </div>
            </div>
        )
    }

}
export default DragBar
