/**
 * Created by necklace on 2017/1/18.
 */
import React from "react";
import ReactDOM from "react-dom";
import BaseComponent from "../BaseComponent";
// import QrCode from "qrcode-reader";
import QrReader from 'react-qr-reader'
import pica from "pica/dist/pica";
import Utils from "../../../lib/utils/Utils";
import ScanStore from "../../stores/ScanStore";
import WalletActions from "../../actions/WalletActions";
import TipsActions from "../../actions/TipsActions";
import PlatformActions from "../../actions/PlatformActions";
import BalancesActions from "../../actions/BalancesActions";
import ContactsActions from "../../actions/ContactsActions";
import WalletStroe from "../../stores/WalletStore";
import SettingsActions from "../../actions/SettingsActions"
import ResourceActions from "../../actions/ResourceActions";

import ScanActions from "../../actions/ScanActions";

//import EXIF from "exif-js";


class WebScan extends BaseComponent {

    constructor(props) {
        super(props)
        this.state = {
            delay: 300,
            result: 'No result',
        }
        this.handleScan = this.handleScan.bind(this)
    }
    componentWillMount() {

        let headerData = {
            buttonLeft: {
                value: "img_back",
            },
            title: "balance.index.webScanTitle",

            canBack: true
        }
        SettingsActions.updateHeader(headerData);


    }
    componentDidMount() {
        //console.log(this.refs.webScan)
        let divObj = this.refs.webScan.childNodes[0].childNodes[0].childNodes[0]
        divObj.style.left = (document.documentElement.clientWidth - divObj.clientWidth) / 2 + "px";
        divObj.style.top = (document.documentElement.clientHeight - divObj.clientHeight) / 2 + "px"
        let node = document.createElement("DIV");
        node.className = "scan_line"
        divObj.appendChild(node)
    }

    handleScan(data) {

        if (data) {
            if (data.indexOf('YYW') === 0) {
                WalletActions.decompress(data).then(res => {
                    if (this.timer) {
                        clearInterval(this.timer);
                        this.timer = null;
                    }
                    this.routerPush('/import-account');
                }).catch(err => TipsActions.error(err));
            } else if (data.indexOf('SC') === 0) {
                let uid = data.substring(2);
                TipsActions.loading(true);
                ResourceActions.getResources(uid).then(res => {
                    TipsActions.loading(false);
                    this.routerPush('/selectTransferRestoreList',true);
                }).catch(err => {
                    TipsActions.alert(this.translate("errors.1022"));
                    TipsActions.loading(false);
                });
            } else if (Utils.isJSON(data)) {
                let resJSON = JSON.parse(data);
                if (resJSON.type == "transfer-for-fix") {
                    let headTitle = ["$" + (resJSON.tokenInfo == null ? "YOYOW" : resJSON.tokenInfo.symbol), "balance.transfer_for_fix.text_transfer"];
                    BalancesActions.setHeadTitle(headTitle);
                    BalancesActions.setTokenInfo(resJSON.tokenInfo);
                    BalancesActions.setAccount(resJSON.toAccount);
                    BalancesActions.setAmount(resJSON.amount)
                    BalancesActions.setMemo(resJSON.memoText);
                    BalancesActions.setCanMemo(resJSON.canMemo);
                    BalancesActions.handleFundsType(true);
                    if (this.timer) {
                        clearInterval(this.timer);
                        this.timer = null;
                    }
                    this.routerPush("/" + resJSON.type);
                } else if (resJSON.type == "contacts") {
                    if (this.timer) {
                        clearInterval(this.timer);
                        this.timer = null;
                    }
                    ContactsActions.setQRcodeUid(msgJson.toAccount);
                    this.routerPush("/contacts/add")
                } else if (resJSON.sign) {

                    PlatformActions.checkSign(data).then(res => {
                        if (this.timer) {
                            clearInterval(this.timer);
                            this.timer = null;
                        }

                        let { accountList } = this.props;

                        if (accountList.filter(w => {
                            return !w.is_trash
                        }).size > 0)
                            this.routerPush('/import-auth');
                        else {
                            this.routerPush('/create-auth');
                        }


                    }).catch(err => {
                        console.log("errrrrrrrr", err)
                        TipsActions.error(err)
                    });
                }
            }
        }
    }

    handleError(err) {
        console.log("err=>", err)
        //alert(err);
        // this.setState({
        //   result: err,
        // })
        // console.error(err)
    }

