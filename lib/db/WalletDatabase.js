import {Apis} from "yoyowjs-ws";
import IdbHelper from "./IdbHelper";
import validation from "../utils/Validation";

const DB_VERSION = 1;
const DB_PREFIX = "yoyow_v1";
const WALLET_BACKUP_STORES = ["wallet", "private_keys", "contacts","historys","qrreceive","localtoken"];

/**
 * 钱包数据实例类
 */
class WalletDatabase {
    constructor() {
        this.currentWalletName = "default";
        let impl = window.openDatabase ? (shimIndexedDB || indexedDB) : indexedDB;
        if ("__useShim" in impl) {
            impl.__useShim();
        }
        this.settingHelper = new IdbHelper(impl, this.getDatabaseName("setting"), (db, oldVersion) => {
            if (oldVersion === 0) {
                db.createObjectStore("settings", {keyPath: "name"});
            }
        });
        this.walletHelper = new IdbHelper(impl, null, this.__upgrade);
    }

    getDatabaseName(walletName, chain_id = Apis.instance().chain_id) {
        if (walletName) {
            return [
                DB_PREFIX,
                chain_id ? chain_id.substring(0, 6) : "",
                walletName
            ].join("_");
        } else {
            return [
                DB_PREFIX,
                chain_id ? chain_id.substring(0, 6) : ""
            ].join("_");
        }

    }

    __upgrade(db, oldVersion) {
        if (oldVersion === 0) {
            db.createObjectStore(WALLET_BACKUP_STORES[0], {keyPath: "public_name"});
            IdbHelper.autoIncrementUnique(db, WALLET_BACKUP_STORES[1], "pubkey");
            /*
            * 联系人模型
            * uid 联系人 uid
            * master 当前操作人 uid
            * remark 备注 非唯一
            * head_img 头像地址
            * last_modify 最后操作时间
            * */
            let os = db.createObjectStore(WALLET_BACKUP_STORES[2], {keyPath: "inx", autoIncrement:true});
            os.createIndex('inx', 'inx', {unique: true});
            os.createIndex('uid', 'uid', {unique: false});
            os.createIndex('master', 'master', {unique: false});
            os.createIndex('remark', 'remark', {unique: false});
            os.createIndex('head_img', 'head_img', {unique: false});
            os.createIndex('last_modify', 'last_modify', {unique: false});
            
            /*
            * 查询记录
            * keyword 关键字 keyword
            * master 当前操作人 uid
            * last_modify 最后操作时间
            * */
           let his = db.createObjectStore(WALLET_BACKUP_STORES[3], {keyPath: "inx", autoIncrement:true});
           his.createIndex('inx', 'inx', {unique: true});
           his.createIndex('keyword', 'keyword', {unique: false});
           his.createIndex('master', 'master', {unique: false});
           his.createIndex('last_modify', 'last_modify', {unique: false});

           /*
            * 二维码转账模型
            * uid 信息所有人 uid
            * assetId 资产编号 （核心资产为：0）
            * transferBalance 是否余额 核心资产时使用：true为余额，false为零钱
            * receiveAmount 转账金额
            * receiveMemo 转账备注
            * receiveSymbol 资产名称
            * last_modify 最后操作时间
            * */
           let qrreceive = db.createObjectStore(WALLET_BACKUP_STORES[4], {keyPath: "inx", autoIncrement:true});
           qrreceive.createIndex('inx', 'inx', {unique: true});
           qrreceive.createIndex('uid', 'uid', {unique: false});
           qrreceive.createIndex('assetId', 'assetId', {unique: false});
           qrreceive.createIndex('receiveAmount', 'receiveAmount', {unique: false});
           qrreceive.createIndex('receiveMemo', 'receiveMemo', {unique: false});
           qrreceive.createIndex('receiveSymbol', 'receiveSymbol', {unique: false});
           qrreceive.createIndex('last_modify', 'last_modify', {unique: false});


           /*
            * 本地token
            * uid 信息所有人 uid
            * assetId 资产编号（核心资产为：0）
            * last_modify 最后操作时间
            * */
           let locaktoken = db.createObjectStore(WALLET_BACKUP_STORES[5], {keyPath: "inx", autoIncrement:true});
           locaktoken.createIndex('inx', 'inx', {unique: true});
           locaktoken.createIndex('uid', 'uid', {unique: false});
           locaktoken.createIndex('assetId', 'assetId', {unique: false});
           locaktoken.createIndex('last_modify', 'last_modify', {unique: false});
        }
    }

