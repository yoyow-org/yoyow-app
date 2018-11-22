import alt from "../altInstance";

/**
 * 历史记录
 */
class HistoryActions{

    /**
     * 获取资产明细
     * @param {*} uid 
     * @param {*} op_type 
     * @param {*} start 
     * @param {数据类型：0：余额，1：零钱} dataType 
     */
    getHistoryByUid(uid, op_type = null,dataType=0,tokenInfo=null,isFirst=false){
        return dispatch => {
            return new Promise((resolve,reject) => {
                dispatch({uid,op_type,dataType,tokenInfo,isFirst,resolve,reject});
            })

        }
    }

    /**
     * 初始化数据
     */
    clearStates(){
        return dispatch => {
            return new Promise((resolve,reject) => {
                dispatch({resolve,reject});
            });
        }
    }
 }
 
 export default alt.createActions(HistoryActions);