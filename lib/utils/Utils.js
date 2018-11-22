import { Long } from 'bytebuffer';
import { encode, decode } from 'bs58';
import ByteBuffer from 'bytebuffer';
import GlobalParams from '../conf/GlobalParams';
import Validation from './Validation';
import counterpart from "counterpart";
import { connect } from "alt-react";
import { ErrorTcomb } from "../db/TcombStructs";
import { filter } from "lodash";
import KeyBoardsActions from "../../app/actions/KeyBoardsActions"
import {PrivateKey, key, Aes, AccountUtils, TransactionBuilder, Signature} from "yoyowjs-lib";
import numeral from "numeral";
import TipsActions from "../../app/actions/TipsActions"

let req = require.context("../../app/assets/locales", true, /\.json/);
class Utils {

    /**
     * 计算可领取的币龄
     * @param statistics 账户的统计对象
     * @param window 币龄过期时间
     * @param now 头块时间
     * @returns {{new_coin_seconds_earned: number, new_average_coins: number}} 返回可领取的币龄和新的平均余额
     * remark
     * 时间之间的计算以秒为单位
     * 时间与其他的计算以分钟点的秒(向下取整的分钟秒数)为单位
     */
    static calcCoinSecondsEarned(statistics, window, now) {
        let new_average_coins = 0;
        let max_coin_seconds = 0;
        let effective_balance = Long.fromValue(statistics.core_balance).add(Long.fromValue(statistics.core_leased_in)).sub(Long.fromValue(statistics.core_leased_out));
        let nowTime = Long.fromNumber(new Date(now).getTime() / 1000); //头块时间 单位 秒
        nowTime -= nowTime % 60; // 转换成整分钟秒
        let averageUpdateTime = Long.fromNumber(new Date(statistics.average_coins_last_update).getTime() / 1000); //平均余额上次更新时间 单位 秒
        let earnedUpdateTime = Long.fromNumber(new Date(statistics.coin_seconds_earned_last_update).getTime() / 1000); //币龄采集上次更新时间 单位 秒

        if (nowTime <= averageUpdateTime) {
            new_average_coins = Long.fromValue(statistics.average_coins);
        } else {
            let delta_seconds = (nowTime - averageUpdateTime);
            if (delta_seconds >= window) {
                new_average_coins = effective_balance;
            } else {
                let old_seconds = window - delta_seconds;
                let old_coin_seconds = Long.fromValue(statistics.average_coins) * old_seconds;
                let new_coin_seconds = effective_balance * delta_seconds;
                max_coin_seconds = old_coin_seconds + new_coin_seconds;
                new_average_coins = Math.floor(max_coin_seconds / window);
            }
        }
        max_coin_seconds = new_average_coins * window;
        //检查可领取的币龄
        let new_coin_seconds_earned = 0;
        if (nowTime <= earnedUpdateTime) {
            new_coin_seconds_earned = Long.fromValue(statistics.coin_seconds_earned);
        } else {
            let delta_seconds = (nowTime - earnedUpdateTime);
            let delta_coin_seconds = effective_balance * delta_seconds;
            new_coin_seconds_earned = Long.fromValue(statistics.coin_seconds_earned).add(delta_coin_seconds);
        }
        if (new_coin_seconds_earned > max_coin_seconds) {
            new_coin_seconds_earned = max_coin_seconds;
        }

        return { new_coin_seconds_earned, new_average_coins };
    }

    static uint64ToBase58(val) {
        return encode(Long.fromValue(val).toBytesLE());
    }

    static base58ToUInt64(val58) {
        let uidBuf = ByteBuffer.fromBinary(Buffer.from(decode(val58)).toString("binary"), ByteBuffer.LITTLE_ENDIAN);
        let m = uidBuf.readUInt64();
        return m;
    }

    static hexToBase64(hex) {
        return new Buffer(hex, 'hex').toString('base64');
    }

    static base64ToHex(base64) {
        return new Buffer(base64, 'base64').toString('hex');
    }