    __openSetting() {
        return this.settingHelper.open(DB_VERSION);
    }

    getSetting(name, default_value) {
        return this.__openSetting().then(db => {
            let transaction = this.settingHelper.getTransactionOnly("settings");
            let store = transaction.objectStore("settings");
            return IdbHelper.onRequested(store.get(name)).then(event => {
                var result = event.target.result;
                return result ? result.value : default_value;
            });
        }).catch(error => {
            console.error(error);
        });
    }

    setSetting(name, value) {
        return this.__openSetting().then(db => {
            let transaction = this.settingHelper.getTransaction("settings");
            let store = transaction.objectStore("settings");
            if (value && value["toJS"]) value = value.toJS();
            return IdbHelper.onTransactionEnd(store.put({name, value}));
        }).catch(error => {
            console.error(error);
            return Promise.reject(error);
        });
    }

    init(chain_id) {
        return this.getSetting("current_wallet", "default").then(current_wallet => {
            this.currentWalletName = current_wallet;
            //let dbName = this.getDatabaseName(current_wallet, chain_id);
            let dbName = this.getDatabaseName(null, chain_id);
            this.walletHelper.setDatabaseName(dbName);
            return this.walletHelper.open(DB_VERSION);
        });
    }

    deleteDatabase(sure = false) {
        return this.walletHelper.deleteDatabase(sure);
    }

    closeWalletDB() {
        this.walletHelper.close();
    }

    closeSettingDB() {
        this.settingHelper.close();
    }

    /**
     * 添加/修改 数据
     * @param store_name
     * @param value
     * @param method
     * @returns {Promise}
     */
    addStore(store_name, value, method = 'add') {
        return new Promise((resolve, reject) => {
            let transaction = this.walletHelper.getTransaction(store_name);
            let store = transaction.objectStore(store_name);
            let request = store[method](value);
            request.onsuccess = () => {
                resolve(value);
            };
            request.onerror = (e) => {
                console.error("addStore - can't store value in db. ", e.target.error.message, value);
                reject(e.target.error.message);
            };
        });
    }

    /**
     * 根据指定key获取数据项
     * @param store_name
     * @param key
     * @return {Promise}
     */
    getStore(store_name, key) {
        return new Promise((resolve, reject) => {
            let tr = this.walletHelper.getTransactionOnly(store_name);
            let store = tr.objectStore(store_name);
            let request = store.get(key);
            request.onsuccess = (e) => {
                resolve(e.target.result);
            };
            request.onerror = (e) => {
                console.error("getStore - can't get store value in db. ", e.target.error.message, key);
                reject(e.target.error.message);
            };
        });
    }

    /**
     * 删除数据
     * @param {String} store_name 
     * @param {Number|String} value - 要删除的索引 不传则清空整个store！！
     */
    removeStore(store_name, value) {
        return new Promise((resolve, reject) => {
            let transaction = this.walletHelper.getTransaction(store_name);
            let store = transaction.objectStore(store_name);
            let request = validation.isEmpty(value) ? store.clear() : store.delete(value);
            request.onsuccess = () => {
                resolve();
            };
            request.onerror = (e) => {
                console.error("removeStore - can't remove value from db. ", e.target.error.message, value);
                reject(e.target.error.message);
            };
        });
    }

