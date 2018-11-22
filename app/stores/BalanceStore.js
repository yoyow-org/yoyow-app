import BaseStore from "./BaseStore";
import alt from "../altInstance";
import BalancesActions from "../actions/BalancesActions";
import WalletStore from "./WalletStore";
import Apis from "../../lib/api/ChainApi";
import walletDatabase from "../../lib/db/WalletDatabase";
class BalanceStore extends BaseStore {
    constructor() {
        super();
        this.state = {
            curAccountInfo: {},
            core_balance: "",
            prepaid_balance: 0,
            csaf_balance: "",
            walletName: "",
            accountInfoList: [],
            fees: {
                with_csaf_fees:0,
                min_fees:0
            },
            max_csaf_limit: "",
            csaf_accumulate: "",
            csaf_collect: "",
            max_accoumulate_csaf: "",
            transferBalance: true,
            receiveInx:0,
            assetId:0,//用于二维码存储的资产id
            receiveAmount: "",
            receiveMemo: "",
            receiveSymbol: "YOYO",
            toAccount: "",
            canMemo: true,
            tokenInfo:null,
            transferHeadTitle:["$YOYO","balance.transfer.title"]
        }
        this.bindActions(BalancesActions);
    }

    onGetChainAccountInfo({uid, resolve, reject}) {
        Apis.getAccount(uid).then((res) => {
            resolve(res)
        }).catch((err) => {
            reject(err)
        })
    }

    onGetAccountInfo({resolve}) {
        let walInfo = WalletStore.getState().wallet?WalletStore.getState().wallet:""
        this.setState({
            curAccountInfo: WalletStore.getState(),
            walletName:walInfo==""?"": walInfo.mark
        });

        resolve(walInfo)
    }

    onGetBalance({uid, resolve, reject}) {
        Apis.getAssetsByUid(uid).then((res) => {
            this.setState({
                core_balance: res.core_balance,
                prepaid_balance: res.prepaid_balance,
                csaf_balance: res.csaf_balance,
                max_csaf_limit: res.max_csaf_limit,
                csaf_accumulate: res.csaf_accumulate,
                csaf_collect:res.csaf_collect,
                max_accoumulate_csaf: res.max_accoumulate_csaf
            })

            resolve({core_balance: res.core_balance,
                prepaid_balance: res.prepaid_balance,
                csaf_balance: res.csaf_balance,
                max_csaf_limit: res.max_csaf_limit,
                csaf_accumulate: res.csaf_accumulate,
                csaf_collect: res.csaf_collect,
                max_accoumulate_csaf: res.max_accoumulate_csaf})
        }).catch((err) => {
            reject(err)
        })
    }

    onGetIntegralByUid({uid, resolve, reject}) {
        Apis.getAssetsByUid(uid).then((res) => {
            resolve({
                csaf_balance: res.csaf_balance,
                max_csaf_limit: res.max_csaf_limit,
                csaf_collect: res.csaf_collect
            })

        }).catch((err) => {
            reject(err)
        })
    }

    onGetAccountInfoList({resolve, reject}) {
        let accountInfoList = [];
        let curID = WalletStore.getState().wallet.yoyow_id;
        let list = WalletStore.getState().accountList._tail.array;
        list.map((item, i) => {
            Apis.getAssetsByUid(item.uid).then(res => {
                if (curID != item.uid) {
                    accountInfoList.push({
                        yoyow_id: item.uid,
                        total: res.core_balance + res.prepaid_balance,
                        walletName: item.mark
                    })
                }
                this.setState({
                    accountInfoList: accountInfoList
                })
                let compare = (obj1, obj2) => {
                    var val1 = obj1.total;
                    var val2 = obj2.total;
                    if (val1 < val2) {
                        return 1;
                    } else if (val1 > val2) {
                        return -1;
                    } else {
                        return 0;
                    }
                }
                accountInfoList.sort(compare);
                resolve(accountInfoList)
            }).catch((err) => {
                reject(err)
            })
        });
    }

    onGetFees({to_account, amount, memo, type, useBalance, useCsaf, resolve, reject}) {
        let pay_uid = WalletStore.getState().wallet.yoyow_id;
        let {tokenInfo}=this.state;
        Apis.buildTransferData(to_account, amount, memo, type,tokenInfo).then(res => {
            let opData = res.op_data
            Apis.__processTransaction("transfer", opData, pay_uid, useBalance, useCsaf, "", false).then(res => {
                this.setState({
                    fees: res,
                })
                resolve(res)
            }).catch((err) => {
                reject(err)
            })

        })
    }

