import alt from "../altInstance";
import BaseStore from "./BaseStore";
import PlatformActions from "../actions/PlatformActions";
import {ChainApi, Validation, WalletDatabase, Utils, GlobalParams, FetchWrapper} from "../../lib";
import WalletStore from "./WalletStore";
import {Apis} from "yoyowjs-ws";
import {merge} from "lodash";

class PlatformStore extends BaseStore{
    constructor(){
        super();
        this.bindActions(PlatformActions);
        this.state = {
            headPid: null,
            source: [],
            platforms: [],
            indexplatforms:[],
            searchHistory: [],
            platform: {},
            setKeywords: ''
        };
    }

    __getPlatforms(headPid, list = []){
        return ChainApi.getPlatforms(headPid, 100).then(res => {
            list = list.concat(res);
            return Apis.instance().db_api().exec("get_platform_count", []).then(count => {
                if(list.length < count){
                    return this.__getPlatforms(list.pop().owner, list).then(p_res => {
                        return p_res;
                    });
                }else{
                    return list;
                }
            });
        });
    }

    __packPlatform(){
        let {headPid} = this.state;
        let yoyow_id = WalletStore.getWallet().yoyow_id;
        return this.__getPlatforms(null).then(p_res => {
            return ChainApi.getAccount(yoyow_id).then(account => {
                let platforms = [];
                let unauthArr = [];
                let auth = JSON.stringify(account.secondary.account_uid_auths);
                for(let p of p_res){
                    p.is_auth = auth.indexOf(p.owner) >= 0;
                    if(p.is_auth) platforms.push(p);
                    else unauthArr.push(p);
                }
                return platforms.concat(unauthArr);
            }).catch(err => {
                return Promise.reject(err);
            })
        }).catch(err => {
            return Promise.reject(err);
        })
    }

    __filterWithKeywords(source, keywords){
        if(Validation.isEmpty(keywords)){
            return source;
        }else{
            return source.filter(p => {
                return p.name.toLowerCase().indexOf(keywords.toLowerCase()) >= 0;
            });
        }
    }

    onGetPlatforms({resolve, reject}){
        this.__packPlatform().then(source => {
            let {keywords} = this.state;
            let platforms = this.__filterWithKeywords(source, keywords);
            this.setState({
                source, 
                platforms
            });
            resolve();
        }).catch(err => {
            reject(err);
        })
    }


    onGetPlatformsForIndex({resolve, reject}){
        this.__packPlatform().then(source => {
            let indexplatforms = this.__filterWithKeywords(source, "");
            this.setState({
                source, 
                indexplatforms
            });
            resolve(indexplatforms);
        }).catch(err => {
            reject(err);
        })
    }

    onClearSignStr(){
        this.setState({platform: {}});
    }

    onCheckSign({signStr, resolve, reject}){
        try{
            let signObj = JSON.parse(signStr);
            ChainApi.checkAuth(signObj.platform, signObj.time, signObj.sign).then(platform => {
                platform.state = signObj.state;
                this.setState({platform});
                resolve(platform);
            }).catch(err => {
                reject(Utils.formatError(1011));
            })
        }catch(e){
            reject(Utils.formatError(1011));
        }
    }

    onDoAuthority({uid, resolve, reject}){
        // 默认调用授权之前当前账号已解锁
        let {platform} = this.state;
        let priKey = WalletStore.getPrivateKey('active');
        ChainApi.doAuthority(uid, platform.owner, true, true, priKey, true).then(res => {
            resolve(res);
        }).catch(err => {
            reject(err);
        });
    }

    onCancelAuthority({pid, useCsaf, broadcast, resolve, reject}){
        let yoyow_id = WalletStore.getWallet().yoyow_id;
        let priKey = broadcast ? WalletStore.getPrivateKey('active') : null;
        ChainApi.cancelAuthority(yoyow_id, pid, true, useCsaf, priKey, broadcast).then(res => {
            resolve(res);
        }).catch(err => {
            reject(err);
        });
    }