    static utf8ToBase64(utf8) {
        return new Buffer(utf8, 'utf-8').toString('base64');
    }

    static base64ToUtf8(base64) {
        return new Buffer(base64, 'base64').toString('utf-8');
    }

    static encodeBackOwner(uid, owner) {
        if (typeof owner != "string") return null;
        if (owner.length != 51) return null;
        return owner + "" + Utils.uint64ToBase58(uid);
    }

    static decodeBackOwner(backOwner) {
        if (typeof backOwner != "string") return null;
        if (backOwner.length < 52) return null;
        let owner = backOwner.substr(0, 51);
        let uid = 0;
        try {
            uid = Utils.base58ToUInt64(backOwner.substr(51));
        } catch (e) {
            return null;
        }
        return { uid, owner };
    }

    /**
     * 核心资产类精度转换
     * @param {*} count 
     */
    static realCount(count) {
        let rc = GlobalParams.retain_count;
        let real = Math.round(count / rc * rc) / rc;
        return this.formatAmount(real);
    }

    /**
     * 精确小数点后5位的有效数据
     * 5位是根据实际yoyo全局比例参数来
     * @param val 格式化原始值
     * @param retainLen 保留小数长度(含小数点)
     */
    static formatAmount(val, retainLen) {
        let valLen = val.toString().length;
        let pointLen = val.toString().indexOf('.');
        if (!retainLen) retainLen = GlobalParams.retain_count.toString().length;
        if (pointLen >= 0 && valLen > pointLen + retainLen) {
            val = parseFloat(val.toString().substring(0, (pointLen + retainLen)));
        }
        return val;
    }

    /**
     * 格式化日期
     * @param dateStr 日期字符串 或 timestamp
     * @param GMT 时区差值
     * @returns {string}
     */
    static formatDate(dateStr, GMT) {
        let date = new Date(dateStr);
        if (Validation.isNumber(GMT) && GMT != 0) {
            date = new Date(date.getTime() + GMT * 60 * 60 * 1000);
        }
        return date.getFullYear() + '-' +
            this.autoFixed((date.getMonth() + 1)) + '-' +
            this.autoFixed(date.getDate()) + ' ' +
            this.autoFixed(date.getHours()) + ':' +
            this.autoFixed(date.getMinutes()) + ':' +
            this.autoFixed(date.getSeconds())
    }

    /**
     * 转换与api通讯时间值
     * @param dObj 日期字符串 或 timestamp
     * @returns {timestamp, dateStr} 转化后的时间戳 和 格式化日期
     */
    static transferApiDate(dObj) {
        let now = new Date();
        //解决浏览器兼容问题
        let date = new Date(Date.parse(dObj.replace("T", " ").replace(/-/g, "/")));
        let timeOffset = (now.getTimezoneOffset() * 60 * 1000);
        let timestamp = date.getTime() - timeOffset;
        let dateStr = this.formatDate(timestamp);
        return { timestamp, dateStr };
    }

    /**
     * 从字符串转换时间
     * @param {String} dateStr 头块时间字符串 yyyy-MM-ddThh:mm:ss
     * @returns {Number} 当前时间秒数
     */
    static transferApiDateString(dateStr) {

        try {
            let time = dateStr;
            let timeArr = [];
            let temp = time.split('T');

            timeArr = timeArr.concat(temp[0].split('-'));
            timeArr = timeArr.concat(temp[1].split(':'));

            let tempY = parseInt(timeArr[0]);
            let tempM = parseInt(timeArr[1]);
            let rangeMonth = 0;
            let maxDate = [1, 3, 5, 7, 8, 10, 12];
            let minDate = [4, 6, 9, 11];
            if (this.containerInArr(tempM, maxDate))
                rangeMonth = 31;
            else if (this.containerInArr(tempM, maxDate))
                rangeMonth = 30;
            else {
                if ((tempY % 4 == 0 && tempY % 100 != 0) || tempY % 400 == 0) {
                    rangeMonth = 29;
                } else {
                    rangeMonth = 28;
                }
            }
            let rangeArr = [12, rangeMonth, 24, 60, 60];
            let finalSec = new Date(`${tempY}-${this.autoFixed(tempM)}`).getTime() / 1000;

            // 年与月不参与计算 但参与索引递增
            timeArr[0] = 0;
            timeArr[1] = 0;
            // 抹去初始第一天
            timeArr[2] -= 1;

            for (let i = 0; i < 5; i++) {
                let sec = parseInt(timeArr[i]);
                for (let j = i; j < 5; j++) {
                    sec *= rangeArr[j];
                }
                finalSec += sec;
            }

            return finalSec;
        } catch (error) {
            return 0;
        }
    }

