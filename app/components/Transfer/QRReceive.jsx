import React from "react";
import BaseComponent from "../BaseComponent";
import SettingsActions from "../../actions/SettingsActions";
import BalancesStore from "../../stores/BalanceStore";
import Button from "../Form/Button";
import BalancesActions from "../../actions/BalancesActions";
import TipsActions from "../../actions/TipsActions";
import Utils from "../../../lib/utils/Utils";
import Clipboard from "clipboard";
import ContactsStore from "../../stores/ContactsStore";
import LayerOut from "../Layout/LayerOut";
import QRCode from "../Layout/QRCode";
import html2canvas from 'html2canvas';

class QRReceive extends BaseComponent {
    constructor() {
        super();
        this.state = {
            layerOutShow: true,
            qrWidth: 0,
            curID: "",
            imgUrl: "",
            copy:false
        }
    }

    componentWillMount() {

    }

    componentDidMount() {

        let headerData = {
            buttonLeft: {
                value: "img_back",
            },
            title: "balance.QR_receive.title",
            canBack: true
        }
        SettingsActions.updateHeader(headerData);
        
        BalancesActions.getAccountInfo().then(res => {
            this.setState({
                curID: res.yoyow_id
            })
        })
        let {receiveAmount} = this.props;
        let scrWidth = document.documentElement.clientWidth;
        let infoObj = this.refs.info_num
        let infoHeight = infoObj ? this.refs.info_num.offsetWidth : 0;
        let bl = scrWidth / 750;
        let rem = bl * 40
        let qrWidth = scrWidth - 40 / 40 * rem - 240 / 40 * rem;
        this.setState({
            qrWidth: qrWidth
        })
        let img = this.refs.canvas.refs.qrcode_view

        let imgUrl = img.toDataURL();
        this.setState({imgUrl: imgUrl});
        if(!receiveAmount) new Clipboard(this.refs.copy_btns);
    }

    setAmount() {
        let {receiveAmount,receiveInx} = this.props;
        if (receiveAmount && receiveAmount != "" && receiveAmount != 0) {
            BalancesActions.setAmount("");
            BalancesActions.setMemo("");
            BalancesActions.setCanMemo(true);
            BalancesActions.setSymbol("");
            if(receiveInx>0){
                BalancesActions.delQRReceive(receiveInx);
            }
        } else {
            this.routerPush("/setQRAmount",true);
        }
    }

    handleSaveImg() {
        let _this = this;
        if(window.cordova){
            var permissions = cordova.plugins.permissions;
            if (permissions) {
                //判断是否拥有权限
                permissions.hasPermission(permissions.WRITE_EXTERNAL_STORAGE, function (status) {
                    if (status.hasPermission) {
                        _this.handleSaveQRCodeImage();
                    }
                    else {
                        //没有权限就添加权限
                        permissions.requestPermission(permissions.WRITE_EXTERNAL_STORAGE,
                            function (status) {
                                //设置成功后 返回状态
                                if (status.hasPermission) {
                                    //保存二维码
                                    _this.handleSaveQRCodeImage();
                                } else {
                                    TipsActions.alert(_this.translate('balance.QR_receive.alert_no_permission'));
                                }
                            },
                            function (error) {
                                TipsActions.alert(_this.translate('balance.QR_receive.alert_no_permission'));
                            });
                    }
                });
                return true;
            }
        }
        //非android情况下
        _this.handleSaveQRCodeImage();
    }

    handleSaveQRCodeImage() {
        let _this=this;
        //保存收款二维码
        if (window.canvas2ImagePlugin) {
            let successMsg = this.translate('balance.QR_receive.alert_save_ok');
            let faildMsg = this.translate('balance.QR_receive.alert_save_faild');
            if (window.canvas2ImagePlugin) {
                window.canvas2ImagePlugin.saveImageDataToLibrary(msg => {
                    TipsActions.alert(successMsg);
                }, err => {
                    TipsActions.alert(faildMsg);
                }, this.refs.canvas.refs.qrcode_view);
            }
        }else{
            html2canvas(this.refs.layer,{ useCORS: true }).then((canvas) => {
                let url = canvas.toDataURL("image/png");
                _this._download(url);
            });
        }
    }

