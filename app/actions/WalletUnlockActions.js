import alt from "../altInstance";

class WalletUnlockActions {

    /**
     * 关闭解锁框
     */
    close(){
        return true;
    }

    /**
     * 检查是否锁定,锁定的情况会弹出解锁框
     * @param {Boolean} force - 是否强制打开解锁
     * @param {Boolean} isShort - true 为零钱 ，false 为余额
     * @param {String} descript - 解锁框描述
     * @param {Object} fees - 手续费对象 
     * 
     */
    checkLock(force = true, isShort = true, descript = null ,fees = null){
        return dispatch => {
            return new Promise((resolve, reject) => {
                dispatch({force, isShort, descript ,fees , resolve, reject});
            });
        }
    }

    /**
     * 执行解锁操作
     */
    unlock(){
        return dispatch => {
            return new Promise((resolve, reject) => {
               dispatch({resolve, reject}); 
            });
        }
    }

    /**
     * 解锁框密码输入
     * @param {String} password 
     */
    passwordChange(password){
        return password;
    }

    /**
     * 改变fees 的 useCsaf 状态
     * @param {Boolean} flag 
     */
    setUseCsaf(flag){
        return flag;
    }
    
}

export default alt.createActions(WalletUnlockActions);