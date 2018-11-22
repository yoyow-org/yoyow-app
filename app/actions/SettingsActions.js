import alt from "../altInstance";
import { dispatch } from "alt/lib/utils/AltUtils";

class SettingsActions {

    setPrevUrl(url){
        return url
    }

    setRouterType(type){
        return type
    }
    //修改设置
    changeSetting(value) {
        return value;
    }

    //添加api服务器
    addWS(ws) {
        return ws;
    }

    //移除api服务器
    removeWS(index) {
        return index;
    }

    //清除设置
    clearSettings() {
        return null;
    }

    updateHeader(data){
        return data;
    }
    isAnimation(bool){
        return bool;
    }
    checkFastApi(){
        return dispatch => {
            return new Promise((resolve, reject) => {
                dispatch({resolve, reject}); 
            });
        }
    }
}
export default alt.createActions(SettingsActions);