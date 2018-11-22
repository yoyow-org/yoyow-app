
import alt from "../altInstance";

/**
 * 更新器
 */
 class UpdaterActions{

    initi(){
        return true;
    }
    /**
     * 检测和更新
     */
    checkUpdate(){
        return dispatch => {
            return new Promise((resolve,reject) => {
                dispatch({resolve,reject});
            });
        };
    }

    /**
     * 安装更新
     */
    installUpdate(){
        return true;
    }

    /**
     * 创建存在文件夹
     */
    createStroesFile(){
        return dispatch => {
            return new Promise((resolve,reject) => {
                dispatch({resolve,reject});
            });
        };
    }

    /**
     * 下载文件
     */
    downLoadFile(fileEntry,downLoadUrl){
        return dispatch => {
            return new Promise((resolve,reject) => {
                dispatch({fileEntry,downLoadUrl,resolve,reject});
            });
        };
    }

    /**
     * 打开下载文件
     */
    openDownLoadFile(fileEntry,downLoadUrl){
        return dispatch => {
            return new Promise((resolve,reject) => {
                dispatch({fileEntry,downLoadUrl,resolve,reject});
            });
        };
    }

    /**
     * 设置更新器状态
     */
    setUpdaterStatus(val){
        return val;
    }

    /**
     * 设置下载进度
     * @param {} val 
     */
    setDownloadProgress(val){
        return val;
    }
}

export default alt.createActions(UpdaterActions);