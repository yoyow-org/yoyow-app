import BaseStore from "./BaseStore";
import alt from "../altInstance";
import Utils from "../../lib/utils/Utils";
import ChainApi from "../../lib/api/ChainApi";
import TokensActions from "../actions/TokensAction";
import WalletStore from "./WalletStore";
import walletDatabase from "../../lib/db/WalletDatabase";
import {filter} from "lodash";

class TokensStore extends BaseStore{
    constructor() {
        super();
        this.state = {
            tokens:[],
            createFee:[],
            issueFee:[],
            tokenVal:0,
            createToken:[],
            localToken:[],
            keyword:""
        };
        this.bindActions(TokensActions);
    }

    /**
     * 获取创建资产列表
     * @param {*} param0 
     */
    onGetCreateTokensList({resolve,reject}){
        let uuid = WalletStore.getWallet().yoyow_id;
        ChainApi.fetchAccountBalances(uuid).then(res=>{
            let tokenList=filter(res, a => { return a.issuer == uuid }).sort(Utils.orderBy("asset_id",true,Number));

            this.setState({createToken: tokenList});
            resolve();
        })
        .catch(err=>{
            reject(err);
        })
    }

    /**
     * 获取账号资产列表
     */
    onGetAccountTokensListForIndex({uuid,resolve,reject}){
        // let uuid = WalletStore.getState().wallet.yoyow_id;
        let tokensList=[];
        Promise.all([ChainApi.fetchAccountBalances(uuid),walletDatabase.instance().walletDB().loadData('localtoken', {uid: uuid})])  
        .then(res=>{
            if(res[0].length>0){
                //排序
                let list=res[0].sort(Utils.sortBy("amount",false));
                //过滤掉核心资产
                list.splice(list.findIndex(item => item.asset_id === 0), 1);
                //过滤非本地设置显示的资产
                let localToken=res[1];
                for(let item of list){
                    let counts= localToken.filter(function(p){
                        return p.assetId == item.asset_id;
                    });
                    let isShow=counts.length>0;
                    //过滤掉资产为0的数据
                    if(isShow&&item.amount>0){
                        let token={
                            amount:item.amount,
                            asset_id:item.asset_id,
                            description:item.description,
                            precision:item.precision,
                            symbol:item.symbol
                        }
                        tokensList.push(token);
                    }
                }
            }
            this.setState({tokens:tokensList});
            resolve(tokensList);
        })
        .catch(err=>{
            reject(err);
        })
    }

    /**
     * 获取账号资产列表
     */
    onGetAccountTokensList({resolve,reject}){
        let uuid = WalletStore.getState().wallet.yoyow_id;
        let tokensList=[];
        Promise.all([ChainApi.fetchAccountBalances(uuid),walletDatabase.instance().walletDB().loadData('localtoken', {uid: uuid})])
        .then(res=>{
            if(res[0].length>0){
                let list=res[0].sort(Utils.sortBy("amount",false));
                //将核心资产放第一位
                let yoyoToken=res[0][res[0].findIndex(item => item.asset_id === 0)];

                let localToken=res[1];
                let {keyword}=this.state;
                if(keyword.length>0){
                    if(yoyoToken.symbol.indexOf(keyword)>-1){
                        tokensList.push(yoyoToken);
                    }
                }else{
                    tokensList.push(yoyoToken);
                }
                //提取本地Token
                for(let item of list){
                    if(item.asset_id > 0){
                        let counts = [];
                        if(localToken.length>0){
                            counts=localToken.filter(function(p){
                                return p.assetId == item.asset_id;
                            });
                        }
                        let isShow=counts.length>0;
                        let token={
                            amount:item.amount,
                            asset_id:item.asset_id,
                            description:item.description,
                            precision:item.precision,
                            symbol:item.symbol,
                            indexshow:isShow
                        }
                        if(keyword.length>0){
                            if(item.symbol.indexOf(keyword)>-1){
                                tokensList.push(token);
                            }
                        }else{
                            tokensList.push(token);
                        }
                    }
                }
            }else{
                let yoyoToken={
                    amount:0,
                    asset_id:0,
                    description:"",
                    precision:5,
                    symbol:"YOYOW"
                };
                tokensList.push(yoyoToken);
            }
            // this.setState({tokenView:tokensList});
            resolve(tokensList);
        })
        .catch(err=>{
            reject(err);
        })
    }