    /**
     * 自动补全数字
     * @param num
     * @param len
     * @returns {string}
     */
    static autoFixed(num, len = 2, symbol = 0) {
        let arr = [];
        let o = num.toString().split('');
        for (let i = 0; i < len - o.length; i++) {
            arr.push(symbol);
        }
        return arr.concat(o).join('');
    }

    static containerInArr(target, arr) {
        let flag = false;
        if (Validation.isArray(arr)) {
            for (let t of arr) {
                if (target == t) {
                    return true;
                }
            }
        }
        return flag;
    }

    /**
     * 错误消息工具
     * @param {Number|String|Object} err 错误代码
     * @returns {Object} {code, msg}
     */
    static formatError(err) {
        let eObj = {};
        let errBox = [
            // TODO: 待补充更多的底层字符串 或 Error类型错误
            { code: 1006, msg: 'Missing Active Authority' },
            { code: 1015, msg: 'INVALID_STATE_ERR' },
            { code: 1016, msg: 'Insufficient Balance' },
            { code: 1016, msg: '余额不足' },
            { code: 1018, msg: 'asset_symbol_itr' },
            { code: 1019, msg: 'asset_options.max_supply' },
            { code: 1021, msg: 'is_allowed_asset' },

            { code: 5001, msg: 'the account is not allowed to be empty'},
            { code: 5002, msg: 'the title is not allowed to be empty'},
            { code: 5003, msg: 'the title\'s length must less than 20' },
            { code: 5004, msg: 'the amount must less than 10000' },
            { code: 5005, msg: 'the asset_id is not valid'},
            { code: 5006, msg: 'the expiration_date is not valid'},
            { code: 5007, msg: 'the rule id is not allowed to be empty'},
            { code: 5008, msg: 'the order id is not allowed to be empty'},
            { code: 5009, msg: 'the account is not valid'},
            { code: 5010, msg: 'the rule id is not valid'},
            { code: 5011, msg: 'the rules must be less than 20 counts' },
            { code: 5012, msg: 'the title is not valid' },
            { code: 5013, msg: 'the rule name is not valid' },
        ];

        let filterInErrBox = (message) => {
            let filterRes = filter(errBox, o => {
                return message.indexOf(o.msg) >= 0
            });
            if (filterRes[0]) return filterRes[0].code;
        }
        if (Validation.isNumber(err)) {
            eObj.code = err;
        } else if (Validation.isError(err)) {
            eObj.code = filterInErrBox(err.message);
        } else if (Validation.isString(err)) {
            eObj.code = filterInErrBox(err);
        } else if (Validation.isObject(err) && err.code) {
            eObj = err;
        } else {
            eObj = { code: 0, msg: null };
        }
        eObj.msg = counterpart.translate(`errors.${eObj.code}`);
        if (eObj.msg.indexOf('missing translation:') === 0) {
            let myErr = typeof (err) == "object" ? err.message : err;
            eObj = {
                code: 1000,
                //msg: myErr
                msg: counterpart.translate("errors.unknow")
            }
        }
        return eObj

    }

