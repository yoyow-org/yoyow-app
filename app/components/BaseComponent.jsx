import React from "react";
import {intlShape} from 'react-intl';
import counterpart from "counterpart";
import {Utils} from "../../lib";
import WalletActions from "../actions/WalletActions";
import WalletStore from "../stores/WalletStore";
import TipsActions from "../actions/TipsActions";
import SettingsAcctions from "../actions/SettingsActions"
import SettingsStore from "../stores/SettingsStore"


class BaseComponent extends React.Component {
    static contextTypes = {
        intl: intlShape.isRequired,
        router: React.PropTypes.object
    };

    constructor(props) {
        super(props);
        let urls = ["/about/product-guide", "/create-account"];
        if(!WalletStore.getWallet()){
            SettingsAcctions.setPrevUrl("init")
        }
    }

    /**
     * 跳转到指定url
     * @param url
     */
    routerPush(url,prevUrl=false,isload=false) {

        let isAnimation = SettingsStore.getState().isAnimation;
        TipsActions.setIsLoadingShow(isload)
        let time = null;
        if(!isAnimation){
            SettingsAcctions.isAnimation(true)
            SettingsAcctions.setRouterType("go");

            if(prevUrl){
                this.context.router.push({pathname:url});
            }else{
                this.context.router.replace({pathname:url});
            }
            time = setTimeout(()=>{
                SettingsAcctions.isAnimation(false)
                clearTimeout(time)
            },300)
        }

    }

    routerBack(){
        let isAnimation = SettingsStore.getState().isAnimation;
        let time = null;
        TipsActions.setIsLoadingShow(false)
        if(!isAnimation){
            SettingsAcctions.setRouterType("back");

            this.context.router.goBack();

            time = setTimeout(()=>{
                SettingsAcctions.isAnimation(false)
                clearTimeout(time)
            },300)
        }


    }
    /**
     * 验证当前账号 或 当前选择账号有效性
     * @param {Function} callback - 回调函数
     * @param {bool} autoChange - 如果传true， 则会切换列表里下一个有效账号，否则不处理
     */
    checkAccountValid(callback, autoChange = true){
        if(navigator.onLine){
            let wallet = WalletStore.getWallet();
                WalletActions.checkAccountValid(wallet.yoyow_id, wallet.encrypted_memo.pubkey).then(valid => {
                    if(!valid){
                        if(['/','/index'].indexOf(this.props.location.pathname) != -1 && this.state.isValid !== undefined){
                            TipsActions.loading(true);
                            WalletActions.fetchAccountListStatistics(autoChange).then(() => {
                                this.setState({isValid: !valid});
                                TipsActions.loading(false);
                            }).catch(err => {
                                TipsActions.error(err);
                                TipsActions.loading(false);
                            });
                        }else{
                            let _this =this
                            setTimeout(()=>{
                                WalletActions.clearSelected();
                                _this.routerPush('/index',true);
                            },300)

                        }
                    }else if(valid && callback){
                        callback();
                    }
                }).catch(err => {
                    TipsActions.error(err);
                });
        }else{
            TipsActions.error(1015);
        }

    }

    /**
     * 语言提取
     * @param {object，string} locale_keypath 
     * @param {*} options 
     */
    translate(locale_keypath,options) {
        let content="";
        if (null != locale_keypath && "" != locale_keypath) {
            if(typeof(locale_keypath)==="string"){
                if(locale_keypath.indexOf("$")>-1){
                    content=locale_keypath.replace("$","");
                }
                else{
                    content=counterpart.translate(locale_keypath,options);
                }
            }else{
                locale_keypath.map((item)=>{
                    if(item.indexOf("$")>-1){
                        content+=item.replace("$","");
                    }else{
                        content+=counterpart.translate(item,options);
                    }
                });
            }
            return content;

        }
        return "Missing Language";
    }
}

export default BaseComponent;
 