    /**
     * 根据资产id获取资产信息
     */
    onGetTokenByAssetId({assetId,resolve,reject}){
        let uuid = WalletStore.getState().wallet.yoyow_id;
        ChainApi.fetchAccountBalances(uuid,[assetId])
        .then((res)=>{
            if(res.length>0){
                this.setState({tokenVal:res[0].amount/Utils.precisionToNum(res[0].precision)});
            }else{
                this.setState({tokenVal:0});
            }
            resolve();
        })
        .catch((err)=>{
            reject(err);
        })
    }

    /**
     * 获取创建资产的费用
     * @param {*} param0 
     */
    onGetCreateFee({data,resolve,reject}){
        let op_data = {
            issuer: WalletStore.getState().wallet.yoyow_id,
            symbol: data.symbol,
            precision: data.precision,
            common_options: {
                max_supply: data.amount,
                market_fee_percent: 0,
                max_market_fee: data.amount,
                issuer_permissions: parseInt((0x02 | 0x04 | 0x08 | 0x200 | 0x400).toString(10)),
                flags: 0,
                description: data.description
            }
        };

        ChainApi.__processTransaction("asset_create", op_data, op_data.issuer, true, false, "", false)
        .then(fees => {
            this.setState({createFee:fees});
            resolve();
        });
    }

    /**
     * 获取发行费用
     * @param {*} param0 
     */
    onGetIssueFee({data,resolve,reject}){
        let uuid = WalletStore.getState().wallet.yoyow_id;
        let realVal = data.amount;
        let op_data = {
            issuer: uuid,
            asset_to_issue: {
                amount: realVal,
                asset_id: 0
            },
            issue_to_account: uuid,
        }; 
        ChainApi.__processTransaction("asset_issue", op_data, op_data.issuer, true, false, "", false)
            .then((fees)=>{
                this.setState({issueFee:fees});
                resolve();
            })
    }


    /**
     * 创建/发行资产
     */
    onCreateToken({data,resolve,reject}){
        let {createFee}=this.state;
        let uuid = WalletStore.getState().wallet.yoyow_id;
        let priKey = WalletStore.getPrivateKey("active");
        ChainApi.createAsset(uuid, data.symbol, data.precision, data.amount, data.description, priKey, true)
        .then(res => {
            resolve(res);
        })
        .catch(err => {
            reject(err);
        });
    }

    /**
     * 提取本地token
     * @param {*} param0 
     */
    onGetLocalToken({resolve,reject}){
        let uuid = WalletStore.getState().wallet.yoyow_id;
        walletDatabase.instance().walletDB().loadData('localtoken', {
            uid: uuid
        }).then(res => {
            this.setState({localToken: res});
            resolve();            
        }).catch(err => {
            reject(err.message);
        });
    }

    /**
     * 添加进本地token
     * @param {*} param0 
     */
    onAddLocalToken({data,resolve,reject}){
        data.uid=WalletStore.getState().wallet.yoyow_id;
        //判断是否存在
        walletDatabase.instance().walletDB().loadData('localtoken', {
            uid: data.uid,
            assetId: data.assetId
        })
        .then(res => {
            if(res.length== 0){
                walletDatabase.instance().walletDB().addStore('localtoken', data, "add")
                .then(() => {
                    resolve();
                });
            }
            else{
                resolve();
            }
        });
    }


    /**
     * 删除本地token
     * @param {*} param0 
     */
    onDelLocalToken({inx,resolve,reject}){
        walletDatabase.instance().walletDB().removeStore('localtoken', inx)
        .then(res => {
            resolve();
        }).catch(err => {
            reject(err);
        });
    }

    /**
     * 设置本地token
     * @param {*} param0 
     */
    onChangeLocalToken({data,resolve,reject}){
        data.uid=WalletStore.getState().wallet.yoyow_id;
        //判断是否存在
        walletDatabase.instance().walletDB().loadData('localtoken', {
            uid: data.uid,
            assetId: data.assetId
        })
        .then(res => {
            // let {tokenView}=this.state;
            if(res.length== 0){
                walletDatabase.instance().walletDB().addStore('localtoken', data, "add")
                .then(() => {
                    // tokenView[tokenView.findIndex(item => item.asset_id == data.assetId)].indexshow=true;
                    // this.setState({tokenView:tokenView});
                    resolve({isAdd:true});
                });
            }
            else{
                walletDatabase.instance().walletDB().removeStore('localtoken', res[0].inx)
                .then(res => {
                    // tokenView[tokenView.findIndex(item => item.asset_id == data.assetId)].indexshow=false;
                    // this.setState({tokenView:tokenView});
                    resolve({isAdd:false});
                })
            }
        });
    }

    /**
     * 关键字
     */
    onChangeKeyword(val){
        this.setState({keyword:val});
    }
}

export default alt.createStore(TokensStore,"TokensStore");