    _download(urlData){
        var link = document.createElement('a');
        link.href = urlData;
        link.download = "filename.png";
        var event = document.createEvent('MouseEvents');
        event.initMouseEvent('click', true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
        link.dispatchEvent(event);
    }
    
    handleStr(str) {
        var out, i, len, c;
        out = "";
        len = str.length;
        for (i = 0; i < len; i++) {
            c = str.charCodeAt(i);
            if ((c >= 0x0001) && (c <= 0x007F)) {
                out += str.charAt(i);
            } else if (c > 0x07FF) {
                out += String.fromCharCode(0xE0 | ((c >> 12) & 0x0F));
                out += String.fromCharCode(0x80 | ((c >> 6) & 0x3F));
                out += String.fromCharCode(0x80 | ((c >> 0) & 0x3F));
            } else {
                out += String.fromCharCode(0xC0 | ((c >> 6) & 0x1F));
                out += String.fromCharCode(0x80 | ((c >> 0) & 0x3F));
            }
        }
        return out;
    }

    handleCopy(){
        this.setState({
            copy:true
        });
    }

    render() {
        let {receiveAmount, receiveMemo, canMemo,receiveSymbol, tokenInfo} = this.props;
        let {curID, copy} = this.state;
        let memo = this.handleStr(receiveMemo);
        let msg = '{"type" : "transfer-for-fix","toAccount":"' + curID + '","amount":"' + receiveAmount + '","memoText":"' + memo + '","canMemo":' + (receiveAmount.length>0?false:true) + ',"transferBalance":' + true + ',"tokenInfo":'+JSON.stringify(tokenInfo)+'}';
        return (
            <div className="cover_full QR_receive">
                <LayerOut isShow={this.state.layerOutShow} closeBtn={false}>
                    <div className="account_qr_receive">
                        <div>
                            <span>#{curID}</span>
                            <button ref="copy_btns" data-clipboard-text={curID} onClick={this.handleCopy.bind(this)}>
                            {
                                copy?this.translate("balance.QR_receive.button_text_copied"):this.translate("balance.public.button_copy")
                            }
                            </button>
                        </div>
                    </div>
                    <div ref="layer" className="layer_QR layer_QR_wh">
                    <QRCode ref="canvas" level="M" account={curID} size={255} value={msg}/></div>
                    {
                        (receiveAmount!="" && receiveAmount!=0) ?
                        <div ref="info_num" className="info_num">
                            <span>{this.translate("balance.QR_receive.amount_title")}</span>
                            <em ref="val">{Utils.formatAmount(Number(receiveAmount))}</em>
                            <span>{receiveSymbol}</span>
                        </div>
                        :""
                    }
                    <div className={window.cordova?"layer_button":"layer_button oneBtn"}>
                        <Button onClick={this.setAmount.bind(this)}
                                value={(receiveAmount!="" &&receiveAmount!=0) ? this.translate("balance.QR_receive.clear_amount") : this.translate("balance.QR_receive.set_amount")}
                                bg="#fff" border="#fff" color="#2E7EFE" fontSize={26}/>
                        {window.cordova?<a>&nbsp;</a>:""}
                        {window.cordova?

                            <Button onClick={this.handleSaveImg.bind(this)}
                            value={this.translate("balance.QR_receive.button_save_code")}
                            bg="#fff" border="#fff" color="#2E7EFE" fontSize={26}/>:""}

                    </div>
                </LayerOut>
            </div>
        )
    }
}

export default Utils.altConnect(QRReceive, [BalancesStore, ContactsStore]);