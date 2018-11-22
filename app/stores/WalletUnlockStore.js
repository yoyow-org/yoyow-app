import alt from "../altInstance";
import BaseStore from "./BaseStore";
import WalletStore from "./WalletStore";
import WalletUnlockActions from "../actions/WalletUnlockActions";
import {GlobalParams, ls, Utils} from "../../lib";

let ss = new ls(GlobalParams.STORAGE_KEY);

class WalletUnlockStore extends BaseStore {
    constructor() {
        super();
        this.bindActions(WalletUnlockActions);
        this.state = this.__initState();
        this.walletLockTimeout = parseInt(ss.get("lockTimeout", 60), 10);
    }

    __initState(){
        return {
            isShow: false,  // 是否显示弹窗
            isShort: true,  // 是否零钱true , 余额 false
            password: '',   // 解锁密码
            descript: null, // 解锁框描述
            fees: null,     // 手续费对象，用于展示
            resolve: null  // 需要解锁保留的回调
        }
    }

    onClose(){
        this.setState(this.__initState());
    }

    onCheckLock({force, isShort, descript ,fees , resolve, reject}){
        if(WalletStore.isLocked(isShort) || force){
            this.setState({ isShow: true, isShort, descript, fees, resolve });
        }else{
            resolve();
        }
    }

    onUnlock(params){
        let _resolve = params.resolve;
        let reject = params.reject;
        let {password, isShort, resolve, fees} = this.state;
        
        if(WalletStore.validatePassword(password, isShort, true)) {
            let lockTimeout = setTimeout(() => {
                WalletStore.lock(isShort);
                clearTimeout(lockTimeout);
            }, this.walletLockTimeout * 1000);
            this.onClose();
            _resolve({resolve, useCsaf: fees ? fees.useCsaf : null});
        }else{
            reject(Utils.formatError(1003));
        }
    }

    onPasswordChange(password){
        this.setState({password});
    }

    onSetUseCsaf(flag){
        let {fees} = this.state;
        fees.useCsaf = flag;
        this.setState({fees});
    }
}

export default alt.createStore(WalletUnlockStore, "WalletUnlockStore");