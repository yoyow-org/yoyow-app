import alt from "../altInstance";
import BaseStore from "./BaseStore";
import {WalletTcomb} from "../../lib/db/TcombStructs";
import {Long} from 'bytebuffer';
import Immutable from "immutable";
import { WalletDatabase, IdbHelper, Utils, FetchWrapper, Validation, ChainApi, FetchApi} from "../../lib";
import PrivateKeyStore from "./PrivateKeyStore";
import CachedSettingStore from "./CachedSettingStore";
import {PrivateKey, key, Aes, AccountUtils, TransactionBuilder, Signature} from "yoyowjs-lib";
import {Apis} from "yoyowjs-ws";
import {cloneDeep} from "lodash";
import PrivateKeyActions from "../actions/PrivateKeyActions";
import WalletUnlockActions from "../actions/WalletUnlockActions";
import WalletActions from "../actions/WalletActions";
import LzString from "lz-string";
import {filter, merge, remove} from "lodash";
import SettingsStore from "./SettingsStore";
import {ls, GlobalParams} from "../../lib/index";

// import secureRandom from 'secure-random';

var aes_private;                //长密码
var aes_short_private;          //短密码
var subscribers = new Set();   //订阅

class WalletStore extends BaseStore {

    constructor() {
        super();
        this.state = this.__getInitState();
        this.bindActions(WalletActions);
        this._export("loadDbData", "getWallet", "isLocked", "validatePassword", "lock", "getPrivateKey", "decryptTcomb_PrivateKey");
    }

    __getInitState() {
        return {
            wallet: null, 
            selectedWallet: {}, // 当前选中钱包（账号管理-当前选择）组件卸载后清空
            accountList: Immutable.List(), 
            bakWallet: [],
            needBack: false, // 创建账号页面，是否需要回退按钮
            pwd: '',
            repwd: '',
            guideInx: SettingsStore.getSetting('createAccountGuide')
        };
    }

    getWallet() {
        let {bakWallet} = this.state;
        let wallet_temp;
        if(bakWallet.length > 0){
            wallet_temp = {
                yoyow_id: bakWallet[9],
                password_pubkey: bakWallet[0],
                encryption_key: bakWallet[2],
                encrypted_active: {
                    label: "active",
                    pubkey: null,
                    encrypted_key: bakWallet[4]
                },
                encrypted_memo: {
                    label: "memo",
                    pubkey: null,
                    encrypted_key: bakWallet[6],
                    encrypted_short_key: bakWallet[7]
                }
            };
            this.setState({keyTip: localStorage.getItem(`keyTip${wallet_temp.yoyow_id}`)});
            return wallet_temp;
        }
        
        let wallet = Validation.isEmpty(this.state.selectedWallet) ? this.state.wallet : this.state.selectedWallet;
        if(wallet) this.setState({keyTip: localStorage.getItem(`keyTip${wallet.yoyow_id}`)});
        return wallet;
    }

    loadDbData() {
        return WalletDatabase.instance().walletDB().getSetting("current_wallet", "default").then(wallet_name => {
            return WalletDatabase.instance().walletDB().loadData("wallet").then(wallets => {
                //载入账号列表
                let accountList = Immutable.List();
                for (let wallet of wallets) {
                    let uid = wallet.yoyow_id;
                    let mark = wallet.mark;
                    accountList = accountList.push({
                        uid, 
                        mark,
                        memo_key: wallet.encrypted_memo.pubkey
                    });
                }
                this.setState({accountList});
                //载入钱包对象
                let wallet = wallets.find(w => {
                    return w.public_name === wallet_name;
                });
                if (wallet) {
                    // 将除字符串或数字之外的任何内容转换回其正确类型
                    wallet.created = new Date(wallet.created);
                    wallet.last_modified = new Date(wallet.last_modified);
                    wallet.backup_date = wallet.backup_date ? new Date(wallet.backup_date) : null;
                    try {
                        WalletTcomb(wallet);
                    } catch (e) {
                        if (__DEBUG__) console.log("WalletStore format error", e);
                        return Promise.reject(e);
                    }
                    this.setState({wallet});
                }
            });
        });
    }

    isLocked(isShort = true) {
        if (!isShort)
            return aes_private ? false : true;
        else
            return aes_short_private ? false : true;
    }

