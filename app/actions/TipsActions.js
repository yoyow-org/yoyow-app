/**
 * 提示组件相关
 * toast
 * alert
 * confirm
 * loading
 */

/**
 * Created by lucker on 2018/2/22.
 */
import alt from '../altInstance';
class TipsActions{

    setToastShow(textValue){
        return dispatch => {
            dispatch(textValue)
        }
    }

    setToastHide(){
        return dispatch => {
            dispatch()
        }
    }
    setDialogShow(data){
        return dispatch => {
            dispatch(data)
        }
    }
    setDialogHide(){
        return dispatch => {
            dispatch(false)
        }
    }
    setLoadingGlobalShow(){
        return dispatch => {
            dispatch()
        }
    }

    setLoadingGlobalHide(){
        return dispatch => {
            dispatch()
        }
    }

    /**
     * 加载框
     * @param {Boolean} show 是否显示
     */
    loading(show){
        return show;
    }

    /**
     * 自动隐藏提示
     * @param {String} text 文本内容
     */
    toast(text){
        return text;
    }

    /**
     * alert 弹窗
     * @param {String} text 文本内容
     * @param {String} [title = null] 标题
     * @param {Boolean} [center = true] 文本内容是否居中
     * @param {function} [callback = null] 文本内容是否居中
     */
    alert(text, title = null, center = true,callback=null){
        return {text, title, center,callback}
    }

    /**
     * @param {String|Number|Error} error 异常
     * @param {String} [title = null] 标题
     * @param {Boolean} [center = true] 文本内容是否居中
     * @param {Boolean} [closeLoading = true] 是否关闭loading框
     */
    error(error, title = null, center = true, closeLoading = false){
        return {error, title, center, closeLoading}
    }

    /**
     * confirm 弹窗
     * @param {String|object} text 文本内容或对象
     * @param {Function} [callback = null] 回调函数
     * @param {String} [title = null] 标题
     * @param {Boolean} [cebter = true] 文本内容是否居中
     */
    confirm(text, callback = null, title = null, center = true){
        return {text, callback, title, center}
    }

    closeLayerOut(){
        return false
    }
    openLayerOut(){
        return true
    }

    clear(){
        return true;
    }
    setIsLoadingShow(bool){
        return bool;
    }

}
export default alt.createActions(TipsActions);