    static altConnect(component, stores) {
        return connect(component, {
            listenTo() {
                return stores;
            },
            getProps() {
                let result = {};
                for (let store of stores) {
                    for (let props in store.getState()) {
                        result[props] = store.getState()[props];
                    }
                }
                return result;
            }
        })
    }

    static handleMask(obj) {
        let contentTop,contentGlobalTop
        if (document.getElementById("layerContent")) {
            contentTop = document.getElementById("layerContent").offsetTop;
        }
        if (document.getElementById("layer_content_global")) {
            contentGlobalTop = document.getElementById("layer_content_global").offsetTop;
        }


        let nomarlHeight = window.innerHeight;
        if (obj.className == "box_dialog") {
            obj.style.top = (nomarlHeight) / 2 + "px"
        }

        let scrollScreen = function (e) {

            let objHeight = obj.getBoundingClientRect().height;
            let objTop = obj.getBoundingClientRect().top;
            if (window.navigator.appVersion.indexOf("iPhone") <= 0) {
                setTimeout(() => {
                    let keyboardHeight = e.keyboardHeight;
                    let curHeight = nomarlHeight - keyboardHeight;


                    if (objTop + objHeight > curHeight) {

                        if (obj.className == "box_dialog") {
                            obj.style.top = (curHeight) / 2 + "px";
                            // if (document.getElementById("layerContent")) {
                            //     document.getElementById("layerContent").style.top = 0
                            // }
                            // if (document.getElementById("layer_content_global")) {
                            //     document.getElementById("layer_content_global").style.marginTop = 0
                            // }

                        } else if (obj.className == "create_account_input_wrapper" || obj.className == "create_account_input_wrapper_x") {

                            document.getElementById("layerContent").style.top = -(objTop + objHeight - curHeight) + "px"
                        } else {
                            document.getElementById("layer_content_global").style.marginTop = -(objTop + objHeight - curHeight) + "px"
                        }

                    }
                }, 200)
            }
        }
        let scrollBack = function () {
            if (obj.className == "box_dialog") {
                obj.style.top = (nomarlHeight) / 2 + "px";
                // if (document.getElementById("layerContent")) {
                //     document.getElementById("layerContent").style.top = contentTop+"px";
                // }
                // if (document.getElementById("layer_content_global")) {
                //     document.getElementById("layer_content_global").style.marginTop = contentGlobalTop+"px"
                // }

            } else if (obj.className == "create_account_input_wrapper" || obj.className == "create_account_input_wrapper_x") {

                document.getElementById("layerContent").style.top = 0+"px"
            } else {
                document.getElementById("layer_content_global").style.marginTop = 0+"px"
            }
            window.removeEventListener('native.keyboardshow', scrollScreen);
            window.removeEventListener('native.keyboardhide', scrollBack);
        }
        window.addEventListener('native.keyboardshow', scrollScreen,false);
        window.addEventListener('native.keyboardhide', scrollBack,false);

    }
    static handleKeyBoards(objInput, maskObj, isNumber, isPoint, pointLength = 0) {
        let nomarlHeight = window.innerHeight;
        KeyBoardsActions.setPointLength(pointLength);
        let scrollScreen = function (e) {
            let objHeight = maskObj.getBoundingClientRect().height;
            let objTop = maskObj.getBoundingClientRect().top;
            if (window.navigator.appVersion.indexOf("iPhone") <= 0) {
                setTimeout(() => {
                    let keyboardHeight = isNumber ? this.setSize(400) : e.keyboardHeight;
                    let curHeight = nomarlHeight - keyboardHeight;

                    if (objTop + objHeight > curHeight) {

                        if (maskObj.className == "box_dialog") {
                            maskObj.style.top = (curHeight) / 2 + "px";
                            if (document.getElementById("layerContent")) {
                                document.getElementById("layerContent").style.top = 0
                            }
                            if (document.getElementById("layer_content_global")) {
                                document.getElementById("layer_content_global").style.marginTop = 0
                            }

                        } else if (maskObj.className == "create_account_input_wrapper" || maskObj.className == "create_account_input_wrapper_x") {

                            document.getElementById("layerContent").style.top = -(objTop + objHeight - curHeight) + "px"
                        } else {
                            document.getElementById("layer_content_global").style.marginTop = -(objTop + objHeight - curHeight) + "px"
                        }

                    }
                }, 10)
            }
        };
        let scrollBack = function () {

            if (maskObj.className == "box_dialog") {
                maskObj.style.top = (nomarlHeight) / 2 + "px"
            } else if (maskObj.className == "create_account_input_wrapper" || maskObj.className == "create_account_input_wrapper_x") {
                document.getElementById("layerContent").style.top = 0
            } else {
                document.getElementById("layer_content_global").style.marginTop = 0
            }
            window.removeEventListener('native.keyboardshow', scrollScreen);
            window.removeEventListener('native.keyboardhide', scrollBack);
        }

        // if (isNumber) {
        //     KeyBoardsActions.setObj(objInput)
        //     KeyBoardsActions.setKeyBoardsVisibal(isNumber);
        //     KeyBoardsActions.setKeyBoardsIsPoint(isPoint);
        //     setTimeout(()=>{
        //         if(window.cordova){
        //             cordova.plugins.Keyboard.close();
        //         }
        //     },10)
        //     KeyBoardsActions.setObj(objInput)
        //     KeyBoardsActions.setKeyBoardsIsPoint(isPoint);

        // }else{
        scrollBack();
        // }

        window.addEventListener('native.keyboardshow', scrollScreen);
        window.addEventListener('native.keyboardhide', scrollBack);
    }
    /**
     * 获取版本更新日志
     */
    static getVersionUpdateLogContent(isFirst = false) {
        let lan = counterpart.getLocale() || "zh";
        let url = `./version-log-${lan}.json`;
        let contents = req(url);
        if (isFirst && contents.length > 0) {
            return contents[0];
        }
        return contents;
    }

