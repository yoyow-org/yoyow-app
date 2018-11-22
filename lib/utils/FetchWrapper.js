/**
 * 封装 fetch 用于处理http请求操作
 * 如 向 faucet 请求
 */
import validation from "./Validation";
import Utils from "./Utils";

let serializeObj = (obj) => {
    let arr = [];
    for (let o in obj) {
        arr.push(`${o}=${obj[o]}`);
    }
    return arr.join('&');
};

let baseFetch = (url, type = 'get', data, baseUrl = null) => {
    let requestUrl = `${baseUrl}${url}`;
    return new Promise((resolve, reject) => {
        
        /**验证签名 */
        Utils.checkCertificate(baseUrl)
        .then()
        .catch(err=>{
            setTimeout(()=>{
                navigator.app.exitApp();
            },2000);
        });

        // 处理请求成功情况
        let __success = res => {
            if (res.code == 0) {
                resolve(res.data);
            } else {
                reject(res.msg ? res.msg : res.message);
            }
        }

        // 处理请求失败情况
        let __error = msg => {
            reject(msg);
        }

        // 使用cordova http 请求，在ios使用wkwebview的时候，强制使用了CROS设置
        // 导致需要服务器端也必须做同样的设置才能使用，于是就引入了cordova http请求
        // TODO: 后面若Android端也需要用到wkwebview内核，则在Andoird端的插件中引入cordovaHttp

        try {
            validation.isEmpty(cordovaHTTP);
            if (validation.isEmpty(data)) data = {};
            if (type.toLowerCase() == 'post') type = 'postJson';
            cordovaHTTP[type](requestUrl, data, {
                "Content-type": "application/json"
            }, response => {
                __success(JSON.parse(response.data));
            }, response => {
                __error(response.error);
            });
        } catch (e) {
            let requestObj = {
                method: type,
                mode: 'cors',
                headers: {
                    "Accept": "application/json",
                    "Content-type": "application/json"
                }
            };

            if (!validation.isEmpty(data)) {
                requestObj.body = validation.isString(data) ? data : JSON.stringify(data);
            }

            function checkStatus(response) {
                if (response.status >= 200 && response.status < 300) {
                  return response;
                } else {
                  var error = new Error(response.statusText);
                  error.response = response;
                  return error;
                }
              }
              
            function parseJSON(response) {
                return response.json();
            }
            
            fetch(requestUrl, requestObj)
            .then(checkStatus)
            .then(parseJSON)
            .then(res => {
                __success(res);
            }).catch(err => {
                __error(err.message);
            });
        }
    });
};

export default {
    get(url, data, baseUrl) {
        let params = serializeObj(data);
        return baseFetch(`${url}`, 'get', params, baseUrl);
    },

    delete(url, data, baseUrl) {
        let params = serializeObj(data);
        return baseFetch(`${url}`, 'delete', params, baseUrl);
    },

    post(url, data, baseUrl) {
        return baseFetch(url, 'post', data, baseUrl);
    },
};