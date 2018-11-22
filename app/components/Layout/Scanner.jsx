import React from "react"
import BaseComponent from "../BaseComponent";
import {img_scanning,img_scanning_green} from "../../assets/img";

class Scanner extends BaseComponent{
    /**
     * 扫描二维码事件
     */
    handleScnner(){
        let {callback}=this.props;
        let result={state:false,message:"erro message"}
        localStorage.setItem('isOpenCamera', true);
        // pc测试使用，当不在手机上操作时，直接回调，若需要测试数据，请在自己回调函数中组装
        try{
            //扫码的js接口代码  
            cordova.plugins.barcodeScanner.scan(
                function (result) {
                    if(typeof(callback)=="function")
                    {
                        result.state=true,
                        callback(result);
                    }
                },
                function (error) {                
                    if(typeof(callback)=="function")
                    {
                        result.message=error;
                        callback(result);
                    }
                },
                {
                    resultDisplayDuration: 0, // 返回扫描结果，必须设置0才不显示 --通用
                    formats : "QR_CODE", // 识别格式：QR_CODE  --通用
                    prompt: this.translate("contacts.sacnner_alert_message"),//文字提示
                    orientation : "portrait", // 扫描框布局：(portrait(横向)|landscape(纵向)
                    disableAnimations : true // 禁止动画 --IOS
                }
            );
        }catch(e){
            if(callback) callback();
        }
    }
    render(){
        let {className}=this.props;
        return (
            <button className={(className&&className.length>0)?className:"scanning_green"} onClick={this.handleScnner.bind(this)} />
        )
    }
}

export default Scanner;