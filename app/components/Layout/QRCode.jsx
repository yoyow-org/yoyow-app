'use strict';

import React from "react";
import BaseComponent from "../BaseComponent";
import PropTypes from "prop-types";
import QRCodeImpl from "qr.js/lib/QRCode"
import ErrorCorrectLevel from "qr.js/lib/ErrorCorrectLevel";
import AccountImage from "./AccountImage";
import {Validation} from "../../../lib";

class QRCode extends BaseComponent {
    constructor() {
        super();

    }

    getBackingStorePixelRatio(ctx) {
        return (
            // $FlowFixMe
            ctx.webkitBackingStorePixelRatio ||
            // $FlowFixMe
            ctx.mozBackingStorePixelRatio ||
            // $FlowFixMe
            ctx.msBackingStorePixelRatio ||
            // $FlowFixMe
            ctx.oBackingStorePixelRatio ||
            // $FlowFixMe
            ctx.backingStorePixelRatio || 1
        );
    }

    shouldComponentUpdate(nextProps) {
        return Object.keys(QRCode.propTypes).some(k => {
            return this.props[k] !== nextProps[k];
        });
    }

    componentDidMount() {
        this.update();
    }

    componentDidUpdate() {
        this.update();
    }

    update() {
        let {value, size, level, bgColor, fgColor, pic} = this.props;
        let picObj = this.refs.pic?this.refs.pic.refs.canvas:""
        var qrcode = new QRCodeImpl(-1, ErrorCorrectLevel[level]);
        
        qrcode.addData(value);
        qrcode.make();

        var canvas = this.refs.qrcode_view;

        var ctx = canvas.getContext('2d');
        if (!ctx) {
            return;
        }
        var cells = qrcode.modules;
        if (cells === null) {
            return;
        }

        let lineW = 15;
        var tileW = (size - lineW*2) / cells.length;
        var tileH =(size - lineW*2) / cells.length;
        var scale = (window.devicePixelRatio || 1) / this.getBackingStorePixelRatio(ctx);
        canvas.height = canvas.width = size * scale;

        ctx.scale(scale, scale);

        cells.forEach(function (row, rdx) {
            row.forEach(function (cell, cdx) {
                ctx && (ctx.fillStyle = cell ? fgColor : bgColor);
                var w = Math.ceil((cdx + 1) * tileW) - Math.floor(cdx * tileW);
                var h = Math.ceil((rdx + 1) * tileH) - Math.floor(rdx * tileH);
                ctx && ctx.fillRect(Math.round(cdx * tileW) + lineW, Math.round(rdx * tileH) + lineW, w, h);
            });
        });
        let r  = size/6
        if(this.refs.pic){

            this.refs.pic.refs.canvas.style.opacity = 0

            let positions = size/2

            ctx.beginPath();
            ctx.arc(positions,positions,r,0,2*Math.PI);
            ctx.stroke();
            ctx.fillStyle="white";
            ctx.fill()
            ctx.drawImage(picObj,(size-size/2.8)/2,(size-size/2.8)/2,size/2.8,size/2.8)
        }

        ctx.strokeStyle = 'white';
        ctx.lineWidth = 30;
        ctx.strokeRect(0, 0, size, size);
    }

    render() {
        let {size, account} = this.props;
        return (
            <div className="qrcode_view">
                <canvas ref="qrcode_view" height={size} width={size} style={{height: size, width: size}}></canvas>
                { Validation.isEmpty(account) ? '' :
                    <AccountImage ref="pic" account={account} size={{height: 140, width: 140}}/> }
            </div>
        )
    }

}

QRCode.defaultProps = {
    enumerable: true,
    writable: true,
    size: 128,
    level: 'L',
    bgColor: '#FFFFFF',
    fgColor: '#000000',
    value: undefined,
    account: undefined
}

QRCode.propTypes = {
    enumerable: PropTypes.bool,
    writable: PropTypes.bool,
    size: PropTypes.number,
    bgColor: PropTypes.string,
    fgColor: PropTypes.string,
    value: PropTypes.string,
    account: PropTypes.string
}

export default QRCode;