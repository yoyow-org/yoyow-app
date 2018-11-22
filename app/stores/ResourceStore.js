import BaseStore from "./BaseStore";
import alt from "../altInstance";
import ResourceActions from "../actions/ResourceActions";
import {FetchApi, ChainApi, Utils} from "../../lib/index";
import {ChainStore} from "yoyowjs-lib";
import WalletStore from "./WalletStore";
import {map, find, uniq, clone} from "lodash"; 
import numeral from "numeral";
import { PrivateKey } from "yoyowjs-lib/es";

let _assets = [];

class ResourceStore extends BaseStore{
    constructor(){
        super();
        this.bindActions(ResourceActions);
        this.state = {
            available: false, // if true show in Index
            resources: {
                title: '',
                data: []
            },
            records: [],
            fees: null,
            selectRule: {},
            selectRecord: {}
        };
    }

    _setLife(available){
        this.setState({available});
    }

    onCheckLife({resolve,reject}){
        FetchApi.checkLife()
            .then(res => {
                this._setLife(true);
                resolve();
            })
            .catch(err => {
                this._setLife(false);
                reject();
            });
    }

    _formatObject(obj){
        let tmp = clone(obj);
        for(let key in tmp){
            if(key.indexOf('_date') >= 0)
                obj[`${key}_format`] = this._localize(new Date(tmp[key]));
            if(key === 'amount'){
                let _asset = find(_assets, a => { return a.asset_id == tmp.asset_id });
                obj.show_amount = Utils.getAssetAmount(tmp.amount, _asset.precision, false);
                obj.symbol = _asset.symbol;
            }
        }
    }

    onGetResources({uid,tpTitle,resolve,reject}){
        FetchApi.getResourcesBySeller(uid).then(res => {
            if(tpTitle != undefined) {
                res.title = tpTitle;
            }
            let asset_ids = uniq(map(res.data, 'asset_id'));
            ChainApi.fetchAssetsByIds(asset_ids).then(a_res => {
                _assets = a_res;
                map(res.data, this._formatObject.bind(this));
                res.data.sort((a, b) => { return b.created_date - a.created_date })
                this.setState({resources: res});
                resolve(res);
            }).catch(err => reject(err));
        }).catch(err => reject(err));
    }

    onChangeTitle(title){
        let {resources} = this.state;
        resources.title = title;
        this.setState({resources});
    }

    onSetTitle({uid, title, resolve, reject}){
        FetchApi.setResourceTitle(uid, title)
            .then(res => resolve())
            .catch(err => reject(err));
    }

    onGetRecords({uid, resolve, reject}){
        FetchApi.getBoughtByBuyer(uid).then(res => {
            let asset_ids = uniq(map(res, 'asset_id'));
            ChainApi.fetchAssetsByIds(asset_ids).then(a_res => {
                _assets = a_res;
                map(res, this._formatObject.bind(this));
                res.sort((a, b) => { return b.pay_date - a.pay_date });
                this.setState({records: res});
                resolve();
            }).catch(err => reject(err));
        }).catch(err => reject(err));
    }

    _getGatewayAccount(){
        return FetchApi.getGatewayUid().then(gateway => {
            return ChainApi.getAccount(gateway.uid).then(acc => {
                return acc;
            }).catch(err => { return Promise.reject(err) })
        }).catch(err => { return Promise.reject(err) })
    }

    onSetRule({uid, title, amount, content, privKey, expiration_date, rid, asset_id, resolve, reject}){
        Promise.all([
            this._getGatewayAccount(),
            ChainStore.fetchAsset(asset_id)
        ]).then(res => {
            let [acc, asset] = res;
            let nonce = numeral(uid).add(acc.uid).value();
            let cipher = Utils.encryptMemo(content, nonce, privKey, acc.memo_key);
            amount = Utils.formatNumber(amount * Utils.getAssetPrecision(asset.precision), 0, false)
            FetchApi.setRule(uid, title, amount, cipher, asset_id, expiration_date, rid).then(res => {
                resolve(res);
            }).catch(err => reject(err));
        }).catch(err => reject(err));
    }

    onBuyRule({uid, rid, useCsaf, memoKey, activeKey, broadcast, resolve, reject}){
        Promise.all([
            this._getGatewayAccount(),
            FetchApi.setRecord(uid, rid)
        ]).then(res => {
            let [acc, order] = res;
            let nonce = numeral(uid).add(acc.uid).value();
            if(!memoKey) memoKey = PrivateKey.fromSeed('0');
            let cipher = Utils.encryptMemo(`#${order.order_id}`, nonce, memoKey, acc.memo_key);
            let amount = {
                amount: order.amount,
                asset_id: order.asset_id
            }
            let op_data = {
                from: uid,
                to: acc.uid,
                amount,
                extensions: {
                    from_balance: amount,
                    to_balance: amount
                },
                memo: {
                    from: memoKey.toPublicKey(),
                    to: acc.memo_key,
                    nonce,
                    message: cipher
                }
            };
            ChainApi.__processTransaction("transfer", op_data, uid, true, useCsaf, activeKey, broadcast).then(fees => {
                if(broadcast){
                    // this.setState({fees: null, selectRule: null});
                    resolve();
                }else{
                    let {data} = this.state.resources;
                    let selectRule = find(data, d => { return d.id == rid });
                    this.setState({fees, selectRule});
                    // TODO: 初始化打开页面模拟转账手续费后，删除模拟数据
                    FetchApi.removeRecord(order.order_id);
                    resolve(fees);
                }
            }).catch(err => reject(err));
        }).catch(err => reject(err));
    }

    onRemoveRule({rid, resolve, reject}){
        FetchApi.removeRule(rid)
            .then(res => resolve())
            .catch(err => reject(err));
    }

    onRemoveRecord({oid, resolve, reject}){
        FetchApi.removeRecord(oid)
            .then(res => resolve())
            .catch(err => reject(err));
    }

    onSelectRule({uid, rid, privKey, resolve, reject}){
        this._getGatewayAccount().then(acc => {
            let {data} = this.state.resources;
            let selectRule = clone(find(data, d => { return d.id == rid }));
            let nonce = numeral(uid).add(acc.uid).value();
            selectRule.content = Utils.decryptMemo(selectRule.content, nonce, privKey, acc.memo_key);
            this.setState({
                selectRule : selectRule
            });
            resolve(selectRule);
        }).catch(err => reject(err));
    }

    onDecryptRecord({uid, oid, privKey, resolve, reject}){
        Promise.all([
            this._getGatewayAccount(),
            FetchApi.getRecord(oid)
        ]).then(res => {
            let [acc, record] = res;
            let nonce = numeral(uid).add(acc.uid).value();
            let message = Utils.decryptMemo(record.content, nonce, privKey, acc.memo_key);
            record.decrypt_content = message;
            this.setState({selectRecord: record});
            resolve(message);
        }).catch(err => reject(err));
    }

    
}

export default alt.createStore(ResourceStore, "ResourceStore");