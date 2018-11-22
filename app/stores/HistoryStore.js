import BaseStore from "./BaseStore";
import alt from "../altInstance";
import Utils from "../../lib/utils/Utils";
import ChainApi from "../../lib/api/ChainApi";
import HistoryActions from "../actions/HistoryActions";
import { setTimeout } from "timers";

class HistoryStore extends BaseStore{
    constructor() {
        super();
        this.state = {
            type: 0,
            source: [],
            history: [],
            start:0,
            lastInx:2,
            isEnd:false,
            pageIndex:1
        };
        this.bindActions(HistoryActions);
    }

    
    /**
     * 获取资产明细
     * @param {} param0 
     */
    onGetHistoryByUid({uid,opType,dataType,tokenInfo,isFirst, resolve, reject}){
        // uid=252722715;
        // let startDate=new Date();
         if(isFirst){
             this.setState({start:0,history:[],pageIndex:1});
         }
        let {start,history,pageIndex}=this.state;
          new Promise((resolve, reject) => this._getHistoryInfoList(history,uid,opType,dataType,start,10,pageIndex,tokenInfo,resolve, reject))
         .then((res) => {
            //  let endDate=new Date();
            //  console.log("times:",endDate-startDate);
            this.setState({start:res.start,history:res.history,isEnd:res.isEnd,pageIndex:res.pageIndex});
             resolve();
         }).catch(err=>{
            reject();
         });
    }

