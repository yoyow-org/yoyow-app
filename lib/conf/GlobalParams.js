import ChainApi from '../api/ChainApi';
import Utils from '../utils/Utils';

/**
 * 需要进行核心资产精度转换的参数 
 * 若不在此处转换则使用的时候自行转换亦可
 */
let need_transfer = [
    'min_witness_pledge',
    'min_committee_member_pledge'
]

class GlobalParams {

    constructor() {
        // 本地参数
        this.STORAGE_KEY = "__yoyow__"; // LocalStoreage Key
        this.balance_task_timeout = 30000; // 资产定时任务刷新间隔
        this.history_page_size = 20; // 近期活动每页显示数
        this.csaf_param = 100; // 币天及积分积累 最终现实转换参数
        this.retain_count = 100000; // 核心资产精度参数
        this.auth_due = 120 * 1000; //授权过期时间 ms
        this.ws_due = 20 * 1000; //ws连接心跳
        this.fetch_url = 'http://localhost:8090';
        // 网关参数 从水龙头获取
        this.bts_fees = 0; // bts网关转出手续费
        this.bts_master = 0; // bts网关账号
        this.erc20_fees = 0; // erc20网关转出手续费
        this.erc20_master = 0; // erc20网关账号
        // 链上参数 从链上获取 
        this.coin_unit = ''; // 货币单位
        this.min_witness_pledge = 0; // 见证人最小抵押
        this.min_committee_member_pledge = 0; // 理事会成员最小抵押
        this.servers=[
            { server: "wss://wallet.yoyow.org/ws", fingerprint: "56 D1 36 F8 7A 96 0A 94 3D C2 03 1B 7A DC 44 F8 CA 0B 26 E3 E3 A0 35 93 64 AF 89 B0 CF 61 CC F1" },
            { server: "https://faucet.yoyow.org", fingerprint: "3A A5 D4 40 92 53 F6 BF CC AC 5C B4 73 4F 22 C0 4E 76 28 E0 3C 81 20 0D 04 02 18 68 17 31 87 48" },
            { server: "https://mixchain.io/resource", fingerprint: "EF 77 DD 4C 5A F3 D3 F0 05 08 DA 30 A5 C5 22 98 EF 25 3D 3B CF 09 61 61 AB 93 D9 43 76 D3 64 B5" }
        ];
    }

    init() {
        // 从水龙头获取网关参数
        // let fetchFaucet = new Promise((resolve, reject) => {
        //     FetchWrapper.get('sys/sysConf/walletConfigs').then(res => {
        //         if (res.code == 0) {
        //             resolve(res.data);
        //         } else if (__DEBUG__) {
        //             console.error('get wallet config error...');
        //             console.log(res.msg);
        //             resolve();
        //         }
        //     });
        // });

        // 从链上获取参数
        let fetchChain = new Promise((resolve, reject) => {
            ChainApi.getParameters().then(({params, paramsdynamicParams }) => {
                resolve(params);
            }).catch(err => {
                if(__DEBUG__){
                    console.error('get chain config error...');
                    console.log(err.message); 
                }
                resolve();
            });
        });

        return new Promise((resolve, reject) => {
            Promise.all([fetchChain]).then(res => {
                for(let paramsObj of res)
                    if(paramsObj)
                        for(let key in paramsObj){
                            let val = paramsObj[key];
                            if(Utils.containerInArr(key, need_transfer)){
                                val = Utils.realCount(val);
                            }
                            this.setConf(key, val);
                        }
                resolve(this);
            }).catch(e => {
                console.log('Init global error ', e);
            });
        });
    }

    setConf(key, val) {
        this[key] = val;
    }

}

let globalParams = new GlobalParams();

export default globalParams;