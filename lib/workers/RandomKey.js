import {key} from "yoyowjs-lib";

self.onmessage = event => {
    let result = [];
    let keys = event.data;
    if(Object.prototype.toString.call(keys) == '[object Array]'){
        for(let k of keys){
            result.push(key.get_random_key(k[0], k[1]).toWif());
        }
    }
    self.postMessage(result);
}