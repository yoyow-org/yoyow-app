import alt from "../altInstance";

/**
 * 历史记录
 */
class TokensActions{

    /**
     * 获取创建资产列表
     */
    getCreateTokensList(){
        return dispatch => {
            return new Promise((resolve,reject) => {
                dispatch({resolve,reject});
            });
        }
    }

    /**
     * 获取账号资产列表(首页)
     */
    getAccountTokensListForIndex(uuid){
        return dispatch => {
            return new Promise((resolve,reject) => {
                dispatch({uuid,resolve,reject});
            });
        }
    }

    /**
     * 获取账号资产列表
     * @param {bool 是否排序} isOrderby
     * @param {bool 是否过滤核心资产} isFilterCoreToken
     */
    getAccountTokensList(){
        return dispatch => {
            return new Promise((resolve,reject) => {
                dispatch({resolve,reject});
            });
        }
    }

    getTokenByAssetId(assetId){
        return dispatch => {
            return new Promise((resolve,reject) => {
                dispatch({assetId,resolve,reject});
            });
        }
    }

    /**
     * 获取手续费
     * @param {*} data 
     */
    getCreateFee(data){
        return dispatch => {
            return new Promise((resolve,reject) => {
                dispatch({data,resolve,reject});
            });
        }
    }
    
    /**
     * 获取手续费
     * @param {*} data 
     */
    getIssueFee(data){
        return dispatch => {
            return new Promise((resolve,reject) => {
                dispatch({data,resolve,reject});
            });
        }
    }

    /**
     * 创建资产
     */
    createToken(data){
        return dispatch => {
            return new Promise((resolve,reject) => {
                dispatch({data,resolve,reject});
            });
        }
    }


    /**
     * 提取本地token
     */
    getLocalToken(){
        return dispatch => {
            return new Promise((resolve,reject) => {
                dispatch({resolve,reject});
            });
        }
    }

    /**
     * 添加本地token
     * @param {*} data 
     */
    addLocalToken(data){
        return dispatch => {
            return new Promise((resolve,reject) => {
                dispatch({data,resolve,reject});
            });
        }
    }

    /**
     * 删除本地token
     * @param {*} inx 
     */
    delLocalToken(inx){
        return dispatch => {
            return new Promise((resolve,reject) => {
                dispatch({inx,resolve,reject});
            });
        }
    }

    /**
     * 设置本地token
     * @param {*} param0 
     */
    changeLocalToken(data){
        return dispatch => {
            return new Promise((resolve,reject) => {
                dispatch({data,resolve,reject});
            });
        }
    }

    /**
     * 关键字
     * @param {*} val 
     */
    changeKeyword(val){
        return val;
    }
 }
 
 export default alt.createActions(TokensActions);