import React from "react"
import {connect} from "alt-react";
import Mask from "./Mask"
import TipsStore from "../../stores/TipsStore";
import TipsActions from "../../actions/TipsActions";
import BaseComponent from "../BaseComponent";
import Button from "../Form/Button"

class Dialog extends BaseComponent{
    constructor(){
        super();
    }
    componentWillReceiveProps(nextProps){
        //console.log(nextProps)
        if(nextProps.dialogShow){
            this.refs.dialog.style.display = "block"
        }
    }
    componentDidMount(){}
    
    closeDialog(){
        this.refs.dialog.style.display = "none";
        TipsActions.setDialogHide();
        TipsActions.clear();
    }
    /**
     * 调整callback 若返回true 则关闭弹窗,反之保留
     */
    callback(){
        let {callBack} = this.props;
        if(callBack())
            this.closeDialog();
    }
    render(){
        let {dialogShow, dialogTitle, dialogTextValue,dialogCancelBtn,dialogOkBtn,callBack,dialogTextCenter} = this.props
        let confirmContent;
        /*用于显示列表文本*/
        if(dialogTextValue && typeof(dialogTextValue)==="object"){
            confirmContent=(<ul>
                    {
                        dialogTextValue.content.map((item)=>{
                            return (<li key={Math.random()}>{item.item}</li>)
                        })
                    }
                </ul>
            )
        }else{
            confirmContent=dialogTextValue;
        }
        return (
            <div ref="dialog" className="dialog z_index_20">
                <Mask/>
                <div className="box_dialog">
                    {dialogTitle?<div className="title">{dialogTitle}</div>:""}
                    <div className="content" style={dialogTextCenter ? {textAlign: 'center'} : {}}>{confirmContent}</div>
                    <div className="layer_button padding_0">
                        {dialogCancelBtn?
                            <Button value={this.translate('form.button_cancel')}
                                    bg="#fff"
                                    color="#666"
                                    borderRadius="none"
                                    size={34}
                                    fontSize={32}
                                    onClick={this.closeDialog.bind(this)}/>:
                            ""}
                        {dialogOkBtn?(
                            dialogCancelBtn?
                                <Button value={this.translate('form.button_confirm')}
                                    bg="#2E7EFE"
                                    color="#fff"
                                    size={34}
                                    fontSize={32}
                                    borderRadius="none"
                                    onClick={callBack?this.callback.bind(this):this.closeDialog.bind(this)} />
                                :
                                <Button value={this.translate('form.button_confirm')}
                                    bg="#fff"
                                    color="#2E7EFE"
                                    size={34}
                                    fontSize={32}
                                    borderRadius="none"
                                    onClick={callBack?this.callback.bind(this):this.closeDialog.bind(this)} />
                                ):
                            ""}
                    </div>
                </div>
            </div>
        )
    }
}
export default connect(Dialog,{
    listenTo(){
        return [TipsStore];
    },
    getProps(){
        return TipsStore.getState();
    }
})