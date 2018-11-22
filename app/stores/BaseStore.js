import counterpart from "counterpart";
class BaseStore {

    _export(...methods) {
        let publicMethods = {};
        methods.forEach((method) => {
            if(!this[method]) throw new Error(`BaseStore._export: method '${method}' not found in ${this.__proto__._storeName}`);
            this[method] = this[method].bind(this);
            publicMethods[method] = this[method];
        });
        this.exportPublicMethods(publicMethods);
    }

    _localize(UTCDate){
        let d =  UTCDate != null ? counterpart.localize(UTCDate, { type: "date", format: "full" }) : "";
        return d.length > 19 ? d.substring(0, 19) : d;
    }
}

export default BaseStore;