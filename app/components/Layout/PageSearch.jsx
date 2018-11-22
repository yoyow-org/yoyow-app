import React from "react";
import {connect} from "alt-react";
import BaseComponent from "../BaseComponent";
import TipsActions from "../../actions/TipsActions";
import SettingsActions from "../../actions/SettingsActions"

class PageSearch extends BaseComponent{
    constructor(){
        super();
    }
    componentDidMount(){
        let headerData = {
            search: {
                type: "search",
                value: "哈哈哈哈哈"
            },
            buttonRight: {
                value: "",
            },
            canBack:true
        }
        SettingsActions.updateHeader(headerData);
        setTimeout(this.showLoading,2000);
    }
    showLoading(){
        TipsActions.setLoadingGlobalHide();
    }
    handlePage(){

        this.routerPush("/transfer")
    }
    render(){
        /*let headerData={
            search:{
                type:"button",
                value:"请输入搜索内容",
                callBack:""
            },
            buttonLeft:{
                value:"img_back",
                //callBack:this.headerCallBack.bind(this)
            },
            title:"标题",
            buttonRight:{
                value:"img_scanning",
                //callBack:this.CallBackScanning.bind(this)
            }
        }*/
        return (
            <div>
                <button onClick={this.handlePage.bind(this)} className="button">测试header</button>
            </div>
        )
    }
}

export default PageSearch