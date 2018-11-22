
import alt from "../altInstance";

/**
 * 联系人
 */
 class ContactsActions{
    
    /**
     * 验证联系人账号
     * @param {*} param0 
     */
    ValidationAccent(uid){
        return dispatch => {
            return new Promise((resolve,reject) => {
                dispatch({uid,resolve,reject});
            });
        };
    }

    /**
     * 获取联系人列表
     * @param master 关联人
     * @param keywords 关键字
     * @returns {function(*)}
     */
    getContactsList(){
        return dispatch => {
            return new Promise((resolve,reject) => {
                dispatch({resolve,reject});
            });
        };
    }

    /**
     * 设置关键字
     * @param {*} val 
     */
    setKeywords(val){
        return val;
    }

    /**
     * 获取查询记录列表
     * @param master 关联人
    */
    getHistroys(master){
        return dispatch => {
            return new Promise((resolve,reject) => {
                dispatch({master,resolve,reject});
            });
        };
    }
    
    /**
     * 新增/修改 联系人
     * @param contact
     * @param method
     * @returns {function(*=)}
     */
    setContact(contact, method = 'add'){
        return dispatch => {
            return new Promise((resolve,reject) => {
                dispatch({contact,method,resolve,reject});
            });
        };
    }
    
    /**
     *添加联系人
     * @param {*} uid 
     */
    addContact(uid,master){
        return dispatch => {
            return new Promise((resolve,reject) => {
                dispatch({uid,master,resolve,reject});
            });
        };
    }

    /**
     * 新增查询记录
     * @param history
     * @param method
     * @returns {function(*=)}
     */
    setHistroy(history){
        let code = 0;
        return dispatch => {
            return new Promise((resolve, reject) => {
                dispatch({history,resolve,reject});
            });
        };
    }

    
    /**
     * 删除搜索记录
     * @param uid
     * @returns {function(*)}
     */
    delHistroy(inx){
        return dispatch => {
            return new Promise((resolve, reject) => {                
                dispatch({inx,resolve,reject});
            });

        }
    }

    /**
     * 删除联系人
     * @param uid
     * @returns {function(*)}
     */
    delContact(inx){
        return dispatch => {
            return new Promise((resolve, reject) => {
                dispatch({inx,resolve,reject});
            });

        }
    }

    /**
     * 选择联系人
     * @param {*} items 
     */
    selectContact(items){
        return dispatch => {
            return new Promise((resolve, reject) => {
                dispatch({items,resolve,reject});
            });
        }
    }

    /**
     * 接收跳转来的
     */
    setQRcodeUid(val){
        return val;
    }
 }
 
export default alt.createActions(ContactsActions);