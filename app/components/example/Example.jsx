import React from "react";
import {connect} from "alt-react";
import BaseComponent from "../BaseComponent";
import Header from "../Layout/Header";
import LoadingGlobal from "../Layout/LoadingGlobal";
import Toast from "../Layout/Toast";
import Dialog from "../Layout/Dialog";
import TipsActions from "../../actions/TipsActions";
import TipsStore from "../../stores/TipsStore";
import SettingsActions from "../../actions/SettingsActions";
import SettingsStore from "../../stores/SettingsStore";
import Button from "../Form/Button";
import LinkButton from "../Layout/LinkButton"
import Scanner from "../Layout/Scanner"

class Example extends BaseComponent {
    constructor() {
        super();
    }

    componentDidMount() {
        let  headerData = {
            buttonLeft: {
                value: "img_back",
            },
            title: "搜索结果",
            canBack:true
        }
        SettingsActions.updateHeader(headerData);
        setTimeout(this.hideLoading, 2000);

    }

    hideLoading() {
        TipsActions.setLoadingGlobalHide();
    }

    openToast() {
        let data = "发呆看了放假啊拉德斯基疯狂拉升大家分开了发呆看了放假啊拉德斯基疯狂拉升大家分开了发呆看了放假啊拉德斯基疯狂拉升大家分开了"
        TipsActions.setToastShow(data)
    }

    openDialog() {
        let data = {
            title: "标题",
            content: "内容内容内容内容内容内容内容内容内容内容内容内容内容内容",
            cancelBtn: true,
            okBtn: true,
            callback: () => {
                console.log("执行回调");
                return true;
            }
        }
        TipsActions.setDialogShow(data)
    }

    handPage(t, e) {
        e.preventDefault();
        let headerData;
        switch (t) {
            case "t1":
                this.routerPush("/example-for-buttons")
                break;
            case "t2":
                this.routerPush("/transfer")
                break;
            case "t3":
                headerData = {
                    buttonLeft: {
                        value: "",
                    },
                    title: "链接跳转",
                    buttonRight: {
                        value: "img_help",
                        textValue: "测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试"
                    },

                }
                break;
            case "t4":
                this.routerPush("/contacts");
                break;
            case "t5":
                this.routerPush("/page-search")
                break;
            case "t6":
                this.routerPush("/changepassword")
                break;
        }
    }

    /**
     * 扫码器回调
     * @param {*} msg 
     */
    handleScannerCallback(msg){
        console.log('接收返回消息');
        console.log(msg.state);
        console.log(msg.message);
    }

    render() {
        return (
            <div className="cover_full">
                <div className="bgWhite">
                    <div className="layer_button">
                        <Button value="打开toast" onClick={this.openToast.bind(this)}/>
                        <Button  value="打开dialog" onClick={this.openDialog.bind(this)}/>
                    </div>
                    <div className="layer_button">
                        <Button  value="按钮样式" onClick={this.handPage.bind(this, "t1")}/>
                    </div>
                    <div className="layer_button">
                        <Button value="测试header(左边文字关闭，右边无)" onClick={this.handPage.bind(this, "t2")}/>
                    </div>
                    <div className="layer_button">
                        <Button  value="打开d测试header(左边三角返回，右边扫一扫)ialog" onClick={this.handPage.bind(this, "t4")}/>
                    </div>
                    <div className="layer_button">
                        <Button value="测试header(search，右边取消)"  onClick={this.handPage.bind(this, "t5")}/>
                    </div>
                </div>
                <div className="bgWhite margin_top_20 test_for_layer_link">
                {/*  callback：为指定扫码完成的回调函数 className：可以自定义样式名称,默认：scanning_green  */}
                    <Scanner className="scanning_green" callback={this.handleScannerCallback.bind(this)}/>
                </div>
                <div className="bgWhite margin_top_20">
                    <LinkButton type="list" to="example-for-inputs" text="输入框"/>
                    <LinkButton type="list" to="example-for-layerOut" text="弹窗"/>
                    <LinkButton type="list" to="example-for-draw-bar" text="拖动条"/>
                </div>
                <div className="bgWhite margin_top_20" >
                    <LinkButton type="noBorder" to="example-for-inputs" text="链接"/>
                </div>
                <div className="bgWhite margin_top_20" >
                    <LinkButton type="noBorder" to="example-for-inputs" text="链接"/>
                </div>
                <div className="bgWhite margin_top_20" >
                    <LinkButton type="noBorder" to="example-for-inputs" text="链接"/>
                </div>
                <div className="bgWhite margin_top_20 test_for_layer_link">
                    <LinkButton type="centerBorder" to="example-for-inputs" text="链接"/>
                </div>
            </div>
        )
    }
}
export default connect(Example, {
    listenTo(){
        return [TipsStore];
    },
    getProps(){
        return TipsStore.getState();
    }
})