    /**
     * 加载数据
     * @param store_name 表名
     * @param target 指定值 根据创建时候的索引来
     *        exp: conditions = {
                    by_name: 'ahhh',
                    by_uid: '10000'
                 }
     * @returns {Promise}
     */
    loadData(store_name, conditions) {
        return new Promise((resolve, reject) => {
            let transaction = this.walletHelper.getTransactionOnly(store_name);
            let request = transaction.objectStore(store_name).openCursor();
            let data = [];
            //用于排序<是降序，>是升序
            const sortBy = p => (a, b) => a[p] < b[p];
            request.onsuccess = e => {
                let cursor = e.target.result;
                if (cursor) {
                    let obj = cursor.value;
                    if(validation.isEmpty(conditions)){
                        data.push(obj);
                    }else{
                        let flag = true;
                        for(let prop in conditions){
                            flag = flag && (obj[prop] == conditions[prop]);
                        }
                        if(flag)
                            data.push(obj);
                    }
                    cursor.continue();
                } else {
                    resolve(data.sort(sortBy("last_modify")));
                }
            };
            request.onerror = (e) => {
                reject(e.target.error.message);
            };
        });
    }
    
    /**
     * 分页获取数据(暂时废弃)
     * @param {*} 表名 
     * @param {*}  起始页
     * @param {*} 结束页
     */
    loadDataByPager(store_name, start, end) {
        return new Promise((resolve, reject) => {
            var transaction = this.walletHelper.getTransactionOnly(store_name);
            transaction.oncomplete = function () {
                console.log("transaction complete");
            };
            transaction.onerror = function (event) {
                reject(event);
            };
        
            var store = transaction.objectStore(store_name);
            var boundKeyRange = IDBKeyRange.bound(start, end, false, false);
            var data = [];
            let request = store.index("inx").openCursor(boundKeyRange);
            request.onsuccess = function () {
                let cursor = this.result;
                if (cursor) {
                    data.push(cursor.value);
                    cursor.continue();
                }else{
                    resolve(data);
                }
            };
            request.onerror = (e) => {
                reject(e.target.error.message);
            };
        });
    }

    backup(store_names = WALLET_BACKUP_STORES) {
        var promises = [];
        for (var store_name of store_names) {
            promises.push(this.loadData(store_name));
        }
        //添加所有存储对象
        return Promise.all(promises).then(results => {
            var obj = {};
            for (let i = 0; i < store_names.length; i++) {
                var store_name = store_names[i];
                if (store_name === "wallet") {
                    var wallet_array = results[i];
                    for (let wallet of wallet_array)
                        wallet.backup_date = new Date().toISOString();
                }
                obj[store_name] = results[i];
            }
            return obj;
        })
    }

    /**
     * 恢复钱包，并且更新
     * @param {String} wallet_name - 钱包名
     * @param {WalletObject} object - 钱包对象
     */
    restore(wallet_name, object) {
        this.setSetting("current_wallet", wallet_name);
        this.currentWalletName = wallet_name;
        let tr = this.walletHelper.getTransactionOnly("wallet");
        let store = tr.objectStore("wallet");
        return IdbHelper.onRequested(store.get(this.currentWalletName)).then(event => {
            var result = event.target.result;
            return this.addStore("wallet", object, 'put');
        });
    }
}

var walletDatabase = (function () {
    var _instance;
    var DB;
    return {
        initInstance: function (chain_id = Apis.instance().chain_id) {
            if (!_instance) {
                DB = new WalletDatabase();
                _instance = {
                    initPromise: DB.init(chain_id),
                    walletDB: () => DB
                };
            }
            return _instance;
        },
        instance: function () {
            if (!_instance) {
                throw new Error("内部数据库实例未初始化");
            }
            return _instance;
        },
        close: function () {
            if (_instance) {
                _instance.walletDB().closeWalletDB();
                _instance.walletDB().closeSettingDB();
            }
            _instance = undefined;
        }
    };
})();
export default walletDatabase;