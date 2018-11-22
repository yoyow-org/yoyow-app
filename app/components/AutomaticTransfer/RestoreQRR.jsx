import React from "react";
import BaseComponent from "../BaseComponent";
import Button from "../Form/Button";
import SettingsActions from "../../actions/SettingsActions";
import TipsActions from "../../actions/TipsActions";
import QRCode from "../Layout/QRCode";
import html2canvas from 'html2canvas';
import { Utils } from "../../../lib";
import ResourceStore from "../../stores/ResourceStore";
import WalletStore from "../../stores/WalletStore";

class RestoreQRR extends BaseComponent {
  constructor() {
    super();
    this.state = {
      uid: WalletStore.getWallet().yoyow_id
    }
  }

  componentDidMount() {
    //设置顶部tab
    let headerData = {
      buttonLeft: {
        value: "img_back",
      },
      title: ["transferAutoRestore.save_QRR"],
      canBack: true
    }
    SettingsActions.updateHeader(headerData);
  }

  handleSaveQRRCode() {
    let _this = this;
    if (window.cordova) {
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
    let _this = this;
    //保存收款二维码
    if (window.canvas2ImagePlugin) {
      let successMsg = this.translate('transferAutoRestore.save_QRR_success');
      let faildMsg = this.translate('balance.QR_receive.alert_save_faild');
      if (window.canvas2ImagePlugin) {
        window.canvas2ImagePlugin.saveImageDataToLibrary(msg => {
          TipsActions.alert(successMsg);
        }, err => {
          TipsActions.alert(faildMsg);
        }, this.refs.canvas.refs.qrcode_view);
      }
    } else {
      html2canvas(this.refs.layer, { useCORS: true }).then((canvas) => {
        let url = canvas.toDataURL("image/png");
        _this._download(url);
      });
    }
  }

  _download(urlData) {
    var link = document.createElement('a');
    link.href = urlData;
    link.download = "filename.png";
    var event = document.createEvent('MouseEvents');
    event.initMouseEvent('click', true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
    link.dispatchEvent(event);
  }

  render() {
    let {uid} = this.state;
    return (
      <div className="save_QRcode">
        <div className="save_QRcode_con">
          <div ref="layer" className="QR_box">
            <QRCode ref="canvas" level="M" size={250} value={`SC${uid}`} />
          </div>
          <div className="save_QRcode_button">
            {/* 判断是否为网页版，网页版无保存按钮  */}
            {/* <Button
              value={this.translate("transferAutoRestore.save_QRR")}
              onClick={this.handleSaveQRRCode.bind(this)}
            /> */}
           {window.cordova?(<Button
              value={this.translate("transferAutoRestore.save_QRR")}
              onClick={this.handleSaveQRRCode.bind(this)}
            />):''}
          </div>
        </div>
      </div>
    )
  }
}

export default Utils.altConnect(RestoreQRR, [ResourceStore]);