    onSendAuthority({resolve, reject}){
        // TODO: 授权完成将授权结果发送给平台，平台通过中间件来验证
        // TODO: 定义平台extra_data 中需有字段 authLogin 做授权登录的提交位置
        let {platform} = this.state;
        let wallet = WalletStore.getWallet();
        let priKey = WalletStore.getPrivateKey('active');

        let result = merge({
            state: platform.state
        }, ChainApi.signAuth(wallet.yoyow_id, priKey));

        let loginUrl = platform.extra_data;
        try{
            loginUrl = JSON.parse(loginUrl).login;
        }catch(e){
            loginUrl = '';
        }
        FetchWrapper.post('', result, loginUrl).then(res => {
            resolve();
        }).catch(err => {
            reject(Utils.formatError(1012));
        })
    }

    onSetKeywords(keywords){
        this.setState({ keywords });
    }

    onCheckAuthority({uid, resolve, reject}){
        ChainApi.getAccount(uid).then(account => {
            let {platform} = this.state;
            resolve(JSON.stringify(account.secondary.account_uid_auths).indexOf(platform.owner) >= 0 && !Validation.isEmpty(platform));
        }).catch(err => {
            reject(err);
        })
    }

    onSelectHistory(){
        let master = WalletStore.getWallet().yoyow_id;
        this.__getHistoryDB().loadData('historys', { master }).then(searchHistory => {
            searchHistory = searchHistory.sort((h1, h2) => {
                return h2.last_modify - h1.last_modify;
            });
            this.setState({searchHistory});
        })
    }

    onAddHistory(keyword){
        let wdb = this.__getHistoryDB();
        let master = WalletStore.getWallet().yoyow_id;
        let history = { master, keyword };
        wdb.loadData('historys', history).then(historys => {
            if(historys[0]){
                history.inx = historys[0].inx;
            }
            history.last_modify = Date.now() ;
            wdb.addStore('historys', history, historys[0] ? 'put' : 'add').then(res => {
                this.onSelectHistory();
            });
        })
    }

    onDeleteHistory({inx}){
        this.__getHistoryDB().removeStore('historys', inx).then(res => {
            this.onSelectHistory();
        })
    }

    __getHistoryDB(){
        return WalletDatabase.instance().walletDB()
    }

    /**
     * 设置平台
     * @param {*} platform 
     */
    onSetPlatform(platform){
        this.setState({platform:platform});
    }

    /**
     * ios跳转
     * @param {*} data 
     */
    onIosJump(data){
        let _this=this;
        appAvailability.check(
            data.urlscheme,
            function() {  // 检测到相关app
                startApp.set(data.urlscheme).start();
            },
            function() {  //没检测到相关app
                _this.onH5Jump(data.h5url);
            }
        );
    }

    /**
     * 安卓跳转
     * @param {*} data 
     */
    onAndroidJump(data){
        let _this=this;
        appAvailability.check(
            data.packagename, 
            function() {  // 检测到相关app
                startApp.set({
                    "action": "ACTION_VIEW",
                    "uri": data.urlscheme
                }).start();
            },
            function() {  //没检测到相关app
                _this.onH5Jump(data.h5url);
            }
        );
    }

    /**
     * H5跳转
     * @param {*} url 
     */
    onH5Jump(url){
        if(url.length>0 && window.cordova){
            if(url.indexOf("http")==0 || url.indexOf("https")==0){
                if (!cordova.InAppBrowser) {
                    return false;
                }
                cordova.InAppBrowser.open(url
                    , '_system'
                    , 'location=no,toolbar=yes,toolbarposition=top,closebuttoncaption=关闭');
            }else{
                TipsActions.error(Utils.formatError(1020));
            }
        }
    }
}

export default alt.createStore(PlatformStore, 'PlatformStore');