import alt from "../altInstance";
import BaseStore from "./BaseStore";
import Immutable from "immutable";
import CachedSettingActions from "../actions/CachedSettingActions";
import {WalletDatabase} from "../../lib";

class CachedSettingStore extends BaseStore {
    constructor() {
        super();
        this.state = this.__getInitialState()
        this.bindListeners({
            onSet: CachedSettingActions.set,
            onGet: CachedSettingActions.get
        })
        this._export("get", "reset")
    }

    __getInitialState() {
        return {
            props: Immutable.Map()
        }
    }

    get(name) {
        return this.onGet({name});
    }

    onGet({name}) {
        var value = this.state.props.get(name);
        if (value !== undefined) return value;
        return WalletDatabase.instance().walletDB().getSetting(name, null).then(value => {
            var props = this.state.props.set(name, value);
            this.state.props = props;
            this.setState({props});
        });
    }

    onSet({name, value}) {
        if (this.state.props.get(name) === value) return;
        var props = this.state.props.set(name, value);
        this.state.props = props;
        WalletDatabase.instance().walletDB().setSetting(name, value).then(() =>
            this.setState({props}));
    }

    reset() {
        this.state = this.__getInitialState();
        this.setState(this.state);
    }
}

export default alt.createStore(CachedSettingStore, "CachedSettingStore");