    /**
     * 递归函数，用于提取指定的数据条数，一直到数据结束为止
     */
    _getHistoryInfoList(result,uid,opType,dataType,lastInx,pageSize,pageIndex,tokenInfo, resolve, reject){
        try{
            // let startDate=new Date();
            ChainApi.getHistoryByUid(uid,opType,lastInx,0,pageSize)
            .then(({history,start})=>{
                //余额
                let balanceSource = [];
                //零钱
                let prepaidSource = [];
                let source =[];
                let _lastInx=(history.length==0 && start>1)?start:2;
                for(let op of history){
                    _lastInx=op.inx;
                    //余额列表对象
                    let balanceDataObj={
                        userId:"",
                        from: op.from,
                        to: op.to,
                        remark:"",
                        amount:0,
                        time:op.time,
                        symbol:"+",
                        transferType:"",
                        inx:op.inx,
                        assetId:0,
                        asssetSymbol:""
                    }
                    //零钱列表对象
                    let prepaidDataObj={
                        userId:"",
                        from: op.from,
                        to: op.to,
                        remark:"",
                        amount:0,
                        time:op.time,
                        symbol:"+",
                        transferType:"",
                        inx:op.inx,
                        assetId:0,
                        asssetSymbol:""
                    }

                    //创建资产手续费
                    if(op.type==25 && op.extensions){
                        let assetInfo={
                            amount:this._formartAmount(op.extensions.initial_supply,tokenInfo),
                            userId:op.issuer,
                            from: op.issuer,
                            to: op.issuer,
                            remark:"",
                            time:op.time,
                            symbol:"+",
                            transferType:"asset_issue",
                            inx:op.inx,
                            assetId:-1,
                            asssetSymbol:op.symbol
                        }
                        balanceSource.push(assetInfo);

                        let feeDataObj={
                            amount:this._formartAmount(op.fee.options.from_balance.amount),
                            userId:op.issuer,
                            from: op.issuer,
                            to: op.issuer,
                            remark:"",
                            time:op.time,
                            symbol:"-",
                            transferType:"asset_create_fee",
                            inx:op.inx,
                            assetId:0,
                            asssetSymbol:""
                        }
                        balanceSource.push(feeDataObj);
                    }

                    //发行资产
                    if(op.type==27)
                    {
                        let assetInfo={
                            amount:this._formartAmount(op.asset_to_issue.amount,tokenInfo),
                            userId:op.issuer,
                            from: op.issuer,
                            to: op.issue_to_account,
                            remark:"",
                            time:op.time,
                            symbol:"+",
                            transferType:"asset_issue",
                            inx:op.inx,
                            assetId:op.asset_to_issue.asset_id,
                            asssetSymbol:""
                        }
                        balanceSource.push(assetInfo);
                        //op手续费
                        let feeDataObj={
                            userId:op.issuer,
                            from: op.issuer,
                            to: op.issuer,
                            remark:"",
                            amount:this._formartAmount(op.fee.options.from_balance.amount),
                            time:op.time,
                            symbol:"-",
                            transferType:"asset_issue_fee",
                            inx:op.inx,
                            assetId:0,
                            asssetSymbol:""
                        }
                        //额外增加一条转账手续费
                        balanceSource.push(feeDataObj);
                    }
                    //金额是不变的
                    let amount=op.amount?op.amount.amount:0;
                    balanceDataObj.amount=tokenInfo==null?this._formartAmount(amount):this._formartAmount(amount,tokenInfo);
                    prepaidDataObj.amount=tokenInfo==null?this._formartAmount(amount):this._formartAmount(amount,tokenInfo);
                    if(op.from==op.to){
                        if(op.type==0){
                            //一.账号内部转账
                            if(op.extensions){
                                //1.余额转账到零钱（零钱，余额）
                                if(op.extensions.from_balance && op.extensions.to_prepaid){
                                    //余额集
                                    balanceDataObj.userId=op.to;
                                    balanceDataObj.transferType="balance_to_prepaid";
                                    balanceDataObj.symbol="-";
                                    balanceDataObj.assetId=op.amount.asset_id;
                                    balanceDataObj.asssetSymbol="";
                                    balanceSource.push(balanceDataObj);
                                    
                                    //零钱集
                                    prepaidDataObj.transferType="balance_to_prepaid";
                                    prepaidDataObj.symbol="+";
                                    prepaidDataObj.asssetSymbol="";
                                    prepaidSource.push(prepaidDataObj);
                                    
                                    //2.手续费（零钱，余额）
                                    if(op.fee.options.from_balance){
                                        let feeDataObj={
                                            userId:op.to,
                                            from: op.from,
                                            to: op.to,
                                            remark:"",
                                            amount:this._formartAmount(op.fee.options.from_balance.amount),
                                            time:op.time,
                                            symbol:"-",
                                            transferType:"balance_for_fee",
                                            inx:op.inx,
                                            assetId:0,
                                            asssetSymbol:""
                                        }
                                        //额外增加一条转账手续费
                                        balanceSource.push(feeDataObj);
                                    }                        
                                }

                                //2.零钱转到余额（零钱，余额）
                                if(op.extensions.from_prepaid && op.extensions.to_balance){
                                    //余额集
                                    balanceDataObj.userId=op.to;
                                    balanceDataObj.transferType="prepaid_to_balance";
                                    balanceDataObj.symbol="+";
                                    balanceDataObj.assetId=op.amount.asset_id;
                                    balanceDataObj.asssetSymbol="";
                                    balanceSource.push(balanceDataObj);
                                    
                                    //零钱集
                                    prepaidDataObj.userId=op.to;
                                    prepaidDataObj.transferType="prepaid_to_balance";
                                    prepaidDataObj.symbol="-";
                                    prepaidDataObj.asssetSymbol="";
                                    prepaidSource.push(prepaidDataObj);
                                                            
                                    //2.手续费（零钱，余额）
                                    if(op.fee.options.from_prepaid){
                                        let feeDataObj={
                                            userId:op.to,
                                            from: op.from,
                                            to: op.to,
                                            remark:"",
                                            amount:this._formartAmount(op.fee.options.from_prepaid.amount),
                                            time:op.time,
                                            symbol:"-",
                                            transferType:"balance_for_fee",
                                            inx:op.inx,
                                            assetId:0,
                                            asssetSymbol:""
                                        }
                                        //额外增加一条转账手续费
                                        prepaidSource.push(feeDataObj);
                                    }                        
                                }
                            }else{
                                balanceDataObj.userId=op.to;
                                balanceDataObj.transferType=(tokenInfo==null?"balance_to_user":"asset_to_user");
                                balanceDataObj.symbol="-";
                                balanceDataObj.remark=(op.memo?op.memo:"");
                                balanceDataObj.asssetSymbol="";
                                balanceSource.push(balanceDataObj);
                                //2.手续费（零钱，余额）
                                if(op.fee.total){
                                    let feeDataObj={
                                        userId:op.to,
                                        from: op.from,
                                        to: op.to,
                                        remark:"",
                                        amount:this._formartAmount(op.fee.total.amount),
                                        time:op.time,
                                        symbol:"-",
                                        transferType:"balance_for_fee",
                                        inx:op.inx,
                                        assetId:0,
                                        asssetSymbol:""
                                    }
                                    //额外增加一条转账手续费
                                    balanceSource.push(feeDataObj);
                                }
                            }
                        }else if(op.type==6){
                            //积分
                            let feeDataObj={
                                userId:op.to,
                                from: op.from,
                                to: op.to,
                                remark:"",
                                amount:this._formartAmount((op.fee.options.from_balance||op.fee.options.from_csaf||op.fee.options.from_prepaid).amount),
                                time:op.time,
                                symbol:"-",
                                transferType:"integral_for_fee",
                                inx:op.inx,
                                assetId:0,
                                asssetSymbol:""
                            }
                            //额外增加一条转账手续费
                            prepaidSource.push(feeDataObj);
                        }
                    }else if(op.from==uid){
                        if(op.type==0){
                            //二.我转账给别人                    
                            //1.余额转账给别人,无扩展信息就是余额转余额
                            if(op.extensions){
                                if(op.extensions.from_balance){
                                    balanceDataObj.userId=op.to;
                                    balanceDataObj.transferType=(tokenInfo==null?"balance_to_user":"asset_to_user");
                                    balanceDataObj.symbol="-";
                                    balanceDataObj.remark=(op.memo?op.memo:"");
                                    balanceDataObj.assetId=op.amount.asset_id;
                                    balanceSource.push(balanceDataObj);
                                    //2.手续费（零钱，余额）
                                    if(op.fee.options.from_balance){
                                        let feeDataObj={
                                            userId:op.to,
                                            from: op.from,
                                            to: op.to,
                                            remark:"",
                                            amount:this._formartAmount(op.fee.options.from_balance.amount),
                                            time:op.time,
                                            symbol:"-",
                                            transferType:"balance_for_fee",
                                            inx:op.inx,
                                            assetId:0
                                        }
                                        //额外增加一条转账手续费
                                        balanceSource.push(feeDataObj);
                                    }                        
                                }
                                //2.零钱转账给别人
                                if(op.extensions.from_prepaid){
                                    prepaidDataObj.userId=op.to;
                                    prepaidDataObj.transferType="prepaid_to_user";
                                    prepaidDataObj.symbol="-";
                                    prepaidDataObj.remark=(op.memo?op.memo:"");
                                    prepaidSource.push(prepaidDataObj);

                                    //2.手续费（零钱，余额）
                                    if(op.fee.options.from_prepaid){
                                        let feeDataObj={
                                            userId:op.to,
                                            from: op.from,
                                            to: op.to,
                                            remark:"",
                                            amount:this._formartAmount(op.fee.options.from_prepaid.amount),
                                            time:op.time,
                                            symbol:"-",
                                            transferType:"balance_for_fee",
                                            inx:op.inx,
                                            assetId:0
                                        }
                                        //额外增加一条转账手续费
                                        prepaidSource.push(feeDataObj);
                                    }
                                }
                            }else{
                                balanceDataObj.userId=op.to;
                                balanceDataObj.transferType=(tokenInfo==null?"balance_to_user":"asset_to_user");
                                balanceDataObj.symbol="-";
                                balanceDataObj.remark=(op.memo?op.memo:"");
                                balanceDataObj.assetId=op.amount.asset_id;
                                balanceSource.push(balanceDataObj);
                                //2.手续费（零钱，余额）
                                if(op.fee.total){
                                    let feeDataObj={
                                        userId:op.to,
                                        from: op.from,
                                        to: op.to,
                                        remark:"",
                                        amount:this._formartAmount(op.fee.total.amount),
                                        time:op.time,
                                        symbol:"-",
                                        transferType:"balance_for_fee",
                                        inx:op.inx,
                                        assetId:0
                                    }
                                    //额外增加一条转账手续费
                                    balanceSource.push(feeDataObj);
                                }
                            }
                        }else if(op.type==6){
                            //积分
                            let feeDataObj={
                                userId:op.to,
                                from: op.from,
                                to: op.to,
                                remark:"",
                                amount:this._formartAmount((op.fee.options.from_balance||op.fee.options.from_csaf||op.fee.options.from_prepaid).amount),
                                time:op.time,
                                symbol:"-",
                                transferType:"integral_for_fee",
                                inx:op.inx,
                                assetId:0
                            }
                            //额外增加一条转账手续费
                            balanceSource.push(feeDataObj);
                        }
                    }else if(op.to==uid && op.type==0){
                        //三.别人转账给我
                        //1.别人转账给我（余额）
                        balanceDataObj.userId=op.from;
                        balanceDataObj.transferType="balance_user_to_me";
                        balanceDataObj.symbol="+";
                        balanceDataObj.remark=(op.memo?op.memo:"");
                        balanceDataObj.assetId=op.amount.asset_id;
                        balanceDataObj.asssetSymbol="";
                        balanceSource.push(balanceDataObj);
                    }
                    
                    //根据请求类型赋值
                    if(dataType==0){
                        // console.log("序号：",op.inx);
                        source = balanceSource;
                    }else{
                        source = prepaidSource;
                    }
                }

                //过滤资产
                if(tokenInfo!=null){
                    source= source.filter(function(item){
                        return (item.assetId==tokenInfo.asset_id || item.asssetSymbol==tokenInfo.symbol);
                    });
                }else{
                    source=source.filter(function(item){
                        return item.assetId==0;
                    });
                }

                // let endDate=new Date();
                // console.log(`logice times:${endDate-startDate}ms,_lastInx:${_lastInx},lastInx:${lastInx},history.length:${history.length},start:${start}`);

                result=source.length>0?result.concat(source):result;
                let isEnd=_lastInx == 2;
                if(result.length<pageSize*pageIndex){
                    if(_lastInx>2){
                        this._getHistoryInfoList(result,uid,opType,dataType,_lastInx,pageSize,pageIndex,tokenInfo, resolve, reject);
                    }else{
                        resolve({history:result,isEnd,start:_lastInx,pageIndex:parseInt(result.length/pageSize)+1});
                    }
                }else{
                    resolve({history:result,isEnd,start:_lastInx,pageIndex:parseInt(result.length/pageSize)+1});
                }
            });
        }
        catch(e){
            reject();
        }
    }

    /**
     * 初始化数据
     */
    onClearStates({resolve, reject}){
        this.setState({
            type: 0,
            source: [],
            history: [],
            start:0,
            lastInx:2,
            isEnd:false,
            pageIndex:1
        });
        resolve();
    }

    /**
     * 格式化金额
     * @param {*} amount 
     */
    _formartAmount(amount,tokenInfo=null)
    {
        if(tokenInfo==null){
            return `${Utils.realCount(amount)}`;
        }else{
            return `${amount / Utils.precisionToNum(tokenInfo.precision)}`;
        }
    }
}

export default alt.createStore(HistoryStore,"HistoryStore");