import alt from "../altInstance";
import {key} from "yoyowjs-lib";
import { dispatch } from 'alt/lib/utils/AltUtils';
import SettingsStore from "../stores/SettingsStore";
import WalletStore from "../stores/WalletStore";
import CachedSettingActions from "../actions/CachedSettingActions";
import {FetchWrapper} from "../../lib";

class WalletActions {

    createAccount(accountPwd, shortPwd = null, mark = '', unlock = false){
        if(!shortPwd) shortPwd = accountPwd;
        return dispatch => {
            return new Promise((resolve, reject) => {
                dispatch({accountPwd, shortPwd, mark, unlock, resolve, reject});
            })
        }
    }

    changeAccount(uid){
        return dispatch => {
            return new Promise((resolve, reject) => {
               dispatch({uid, resolve, reject}); 
            });
        }
    }

    decompress(backup){
        return dispatch => {
            return new Promise((resolve, reject) => {
               dispatch({backup, resolve, reject}); 
            });
        }
    }

    restore(mark){
        return dispatch => {
            return new Promise((resolve, reject) => {
                dispatch({mark, resolve, reject});
            });
        }
    }

    setMark(mark){
        return dispatch => {
            return new Promise((resolve, reject) => {
                dispatch({mark, resolve, reject});
            });
        }
    }

    /**
     * 
     * @param {bool} autoChange - 如果传true， 则会切换列表里下一个有效账号，否则不处理
     */
    fetchAccountListStatistics(autoChange){
        return dispatch => {
            return new Promise((resolve, reject) => {
               dispatch({autoChange, resolve, reject}); 
            });
        }
    }

    deleteAccount(uid){
        return dispatch => {
            return new Promise((resolve, reject) => {
               dispatch({uid, resolve, reject}); 
            });
        }
    }

    selectAccount(uid){
        return dispatch => {
            return new Promise((resolve, reject) => {
               dispatch({uid, resolve, reject});
            });
        }
    }

    updateAccount(wallet){
        return dispatch => {
            return new Promise((resolve, reject) => {
                dispatch({wallet, resolve, reject});
            });
        }
    }

    clearSelected(){
        return true;
    }

    setNeedBack(flag){
        return flag;
    }

    guideNext(inx){
        return inx;
    }

    generateQRString(){
        return dispatch => {
            return new Promise((resolve, reject) => {
                dispatch({resolve, reject});
            });
        }
    }

    clearBackWallet(){
        return true;
    }

    setPassword(pwd, repwd){
        return {pwd, repwd};
    }

    clearPassword(){
        return true;
    }

    checkPassword(pwd){
        return dispatch => {
            return new Promise((resolve, reject) => {
               dispatch({pwd, resolve, reject}); 
            });
        }
    }

    changePassword(old, pwd){
        return dispatch => {
            return new Promise((resolve, reject) => {
               dispatch({old, pwd, resolve, reject}); 
            });
        }
    }

    checkAccountValid(uid, memo_key){
        return dispatch => {
            return new Promise((resolve, reject) => {
                dispatch({uid, memo_key, resolve, reject});
            });
        }
    }

    addSubscribe(cb){
        return {cb};
    }

    removeSubscribe(cb){
        return {cb};
    }

    setViewKeyTip(uid){
        return uid;
    }

}

export default alt.createActions(WalletActions);