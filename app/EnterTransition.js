import {
    Apis,
    Manger
} from "yoyowjs-ws";
import {
    ChainStore
} from "yoyowjs-lib/es";

import {
    ls,
    WalletDatabase,
    GlobalParams
} from "../lib";
//actions
import PrivateKeyActions from "./actions/PrivateKeyActions";
import SettingsActions from "./actions/SettingsActions";

//stores
import SettingsStore from "./stores/SettingsStore";
import WalletStore from "./stores/WalletStore";
import {
    FetchWrapper
} from "../lib";
import TipsActions from "./actions/TipsActions";


ChainStore.setDispatchFrequency(20);
let connects = true;
let enterTransition = (nextState, replaceState, next) => {

    let initNet = () => {
        SettingsActions.checkFastApi().then(connectionString => {
                SettingsActions.changeSetting({
                    setting: "apiServer",
                    value: connectionString
                });
                Apis.instance(connectionString, !!connects).init_promise
                    .then((result) => {
                        GlobalParams.init().then(() => {
                            GlobalParams.setConf('coin_unit', result[0].network.core_asset);
                            var db;
                            try {
                                db = WalletDatabase.initInstance().initPromise;
                            } catch (err) {
                                console.error("db init error:", err);
                            }

                            return Promise.all([db]).then(() => {
                                if (__DEBUG__) console.log("db init done");
                                return Promise.all([
                                    PrivateKeyActions.loadDbData().then(() => {
                                        if (__DEBUG__) console.log("=====================PrivateKeyActions.loadDbData");
                                    }),
                                    WalletStore.loadDbData().then(() => {
                                        if (__DEBUG__) console.log("=====================WalletStore.loadDbData");
                                        let urls = ["/about/product-guide", "/create-account"]; //允许直接访问的url
                                        //首次加载引导页
                                        if (!localStorage.getItem('firstProductGuide') && urls.indexOf(nextState.location.pathname) == -1) {
                                            replaceState("/about/product-guide");
                                        } else if (!WalletStore.getWallet() && urls.indexOf(nextState.location.pathname) == -1) {
                                            replaceState("/create-account");
                                        } else if (nextState.location.pathname === '/init-error') {
                                            replaceState("/");
                                        }
                                    }).catch((error) => {
                                        console.error("----- WalletStore.enterTransition error ----->", error);
                                    })
                                ]).then(() => {
                                    next();
                                });
                            });
                        });
                    })
                    .catch(error => {
                        errPage(nextState, replaceState, next);
                    });
                connects = false;
            })
            .catch(err => {
                errPage(nextState, replaceState, next);
            });
    };

    setTimeout(function () {
        initNet();
    }, 200);
};

let errPage = (nextState, replaceState, next) => {
    if (nextState.location.pathname !== '/init-error') {
        replaceState("/init-error");
    }
    next();
}

export default enterTransition;