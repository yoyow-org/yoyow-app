import FetchWrapper from '../utils/FetchWrapper';
import SettingsStore from '../../app/stores/SettingsStore';

const fetch_url = SettingsStore.getSetting('fetchServer');

export default {

    /**
     * check server is alive
     * @returns {Promise}
     */
    checkLife(){
        return FetchWrapper.get('', null, fetch_url);
    },

    /**
     * get gateway uid
     * @returns {Promise}
     */
    getGatewayUid(){
        return FetchWrapper.get('/config', null, fetch_url);
    },

    /**
     * get resources by seller uid number
     * @param {Number} uid - seller uid number
     * @returns {Promise}
     */
    getResourcesBySeller(uid){
        return FetchWrapper.get(`/title/${uid}`, null, fetch_url);
    },

    /**
     * get bought resources by buyer uid number
     * @param {Number} uid - buyer uid number
     * @returns {Promise}
     */
    getBoughtByBuyer(uid){
        return FetchWrapper.get(`/orders/${uid}`, null, fetch_url);
    },

    /**
     * get single record
     * @param {Number} rid - record id number
     * @returns {Promise}
     */
    getRecord(rid){
        return FetchWrapper.get(`/order/${rid}`, null, fetch_url);
    },

    /**
     * set resource title 
     * @param {Number} uid - seller uid number
     * @param {String} title - title string
     * @returns {Promise}
     */
    setResourceTitle(uid, title){
        return FetchWrapper.post('/title', { uid, title }, fetch_url);
    },

    /**
     * set rule
     * @param {Number} uid - seller uid number
     * @param {String} title - rule title
     * @param {Number} amount - rule price
     * @param {String} content - encrypt content
     * @param {Number} asset_id - asset id number
     * @param {Number} expiration_date - expires time timestamp
     * @param {Number} rid - rule id use for update
     * @returns {Promise}
     */
    setRule(uid, title, amount, content, asset_id = 0, expiration_date = 0, rid = 0){
        return FetchWrapper.post('/rule', { uid, title, amount, content, asset_id, expiration_date, rid }, fetch_url);
    },

    /**
     * when tranfer complate , notice server
     * @param {Number} uid - yoyow uid number
     * @param {Number} rid - rule rid number
     * @returns {Promise}
     */
    setRecord(uid, rid){
        return FetchWrapper.post('/order', {uid, rid}, fetch_url);
    },

    /**
     * remove resources rule by id number
     * @param {Number} rid - rule id number
     * @returns {Promise}
     */
    removeRule(rid){
        return FetchWrapper.delete(`/rule/${rid}`, null, fetch_url);
    },

    /**
     * remove record by record id number
     * @param {Number} rid 
     * @returns {Promise}
     */
    removeRecord(rid){
        return FetchWrapper.delete(`/order/${rid}`, null, fetch_url)
    },

    /**
     * check account restore 
     * @param {Number} uid - account uid number
     * @returns {Promise}
     */
    checkRestore(uid){
        return FetchWrapper.post(`/import`, {uid}, fetch_url)
    }
}