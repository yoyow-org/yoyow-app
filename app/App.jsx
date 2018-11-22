import React from "react";
import IntlStore from "stores/IntlStore";
import IntlActions from "actions/IntlActions";
import alt from "altInstance";
import { connect, supplyFluxContext } from "alt-react";
import { IntlProvider } from "react-intl";
import { ChainStore } from "yoyowjs-lib/es"
import intlData from "assets/intl-data/intlData";
import { Apis, Manger } from "yoyowjs-ws";
import KeyBoards from "./components/Layout/KeyBoards"
import TipsActions from "./actions/TipsActions";
import Dialog from "./components/Layout/Dialog";
import Toast from "./components/Layout/Toast";
import LoadingGlobal from "./components/Layout/LoadingGlobal";
import Header from "./components/Layout/Header";
import SettingsStore from "./stores/SettingsStore";
import WalletUnlock from "./components/Layout/WalletUnlock";
import Updater from "./components/Updater";
import ReactCSSTransitionGroup from "react-addons-css-transition-group";
import counterpart from "counterpart";
import Utils from "../lib/utils/Utils";
import WalletStore from "./stores/WalletStore";
import SettingsAcctions from "./actions/SettingsActions"

var apis_reconnecting = false; // apis 重新连接状态
var countLoading = 0;
var tiredLoding = false;
var wsLife = null;
var webHeart = null;
class App extends React.Component {
    constructor() {
        super();
        let syncFail = ChainStore.subError && (ChainStore.subError.message === "ChainStore sync error, please check your system clock") ? true : false;
        this.state = {
            loading: true,
            synced: ChainStore.subscribed,
            syncFail,
            modalIsShow: false,
            buttonClick: 0,
            allServers: []
        };
    }

    __handleBackButton(e) {
        e.preventDefault()

        let { buttonClick } = this.state;
        let hash = window.location.hash;

        if((hash.includes("#/product-guide")||hash.includes("#/index")||hash.includes("#/platformindex")||hash.includes("#/myaccount"))&&!this.props.needBack){
            buttonClick++
            if (buttonClick == 1) {
                TipsActions.toast(this.__translate("public.tips_back_button"))
            } else if (buttonClick == 2) {
                buttonClick = 0;

                window.removeEventListener("deviceready", this.__handleDeviceReady);
                window.removeEventListener("backbutton", this.__handleBackButton);
                this.setState({
                    buttonClick: buttonClick
                })
                navigator.app.exitApp()
            }
            this.setState({
                buttonClick: buttonClick
            })
        }else{
            let isAnimation = SettingsStore.getState().isAnimation;
            let time = null;
            TipsActions.setIsLoadingShow(false)
            if(!isAnimation){
                SettingsAcctions.setRouterType("back");

                this.context.router.goBack();

                time = setTimeout(()=>{
                    SettingsAcctions.isAnimation(false)
                    clearTimeout(time)
                },300)
            }
        }


    }

    __translate(locale_keypath, options) {
        let content = "";
        if (null != locale_keypath && "" != locale_keypath) {
            if (typeof (locale_keypath) === "string") {
                if (locale_keypath.indexOf("$") > -1) {
                    content = locale_keypath.replace("$", "");
                }
                else {
                    content = counterpart.translate(locale_keypath, options);
                }
            } else {
                locale_keypath.map((item) => {
                    if (item.indexOf("$") > -1) {
                        content += item.replace("$", "");
                    } else {
                        content += counterpart.translate(item, options);
                    }
                });
            }
            return content;

        }
        return "Missing Language";
    }

    componentDidMount() {
        document.addEventListener("deviceready", this.onDeviceReady.bind(this), false);
        document.addEventListener("resume", this.onResume.bind(this), false);
        document.addEventListener("online", this.onConnectSwitch.bind(this), false);
        document.addEventListener("offline", this.onConnectSwitch.bind(this), false);

        // 延时1s关闭启动页，防止白屏
        setTimeout(() => {
            if (navigator.splashscreen) navigator.splashscreen.hide();
        }, 3000);
        wsLife = setTimeout(() => {
            this.__reconnectApis();
        }, 500);

        localStorage.setItem('pageInx', 1);

        webHeart = setInterval(this.__checkWebHeart.bind(this), 3000);
    }

    __checkWebHeart() {
        ChainStore.init().then().catch(err => {
            this.__reconnectApis();
        })
    }

