import React from "react";
import BaseComponent from "../BaseComponent";
import Input from "../Form/Input";
import Utils from "../../../lib/utils/Utils"

class TokensBar extends BaseComponent {
    constructor() {
        super();
        this.state = {
            left: 0,
            value: 0,
            per: 0
        }
    }

    componentDidMount() {
        let {min} = this.props
        if(min>0){
            this.state = {
                left: 27,
                value: min,
                per: 12
            }
        }
    }

    handleOnChange(e) {
        let {min,max, onChange} = this.props
        let barObj = this.refs.bar;
        let startX = e.touches[0].pageX;
        let maxMove = this.refs.total.offsetWidth+10;
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
            let val =  Math.ceil(moveDistance / (maxMove - barWidth) * max);
            if(val>=min){
                this.setState({
                    left: moveDistance,
                    value: Utils.formatAmount(val,1),
                    per: (moveDistance) / (maxMove - barWidth) * 100
                })
            }
            if (onChange) {
                onChange(this.state.value);
            }
        })
    }

    handleClick(e){
        let {min,max, onChange} = this.props
        let maxMove = this.refs.total.offsetWidth+10;
        let barWidth = this.refs.bar.offsetWidth;
        let leftTitleWidth=this.refs.leftTitle.offsetWidth;
        let curLeft = e.touches[0].pageX-(leftTitleWidth+barWidth)<0?0:e.touches[0].pageX-(leftTitleWidth+barWidth);
        let margin = window.getComputedStyle(this.refs.layer_draw, null)["padding-left"];
        let moveDistance =curLeft-parseInt(margin);
        if (moveDistance <= 0) {
            moveDistance = 0;
        } else if (moveDistance >= maxMove - barWidth) {
            moveDistance = maxMove - barWidth;
        }
        let val= Math.ceil((moveDistance) / (maxMove - barWidth) * max);
        if(val>=min){
            this.setState({
                left: moveDistance,
                value: Utils.formatAmount(val, 1),
                per:(moveDistance) / (maxMove - barWidth) * 100
            });
        }
        if (onChange) {
            onChange(Utils.formatAmount(val, 1));
        }
    }

    render() {
        let {left,value,per}=this.state;
        return (
            <div className="layer_draw_bar_box" ref="layer_draw">
                <div ref="leftTitle" className="layer_draw_bar_box_title">
                    {this.translate("tokens.token_add_bar_label")}
                </div>
                <div className="layer_draw_bar_box_bar" onTouchStart={this.handleClick.bind(this)}>
                    <div ref="total"></div>
                    <div ref="cur" style={{width: this.state.per + "%"}}></div>
                    <div className="layer_draw_bar_box_pro"  style={{width: (this.state.left)+"px"}}></div>
                    <div ref="bar" className="layer_draw_bar_box_draw_obj" onTouchStart={this.handleOnChange.bind(this)} style={{left: this.state.left+"px"}}>
                        <span></span>
                    </div>
                </div>
                <div className="layer_draw_bar_box_number">
                    {this.state.value}
                </div>
            </div>
        )
    }

}
export default TokensBar