    render() {
        return (
            <div ref="webScan" className="cover_full webScan">
                <QrReader
                    delay={this.state.delay}
                    onError={this.handleError}
                    onScan={this.handleScan}
                    style={{ width: '100%' }}
                />
            </div>
        )
    }

    /*static getPropsFromStores() {
        return ScanStore.getState();
    }

    static getStores() {
        return [ScanStore];
    }

    constructor(props) {
        super(props);
        this.state = {
            hasCamera: false,
            cameras: []//存储设备源ID
        };
        this.qrcode = new QrCode();
        this.mStream = null;
        this.scan = this.scan.bind(this);
        this.qrcodeSuccess = this.qrcodeSuccess.bind(this);
    }

    userBrowser() {
        let browserName = navigator.userAgent.toLowerCase();
        if (/msie/i.test(browserName) && !/opera/.test(browserName)) {
            return "IE";
        } else if (/firefox/i.test(browserName)) {
            return "Firefox";
        } else if (/chrome/i.test(browserName) && /webkit/i.test(browserName) && /mozilla/i.test(browserName)) {
            return "Chrome";
        } else if (/opera/i.test(browserName)) {
            return "Opera";
        } else if (/webkit/i.test(browserName) && !(/chrome/i.test(browserName) && /webkit/i.test(browserName) && /mozilla/i.test(browserName))) {
            return "Safari";
        } else {
            return "unKnow";
        }
    }

    isIphone() {
        let agent = navigator.userAgent.toLowerCase();
        return /iphone/i.test(agent);
    }

    componentWillUnmount() {
        clearInterval(this.timeCanvas);
        clearInterval(this.timer);
        if (this.mStream) {
            this.mStream.getVideoTracks().forEach(function (videoTrack) {
                videoTrack.stop();
            });
        }
    }

    componentDidMount() {
        this.initCamera();

        let t = setTimeout(() => {
            let canvas = this.refs.qrCanvas;
            let video = this.refs.video;
            let canvas2 = this.refs.decodeCanvas;
            let fu = this.refs.focus;
            fu.style.top = (video.clientHeight - fu.clientHeight) / 2 + "px";
            fu.style.left = (video.clientWidth - fu.clientWidth) / 2 + "px"
            canvas2.style.top = (video.clientHeight - fu.clientHeight) / 2 + "px";
            canvas2.style.left = (video.clientWidth - fu.clientWidth) / 2 + "px"
            canvas.width = video.clientWidth * 2;
            canvas.height = video.clientHeight * 2;
            canvas.style.width = canvas.width / 2 + "px";
            canvas.style.height = canvas.height / 2 + "px";
            canvas2.style.width = canvas2.width / 2 + "px";
            canvas2.style.height = canvas2.height / 2 + "px";
        }, 100)

    }

    qrcodeSuccess(data, err) {
        if (err !== undefined) {
            console.error('qrcode:', err);
        }
        if (this.refs.msgBox) {
            if (data === undefined) {
                //this.refs.msgBox.innerText = this.formatMessage('scan_noQrcode');
            } else {
                //this.refs.msgBox.innerText = this.formatMessage('scan_yesQrcode');
            }
        }

        if (data !== undefined) {


            if (data.indexOf('YYW') === 0) {
                WalletActions.decompress(data).then(res => {
                    if (this.timer) {
                        clearInterval(this.timer);
                        this.timer = null;
                    }
                    this.routerPush('/import-account');
                }).catch(err => TipsActions.error(err));
            } else if (Utils.isJSON(data)) {
                let resJSON = JSON.parse(data);
                if (resJSON.type == "transfer-for-fix") {
                    BalancesActions.setTokenInfo(resJSON.tokenInfo);
                    BalancesActions.setAccount(resJSON.toAccount);
                    BalancesActions.setAmount(resJSON.amount)
                    BalancesActions.setMemo(resJSON.memoText);
                    BalancesActions.setCanMemo(resJSON.canMemo);
                    BalancesActions.handleFundsType(true);
                    if (this.timer) {
                        clearInterval(this.timer);
                        this.timer = null;
                    }
                    this.routerPush("/" + resJSON.type);
                } else if (resJSON.type == "contacts") {
                    if (this.timer) {
                        clearInterval(this.timer);
                        this.timer = null;
                    }
                    ContactsActions.setQRcodeUid(msgJson.toAccount);
                    this.routerPush("/contacts/add")
                } else if (resJSON.sign) {
                    // console.log("dddddd=>>>>",data);
                    // console.log("jjjjjj====>",JSON.stringify(data))
                    // console.log("jjjjjj====>",JSON.parse(data))
                    PlatformActions.checkSign(data).then(res => {
                        if (this.timer) {
                            clearInterval(this.timer);
                            this.timer = null;
                        }

                        let {accountList} = this.props;
                        console.log(accountList)
                        if (accountList.filter(w => {
                                return !w.is_trash
                            }).size > 0)
                            this.routerPush('/import-auth');
                        else{
                            this.routerPush('/create-auth');
                        }


                    }).catch(err => {
                        console.log("errrrrrrrr",err)
                        TipsActions.error(err)
                    });
                }
            }

        }
    }

    initCamera() {
        let _this = this;
        if (navigator.mediaDevices) {
            navigator.mediaDevices.enumerateDevices().then((devices) => {
                //console.debug("devices:", devices);
                let cArray = [];
                let flag = false;
                for (var i = 0; i != devices.length; ++i) {
                    var device = devices[i];
                    //这里会遍历audio,video，所以要加以区分
                    if (device.kind === 'videoinput') {
                        cArray.push(device.deviceId);
                        //console.info('cameraID:', device.deviceId);
                        flag = true;
                    }
                }
                if (flag) {
                    _this.setState({hasCamera: true, cameras: cArray});
                    _this.openCamera(cArray);
                }
            });
        } else {
            this.refs.file.click();
        }
    }

    scan() {
        if (this.mStream) {

            let video = this.refs.video;


            let canvas = this.refs.qrCanvas;
            let context = canvas.getContext('2d');
            let fu = this.refs.focus;

            let canvas2 = this.refs.decodeCanvas;
            var context2 = canvas2.getContext("2d")


            let dx = fu.offsetLeft * 2;

            let dy = fu.offsetTop * 2;


            // context2.drawImage(canvas, dx,dy,fu.offsetWidth*2 ,fu.offsetHeight*2,0,0,canvas2.offsetWidth*2,canvas2.offsetHeight*2);
            context2.drawImage(video, 0, 0, video.videoWidth, video.videoHeight, 0, 0, canvas2.offsetWidth * 2, canvas2.offsetWidth * 2);
            try {
                this.qrcode.decode(canvas2.toDataURL("image/png"));
                context2.clearRect(0, 0, fu.offsetWidth * 2, fu.offsetHeight * 2);
            } catch (e) {
                console.error('scan error:', e);
            }
        }
    }

    __handleVideo() {

        let video = this.refs.video;
        //console.debug("scan video", video)
        let canvas = this.refs.qrCanvas;
        let fu = this.refs.focus;
        let context = canvas.getContext('2d');
        let cx = (video.clientWidth - fu.offsetWidth) / 2
        let cy = (video.clientHeight - fu.offsetHeight) / 2
        let dx = (video.videoWidth - fu.offsetWidth) / 2;
        let dy = (canvas.height - fu.offsetHeight) / 2
        //console.log(dx)

        context.drawImage(video, dx, 0, video.clientWidth, video.clientHeight, 0, cy, canvas.width, canvas.height);


    }

    openCamera(cArray) {
        let _this = this;
        if (navigator.mediaDevices === undefined) {
            navigator.mediaDevices = {};
        }

        if (navigator.mediaDevices.getUserMedia === undefined) {
            navigator.mediaDevices.getUserMedia = function (constraints) {
                let getUserMedia = (navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia);
                if (!getUserMedia) {
                    return Promise.reject(new Error('getUserMedia is not implemented in this browser'));
                }
                return new Promise(function (resolve, reject) {
                    getUserMedia.call(navigator, constraints, resolve, reject);
                });
            }
        }
        window.URL = window.URL || window.webkitURL || window.mozURL || window.msURL;
        let video = this.refs.video;

        let constraints = {
            video: {
                facingMode: "user",
                deviceId: undefined
                //width: video.clientWidth,
                //height: video.clientHeight
            },
            audio: false
        };
        if (this.state.cameras.length > 0) {
            constraints.video.deviceId = this.state.cameras.length > 1 ? this.state.cameras[1] : this.state.cameras[0];
            if (this.state.cameras.length > 1) constraints.video.facingMode = {exact: "environment"};
        }
        //constraints = {audio: false, video: true};
        //console.log("openCamera constraints:", constraints)
        if (navigator.mediaDevices.getUserMedia) {
            //console.debug(navigator.mediaDevices.getUserMedia);

            navigator.mediaDevices.getUserMedia(constraints).then((stream) => {

                var videoTracks = stream.getVideoTracks();
                //console.log('Using video device: ' + videoTracks[0].label);

                if (video["srcObject"] !== undefined) {
                    video.srcObject = stream;
                }
                else if (video["mozSrcObject"] !== undefined) {
                    video.mozSrcObject = stream;
                } else {
                    video.src = window.URL && window.URL.createObjectURL(stream) || stream;
                }
                _this.mStream = stream;
                video.onloadedmetadata = function (e) {
                    video.play();

                    _this.timer = setInterval(_this.scan, 1000);

                };
                _this.qrcode.callback = (result, err) => {

                    _this.qrcodeSuccess(result, err);
                };
            }).catch((e) => {
                console.error('openCamera error:', e);
                //alert(e.message)
            });
        }
    }

    onSelectPicClick() {
        this.refs.file.click();
    }

    onFileChange() {
        let _this = this;
        window.URL = window.URL || window.webkitURL || window.mozURL || window.msURL;
        this.qrcode.callback = (result, err) => {
            this.qrcodeSuccess(result, err);
        };

        pica.WEBGL = true;

        let qrCanvas = this.refs.qrCanvas;
        let fileElm = this.refs.file;
        if (fileElm.files.length > 0) {
            let file = fileElm.files[0];
            let imageType = /^image\//;
            if (!imageType.test(file.type)) {
                console.info('File type not valid');
                return;
            }
            /!*
             let Orientation = null;
             EXIF.getData(file, function () {
             console.debug('exif:', EXIF.pretty(this));
             Orientation = EXIF.getTag(this, 'Orientation');
             });
             *!/


            let img = new Image();
            let tmpCvs = document.createElement("canvas");
            let tmpCtx = null;
            img.onload = function () {

                //alert('Orientation:' + Orientation);

                let sw = img.width, sh = img.height;
                let scale = sw / sh;
                let tw = _this.refs.videoImg.clientWidth;
                let th = parseInt(tw / scale);
                tmpCvs.width = sw;
                tmpCvs.height = sh;
                tmpCtx = tmpCvs.getContext("2d");
                tmpCtx.drawImage(img, 0, 0);

                qrCanvas.width = tw;
                qrCanvas.height = th;

                //console.debug('st:', sw, sh, tw, th);

                pica.resizeCanvas(tmpCvs, qrCanvas, {
                    quality: 3,
                    alpha: false,
                    unsharpAmount: 80,
                    unsharpRadius: 0.6,
                    unsharpThreshold: 2,
                    transferable: true
                }, (err) => {
                    if (err !== undefined) {
                        console.error('resizeCanvas:', err);
                        return;
                    }
                    _this.qrcode.decode();
                });

            }.bind(img);
            let fdata = window.URL.createObjectURL(file);
            img.src = fdata;
        }
    }

    render() {
        let browserName = this.userBrowser();
        let content = null;
        if (this.state.hasCamera) {

            content = (
                <div className="scan" ref="layer">
                    <video ref="video" autoPlay playsInline></video>
                    <div ref="focus" className="picture-frame"></div>
                    <canvas ref="qrCanvas" id="qr-canvas"/>
                </div>
            );
        } else {
            if (this.isIphone()) {

                content = (
                    <div className="scan">
                        <div className="video" ref="videoImg">
                            <canvas ref="qrCanvas" id="qr-canvas" style={{display: 'none'}}></canvas>
                        </div>
                        <br/>
                        <div className="message-box" ref="msgBox">

                        </div>
                        <br/>
                        <div className="operate">
                            <input type="button" className="green-btn" value={"11"}
                                   onClick={this.onSelectPicClick.bind(this)}/>
                            <input ref="file" type="file" accept="image/!*" style={{display: 'none'}}
                                   onChange={this.onFileChange.bind(this)}/>
                        </div>
                    </div>
                );
            } else {

                content = (
                    <div className="scan">
                        <div className="video"></div>
                    </div>
                );
            }
        }

        return (
            <div className="cover_full">

                {content}
                <canvas ref="decodeCanvas" className="decodeCanvas" id="decodeCanvas" width={600} height={600}></canvas>
            </div>
        );
    }*/
}

export default Utils.altConnect(WebScan, [ScanStore, WalletStroe]);