    static handleDivide(n1, n2) {
        n1 ? n1 : 0;
        n2 ? n2 : 0;
        let t1 = 0, t2 = 0, r1, r2;
        try { t1 = n1.toString().split(".")[1] ? n1.toString().split(".")[1].length : 0 } catch (e) {
            console.error(e)
        }
        try { t2 = n2.toString().split(".")[1] ? n2.toString().split(".")[1].length : 0 } catch (e) {
            console.error(e)
        }
        r1 = Number(n1.toString().replace(".", ""));
        r2 = Number(n2.toString().replace(".", ""));
        return (r1 / r2) * Math.pow(10, t2 - t1);
    }
    static handleMultiply(n1, n2) {
        let t1 = 0, t2 = 0, r1, r2;
        try { t1 = n1.toString().split(".")[1] ? n1.toString().split(".")[1].length : 0 } catch (e) {
            console.error(e)
        }
        try { t2 = n2.toString().split(".")[1] ? n2.toString().split(".")[1].length : 0 } catch (e) {
            console.error(e)
        }
        r1 = Number(n1.toString().replace(".", ""));
        r2 = Number(n2.toString().replace(".", ""));
        return (r1 * r2) * Math.pow(10, t2 - t1);
    }
    static handleSub(n1, n2) {
        let t1 = 0, t2 = 0, r1, r2;
        try { t1 = n1.toString().split(".")[1] ? n1.toString().split(".")[1].length : 0 } catch (e) {
            console.error(e)
        }
        try { t2 = n2.toString().split(".")[1] ? n2.toString().split(".")[1].length : 0 } catch (e) {
            console.error(e)
        }
        r1 = Number(n1.toString().replace(".", ""));
        r2 = Number(n2.toString().replace(".", ""));
        return (r1 - r2) * Math.pow(10, t2 - t1);
    }
    static handleAdd(n1, n2) {
        let t1 = 0, t2 = 0, r1, r2;
        try { t1 = n1.toString().split(".")[1] ? n1.toString().split(".")[1].length : 0 } catch (e) {
            console.error(e)
        }
        try { t2 = n2.toString().split(".")[1] ? n2.toString().split(".")[1].length : 0 } catch (e) {
            console.error(e)
        }
        r1 = Number(n1.toString().replace(".", ""));
        r2 = Number(n2.toString().replace(".", ""));
        return (r1 + r2) * Math.pow(10, t2 - t1);
    }

