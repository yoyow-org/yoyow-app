/**
 * Created by lucker on 2018/2/22.
 */
import BaseStore from "./BaseStore";
import alt from "../altInstance";
import TipsActions from "../actions/TipsActions";
import {Utils, Validation} from "../../lib";

class TipsStore extends BaseStore {
    constructor() {
        super();
        this.bindActions(TipsActions);
        this.state={
            toastShow:false,
            toastTextValue:null,
            dialogShow:false,
            dialogTitle:null,
            dialogTextValue:null,
            dialogCancelBtn:null,
            dialogOkBtn:"确认",
            callBack:null,
            loadingGlobalShow:false,
            layerOutSHow:false,
            isLoadingShow:false
        };
    }

    onSetToastShow(toastTextValue){
        this.setState({toastShow:true,toastTextValue:toastTextValue})
    }
    onSetToastHide(){
        this.setState({toastShow:false,toastTextValue:null})
    }
    onSetDialogShow(data){
        this.setState({
            dialogShow:true,
            dialogTitle:data.title,
            dialogTextValue:data.content,
            dialogCancelBtn:data.cancelBtn,
            dialogOkBtn:data.okBtn,
            callBack:data.callback
        })
    }
    onSetDialogHide(){
        this.setState({
            dialogShow:false,
            dialogTitle:null,
            dialogTextValue:null,
            dialogCancelBtn:null,
            dialogOkBtn:"确认"
        })
    }
    onSetLoadingGlobalShow(toastTextValue){
        this.setState({loadingGlobalShow:true})
    }
    onSetLoadingGlobalHide(){
        this.setState({loadingGlobalShow:false})
    }

    onLoading(show){
        this.setState({loadingGlobalShow:show});
    }

    onToast(text){
        this.setState({
            toastShow: true,
            toastTextValue: text
        });
    }

    onAlert({text, title, center,callback}){
        this.setState({
            dialogShow: true,
            dialogTitle: title,
            dialogTextValue: text,
            dialogCancelBtn: false,
            dialogOkBtn: true,
            dialogTextCenter: center,
            callBack: callback
        });
    }

    onError({error, title, center, closeLoading}){
        let text = Utils.formatError(error).msg;
        this.setState({
            dialogShow: true,
            dialogTitle: title,
            dialogTextValue: text,
            dialogCancelBtn: false,
            dialogOkBtn: true,
            dialogTextCenter: center,
            loadingGlobalShow: closeLoading
        });
    }

    onConfirm({text, callback, title, center}){
        this.setState({
            dialogShow: true,
            dialogTitle: title,
            dialogTextValue: text,
            dialogCancelBtn: true,
            dialogOkBtn: true,
            dialogTextCenter: center,
            callBack: callback
        });
    }

    onCloseLayerOut(){
        this.setState({
            layerOutShow:false
        })
    }
    onOpenLayerOut(){
        this.setState({
            layerOutShow:true
        })
    }

    onClear(){
        this.setState({callBack: null});
    }
    onSetIsLoadingShow(bool){
        this.setState({
            isLoadingShow:bool
        })
    }
}
export default alt.createStore(TipsStore, "TipsStore");