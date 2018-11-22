import alt from "../altInstance";

class ResourceActions{
    /**
     * check server is alive
     * @returns null
     */
    checkLife(){
        return dispath => {
            return new Promise((resolve,reject) => {
                dispath({resolve, reject});
            });
        }
    }

    /**
     * get resources by yoyow uid number
     * @param {Number} uid - yoyow uid number
     * @returns null 
     */
    getResources(uid,tpTitle){
        return dispath => {
            return new Promise((resolve,reject) => {
                dispath({uid,tpTitle, resolve, reject});
            });
        }
    }

    /**
     * when title input change use it
     * @param {String} title - title string
     * @returns null
     */
    changeTitle(title){
        return title;
    }

    /**
     * set title to server
     * @param {Number} uid - yoyow uid number
     * @param {String} title - resources title
     * @returns {Promise}
     */
    setTitle(uid, title){
        return dispath => {
            return new Promise((resolve, reject) => {
                dispath({uid, title, resolve, reject});
            })
        }
    }

    /**
     * get records by uid
     * @param {Number} uid - yoyow uid number
     * @returns null
     */
    getRecords(uid){
        return dispath => {
            return new Promise((resolve, reject) => {
                dispath({uid, resolve, reject});
            })
        }
    }

    /**
     * set rule  新增和编辑rule
     * @param {Number} uid - yoyow uid number
     * @param {String} title - rule title string
     * @param {Number} amount - rule sell price amount number
     * @param {String} content - rule content string
     * @param {PrivateKey} privKey - private key object
     * @param {Number} expiration_date - timestamp
     * @param {Number} rid - rule rid number
     * @param {Number} asset_id - asset id number
     * @returns {Promise}
     */
    setRule(uid, title, amount, content, privKey, expiration_date = 0, rid = 0, asset_id = 0){
        return dispatch => {
            return new Promise((resolve, reject) => {
                dispatch({uid, title, amount, content, privKey, expiration_date, rid, asset_id, resolve, reject});
            });
        }
    }

    /**
     * buy rule
     * @param {Number} uid - yoyow uid number
     * @param {Number} rid - rule rid number
     * @param {Boolean} useCsaf - use csaf
     * @param {PrivateKey} privKey - private key object
     * @param {Boolean} broadcast - if true process transfer , if false set fees
     * 
     */
    buyRule(uid, rid, useCsaf, memoKey = null, activeKey = null, broadcast = false){
        return dispatch => {
            return new Promise((resolve, reject) => {
                dispatch({uid, rid, useCsaf, memoKey, activeKey, broadcast, resolve, reject});
            })
        }
    }

    /**
     * remove rule by rule rid number
     * @param {Number} rid - rule id number
     * @returns {Promise}
     */
    removeRule(rid){
        return dispath => {
            return new Promise((resolve, reject) => {
                dispath({rid, resolve, reject});
            })
        }
    }

    /**
     * remove record by record rid number
     * @param {String} oid - orider id string
     * @returns {Promise}
     */
    removeRecord(oid){
        return dispath => {
            return new Promise((resolve, reject) => {
                dispath({oid, resolve, reject});
            })
        }
    }

    /**
     * select rule from resources store
     * @param {Number} uid - yoyow uid number
     * @param {Number} rid - rule rid number
     * @param {PrivateKey} privKey - private key object
     * @returns {Promise}
     */
    selectRule(uid, rid, privKey){
        return dispatch => {
            return new Promise((resolve, reject) => {
                dispatch({uid, rid, privKey, resolve, reject});
            })
        }
    }

    /**
     * decrypt record
     * @param {Number} uid - yoyow uid number
     * @param {String} oid - order oid string
     * @param {PrivateKey} privKey - private key object
     * @returns {Promise}
     */
    decryptRecord(uid, oid, privKey){
        return dispatch => {
            return new Promise((resolve, reject) => {
                dispatch({uid, oid, privKey, resolve, reject});
            })
        }
    }
}

export default alt.createActions(ResourceActions);