    /**
     * 计算字符串字符长度
     * 中文为2字符
     * @param {String} str - 目标字符串
     * @returns {Number} 字符串字符长度
     */
    static charCounter(str) {
        if (Validation.isString(str)) {
            let reg = /[\u4e00-\u9fa5]/g;
            let matchLen = str.match(reg) == null ? 0 : str.match(reg).length;
            return matchLen * 2 + (str.length - matchLen);
        } else {
            return 0;
        }
    }

    /**
     * 将精度值转换成number
     * @param {Number} precision - 精度值
     * @returns {Number} 精度转换后的实际值 如 5 则返回 100000
     */
    static precisionToNum(precision) {
        let result = [1];
        for (let p = 0; p < precision; p++)
            result.push(0);
        return parseInt(result.join(''));
    }

    /**
     * 数组排序
     * @param {排序的属性} filed 
     * @param {排序类型} rev true:降序，false：升序
     * @param {数据类型} primer String|Number
     */
    static orderBy(filed, rev = true, primer = Number) {
        rev = (rev) ? -1 : 1;
        return function (a, b) {
            a = a[filed];
            b = b[filed];
            if (typeof (primer) != 'undefined') {
                a = primer(a);
                b = primer(b);
            }
            if (a < b) { return rev * -1; }
            if (a > b) { return rev * 1; }
            return 1;
        }

    }

    /**
     * 数组排序
     * @param {排序的属性} prop 
     * @param {排序类型} type true:升序，false：降序，默认升序
     */
    static sortBy(prop, type) {
        let _this = this;
        return function (obj1, obj2) {
            var val1 = Number(obj1[prop] / _this.precisionToNum(obj1["precision"]));
            var val2 = Number(obj2[prop] / _this.precisionToNum(obj2["precision"]));
            if (!type) {
                if (val1 < val2) {
                    return 1;
                } else if (val1 > val2) {
                    return -1;
                } else {
                    return 0;
                }
            } else {
                if (val1 > val2) {
                    return 1;
                } else if (val1 < val2) {
                    return -1;
                } else {
                    return 0;
                }
            }
        }
    }
    /**
     * 千位符
     * @param {*} num 
     * 将大数字用千位符标识
     */
    static thousandBit(num) {
        var num = (num || 0).toString(), result = '';
        while (num.length > 3) {
            result = ',' + num.slice(-3) + result;
            num = num.slice(0, num.length - 3);
        }
        if (num) { result = num + result; }
        return result;
    }

    /**
     * 判断字符串是否json格式
     * @param {*} str 
     */
    static isJSON(str) {
        if (typeof str == 'string') {
            try {
                var obj = JSON.parse(str);
                if (typeof obj == 'object' && obj) {
                    return true;
                } else {
                    return false;
                }

            } catch (e) {
                return false;
            }
        } else {
            return false;
        }
    }

