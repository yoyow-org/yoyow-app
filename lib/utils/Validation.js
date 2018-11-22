
import createKeccakHash from "keccak";
export default {

    /**
     * 验证对象类型
     * @param {Object} obj 验证对象
     * @param {String} vType 验证类型
     * @return {Boolean} 对象是否与验证类型匹配
     */
    base(obj, vType){
        return Object.prototype.toString.call(obj) === `[object ${vType}]`;
    },

    /**
     * 验证是否数组类型
     * @param {Object} obj 需验证对象
     * @returns {Boolean} 是否数组类型
     */
    isArray(obj){ return this.base(obj, 'Array'); },

    /**
     * 验证是否函数类型
     * @param {Object} obj 需验证对象
     * @returns {Boolean} 是否函数类型
     */
    isFunction(obj){ return this.base(obj, 'Function'); },

    /**
     * 验证是否字符串类型
     * @param {Object} obj 需验证对象
     * @returns {Boolean} 是否字符串类型
     */
    isString(obj){ return this.base(obj, 'String'); },

    /**
     * 验证是否对象类型
     * @param {Object} obj 需验证对象
     * @returns {Boolean} 是否对象类型
     */
    isObject(obj){ return this.base(obj, 'Object'); },

    /**
     * 验证是否数字类型
     * @param {Object} obj 需验证对象
     * @returns {Boolean} 是否数字
     */
    isNumber(obj){
        let result=false;
        try{
            // 不运行有空格的字符串
            if(typeof obj == 'string' && obj.indexOf(' ') >= 0)
                return false;
        
            let n = Number(obj);
            result=this.base(n, 'Number') && !isNaN(n);
        }
        catch(e){
            console.log("isNumber:",e)
        }
        return result;
    },

    /**
     * 验证是否错误对象
     * @param {Object} obj 
     */
    isError(obj){ return this.base(obj, 'Error'); },

    /**
     * 验证对象是否为空
     * @param {Object} obj 需验证对象
     * @returns {Boolean} 是否空对象
     */
    isEmptyObject(obj){
        for (var t in obj)
            return false;
        return true;
    },

    /**
     * 验证是否为空
     * @param {Object} obj 需验证对象
     * @returns {Boolean} 是否为空对象 数组 字符串 ...
     */
    isEmpty(obj){
        if(this.isString(obj)) obj = obj.trim();
        let flag = obj == undefined || obj == null || obj == 'null' || obj == '' || obj.length == 0;
        if(this.isObject(obj)){
            flag = this.isEmptyObject(obj);
        }
        return flag;
    },

    /**
     * 返回数据类型
     * @param {Object} obj 需验证对象
     * @returns {Boolean} 数据类型
     */
    whatType(obj){
        let t = Object.prototype.toString.call(obj);
        return t.substring(t.indexOf(' ')+1, t.length-1);
    },

    /**
     * 验证erc20地址
     * @param {String} address erc20地址
     * @returns {Boolean} 是否有效erc20地址
     */
    validateEtherAddress(address){
        if(address){
            if(address == "0x0000000000000000000000000000000000000000") return false;
            else{
                if (!/^(0x)?[0-9a-f]{40}$/i.test(address)) {
                    // check if it has the basic requirements of an address
                    return false;
                } else if (/^(0x)?[0-9a-f]{40}$/.test(address) || /^(0x)?[0-9A-F]{40}$/.test(address)) {
                    // If it's all small caps or all all caps, return true
                    return true;
                } else {
                    return address == this.checksumAddress(address);
                }
            }
        }
        return false;
    },

    /**
     * 转换传入都地址效验
     * @param {String} address erc20地址
     * @return {String} 效验后的地址
     */
    checksumAddress(address){
        address = address.toLowerCase().replace('0x','');
        var hash = createKeccakHash('keccak256').update(address).digest('hex')
        var ret = '0x'
      
        for (var i = 0; i < address.length; i++) {
          if (parseInt(hash[i], 16) >= 8) {
            ret += address[i].toUpperCase()
          } else {
            ret += address[i]
          }
        }
        return ret
    }
};