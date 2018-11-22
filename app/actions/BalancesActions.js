/**
 * 资产
 */

import alt from "../altInstance";
import { SSL_OP_DONT_INSERT_EMPTY_FRAGMENTS } from "constants";

class BalancesActions {
    getAccountInfo(){
        return dispatch => {
            return new Promise((resolve) => {
                dispatch({resolve});
            })
        }
    }
    getChainAccountInfo(uid){
        return dispatch => {
            return new Promise((resolve,reject) => {
                dispatch({uid,resolve,reject});
            })
        }
    }
    getBalance(uid){
        return dispatch => {
            return new Promise((resolve,reject) => {
                dispatch({uid,resolve,reject});
            })
        }
    }
    getIntegralByUid(uid){
        return dispatch => {
            return new Promise((resolve,reject) => {
                dispatch({uid,resolve,reject});
            })
        }
    }
    getAccountInfoList(){
        return dispatch => {
            return new Promise((resolve,reject) => {
                dispatch({resolve,reject});
            })
        }
    }
    getFees(to_account, amount, memo, type){
        return dispatch => {
            return new Promise((resolve,reject) => {
                dispatch({to_account, amount, memo, type,resolve,reject});
            })
        }
    }
    handleTransfer(to_account, amount, memo, type,useBalance, useCsaf, broadcast){
        return dispatch => {
            return new Promise((resolve,reject) => {
                dispatch({to_account, amount, memo, type,useBalance, useCsaf, broadcast,resolve,reject});
            })
        }
    }
    getFeesForCsaf(to_account, amount,memo, type,useBalance, useCsaf){
        return dispatch => {
            return new Promise((resolve,reject) => {
                dispatch({to_account, amount,memo, type,useBalance, useCsaf,resolve,reject});
            })
        }
    }
    handleCsafCollect(to_account, amount,useBalance, useCsaf){
        return dispatch => {
            return new Promise((resolve,reject) => {
                dispatch({to_account, amount,useBalance, useCsaf,resolve,reject});
            })
        }
    }

    handleFundsType(type){
        return type;
    }

    setTokenInfo(tokenInfo){
        return tokenInfo;
    }

    /**
     * 用于转账二维码存储资产id
     * @param {} val 
     */
    setAssetId(val){
       return val; 
    }

    setAmount(val){
        return val;
    }
    setAccount(uid){
        return uid;
    }
    setMemo(memoText){
        return memoText;
    }
    setSymbol(symbolText){
        return symbolText;
    }
    setCanMemo(bool){
        return bool;
    }

    /**
     * 设置转账页面的头部标题
     * @param {*} val 
     */
    setHeadTitle(val){
        return val;
    }

    /**
     * 获取二维码收款信息
     * @param {*} assetId 
     * @param {*} transferBalance 
     */
    getQRReceive(assetId){
        return dispatch => {
            return new Promise((resolve,reject) => {
                dispatch({assetId,resolve,reject});
            })
        }
    }

    /**
    * 获取二维码收款信息
    * @param {*} assetId 
    * @param {*} transferBalance 
    */
   addQRReceive(qrReceive){
       return dispatch => {
           return new Promise((resolve,reject) => {
               dispatch({qrReceive,resolve,reject});
           })
       }
   }

   /**
   * 获取二维码收款信息
   * @param {*} assetId 
   * @param {*} transferBalance 
   */
  delQRReceive(inx){
      return dispatch => {
          return new Promise((resolve,reject) => {
              dispatch({inx,resolve,reject});
          })
      }
  }

}
export default alt.createActions(BalancesActions);