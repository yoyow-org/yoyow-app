import React from 'react';
import BaseComponent from "../BaseComponent";
import counterpart from "counterpart";
import SettingsActions from "../../actions/SettingsActions";
import WalletStore from "../../stores/WalletStore";
import {
    img_product_guide_zh_1,
    img_product_guide_zh_2,
    img_product_guide_zh_3,
    img_product_guide_en_1,
    img_product_guide_en_2,
    img_product_guide_en_3
} from "../../assets/img"

/**
 *产品向导
 */
let startX;
class AboutProductGuide extends BaseComponent {
    constructor() {
        super();
        this.state = {
            touchIndex: 0,
            startX: 0,
            objCurX: 0
        };
    }

    componentDidMount() {
        SettingsActions.updateHeader(null);
        this.setSize()
        this.refs.tag.childNodes[0].setAttribute("class","cur");
    }

    setSize() {
        let windowWidth = window.innerWidth;
        let windowHeight = window.innerHeight;
        this.refs.imgList.style.width = windowWidth * 3 + "px"
    }


    /**
     * 跳转到首页
     */
    handleJumpToIndex(event) {
        this.__setReaded();
    }

    __setReaded() {
        localStorage.setItem('firstProductGuide', true);
        if (WalletStore.getWallet()) {
            this.context.router.replace("/");
        } else {
            this.context.router.replace("/create-account");
        }
    }

    handleStart(e) {
        let obj = this.refs.imgList
        let startX = e.touches[0].pageX;

        let objCurX = obj.getBoundingClientRect().x;
        //console.log(obj.getBoundingClientRect().x)
        // let curX, endX, moveX, endL, dir;
        // let {touchIndex} = this.state;
        // let windowWidth = window.innerWidth
        // let _this = this;
        this.setState({
            moveX:null,
            startX: startX,
            objCurX: objCurX
        });
    }

    handleMove(e) {
        let {startX, objCurX} = this.state
        let obj = this.refs.imgList
        let curX = e.touches[0].pageX;
        let moveX = -(startX - curX) + objCurX + "px";

        //obj.style.left = moveX
        obj.style.transform = "translate3d("+moveX+",0,0)"
        this.setState({
            moveX: moveX
        })
    }

    handleUp(e) {
        let {moveX, startX, touchIndex} = this.state;

        let endX = e.changedTouches[0].pageX;
        let windowWidth = window.innerWidth
        if (endX - startX < 0 && Math.abs(parseFloat(endX - startX))>100) {
            if (touchIndex < 2) {
                touchIndex++;
            }
        } else if(endX - startX > 0 && Math.abs(parseFloat(endX - startX))>100){
            if (touchIndex > 0) {
                touchIndex--
            }
        }else{
            touchIndex
        }
        let mx = Math.abs(parseFloat(endX - startX))

        if(moveX){
            let endL =- windowWidth * touchIndex + "px"
            this.guildAnimation(moveX, endL)
            this.setState({
                touchIndex: touchIndex
            })
        }

    }

    guildAnimation(startL, endL, dir) {

        let obj = this.refs.imgList
        let style = document.createElement('style');
        style.id = "style"
        style.name = "a"
        style.type = 'text/css';
        style.innerHTML = '';
        document.getElementsByTagName('head')[0].appendChild(style);
        let stylesheet = document.styleSheets[document.styleSheets.length - 1];
        // let rules = "@-webkit-keyframes run{0% {left:" + startL + "}\n" +
        //     "100%{left:" + endL + "}}";
        let rules = "@-webkit-keyframes run{0% {transform:translate3d(" + startL + ",0,0)}\n" +
            "100%{transform:translate3d(" + endL + ",0,0)}";
        stylesheet.insertRule(rules, stylesheet.rules.length)
        obj.style.animation = "run .5s";
        obj.style.animationFillMode = "forwards";
        window.addEventListener("animationend", () => {
            obj.style.transform = "translate3d("+endL+",0,0)"
            let styleDoc = document.getElementById("style")
            if (styleDoc) {
                document.head.removeChild(styleDoc)
            }
            if(this.refs.tag){
                for(let i=0;i<this.refs.tag.childNodes.length;i++){

                    this.refs.tag.childNodes[i].setAttribute("class","");
                }
                let {touchIndex} = this.state
                this.refs.tag.childNodes[touchIndex].setAttribute("class","cur");
            }
            obj.style.animation = "";
            obj.style.animationFillMode = "";
        })
    }

    render() {
        const {touchIndex} = this.state;
        let img_1, img_2, img_3;
        let locale = this.props.locale || counterpart.getLocale() || "zh";
        img_1 = locale === "zh" ? img_product_guide_zh_1 : img_product_guide_en_1;
        img_2 = locale === "zh" ? img_product_guide_zh_2 : img_product_guide_en_2;
        img_3 = locale === "zh" ? img_product_guide_zh_3 : img_product_guide_en_3;
        return (
            <div className="about_product_guide">
                <ul className="img_list" ref="imgList" >
                    <li><img src={img_1}/></li>
                    <li><img src={img_2}/></li>
                    <li>
                        <img src={img_3}/>
                    </li>
                </ul>
                <div className="tag" onTouchStart={this.handleStart.bind(this)} onTouchMove={this.handleMove.bind(this)}
                     onTouchEnd={this.handleUp.bind(this)}>
                   <ul  style={{visibility:touchIndex==2?"hidden":"visible"}} ref="tag">
                        <li></li>
                        <li></li>
                        <li ></li>
                    </ul>
                </div>
                {touchIndex==2?<div className="btn"><button onClick={this.handleJumpToIndex.bind(this)}>{this.translate("about.about_service.button_guild")}</button></div>:""}
            </div>
        )
    }
}
export default AboutProductGuide;