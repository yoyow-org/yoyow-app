import React, {PropTypes} from "react";
import {jdenticon} from "../../../lib";
import {hash} from "yoyowjs-lib";
import BaseComponent from "../BaseComponent";
import {merge} from "lodash";

class AccountImage extends BaseComponent {
    constructor(props) {
        super(props);
    }

    repaint(){
        let {account} = this.props;
        if(account){
            jdenticon.update(this.refs.canvas, hash.sha256(account).toString("hex"));
        }
    }

    componentDidMount(){
        this.repaint();
    }

    componentDidUpdate(){
        this.repaint();
    }

    render() {
        let {account, image, size, style} = this.props;
        let {width, height} = size;
        let domId = `account_img_${account}`
        let scrWidth = document.documentElement.clientWidth;
        let bl = scrWidth/750;
        let rem = bl*40
        width = width < 30 ? 30 : width;
        height = height < 30 ? 30 : height;
        style = merge({background: 'white'}, style, {borderRadius: `${height/40*rem}px`, border: '1px solid #cccccc'})
        let img = image ? 
            <img src={image} height={height*rem/40 + "px"} width={width/40*rem + "px"} /> :
            <canvas id={domId} ref="canvas" width={width/40*rem} style={style} height={height/40*rem} />
        return (
            <div style={{width:width/40*rem,height:height/40*rem}}>
                {img}
            </div>
        )
    }
}

AccountImage.defaultProps = {
    src: "",
    account: "",
    size: {width: 80, height: 80},
    style: {}
}

AccountImage.propTypes = {
    src: PropTypes.string,
    account: PropTypes.string,
    size: PropTypes.object.isRequired,
    style: PropTypes.object
};

export default AccountImage;