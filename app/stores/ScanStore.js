/**
 * Created by lucker on 2018/6/21.
 */
import BaseStore from "./BaseStore";
import alt from "../altInstance";
import ScanActions from "../actions/ScanActions";

class ScanStore extends BaseStore {
    constructor() {
        super();
        this.bindActions(ScanActions);
        this.state = this.__initState();
    }

    __initState() {
        return {routerState: null, qrStr: null};
    }

    onScan(routerState) {
        this.setState({routerState});
    }

    onSetScanResult(qrStr) {
        this.setState({qrStr});
    }

    onReset() {
        this.setState(this.__initState());
    }
}

export default alt.createStore(ScanStore, "ScanStore");