    __getTransaction() {
        var tr = WalletDatabase.instance().walletDB().walletHelper.getTransaction("wallet");
        return tr;
    }

    __setCurrentWallet(public_name) {
        WalletDatabase.instance().walletDB().setSetting("current_wallet", public_name);
    }

    onCreateAccount({accountPwd, shortPwd, mark, unlock, resolve, reject}) {
        let sk = new ls(GlobalParams.STORAGE_KEY);
        let faucetAddress = sk.get("settings_v1").faucet_address;
        if (window && window.location && window.location.protocol === "https:") {
            faucetAddress = faucetAddress.replace(/http:\/\//, "https://");
        }
        let tiemout = setTimeout(() => {
            let keys = {
                owner_private: key.get_random_key(),
                active_private: key.get_random_key(),
                secondary_private: key.get_random_key(),
                memo_private: key.get_random_key(),
            }
            FetchWrapper.post('/api/v1/createAccount', {
                account: {
                    owner_key: keys.owner_private.toPublicKey().toPublicKeyString(),
                    active_key: keys.active_private.toPublicKey().toPublicKeyString(),
                    secondary_key: keys.secondary_private.toPublicKey().toPublicKeyString(),
                    memo_key: keys.memo_private.toPublicKey().toPublicKeyString()
                }
            }, faucetAddress).then(account => {
                let yoyow_id = account + '';//account[0].trx.operations[0][1].uid.toString();
                let password_aes = Aes.fromSeed(accountPwd);
                let password_short_aes = Aes.fromSeed(shortPwd);
    
                let encryption_buffer = key.get_random_key().toBuffer();//resKeys[4].toBuffer();
                //encryption_key是active加密密钥（密码更改时不会更改）
                let encryption_key = password_aes.encryptToHex(encryption_buffer);
                let encryption_short_buffer = key.get_random_key().toBuffer();//resKeys[5].toBuffer();
                //encryption_short_key是secondary加密密钥（密码更改时不会更改）
                let encryption_short_key = password_short_aes.encryptToHex(encryption_short_buffer);
                //如果解锁，local_aes_private将成为全局的aes_private对象
                let local_aes_private = Aes.fromSeed(encryption_buffer);
                let local_short_aes_private = Aes.fromSeed(encryption_short_buffer);
                let owner_key = PrivateKey.fromWif(keys.owner_private.toWif());
                let active_key = PrivateKey.fromWif(keys.active_private.toWif());
                let secondary_key = PrivateKey.fromWif(keys.secondary_private.toWif());
                let memo_key = PrivateKey.fromWif(keys.memo_private.toWif());
                let password_private = PrivateKey.fromSeed(accountPwd);
                let password_pubkey = password_private.toPublicKey().toPublicKeyString();
    
                let public_name = "yoyow" + yoyow_id;
                let encrypted_owner = {
                    label: "owner",
                    pubkey: owner_key.toPublicKey().toPublicKeyString(),
                    encrypted_key: local_aes_private.encryptToHex(owner_key.toBuffer())
                };
                let encrypted_active = {
                    label: "active",
                    pubkey: active_key.toPublicKey().toPublicKeyString(),
                    encrypted_key: local_aes_private.encryptToHex(active_key.toBuffer())
                };
                let encrypted_secondary = {
                    label: "secondary",
                    pubkey: secondary_key.toPublicKey().toPublicKeyString(),
                    encrypted_key: local_short_aes_private.encryptToHex(secondary_key.toBuffer())
                };
                let encrypted_memo = {
                    label: "memo",
                    pubkey: memo_key.toPublicKey().toPublicKeyString(),
                    encrypted_key: local_aes_private.encryptToHex(memo_key.toBuffer()),
                    encrypted_short_key: local_short_aes_private.encryptToHex(memo_key.toBuffer())
                };
    
                let wallet = {
                    mark,
                    public_name,
                    yoyow_id,
                    created: new Date(),
                    last_modified: new Date(),
                    password_pubkey,
                    password_short_pubkey: password_pubkey,
                    encryption_key,
                    encryption_short_key,
                    encrypted_owner,
                    encrypted_active,
                    encrypted_secondary,
                    encrypted_memo,
                    chain_id: Apis.instance().chain_id
                };
    
                var tr = this.__getTransaction();
                let add = IdbHelper.add(tr.objectStore("wallet"), wallet);
                let end = IdbHelper.onTransactionEnd(tr).then(() => {
    
                    this.__setCurrentWallet(public_name);
    
                    let accountList = this.state.accountList;
                    if (filter(accountList.toArray(), a => {return a.uid == yoyow_id}).length == 0) {
                        accountList = accountList.push({uid: yoyow_id, mark: mark, memo_key: memo_key.toPublicKey().toPublicKeyString()});
                    }
                    if (unlock) {
                        aes_private = local_aes_private;
                        aes_short_private = local_short_aes_private;
                    }
    
                    this.setState({wallet, accountList});
                    resolve(yoyow_id);
                    
                });
            }).catch(err => {
                reject(err);
            });
        clearTimeout(tiemout);
        }, 360);
    }

    /**
     * 解密私钥
     */
    decryptTcomb_PrivateKey(private_key_tcomb) {
        if (!private_key_tcomb) return null;
        var private_key_hex = null;
        if (private_key_tcomb.label === "owner" || private_key_tcomb.label == "active") {
            if (!aes_private) throw new Error("wallet locked balance");
            private_key_hex = aes_private.decryptHex(private_key_tcomb.encrypted_key);
        }
        else if (private_key_tcomb.label === "secondary") {
            if (!aes_short_private) throw new Error("wallet locked prepaid");
            private_key_hex = aes_short_private.decryptHex(private_key_tcomb.encrypted_key);
        }
        else if (private_key_tcomb.label === "memo") {
            if (aes_short_private) {
                private_key_hex = aes_short_private.decryptHex(private_key_tcomb.encrypted_short_key);
            } else if (aes_private) {
                private_key_hex = aes_private.decryptHex(private_key_tcomb.encrypted_key);
            } else {
                throw new Error("wallet locked");
            }
        }

        return PrivateKey.fromBuffer(new Buffer(private_key_hex, 'hex'));
    }

    /**
     * 解锁私钥
     * @param {Number|String} key_type - 密钥类型 0/owner 1/active , 2/secondary , 3/memo
     * @returns {Object} privateKey
     */
    getPrivateKey(key_type){
        let key = null;
        let wallet = this.getWallet();
        let keyEnum = { 'owner':0, 'active': 1, 'secondary': 2, 'memo': 3 };
        if(Validation.isString(key_type)) key_type = keyEnum[key_type];
        if(!wallet) return key;
        if(key_type === 0){
            key = Utils.encodeBackOwner(wallet.yoyow_id + '', this.decryptTcomb_PrivateKey(wallet.encrypted_owner).toWif());
        }else if(key_type === 1){
            key = this.decryptTcomb_PrivateKey(wallet.encrypted_active);
        }else if(key_type === 2){
            key = this.decryptTcomb_PrivateKey(wallet.encrypted_secondary);
        }else if(key_type === 3){
            key = this.decryptTcomb_PrivateKey(wallet.encrypted_memo);
        }
        return key;
    }
    /**
     * 验证密码
     * @param {String} password 
     * @param {Boolean} isShort 是否是验证的短密码，默认为true
     * @param {Boolean} unlock 是否验证成功后直接解锁，默认为false
     * @returns {boolean}
     */
    validatePassword(password, isShort = true, unlock = false) {
        let wallet = this.getWallet();
        try {
            var password_private = PrivateKey.fromSeed(password);
            var password_pubkey = password_private.toPublicKey().toPublicKeyString();

            if (!isShort) {
                if (wallet.password_pubkey !== password_pubkey) return false;
            }
            else {
                if (wallet.password_short_pubkey !== password_pubkey) return false;
            }
            
            if (unlock) {
                var password_aes = Aes.fromSeed(password);
                var encryption_plainbuffer = null;
                if (!isShort) {
                    encryption_plainbuffer = password_aes.decryptHexToBuffer(wallet.encryption_key);
                    aes_private = Aes.fromSeed(encryption_plainbuffer);
                    
                } else {
                    encryption_plainbuffer = password_aes.decryptHexToBuffer(wallet.encryption_short_key);
                    aes_short_private = Aes.fromSeed(encryption_plainbuffer);
                    
                }
            }
            return true;
        } catch (e) {
            if(__DEBUG__) console.error(e);
            return false;
        }
    }

    /**
     * 锁定钱包 
     * @param {Boolean} isShort - 是否零钱 true 余额 false
     */
    lock(isShort){
        if(isShort) 
            aes_short_private = null;
        else 
            aes_private = null;
    }

    /**
     * 锁定钱包零钱和余额
     */
    lockall(){
        aes_short_private = null;
        aes_private = null;
    }

    /**
     * 账号切换
     * @param {Number|String} uid - 用户 yoyow id 
     */
    onChangeAccount({uid, resolve, reject}) {
        this.__changeAccount(uid, resolve, reject);
    }

    __changeAccount(uid, resolve, reject){
        let walletName = "yoyow" + uid;
        let pro = WalletDatabase.instance().walletDB().getStore("wallet", walletName).then(wallet => {
            if (wallet == undefined) reject(Utils.formatError(1004));
            PrivateKeyActions.cleanKey();
            wallet.created = new Date(wallet.created);
            wallet.last_modified = new Date(wallet.last_modified);
            wallet.backup_date = wallet.backup_date ? new Date(wallet.backup_date) : null;
            WalletDatabase.instance().walletDB().setSetting("current_wallet", walletName);
            this.setState({
                keyTip: localStorage.getItem(`keyTip${uid}`),
                wallet
            });
            this.lockall();
            this.__notification();
            if (__DEBUG__) console.log('切换账号：', uid);
            return PrivateKeyActions.loadDbData();
        });
        if (resolve) resolve(pro);
    }

    /**
     * 解压缩二维码导入账号信息
     * @param {String} backup - 备份压缩字符串
     */
    onDecompress({backup, resolve, reject}){
        try{
            if(backup.indexOf('YYW') !== 0)
                return reject(Utils.formatError(1013));
            let decStr = backup;
            let decBox = [53,53,64,64,64,64,64,64,13,0];
            let bakBox = [];
            let cusor = 0;
            for(let d of decBox){
                if(d == 0){
                    bakBox.push(decStr.substring(cusor));
                }else{
                    if(d == 64){
                        bakBox.push(Utils.base64ToHex(decStr.substring(cusor, cusor + d)));
                    }else{
                        bakBox.push(decStr.substring(cusor, cusor + d));
                    }
                }
                cusor += d ;
            }
            
            // 带有备注的情况
            if(bakBox[9].indexOf('imark') > 0){
                let uid = bakBox[9].substring(0, bakBox[9].indexOf('imark'));
                let mark = bakBox[9].substring(uid.length + 5, bakBox[9].length);
                // 带有owner key的情况
                if(uid.length > 64){
                    bakBox[9] = uid.substring(0, uid.length - 64);
                    bakBox[10] = Utils.base64ToHex(uid.substring(bakBox[9].length, uid.length));
                }else{
                    bakBox[9] = uid;
                    bakBox[10] = undefined;
                }
                bakBox[11] = Utils.base64ToUtf8(mark);
            }else if(bakBox[9].length > 64){
                let last = bakBox[9];
                bakBox[9] = last.substring(0, last.length - 64);
                bakBox[10] = Utils.base64ToHex(last.substring(bakBox[9].length, last.length));
            }

            let {accountList} = this.state;
            // TODO: 设置导入账号之前，验证当前账号（有效）是否存在，若存在则提示
            ChainApi.getAccount(bakBox[9]).then(cur => {
                if(accountList.size > 0 && accountList.find(a => {return a.uid == bakBox[9]})){
                    WalletDatabase.instance().walletDB().loadData("wallet", {public_name: `yoyow${bakBox[9]}`}).then(dbWallet => {
                        if(cur.memo_key == dbWallet[0].encrypted_memo.pubkey){
                            reject(Utils.formatError(1014));
                        }else{
                            this.setState({bakWallet: bakBox});
                            resolve(bakBox);
                        }
                    }).catch(err => {
                        reject(Utils.formatError(err));
                    })
                }else{
                    this.setState({bakWallet: bakBox});
                    resolve(bakBox);
                }
            }).catch(err => {
                reject(Utils.formatError(1013));
            })
        }catch(e){
            reject(Utils.formatError(1013));
        }
    }

    /**
     * 恢复账号
     */
    onRestore({mark, resolve, reject}){
       let {bakWallet} = this.state;
       let yoyow_id = bakWallet[9];
       let public_name = `yoyow${yoyow_id}`;
       ChainApi.getAccount(yoyow_id).then(acc => {
           if(acc.memo_key != this.getPrivateKey('memo').toPublicKey().toPublicKeyString()){
               reject(Utils.formatError('1006'));
               return;
           }
            let wallet_object = {
                mark: (!Validation.isEmpty(bakWallet[11]) && Validation.isEmpty(mark)) ? bakWallet[11] : mark,
                public_name,
                yoyow_id,
                created: new Date(acc.create_time),
                last_modified: new Date(acc.last_update_time),
                password_pubkey: bakWallet[0],
                password_short_pubkey: bakWallet[1],
                encryption_key: bakWallet[2],
                encryption_short_key: bakWallet[3],
                encrypted_active: {
                    label: "active",
                    pubkey: acc.active.key_auths[0][0],
                    encrypted_key: bakWallet[4]
                },
                encrypted_secondary: {
                    label: "secondary",
                    pubkey: acc.secondary.key_auths[0][0],
                    encrypted_key: bakWallet[5]
                },
                encrypted_memo: {
                    label: "memo",
                    pubkey: acc.memo_key,
                    encrypted_key: bakWallet[6],
                    encrypted_short_key: bakWallet[7]
                },
                chain_id: Apis.instance().chain_id
            };

            if(bakWallet[10]){
                wallet_object.encrypted_owner = {
                    label: "owner",
                    pubkey: acc.owner.key_auths[0][0],
                    encrypted_key: bakWallet[10]
                }
            }

            WalletTcomb(wallet_object);

            WalletDatabase.instance().walletDB().restore(public_name, wallet_object).then(() => {
                Promise.all([PrivateKeyActions.loadDbData(), this.loadDbData()]).then(() => {
                    let accountList = this.state.accountList;
                    if(filter(accountList.toArray(), a => {return a.uid == yoyow_id}).length == 0){
                        accountList = accountList.push({uid: yoyow_id, mark: mark, memo_key: acc.memo_key});
                    }
                    this.__fetchAccountsStatistics();
                    FetchApi.checkRestore(yoyow_id);
                    this.setState({wallet: wallet_object, accountList});
                    resolve(wallet_object);
                }).catch(err => reject(Utils.formatError(err)));
            }).catch(err => reject(Utils.formatError(err)));
       }).catch(err => reject(Utils.formatError(err)));
    }

    /**
     * 清空导入备份的钱包对象
     */
    onClearBackWallet(){
        this.__clearBackWallet();
    }

    __clearBackWallet(){
        this.setState({bakWallet: []});
    }

    /**
     * 获取本地钱包列表账号的资产数据
     */
    onFetchAccountListStatistics({autoChange, resolve, reject}){
        this.__fetchAccountsStatistics(autoChange).then(accountList => {
            resolve(accountList);
        }).catch(err => {
            reject(err);
        })
    }

    __fetchAccountsStatistics(autoChange){
        return new Promise((resolve, reject) => {
            let {wallet} = this.state;
            let {accountList} = this.state;
            let uids = [];
            accountList.forEach(i => {
                uids.push(i.uid);
            })
            ChainApi.getAccountsByUids(uids).then(res => {

                let _sortAccounts = accountList => {
                    let validList = accountList.filter(w => { return !w.is_trash });
                    validList = validList.sort((w1, w2) => {
                        return wallet.yoyow_id == w1.uid ? -1 : wallet.yoyow_id == w2.uid ? 1 : (w2.balance + w2.prepaid) - (w1.balance + w1.prepaid);
                    });
                    let invalidList = accountList.filter(w => { return w.is_trash });
                    invalidList = invalidList.sort((w1, w2) => {
                        return (w2.balance + w2.prepaid) - (w1.balance + w1.prepaid)
                    });
                    return validList.concat(invalidList);
                }

                res.forEach(r => {
                    let cusor = accountList.find(a => { return a.uid == r.uid });
                    cusor.is_trash = cusor.memo_key != r.pubkey;
                    cusor = merge(cusor, r);
                });

                // 排序依据 当前使用 > 未失效优先 > 余额从大到小排序
                accountList = _sortAccounts(accountList);
                this.setState({accountList});
                
                // 当前账号失效 并且 账号列表中存在未失效账号
                let isValidAccounts = accountList.filter(w => { return !w.is_trash });
                if(autoChange && isValidAccounts.size > 0 && accountList.find(w => {return w.uid == wallet.yoyow_id }).is_trash){
                    this.__changeAccount(isValidAccounts.get(0).uid, p => {
                        p.then(() => {
                            accountList = _sortAccounts(accountList);
                            this.setState({accountList});
                            resolve(accountList);
                        }).catch(err => {
                            if(__DEBUG__) console.log('resort and change account error ',err);
                            reject(Utils.formatError(err));    
                        });
                    }, err => {
                        if(__DEBUG__) console.log(err);
                        reject(Utils.formatError(err));
                    });
                }else{
                    resolve(accountList);
                }
            }).catch(err => {
                if(__DEBUG__) console.log(err);
                reject(Utils.formatError(err));
            });
        });
    }

    /**
     * 选择临时使用的账号
     * @param {Number|String} uid 
     */
    selectAccount({uid, resolve, reject}){
        WalletDatabase.instance().walletDB().getStore('wallet', `yoyow${uid}`).then(selectedWallet => {
            this.setState({selectedWallet});
            resolve();
        });
    }

    /**
     * 删除账号
     * @param {Number|String} uid - 账号 uid
     */
    onDeleteAccount({uid, resolve, reject}){
        let {accountList} = this.state;
        let nextWallet = null;
        WalletDatabase.instance().walletDB().loadData("wallet").then(wallets => {
            let target = wallets.find(w => { return w.yoyow_id == uid })
            WalletDatabase.instance().walletDB().removeStore('wallet', target.public_name).then(() => {
                let accOfList = accountList.find(a => { return a.uid == uid });
                accountList = accountList.remove(accountList.indexOf(accOfList));
                let validList = accountList.filter(w => { return !w.is_trash });
                if(validList.size > 0){
                    let nextUid = validList.toArray()[0].uid;
                    this.__setCurrentWallet(`yoyow${nextUid}`);
                    nextWallet = wallets.find(w => { return w.yoyow_id == nextUid });
                }
                this.setState({accountList, wallet: nextWallet});
                resolve(validList.size > 0);
            })
        });
    }

    /**
     * 更新传入的钱包对象
     * @param {WalletObject} wallet - 本地钱包对象
     */
    onUpdateAccount({wallet, resolve, reject}){
        WalletDatabase.instance().walletDB().addStore('wallet', wallet, 'put').then(() => {
            let {accountList} = this.state;
            accountList.find(a => { return a.uid == wallet.yoyow_id; }).mark = wallet.mark;
            this.setState({selectedWallet: wallet});
            if(wallet.yoyow_id == this.state.wallet.yoyow_id) this.setState({wallet});
            resolve();
        }).catch(err => {
            reject(err);
        })
    }

    /**
     * 清空选择的账号信息
     */
    onClearSelected(){
        this.setState({ selectedWallet: {} });
        this.lockall();
    }

    /**
     * 设置创建账号页面是否需要返回按钮
     * @param {Boolean} flag 
     */
    onSetNeedBack(flag){
        this.setState({needBack: flag ? true : false});
    }

    /**
     * 创建账号导航索引自增
     */
    onGuideNext(guideInx){
        this.setState({guideInx});
    }

    /**
     * 根据所选账号生成导入字符串并压缩
     * TODO: 采用方式为将加密过后都encrypted key 压缩成base64
     */
    onGenerateQRString({resolve, reject}){
        let {selectedWallet} = this.state;
        let keysStr = '';
        if(!Validation.isEmpty(selectedWallet)){
            keysStr = selectedWallet.password_pubkey
                        +selectedWallet.password_short_pubkey 
                        +Utils.hexToBase64(selectedWallet.encryption_key)
                        +Utils.hexToBase64(selectedWallet.encryption_short_key)
                        +Utils.hexToBase64(selectedWallet.encrypted_active.encrypted_key)
                        +Utils.hexToBase64(selectedWallet.encrypted_secondary.encrypted_key)
                        +Utils.hexToBase64(selectedWallet.encrypted_memo.encrypted_key)
                        +Utils.hexToBase64(selectedWallet.encrypted_memo.encrypted_short_key)
                        +Date.now()
                        +selectedWallet.yoyow_id;
            if(selectedWallet.encrypted_owner) keysStr += Utils.hexToBase64(selectedWallet.encrypted_owner.encrypted_key);
            if(!Validation.isEmpty(selectedWallet.mark)) keysStr += 'imark' + Utils.utf8ToBase64(selectedWallet.mark);
        }
        resolve(keysStr);
    }

    /**
     * 检查密码是否正确
     * @param {String} pwd - 新密码
     */
    onCheckPassword({pwd, resolve, reject}){
        let valid_password = this.validatePassword(pwd, false);
        let valid_short_password = this.validatePassword(pwd);
        if(valid_password && valid_short_password){
            resolve();
        }else if(!valid_password && !valid_password){
            reject(Utils.formatError(1003));
        }else{
            // TODO: 由于pc钱包上的余额密码和零钱密码设置了不一样，导致修改app中的账号密码时候，无法正确解开另一个权限密钥
            // TODO: 此时采用到方式为提示用户自行在pc钱包设置
            reject(Utils.formatError(1007));
        }
    }

    /**
     * 执行修改密码
     * @param {String} old - 原密码
     * @param {String} pwd - 新密码
     */
    onChangePassword({old, pwd, resolve, reject}){
        let wallet = this.getWallet();
        // 旧的密码AES
        let old_password_aes = Aes.fromSeed(old);
        // 新的密码AES
        let new_password_aes = Aes.fromSeed(pwd);
        // 获取私钥AES种子
        let encryption_buffer = old_password_aes.decryptHexToBuffer(wallet.encryption_key);
        let encryption_short_buffer = old_password_aes.decryptHexToBuffer(wallet.encryption_short_key);
        // 获取新的password_pubkey 不区分余额和零钱
        let password_pubkey = PrivateKey.fromSeed(pwd).toPublicKey().toPublicKeyString();
        // 用新的密码AES加密私钥AES种子
        wallet.encryption_key = new_password_aes.encryptToHex(encryption_buffer);
        wallet.encryption_short_key = new_password_aes.encryptToHex(encryption_short_buffer);
        // 赋值新到密码验证公钥
        wallet.password_pubkey = password_pubkey;
        wallet.password_short_pubkey = password_pubkey;
        this.onUpdateAccount({wallet, resolve, reject});
    }

    /**
     * 设置密码（创建账号用）
     * @param {String} pwd - 密码
     * @param {String} repwd - 重复密码
     */
    onSetPassword({pwd, repwd}){
        this.setState({pwd, repwd});
    }

    /**
     * 清空设置的密码
     */
    onClearPassword(){
        this.setState({pwd: '', repwd: ''});
    }

    /**
     * 验证账号是否失效
     * @param {Number|String} uid - 账号id
     * @param {String} memo_key - 备注公钥
     */
    onCheckAccountValid({uid, memo_key, resolve, reject}){
        ChainApi.getAccount(uid).then( account => {
            resolve(memo_key == account.memo_key);
        }).catch(err => {
            reject(err);
        })
    }

    /**
     * 添加订阅 - walletStore需要通知点时候，将通知所有的订阅，例 切换账号情况
     * 组件挂载的时候 添加订阅，组件卸载的时候 删除订阅
     * @param {Function} cb - 回调函数
     */
    onAddSubscribe({cb}){
        if(!subscribers.has(cb) && Validation.isFunction(cb))
            subscribers.add(cb);
    }

    /**
     * 删除订阅
     * @param {Function} cb - 回调函数
     */
    onRemoveSubscribe({cb}){
        if(subscribers.has(cb) && Validation.isFunction(cb))
            subscribers.delete(cb);
    }

    /**
     * 通知订阅
     */
    __notification(){
        if(subscribers.size > 0){
            subscribers.forEach(cb => cb());
        }
    }

    onSetViewKeyTip(uid){
        localStorage.setItem(`keyTip${uid}`, true)
    }
}

export default alt.createStore(WalletStore, "WalletStore");