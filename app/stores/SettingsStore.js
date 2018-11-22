import alt from "../altInstance";
import SettingsActions from "../actions/SettingsActions";
import IntlActions from "../actions/IntlActions";
import Immutable from "immutable";
import {merge} from "lodash";
import BaseStore from "./BaseStore";
import {GlobalParams} from "../../lib";
import ls from "../../lib/db/localStorage";

const STORAGE_KEY = "__yoyow__"

let sk = new ls(STORAGE_KEY);

class SettingsStore extends BaseStore {
    constructor() {
        super();

        this.exportPublicMethods({
            getSetting: this.getSetting.bind(this),
        });

        this.headerData ={
            buttonLeft:{
                value:"img_back",
            },
            title:"",
            canBack:true
        }
        this.isAnimation = false
        this.transitionName={
            enter: 'enter',
            leave: 'leave'
        }
        this.prevUrl=["/"];
        
        this.bindListeners({
            onChangeSetting: SettingsActions.changeSetting,
            onAddWS: SettingsActions.addWS,
            onRemoveWS: SettingsActions.removeWS,
            onClearSettings: SettingsActions.clearSettings,
            onSwitchLocale: IntlActions.switchLocale,
            onUpdateHeader:SettingsActions.updateHeader,
            onCheckFastApi: SettingsActions.checkFastApi,
            onSetPrevUrl: SettingsActions.setPrevUrl,
            onSetRouterType: SettingsActions.setRouterType,
            onIsAnimation:SettingsActions.isAnimation
        });

        let apisvr = "wss://demo.yoyow.org/ws";
        // let apisvr = "ws://47.52.155.181:10011";
        let faucetsvr = "http://demo.yoyow.org:3000";
        let fetchsvr = "https://download.yoyow.org/resource";
        if (!process.env.test) {
            apisvr = "wss://wallet.yoyow.org/ws";
            faucetsvr = "https://faucet.yoyow.org";
            fetchsvr = "https://mixchain.io/resource";
        }

        this.defaultSettings = Immutable.Map({
            locale: "zh",
            apiServer: apisvr,
            faucet_address: faucetsvr,
            walletLockTimeout: 60 * 1,
            createAccountGuide: 1
        });

        let apiFaucets = [
            {value: faucetsvr, text: faucetsvr}
        ];

        let apiServers = this.getApiServers();

        let defaults = {
            locale: [
                "zh",
                "en"
            ],
            apiServers: [],
            apiFaucets: apiFaucets
        };

        this.settings = Immutable.Map(merge(this.defaultSettings.toJS(), sk.get("settings_v1"), {'fetchServer': fetchsvr}));
        let savedDefaults = sk.get("defaults_v1", {});
        this.defaults = merge({}, defaults, savedDefaults);
        (savedDefaults.apiServers || []).forEach(api => {
            let hasApi = false;
            if (typeof api === "string") {
                api = {value: api, text: api};
            }
            this.defaults.apiServers.forEach(server => {
                if (server.value === api.value) {
                    hasApi = true;
                }
            });

            if (!hasApi) {
                this.defaults.apiServers.push(api);
            }
        });

        for (let i = apiServers.length - 1; i >= 0; i--) {
            let hasApi = false;
            this.defaults.apiServers.forEach(api => {
                if (api.value === apiServers[i].value) {
                    hasApi = true;
                }
            });
            if (!hasApi) {
                this.defaults.apiServers.unshift(apiServers[i]);
            }
        }

    }

    getApiServers(){
        let apiServers = [];
        if(process.env.test){
            apiServers.push({value: "wss://demo.yoyow.org/ws", text: "TESTNET"});
        }else{
            apiServers.push({value: "wss://wallet.yoyow.org/ws", text: "wallet.yoyow.org"});
            apiServers.push({value: "wss://api-bj.yoyow.org/ws", text: "api-bj.yoyow.org"});
            apiServers.push({value: "wss://api-hz.yoyow.org/ws", text: "api-hz.yoyow.org"});
        }

        return apiServers;
    }

    onCheckFastApi({resolve, reject}){
        let apiServers = this.getApiServers();
        apiServers.map( api => {
            let _ws = new WebSocket(api.value);
            _ws.onopen = () => {
                _ws.close();
                resolve(api.value);
            }
            _ws.onerror = () => {
                reject()
            }
        });
    }

    getSetting(setting) {
        return this.settings.get(setting);
    }

    onChangeSetting(payload) {
        this.settings = this.settings.set(
            payload.setting,
            payload.value
        );
        sk.set("settings_v1", this.settings.toJS());
        if (payload.setting === "walletLockTimeout") {
            sk.set("lockTimeout", payload.value);
        }
    }

    onAddWS(ws) {
        if (typeof ws === "string") {
            ws = {value: ws, text: ws};
        }
        this.defaults.apiServers.push(ws);
        sk.set("defaults_v1", this.defaults);
    }

    onRemoveWS(index) {
        if (index !== 0) {
            this.defaults.apiServers.splice(index, 1);
            sk.set("defaults_v1", this.defaults);
        }
    }

    onClearSettings() {
        sk.remove("settings_v1");
        this.settings = this.defaultSettings;
        sk.set("settings_v1", this.settings.toJS());
        if (window && window.location) {
            window.location.reload();
        }
    }

    onSwitchLocale({locale}) {
        this.onChangeSetting({setting: "locale", value: locale});
    }

    onUpdateHeader(data){
        this.setState({
            headerData:data
        })
    }

    onSetPrevUrl(url) {
        if(url==""||!url){
            this.prevUrl.pop();
        }else if(url == "init"){
            this.prevUrl = ["/create-account"]
        }else if (!this.prevUrl.includes(url)) {
            this.prevUrl.push(url);
        }else if(this.prevUrl.includes(url)&& url !=""){

            let index = this.prevUrl.findIndex(n => n==url)
            this.prevUrl.splice(index,1);
            this.prevUrl.push(url)
        }

        this.setState({
            prevUrl: this.prevUrl
        })
    }
    onIsAnimation(bool) {
        this.setState({
            isAnimation: bool
        })
    }
    onSetRouterType(type) {
        if (type == "go") {
            this.setState({
                transitionName: {
                    enter: 'enter',
                    leave: 'leave'
                }
            })

        } else if (type == "back") {
            this.setState({
                transitionName: {
                    enter: 'back_enter',
                    leave: 'back_leave'
                }
            })
        }
    }
}

export default alt.createStore(SettingsStore, "SettingsStore");