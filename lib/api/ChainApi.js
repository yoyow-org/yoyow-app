"use strict";

import {Apis} from "yoyowjs-ws";
import {
    Aes,
    ChainStore,
    ChainTypes,
    ChainValidation,
    AccountUtils,
    PrivateKey,
    PublicKey,
    TransactionBuilder,
    TransactionHelper,
    Signature
} from 'yoyowjs-lib';
import {Long} from "bytebuffer";
import GlobalParams from "../conf/GlobalParams";
import Utils from "../utils/Utils";
import Validation from "../utils/Validation";
import WalletStore from "../../app/stores/WalletStore";
import {last} from "lodash";
let global_prams_type = `2.${parseInt(ChainTypes.impl_object_type.global_property, 10)}.0`;
let dynamic_global_prams_type = `2.${parseInt(ChainTypes.impl_object_type.dynamic_global_property, 10)}.0`;

export default {

    /**
     * 系统通用参数
     * @returns {Promise<U>|*|Thenable<U>|Promise.<TResult>} resolve({ params, dynamicParams}) resolve(err)
     */
    getParameters() {
        return Apis.instance().db_api().exec("get_objects", [[global_prams_type, dynamic_global_prams_type]]).then(res => {
            let params = res[0]['parameters'];
            let dynamicParams = res[1];
            return {params, dynamicParams};
        }).catch(err => {
            return Promise.reject(Utils.formatError(err));
        });
    },

    /**
     * 根据账号获取账号信息
     * @param {Number|String} uid - yoyow id
     * @returns {Promise<U>|*|Thenable<U>|Promise.<TResult>} resolve(account) reject(err)
     */
    getAccount(uid) {
        return new Promise((resolve, reject) => {
            if (ChainValidation.is_account_uid(uid)) {
                return Apis.instance().db_api().exec("get_accounts_by_uid", [[uid]]).then(res => {
                    if (res && res.length > 0 && res[0] != null){
                        resolve(res[0]);
                    }else{
                        reject(Utils.formatError(1002));
                    }
                });
            }else{
                reject(Utils.formatError(1001));
            }
        });
    },

    /**
     * 获取单个平台信息
     * @param {Number|String} uid - 平台yoyow id
     * @returns {Promise<U>|*|Thenable<U>|Promise.<TResult>} resolve(platform) reject(err)
     */
    getPlatform(pid){
        return ChainStore.fetchPlatformByUid(pid).then(platform => {
            if(!Validation.isEmpty(platform)){
                return this.getAccount(pid).then(account => {
                    platform.secondary_pubkey = account.secondary.key_auths[0][0];
                    return platform;
                }).catch(err => {
                    return Promise.reject(err);
                })
            }else{
                return Promise.reject(Utils.formatError(1011));
            }
        }).catch(err => {
            return Promise.reject(Utils.formatError(1011));
        })
    },

    /**
     * 获取平台列表
     * @param {Number|String} pid - 指定平台所有者id开始查询
     * @param {Number} limit - 返回数量
     * @param {Number} sortType - 排序方式 0 by_uid, 1 by_votes, 2 by_pledge
     * @returns {Promise<U>|*|Thenable<U>|Promise.<TResult>} resolve(platformsList) reject(err)
     */
    getPlatforms(pid, limit = 10, sortType = 1){
        return new Promise((resolve, reject) => {
            ChainStore.fetchPlatforms(pid, limit, sortType).then(res => {
                resolve(res);
            }).catch(err => {
                reject(Utils.formatError(err));
            })
        });
    },

    /**
     * 验证签名
     * @param {Number|String} platform - 平台id
     * @param {String} time - 时间戳字符串
     * @param {String} sign - 签名字符串
     */
    checkAuth(platform, time, sign){
        return this.getPlatform(platform).then(p => {
            let cur = Date.now();
            let req = parseInt(time);
            let sendStr = JSON.stringify({ platform, time });
            let pubkey = PublicKey.fromPublicKeyString(p.secondary_pubkey);
            // if(cur - req > GlobalParams.auth_due)
            //     return Promise.reject(Utils.formatError(1010));
            if(!Signature.fromHex(sign).verifyBuffer(new Buffer(sendStr), pubkey))
                return Promise.reject(Utils.formatError(1009));
            else
                return p;
        }).catch(err => {
            return Promise.reject(err);
        });
    },

    /**
     * 生成授权请求
     * @param {Number|String} yoyow - 授权账号id
     * @param {PrivateKey} priKey - 所需active私钥
     */
    signAuth(yoyow, priKey){
        let sendObj = {
            yoyow,
            time: Date.now().toString()
        }
        sendObj.sign = Signature.signBuffer(new Buffer(JSON.stringify(sendObj)), priKey).toHex();
        return sendObj;
    },

    /**
     * 授权平台
     * @param {Number|String} uid - 操作者 yoyow id
     * @param {Number|String} pid - 平台拥有者 yoyow id
     * @param {Boolean} useBalance - 是否使用余额
     * @param {Boolean} useCsaf - 是否使用积分
     * @param {String} priKey - 私钥
     * @param {Boolean} broadcast - 是否广播
     * @returns {Promise<U>|*|Thenable<U>|Promise.<TResult>}
     */
    doAuthority(uid, platform, useBalance, useCsaf, priKey, broadcast){
        let op_data = { uid, platform };
        return this.__processTransaction('account_auth_platform', op_data, uid, useBalance, useCsaf, priKey, broadcast);
    },

    /**
     * 取消平台授权
     * @param {Number|String} uid - 操作者 yoyow id
     * @param {Number|String} pid - 平台拥有者 yoyow id
     * @param {Boolean} useBalance - 是否使用余额
     * @param {Boolean} useCsaf - 是否使用积分
     * @param {String} priKey - 私钥
     * @param {Boolean} broadcast - 是否广播
     * @returns {Promise<U>|*|Thenable<U>|Promise.<TResult>}
     */
    cancelAuthority(uid, platform, useBalance, useCsaf, priKey, broadcast){
        let op_data = { uid, platform };
        return this.__processTransaction('account_cancel_auth_platform', op_data, uid, useBalance, useCsaf, priKey, broadcast);
    },


    /**
     * 处理op操作
     * @param {String} op_type - op 类型
     * @param {Object} op_data - op 操作数据
     * @param {Number|String} pay_uid - 操作者 yoyow id
     * @param {Boolean} useBalance - 是否使用余额 true , 零钱 false
     * @param {Boolean} useCsaf - 是否使用积分
     * @param {PrivateKey} priKey - 私钥
     * @param {Boolean} broadcast - 是否广播 , 默认为false
     * @returns {Promise<U>|*|Thenable<U>|Promise.<TResult>} 不广播的情况 resolve 操作费率, 否则resolve {block_num, txid};
     */
    __processTransaction(op_type, op_data, pay_uid, useBalance, useCsaf, priKey, broadcast = false){
        return new Promise((resolve, reject) => {
            TransactionHelper.process_transaction(op_type, op_data, pay_uid, useBalance, useCsaf, priKey, broadcast).then(res => {
                if(!broadcast){
                    res.min_fees = Utils.realCount(res.min_fees.toNumber());
                    res.min_real_fees = Utils.realCount(res.min_real_fees.toNumber()),
                    res.use_csaf = Utils.realCount(res.use_csaf.toNumber()),
                    res.with_csaf_fees = Utils.realCount(res.with_csaf_fees.toNumber()),
                    res.useCsaf = useCsaf // 是否使用积分
                }
                resolve(res);
            }).catch(err => reject(err));    
        })
    },
    
    /**
     * 获取用户历史记录
     * @param uid
     * @param op_type
     * @param start
     * @param stop
     * @param limit
     * @returns {Promise<U>|Promise.<T>|*|Promise}
     */
    getHistoryByUid(uid, op_type = null, start = 0, stop = 0, limit = 20) {
        if (start != 0) {
            start -= 1;
        }
        return ChainStore.fetchRelativeAccountHistory(uid, op_type, stop, limit, start).then(res => {
            let history = [];
            for (let o of res) {
                let op = o[1]['op'][1];
                let op_type = o[1]['op'][0];
                // 目前仅转账 积分领取在历史查看范围
                if (op_type == 0 || op_type == 6 || op_type == 25 || op_type == 27) {
                    op.type = op_type;
                    op.time = Utils.transferApiDate(o[1]['block_timestamp']).dateStr;
                    op.inx = o[0];
                    history.push(op);
                }
            }
            return {history, start: last(res)[0]};
        }).catch(err => {
            return Promise.reject(err);
        });

    },

    /**
     * 获取资产信息
     * @param {Number|String} uid - 账号id
     */
    getAssetsByUid(uid){
        let statisticsPromise = new Promise((resolve, reject) => {
            if (!ChainValidation.is_account_uid(uid)) {
                reject(new Error('invalid account uid'));
            } else {
                Apis.instance().db_api().exec("get_full_accounts_by_uid", [[uid], {fetch_statistics: true}])
                    .then(res => {
                        if (res.length == 0) {
                            reject({code: 1});
                        } else {
                            resolve(res[0][1].statistics);
                        }
                    }).catch(err => {
                    reject(err);
                });
            }
        });
        return Promise.all([statisticsPromise, this.getParameters()])
            .then(res => {
              /*  let statistics = res[0];
                let {params, dynamicParams} = res[1];
                console.log(GlobalParams)
                let effective_balance = Long.fromValue(statistics.core_balance).add(Long.fromValue(statistics.core_leased_in)).sub(Long.fromValue(statistics.core_leased_out));
                let csaf_collect = Math.floor(Utils.calcCoinSecondsEarned(statistics, GlobalParams.csaf_accumulate_window, GlobalParams.time).new_coin_seconds_earned / GlobalParams.csaf_rate * GlobalParams.csaf_param);
                let csaf_accumulate = effective_balance * 86400 / GlobalParams.csaf_rate * GlobalParams.csaf_param;
                //console.log( Utils.formatAmount(Utils.realCount(statistics.csaf),4))
                let assets = {
                    orign_core_balance: Utils.realCount(statistics.core_balance),// 原始余额
                    core_balance: Utils.realCount(Long.fromValue(statistics.core_balance)
                        .sub(statistics.total_witness_pledge)
                        .sub(statistics.total_committee_member_pledge)
                        // .sub(statistics.total_platform_pledge)
                        .toNumber()), // 实际余额 - 见证人抵押 - 理事会抵押 - 平台抵押
                    prepaid_balance: Utils.realCount(statistics.prepaid), // 零钱
                    csaf_balance: Utils.realCount(statistics.csaf), // 币天/积分,
                    max_accoumulate_csaf:GlobalParams.csaf_accumulate_window/86400*effective_balance/10000,
                    max_csaf_limit: Utils.realCount(GlobalParams.max_csaf_per_account), // 币天/积分上限
                    csaf_accumulate: Utils.formatAmount(Utils.realCount(csaf_accumulate), 4), // 币天/积分积累
                    csaf_collect: Utils.formatAmount(Utils.realCount(csaf_collect), 4), // 可领取币天/积分
                    total_witness_pledge: Utils.realCount(statistics.total_witness_pledge),// 见证人抵押总额
                    releasing_witness_pledge: Utils.realCount(statistics.releasing_witness_pledge), // 见证人抵押待退
                    total_committee_member_pledge: Utils.realCount(statistics.total_committee_member_pledge),// 理事会抵押总额
                    releasing_committee_member_pledge: Utils.realCount(statistics.releasing_committee_member_pledge), // 理事会抵押待退
                    is_pledge: statistics.total_witness_pledge > 0 || statistics.total_committee_member_pledge > 0, // 以是否有抵押判断时候见证人或理事会成员
                    is_witness: statistics.total_witness_pledge > 0, // 是否有见证人抵押
                    is_committee: statistics.total_committee_member_pledge > 0 // 是否有理事会抵押
                };
                return assets;*/
                let statistics = res[0];
                let {params, dynamicParams} = res[1];
                // 币天/积分积累
                // 余额（加上借入的，减去借出的）

                let effective_balance = Long.fromValue(statistics.core_balance).add(Long.fromValue(statistics.core_leased_in)).sub(Long.fromValue(statistics.core_leased_out));
                // * 一天秒数 / 币龄抵扣手续费比率（csaf_rate）
                let csaf_accumulate = effective_balance * 86400 / params.csaf_rate * GlobalParams.csaf_param;

                // 币天/积分 可领取
                let csaf_collect = Math.floor(Utils.calcCoinSecondsEarned(statistics, params.csaf_accumulate_window, dynamicParams.time).new_coin_seconds_earned / params.csaf_rate * GlobalParams.csaf_param);
                let assets = {
                    orign_core_balance: Utils.realCount(statistics.core_balance),// 原始余额
                    core_balance: Utils.realCount(Long.fromValue(statistics.core_balance)
                        .sub(statistics.total_witness_pledge)
                        .sub(statistics.total_committee_member_pledge)
                        .sub(statistics.total_platform_pledge)
                        .toNumber()), // 实际余额 - 见证人抵押 - 理事会抵押 - 平台抵押
                    prepaid_balance: Utils.realCount(statistics.prepaid), // 零钱
                    csaf_balance: Utils.realCount(statistics.csaf * GlobalParams.csaf_param), // 币天/积分
                    max_csaf_limit: Utils.realCount(params.max_csaf_per_account * GlobalParams.csaf_param), // 币天/积分上限
                    csaf_accumulate: Utils.formatAmount(Utils.realCount(csaf_accumulate),4), // 币天/积分积累
                    csaf_collect: Utils.formatAmount(Utils.realCount(csaf_collect), 4), // 可领取币天/积分
                    max_accoumulate_csaf:GlobalParams.csaf_accumulate_window/86400*effective_balance/10000/1000,
                    total_witness_pledge: Utils.realCount(statistics.total_witness_pledge),// 见证人抵押总额
                    releasing_witness_pledge: Utils.realCount(statistics.releasing_witness_pledge), // 见证人抵押待退
                    total_committee_member_pledge: Utils.realCount(statistics.total_committee_member_pledge),// 理事会抵押总额
                    releasing_committee_member_pledge: Utils.realCount(statistics.releasing_committee_member_pledge), // 理事会抵押待退
                    is_pledge: statistics.total_witness_pledge > 0 || statistics.total_committee_member_pledge > 0, // 以是否有抵押判断时候见证人或理事会成员
                    is_witness: statistics.total_witness_pledge > 0, // 是否有见证人抵押
                    is_committee: statistics.total_committee_member_pledge > 0 // 是否有理事会抵押
                };
                return assets;
            }).catch(err => {
                if (__DEBUG__) {
                    console.log('获取资产异常');
                    console.log(err);
                }
                return Promise.reject(err);
            });
    },

    /**
     * 构建转账op对象
     * 默认为当前操作帐号信息
     * 根据type判断转账方式，为空的情况为异帐号转账，其他为零转余或余转零
     * @param to_account
     * @param amount
     * @param memo
     * @param type 内部转账类型 对外转账不传
     * @returns {*|Promise|Promise<U>|Promise.<T>}
     */
    buildTransferData(to_account, amount, memo, type,tokenInfo=null) {
        let curWallet = WalletStore.getWallet();
        let from_account = curWallet.yoyow_id;
        to_account == ""? curWallet.yoyow_id:to_account;
        if(to_account == ""){
            to_account =curWallet.yoyow_id;
        }else{
            to_account =to_account;
        }
        let fetchMemoToKey;
        if (from_account != to_account) {
            fetchMemoToKey = new Promise((resolve, reject) => {
                Apis.instance().db_api().exec("get_accounts_by_uid", [[to_account]]).then(uObj => {
                    if (uObj && uObj[0]) {
                        resolve(uObj[0].memo_key);
                    } else {
                        resolve(PrivateKey.fromSeed("1").toPublicKey());
                    }
                });
            });
        } else {
            fetchMemoToKey = curWallet.encrypted_memo.pubkey;
        }
        return Promise.all([fetchMemoToKey]).then(res => {
            let memoFromKey = PublicKey.fromPublicKeyString(curWallet.encrypted_memo.pubkey);
            let memoToKey = PublicKey.fromPublicKeyString(res[0]);
            let val =0;
            if(tokenInfo!=null){
                val=parseInt((amount * Utils.precisionToNum(tokenInfo.precision)).toFixed(0));
            }else{
                val=parseInt((amount * GlobalParams.retain_count).toFixed(0));
            } 
            let asset = {amount: Math.round(val), asset_id: tokenInfo!=null?tokenInfo.asset_id:0};
            let extensions_data = {};
            if (type == 'toPrepaid') {
                extensions_data = {
                    from_balance: asset,
                    to_prepaid: asset
                }
            } else if (type == 'toBalance') {
                extensions_data = {
                    to_balance: asset,
                    from_prepaid: asset
                }
            } else if (type == 'fromBalance') {
                extensions_data = {
                    from_balance: asset,
                    to_balance: asset
                }
            } else if (type == 'fromPrepaid') {
                extensions_data = {
                    from_prepaid: asset,
                    to_balance: asset
                }
            }else if(type=="asset"){
                extensions_data = {
                    from_balance: asset,
                    to_balance: asset
                }
            }

            let op_data = {
                from: curWallet.yoyow_id,
                to: to_account,
                amount: asset,
                extensions: extensions_data
            };
            // 转账备注不为空
            if (memo && memo.trim() != '') {
               let memoKey = (WalletStore.isLocked(true) && WalletStore.isLocked(false)) ? PrivateKey.fromSeed("1") : WalletStore.decryptTcomb_PrivateKey(curWallet.encrypted_memo);

                let nonce = TransactionHelper.unique_nonce_uint64();
                let message = Aes.encrypt_with_checksum(
                    memoKey,
                    memoToKey,
                    nonce,
                    new Buffer(memo, 'utf-8')
                );

                // let message = new Buffer('uncrypto'+memo, 'utf-8').toString('hex')
                let memo_data = {
                    from: memoFromKey,
                    to: memoToKey,
                    nonce,
                    message: message
                };
                op_data.memo = memo_data;
            }

            return {op_data, memoFromKey, from_account};
        }).catch(err => {
            if (__DEBUG__) {
                console.log('构建转账对象异常');
                console.log(err);
            }
            return Promise.reject(err);
        });
    },

    /**
     * 获取给定数组的用户资产信息
     * @param {Array} uids - 用户id 数组
     */
    handleTransfer(type, opData, pay_uid, useBalance, useCsaf, priKey, broadcast){
        return this.__processTransaction(type, opData, pay_uid, useBalance, useCsaf, priKey, broadcast)
    },
    /**
     * 获取给定数组的用户资产信息
     * @param {Array} uids - 用户id 数组
     */

    getAccountsByUids(uids){
        return Apis.instance().db_api().exec("get_full_accounts_by_uid", [uids, {fetch_statistics: true, fetch_account_object: true}]).then(res => {
            let acounts = [];
            res.forEach(r => {
                let uid = r[0];
                /**
                 * TODO: 用作验证账号是否失效，若后面有业务要求将不更改memo_key的情况
                 * （如确保备注加密不会因为重置密码而无法查看等情况）,则修改此处验证的pubkey
                 */ 
                let memo_key = r[1].account.memo_key; 
                let statistics = r[1].statistics;
                acounts.push({
                    uid ,
                    pubkey: memo_key ,
                    balance: Utils.realCount(Long.fromValue(statistics.core_balance)
                            .sub(statistics.total_witness_pledge)
                            .sub(statistics.total_committee_member_pledge)
                            .sub(statistics.total_platform_pledge)
                            .toNumber()),
                    prepaid: Utils.realCount(statistics.prepaid)
                });
            })
            return acounts;
        }).catch(err => {
            return Promise.reject(err);
        })
    },

    /**
     * 构建获取积分op对象
     * @param to_account
     * @param amount
     * @param use_csaf
     */
    buildCsafCollectData(to_account, amount) {
        return this.getParameters().then(res => {
            let {dynamicParams} = res;
            let time_point_sec = Utils.transferApiDateString(dynamicParams.time);
            let curWallet = WalletStore.getWallet();
            let op_data = {
                from: curWallet.yoyow_id,
                to: to_account,
                amount: {amount: Math.round(amount), asset_id: 0},
                time: time_point_sec
            };
            return op_data;
        }).catch(err => {
            return Promise.reject(err);
        });
    },

    /**
     * 处理领取积分
     * @param to_account
     * @param amount
     * @param use_csaf
     * @returns {Promise<U>|*|Thenable<U>|Promise.<TResult>}
     */
    processCsafCollect(to_account, amount,useBalance,priKey, use_csaf) {
        return this.buildCsafCollectData(to_account, amount).then(op_data => {
            let curWallet = WalletStore.getWallet();
            return this.__processTransaction('csaf_collect', op_data, curWallet.yoyow_id, !useBalance, use_csaf, priKey, true);
        });
    },

    /**
     * 创建资产
     * @param {String | Number} issuer - 资产拥有者uid
     * @param {String} symbol - 资产符号 必须为大写字母
     * @param {Number} precision - 资产精度
     * @param {Number} max_supply - 最大供应量
     * @param {String} description - 资产描述 基于中文出现的问题，暂要求资产备注大于28个字符，中文占2字符
     * @param {PrivateKey} priKey - 签名私钥
     * @param {Boolean} broadcast - 是否广播
     */
    createAsset(issuer, symbol, precision, max_supply, description, priKey, broadcast){
        let realVal = Long.fromValue(max_supply).mul(Utils.precisionToNum(precision)).toString();
        let op_data = {
            issuer: issuer,
            symbol: symbol,
            precision: precision,
            common_options: {
                max_supply: realVal,
                market_fee_percent: 0,
                max_market_fee: 0,
                issuer_permissions: parseInt((0x02 | 0x04 | 0x08 | 0x200 | 0x400).toString(10)),
                flags: 0,
                description: description
            },
            extensions: {
                initial_supply: realVal
            }
        };

        return this.__processTransaction('asset_create', op_data, issuer, true, true, priKey, broadcast);
    },

    /**
     * 更新资产
     * @param {String | Number} issuer - 资产拥有者uid
     * @param {Number} asset_to_update - 资产id
     * @param {Number} precision - 资产精度
     * @param {Number} max_supply - 最大供应量
     * @param {String} description - 资产描述 基于中文出现的问题，暂要求资产备注大于28个字符，中文占2字符
     * @param {PrivateKey} priKey - 签名私钥
     * @param {Boolean} broadcast - 是否广播
     */
    updateAsset(issuer, asset_to_update, precision, max_supply, description, priKey, broadcast){
        return this.fetchAsset(asset_to_update).then(asset => {
            let realVal = Long.fromValue(max_supply).mul(Utils.precisionToNum(precision)).toString();
            let op_data = {
                issuer: issuer,
                asset_to_update: asset_to_update,
                new_precision: precision,
                new_options: {
                    max_supply: realVal,
                    market_fee_percent: 0,
                    max_market_fee: 0,
                    issuer_permissions: parseInt((0x02 | 0x04 | 0x08 | 0x200 | 0x400).toString(10)),
                    flags: 0,
                    description: Validation.isEmpty(description) ? asset.options.description : description
                }
            };
            return this.__processTransaction('asset_update', op_data, issuer, true, true, priKey, broadcast);
        });
    },

    /**
     * 发行资产
     * @param {String | Number} issuer - 资产拥有者uid
     * @param {Number} asset_id - 资产id
     * @param {Number} amount - 发行数量
     * @param {String | Number} issuer_to - 发行目标uid
     * @param {PrivateKey} priKey - 签名私钥
     * @param {Boolean} broadcast - 是否广播
     */
    issueAsset(issuer, asset_id, amount, issuer_to, priKey, broadcast){
        return this.fetchAsset(asset_id).then(asset => {
            let realVal = Long.fromValue(amount).mul(Utils.precisionToNum(precision)).toString();
            let op_data = {
                issuer: issuer,
                asset_to_issue: {
                    amount: realVal,
                    asset_id: asset_id
                },
                issue_to_account: issuer_to,
            }; 
            return this.__processTransaction('asset_issue', op_data, issuer, true, true, priKey, broadcast);
        });
    },

    /**
     * 回收/销毁 资产
     * @param {String | Number} payer - 任意拥有此资产的账户id
     * @param {Number} asset_id - 资产id
     * @param {Number} amount - 回收/销毁 数量
     * @param {PrivateKey} priKey - 签名私钥
     * @param {Boolean} broadcast - 是否广播
     */
    reserveAsset(payer, asset_id, amount, priKey, broadcast){
        return this.fetchAsset(asset_id).then(asset => {
            let realVal = Long.fromValue(amount).mul(Utils.precisionToNum(precision)).toString();
            let op_data = {
                payer: payer,
                amount_to_reserve: {
                    amount: realVal,
                    asset_id: asset_id
                }
            };
            return TransactionHelper.process_transaction('asset_reserve', op_data, payer, true, true, priKey, broadcast);
        });
    },

    /**
     * 查询单个资产
     * @param {String | Number} query - 资产ID 或 符号
     */
    fetchAsset(query){
        return new Promise((resolve, reject) => {
            ChainStore.fetchAsset(query).then(asset => {
                if(asset)
                    resolve(asset);
                else 
                    reject(1007);
            }).catch(err => reject(err));
        });
    },

    /**
     * 查询资产列表
     * TODO: 因为目前的api查询接口只有两个参数符号和limit
     * 查询出的顺序是按符号正序，所以目前的查询是把所有资产拉出来，在ui层做筛选操作
     */
    fetchAssets(){
        return new Promise((resolve, reject) => {
            ChainStore.fetchAssets().then(assets => {
                resolve(assets);
            }).catch(err => reject(err))
        });
    },

    fetchAssetsByIds(ids){
        return Apis.instance().db_api().exec('get_assets', [ids]).then(res => {
            return res;
        }).catch(err => {
            return Promise.reject(err);
        })
    },

    /**
     * 查询账户所有资产
     * @param {String | Number} uid - 账户uid
     * @param {Array<int>} assets - 资产id数组 默认为查询该用户所有拥有的资产
     */
    fetchAccountBalances(uid, assets = []){
        return new Promise((resolve, reject) => {
            ChainStore.fetchAccountBalances(uid, assets).then(res => {
                resolve(res);
            }).catch(err => reject(err));
        });
    }
};