    componentWillUnmount() {
        if (wsLife) clearInterval(wsLife);
        if (webHeart) {
            clearInterval(webHeart);
            webHeart = null;
        }
    }
    /**
     * 设备准备完成
     */
    onDeviceReady() {
        document.addEventListener("backbutton", this.__handleBackButton.bind(this), false)
        StatusBar.hide();
        //判断是否设置过全球化
        if (!localStorage.golbalization) {
            localStorage.golbalization = true;
            //国际化
            if (navigator.globalization) {
                navigator.globalization.getLocaleName(
                    function (locale) {
                        let upChar = locale.value.toUpperCase();
                        if (upChar.indexOf("ZH") > -1 || upChar.indexOf("CN") > -1) {
                            IntlActions.switchLocale("zh");
                        } else {
                            IntlActions.switchLocale("en");
                        }
                    },
                    function () {
                        IntlActions.switchLocale("zh");
                    }
                )
            } else {
                if (window.navigator.language.indexOf("en") >= 0) {
                    IntlActions.switchLocale("en");
                } else {
                    IntlActions.switchLocale("zh");
                }
            }

        }
    }
    /**
     * 设备唤醒
     */
    onResume() {
        let netstatus = this.__checkNetwork();
        if (netstatus) {
            this.__reconnectApis();
        }
    }

    /**
     * 网络状态切换
     */
    onConnectSwitch() {
        let netstatus = this.__checkNetwork();
        if (netstatus) {
            this.__reconnectApis();
        }
    }

    __checkNetwork() {
        if (!navigator.onLine) {
            let pathname = this.props.location.pathname;
            if (pathname != '/init-error') {
                window.location.href = '#/init-error';
            }
            return false;
        } else {
            return true;
        }
    }

    __reconnectApis() {
        if (!apis_reconnecting) {
            ChainStore.init().then(() => {
            }).catch(err => {
                let connectionString = SettingsStore.getSetting("apiServer");
                /**验证签名 */
                Utils.checkCertificate(connectionString)
                    .then(res => {
                    })
                    .catch(err => {
                        // navigator.app.exitApp();
                    });

                //初始化API
                Apis.instance(connectionString, true).init_promise
                    .then(result => {
                        apis_reconnecting = true;
                        let reconnect = setInterval(() => {
                            let isErrorPage = window.location.href.indexOf('init-error') >= 0;
                            if (!tiredLoding && !isErrorPage) {
                                TipsActions.loading(true);
                                countLoading++;
                            }
                            ChainStore.init().then(() => {
                                apis_reconnecting = false;
                                countLoading = 0;
                                tiredLoding = false;
                                TipsActions.loading(false);
                                clearInterval(reconnect);
                                // 网络恢复正常 且当前为错误页，重新加载页面
                                if (isErrorPage) {
                                    navigator.splashscreen.show();
                                    window.location.reload(true);
                                }
                            }).catch(err => {
                                // 若连接10秒之后依然未能连上，跳转到error页面
                                if (countLoading > 10 && !isErrorPage) {
                                    apis_reconnecting = false;
                                    countLoading = 0;
                                    tiredLoding = true;
                                    TipsActions.loading(false);
                                    window.location.href = '#/init-error';
                                }
                            });
                        }, 1000);
                    })
                    .catch(err => { });

            });
        }
    }

    render() {
        let { headerData, locale, transitionName } = this.props;
        let content;
        if (this.state.syncFail) {
            content = (<InitError />);
        } else {
            content = (
                <ReactCSSTransitionGroup
                    transitionName={transitionName}
                    component="div"
                    className="full_screen"
                    transitionEnterTimeout={200}
                    transitionLeaveTimeout={200}>
                    <div key={this.props.location.pathname} id="layer_content_global" className="layer_router" style={{ paddingTop: headerData ? "" : "0" }}>
                        <Header headerData={headerData} />
                        {this.props.children}
                    </div>
                </ReactCSSTransitionGroup>
            );
        }
        return (
            <div className="cover_full">
                <Updater />
                <WalletUnlock />
                <LoadingGlobal />
                <Toast />
                <Dialog />
                <KeyBoards />
                {content}
            </div>
        );
    }
}

class RootIntl extends React.Component {
    componentWillMount() {
        IntlActions.switchLocale(this.props.locale);
    }

    render() {
        return (
            <IntlProvider
                locale={this.props.locale}
                formats={intlData.formats}
                initialNow={Date.now()}
            >
                <App {...this.props} />
            </IntlProvider>
        );
    }
}

RootIntl = connect(RootIntl, {
    listenTo() {
        return [IntlStore, SettingsStore];
    },
    getProps() {
        return {
            needBack:WalletStore.getState().needBack,
            locale: IntlStore.getState().currentLocale,
            headerData: SettingsStore.getState().headerData,
            transitionName: SettingsStore.getState().transitionName
        };
    }
});

class Root extends React.Component {
    static childContextTypes = {
        router: React.PropTypes.object,
        location: React.PropTypes.object
    }

    getChildContext() {
        return {
            router: this.props.router,
            location: this.props.location
        };
    }

    render() {
        return <RootIntl {...this.props} />;
    }
}

export default supplyFluxContext(alt)(Root);