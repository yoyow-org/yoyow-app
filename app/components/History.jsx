import React from 'react';
import BaseComponent from "./BaseComponent";
import TipsActions from "../actions/TipsActions";
import SettingsActions from "../actions/SettingsActions";
import HistoryActions from "../actions/HistoryActions";
import WalletStore from "../stores/WalletStore";
import HistoryStore from "../stores/HistoryStore";
import BalancesStore from "../stores/BalanceStore";
import TokensStore from "../stores/TokensStore";
import WalletUnlockActions from "../actions/WalletUnlockActions";
import PrivateKeyStore from "../stores/PrivateKeyStore";
import {img_nodata} from "../assets/img";
import {Utils, Validation} from "../../lib";

let isRequest = false;
let preBoxHeight = 0;
let timer
class History extends BaseComponent {
    constructor() {
        super();
        this.state = this.__initHistoryState();
    }

    __initHistoryState() {
        let initState = {
            master: WalletStore.getWallet().yoyow_id,
            //master:"288395475",
            curType: 0,
            dataType: 0
        }
        return initState;
    }

    componentDidMount() {
        let headerData = {
            buttonLeft: {
                value: "img_back",
            },
            title: "",
            onBack: this.handleBack.bind(this)
            //canBack:true
        }
        SettingsActions.updateHeader(headerData);
        /**
         * 根据URL参数判断取那种数据
         */
        timer = setTimeout(() => {
            let {params, tokenInfo, transferHeadTitle} = this.props;
            let dataType = Validation.isEmpty(params.type) ? 0 : params.type;
            this.setState({dataType: dataType});
            if (tokenInfo == null) {
                headerData.title = `history.op_tite.${dataType}`;
            } else {
                headerData.title = transferHeadTitle;
            }

            //提取数据
            // TipsActions.loading(true);
            HistoryActions.getHistoryByUid(this.state.master, null, dataType, tokenInfo, true)
                .then(() => {
                    // TipsActions.loading(false);
                })
                .catch(err => {
                    // TipsActions.loading(false);
                });
        }, 210)

    }

    componentWillUnmount() {
        HistoryActions.clearStates();
        
        clearTimeout(timer)
    }

    handleBack() {
        let HistoryList = this.refs.HistoryList;
        if (HistoryList) HistoryList.display = "none";
        this.routerBack()
    }

    handleScroll(e) {
        let {HistoryList} = this.refs;
        preBoxHeight = HistoryList.scrollTop;
        let bottomVal = Math.ceil(HistoryList.scrollTop + HistoryList.clientHeight) >= HistoryList.scrollHeight;
        let {isEnd, tokenInfo} = this.props;
        if (bottomVal && !isEnd && !isRequest) {
            isRequest = true;
            //提取数据
            // TipsActions.loading(true);
            HistoryActions.getHistoryByUid(this.state.master, null, this.state.dataType, tokenInfo)
                .then(() => {
                    isRequest = false;
                    HistoryList.scrollTo(0, preBoxHeight);
                    // TipsActions.loading(false);
                }).catch(err => {
                // TipsActions.loading(false);
            });
        }
    }

    /**查看备注 */
    handleViewRemark(memo, event) {
        let tryDecode = new Buffer(memo.message, 'hex').toString('utf-8');
        let contentAlgin = true;
        if (tryDecode.indexOf('uncrypto') === 0) {
            let remark = tryDecode.substring(8, tryDecode.length);
            contentAlgin = remark.length > 20 ? false : true;
            TipsActions.alert(remark, this.translate("history.dialog_title"), contentAlgin);
            return true;
        }

        let memoStand = () => {
            let result = PrivateKeyStore.decodeMemo(memo);
            if (result.text != '**') {
                if (Validation.isEmpty(result.text)) {
                    TipsActions.alert(this.translate('history.unable_view_reason'), this.translate("history.dialog_title"), contentAlgin);
                } else {
                    contentAlgin = result.text.length > 20 ? false : true;
                    TipsActions.alert(result.text, this.translate("history.dialog_title"), contentAlgin);
                }
            }
        };
        WalletUnlockActions.checkLock(false, false, "")
            .then(() => {
                memoStand();
            })
    }

    render() {
        let {history, isEnd} = this.props;
        let haveHistory = history && history.length > 0;
        return (
            <div className="history_content">
                {
                    haveHistory ?
                        <div ref="HistoryList" className="history_list" onScroll={this.handleScroll.bind(this)}>
                            <ul>
                                {
                                    history.map(item => {
                                        return (<li key={'history' + Date.now() + Math.random()}>
                                            <div className="detail_content">
                                                <span
                                                    className="deteil_type">{this.translate(`history.op_transfer.${item.transferType}`, {uid: item.userId})}</span> {item.remark ?
                                                <button
                                                    onClick={this.handleViewRemark.bind(this, item.remark)}></button> : ""}
                                                <br/>
                                                <span className="deteil_date">{item.time}</span>
                                            </div>
                                            <div
                                                className={item.symbol == "-" ? "detail_count" : "detail_count red"}>{item.symbol}{item.amount}</div>
                                        </li>)
                                    })
                                }
                                {
                                    !isEnd ? <li ref="PullUp"><span
                                        className="loadMore">{this.translate("history.loading")}</span></li> : ""
                                }
                            </ul>
                        </div>
                        :
                        <div className="history_undata">
                            <div className="history_undata_content">
                                <img src={img_nodata}/><br />
                                <span>{this.translate("history.no_relevant_data")}</span>
                            </div>
                        </div>
                }
            </div>
        )
    }

}

export default Utils.altConnect(History, [HistoryStore, BalancesStore]);