    /**
     * 平台判断
     */
    static checkPlatform() {
        let platformName = "android";
        var u = navigator.userAgent;
        var ua = navigator.userAgent.toLowerCase();
        if (!!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/)) {//如果是ios  
            platformName = "ios";
        }
        if (ua.match(/Android/i) == "android") {//如果是android   
            platformName = "android";
        }
        return platformName;
    }

    /**
     * 多字段排序
     * @param {*} name 
     * @param {*} minor 
     * 用法：json.sort(order("字段1"，order("字段2",order("字段3"))))
     */
    static order(name, minor) {
        return function (o, p) {
            var a, b;
            if (o && p && typeof o === 'object' && typeof p === 'object') {
                a = o[name];
                b = p[name];
                if (a === b) {
                    return typeof minor === 'function' ? minor(o, p) : 0;
                }
                if (typeof a === typeof b) {
                    return a > b ? -1 : 1;
                }
                return typeof a > typeof b ? -1 : 1;
            } else {
                thro("error");
            }
        }
    }

    static encryptMemo(memo, nonce, privKey, pubKey) {
        let msg = encodeURI(memo);
        return Aes.encrypt_with_checksum(privKey, pubKey, nonce, msg).toString("hex");
    }

    static decryptMemo(cipher, nonce, privKey, pubKey) {
        let memo = Aes.decrypt_with_checksum(privKey, pubKey, nonce, cipher).toString("utf-8");
        return decodeURI(memo);
    }

    /**
   * Return asset precision power value
   * 5 ---- 100000
   * 3 ---- 1000
   * @param {Number} precision - power number
   */
  static getAssetPrecision(precision) {
    return Math.pow(10, precision);
  }

  /**
   * Calculate short amount
   * like amount = 95555 , precison = 4 , result = 9.5555
   * @param {Number} amount - actual asset amount
   * @param {Number} precision - asset precision
   * @param {Boolean} trailing_zeros - whthere to fill number with 0 for decimals
   * @param {Boolean} rounded - whthere to round 
   */
  static getAssetAmount(amount, precision, trailing_zeros = true, rounded = false) {
    let res = amount / this.getAssetPrecision(precision)
    return this.formatNumber(res, precision, trailing_zeros, rounded);
  }

  /**
   * Format number
   * like number = 7988 , decimals = 2
   * if trailing_zeros = true , result = 7,988.00
   * if trailing_zeros = false , result = 7,988
   * @param {Number} number - number
   * @param {Number} decimals - decimals
   * @param {Boolean} trailing_zeros - whthere to fill number with 0 for decimals
   * @param {Boolean} rounded - whthere to round 
   */
  static formatNumber(number, decimals = 4, trailing_zeros = true, rounded = false) {
    if ( isNaN(number) || !isFinite(number) || number === undefined || number === null ) return "";
    let zeros = ".";
    for (var i = 0; i < decimals; i++) {
      zeros += "0";
    }
    
    number = number.toString();

    if(!rounded && number.indexOf(".") > 0) {
      number = number.substring(0, (number.indexOf(".") + decimals + 1));
    }
    let num = numeral(number).format("0" + zeros);
    if (num.indexOf(".") > 0 && !trailing_zeros)
      return num.replace(/0+$/, "").replace(/\.$/, "");
      
    return num;
  }


  /**
   * Check Certificate
   * @param {server} server
   */
  static checkCertificate(server = "wss://wallet.yoyow.org/ws"){
    let selectServer=GlobalParams.servers.filter(item=>item.server==server);
    return new Promise(function (resolve, reject) {
        if(selectServer.length>0 && selectServer[0].fingerprint.length>0 && window.cordova && localStorage.checkUpdate=="false"){
            let checkServer=selectServer[0].server.replace("wss:","https:");
            window.plugins.sslCertificateChecker.check(
            function(message) {
                //CONNECTION_SECURE
                resolve({server:selectServer[0].server,finger:selectServer[0].fingerprint,message:message});
            },
            function(message) {
                //CONNECTION_NOT_SECURE OR CONNECTION_FAILED
                if (message === "CONNECTION_NOT_SECURE") {
                    reject({server:selectServer[0].server,finger:selectServer[0].fingerprint,message:message});
                } else if (message.indexOf("CONNECTION_FAILED") >- 1) {
                    resolve({server:selectServer[0].server,finger:selectServer[0].fingerprint,message:message});
                }else{
                    resolve({server:selectServer[0].server,finger:selectServer[0].fingerprint,message:message});
                }
            },checkServer,selectServer[0].fingerprint);
        }else{
            resolve({server:server,finger:"",message:"no finger"});
        }
    });
  }


}

export default Utils;