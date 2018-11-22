/**
 * 平台
 */
import alt from "../altInstance";
import { dispatch } from 'alt/lib/utils/AltUtils';

class PlatformActions {

    /**
     * 获取平台列表
     * @returns {Promise<U>|*|Thenable<U>|Promise.<TResult>}
     */
    getPlatforms(){
        return dispatch => {
            return new Promise((resolve, reject) => {
                dispatch({resolve, reject});
            });
        }
    }

    /**
     * 获取平台列表(首页)
     * @returns {Promise<U>|*|Thenable<U>|Promise.<TResult>}
     */
    getPlatformsForIndex(){
        return dispatch => {
            return new Promise((resolve, reject) => {
                dispatch({resolve, reject});
            });
        }
    }

    /**
     * 清空授权签名对象
     */
    clearSignStr(){
        return true;
    }

    /**
     * 效验授权签名对象
     */
    checkSign(signStr){
        return dispatch => {
            return new Promise((resolve, reject) => {
               dispatch({signStr, resolve, reject}); 
            });
        }
    }

    /**
     * 授权平台
     * @param {Number|String} pid - 平台账户 id
     * @param {Number|String} uid - 用户账户 id
     */
    doAuthority(uid){
        return dispatch => {
            return new Promise((resolve, reject) => {
               dispatch({uid, resolve, reject}); 
            });
        }
    }

    /**
     * 取消平台授权
     * @param {Number|String} pid - 平台账号 id
     */
    cancelAuthority(pid, useCsaf, broadcast){
        return dispatch => {
            return new Promise((resolve, reject) => {
               dispatch({pid, useCsaf, broadcast, resolve, reject}); 
            });
        }
    }

    /**
     * 发送授权登录消息给平台
     */
    sendAuthority(){
        return dispatch => {
            return new Promise((resolve, reject) => {
               dispatch({resolve, reject}); 
            });
        }
    }

    /**
     * 检查该账户是否授权
     * @param {Number|String} pid - 平台账号id
     * @param {Number|String} uid - 用户账号id
     */
    checkAuthority(uid){
        return dispatch => {
            return new Promise((resolve, reject) => {
               dispatch({uid, resolve, reject}); 
            });
        }
        
    }

    /**
     * 设置关键字
     * @param {String} keywords - 关键字
     */
    setKeywords(keywords){
        return keywords;
    }

    /**
     * 查询搜索历史
     */
    selectHistory(){
        return true;
    }

    /**
     * 添加搜索历史
     * @param {String} text - 搜索文本
     */
    addHistory(text){
        return text;
    }

    /**
     * 删除搜索历史
     * @param {String} inx - 索引下标
     */
    deleteHistory(inx){
        return {inx}
    }

    /**
     * 设置平台
     * @param {*} val 
     */
    setPlatform(val){
        return val;
    }

    /**
     * ios跳转
     * @param {*} data 
     */
    iosJump(data){
        return data;
    }

    /**
     * android跳转
     * @param {*} data 
     */
    androidJump(data){
        return data;
    }

    /**
     * h5跳转
     * @param {*} url 
     */
    h5Jump(url){
        return url;
    }
}

export default alt.createActions(PlatformActions);