    onHandleTransfer({to_account, amount, memo, type, useBalance, useCsaf, broadcast, resolve, reject}) {
        let {tokenInfo}=this.state;
        Apis.buildTransferData(to_account, amount, memo, type,tokenInfo).then(res => {
            let opData = res.op_data;
            let pay_uid = WalletStore.getState().wallet.yoyow_id;
            let keyType;
            if (type == "toPrepaid" || type == "fromBalance" || type == "asset") {
                keyType = "active";
            } else if (type == "toBalance" || type == "fromPrepaid") {
                keyType = "secondary";
            }
            let priKey = WalletStore.getPrivateKey(keyType);
            Apis.handleTransfer("transfer", opData, pay_uid, useBalance, useCsaf, priKey, true).then(res => {
                resolve(res)
            }).catch(erro => {
                reject(erro)
            })
        })
    }

    onGetFeesForCsaf({to_account, amount, memo, type, useBalance, useCsaf, resolve, reject}) {
        let pay_uid = WalletStore.getState().wallet.yoyow_id;
        Apis.buildCsafCollectData(to_account, amount).then(res => {
            let opData = res;
            Apis.__processTransaction("csaf_collect", opData, pay_uid, null, null, "", false).then(res => {
                this.setState({
                    fees: res,
                })
                resolve(res)
            }).catch((err) => {
                reject(err)
            })

        }).catch((err) => {
            reject(err)
        })
    }

    onHandleCsafCollect({to_account, amount, useBalance, useCsaf, resolve, reject}) {
        let keyType = useBalance ? "secondary" : "active";

        let priKey = WalletStore.getPrivateKey(keyType);
        Apis.processCsafCollect(to_account, amount, useBalance, priKey, useCsaf).then(res => {
            resolve(res)
        }).catch((err) => {
            reject(err)
        })
    }

    onHandleFundsType(type) {
        this.setState({
            transferBalance: type
        });
    }
    
    onSetTokenInfo(tokenInfo){
        this.setState({
            tokenInfo:tokenInfo
        });
    }

    /**
     * 设置资产id，用于转账二维码存储
     * @param {*} val 
     */
    onSetAssetId(val){
        this.setState({
            assetId: val
        })
    }

    onSetAmount(num) {
        this.setState({
            receiveAmount: num
        })
    }

    onSetAccount(uid) {
        this.setState({
            toAccount: uid
        })
    }

    onSetMemo(memoText) {
        this.setState({
            receiveMemo: memoText
        })
    }

    onSetSymbol(symbolText) {
        this.setState({
            receiveSymbol: symbolText
        })
    }

    onSetCanMemo(bool) {
        this.setState({
            canMemo: bool
        })
    }
    
    /**
     * 设置头部标题
     * @param {*} val 
     */
    onSetHeadTitle(val){ 
        this.setState({
            transferHeadTitle:val
        })
    }

    /**
     * 获取二维码收款信息
     * @param {*} param0 
     */
    onGetQRReceive({assetId,resolve,reject}){
        let uid= WalletStore.getState().wallet.yoyow_id;
        walletDatabase.instance().walletDB().loadData('qrreceive', {
            uid: uid,
            assetId: assetId
        }).then(res => {
            if(res.length>0){
                this.setState({
                    receiveInx:res[0].inx,
                    assetId:assetId,
                    receiveAmount:res[0].receiveAmount,
                    receiveMemo: res[0].receiveMemo,
                    receiveSymbol: res[0].receiveSymbol,
                });
            }else{
                this.setState({
                    receiveInx:0,
                    assetId:0,
                    receiveAmount:0,
                    receiveMemo: "",
                    receiveSymbol: "YOYO",
                });
            }
            resolve();
        }).catch(err => {
            this.setState({
                receiveInx:0,
                assetId:0,
                receiveAmount:0,
                receiveMemo: "",
                receiveSymbol: "YOYO",
            });
            reject(err);
        });
    }

    /**
     * 添加二维码收款信息
     */
    onAddQRReceive({qrReceive,resolve,reject}){
        qrReceive.uid=WalletStore.getState().wallet.yoyow_id;
        walletDatabase.instance().walletDB().addStore('qrreceive', qrReceive, "add")
        .then((res) => {
            this.setState({
                receiveInx:res.inx,
                assetId:res.assetId,
                receiveAmount:res.receiveAmount,
                receiveMemo: res.receiveMemo,
                receiveSymbol: res.receiveSymbol,
            });
            resolve();
        })
        .catch(err => {
            reject(err);
        });
    }

    /**
     * 删除二维码收款信息
     */
    onDelQRReceive({inx,resolve,reject}){
        walletDatabase.instance().walletDB().removeStore('qrreceive', inx)
        .then(res => {
            resolve();
        }).catch(err => {
            reject(err);
        });
    }
}

export default alt.createStore(BalanceStore, "BalanceStore")