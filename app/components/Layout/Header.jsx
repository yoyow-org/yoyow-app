import React from "react";
import {connect} from "alt-react";
import BaseComponent from "../BaseComponent";
import Search from "../Form/Search"
import Scanner from "../Layout/Scanner"
import SettingsStore from "../../stores/SettingsStore";
import SettingsActions from "../../actions/SettingsActions";

class Header extends BaseComponent {
    constructor(props) {
        super(props);
        this.state={
            tipsShow:false
        }
        this.onDocumentClick = this.onDocumentClick.bind(this);
    }

    componentDidMount(){
        // let {headerData} = this.props;
        // console.log(headerData)
    }
    componentDidUpdate(prevProps, prevState) {

        //console.log(prevState)
        if (this.state.tipsShow) {
            document.addEventListener('touchstart', this.onDocumentClick, false);
        } else {
            document.removeEventListener('touchstart', this.onDocumentClick, false);
        }
    }
    onDocumentClick(e) {
        this.setState({tipsShow: false});
    }
    backToPrev(e){
        let {canBack, onBack} = this.props.headerData;
        if(onBack){
            onBack();
        } 
        if(canBack){
            this.routerBack();
        }

    }
    handleRightButton(e){
        e.preventDefault();
        let {headerData} = this.props;
        if(headerData.buttonRight&&headerData.buttonRight.value == "img_help"){
            this.setState({
                tipsShow:true
            })
        }
    }
    render() {
        let {headerData} = this.props;
        let {tipsShow} = this.state
        let btnLeft ;
        let headerContent;
        if(headerData && headerData.buttonLeft) btnLeft = headerData.buttonLeft.value;
        if(!headerData){
            return headerContent = (
                <div></div>
            )
        }else  if(headerData.search){
            return headerContent = (
                <div className="header">
                    <Search type ={headerData.search.type} onSubmit={headerData.onSubmit?headerData.onSubmit:null} textChangeEvent={headerData.textChangeEvent} claerEvent={headerData.claerEvent} placeholder= {this.translate(headerData.search.value)} width={this.props.width} height={this.props.height}/>
                    <button onClick={this.backToPrev.bind(this)}>{this.translate('form.button_cancel')}</button>
                </div>
            )
        }else {
            let className,isScanning,callback;
            if(!headerData.buttonRight){
                className= "";
            }else if(headerData.buttonRight.value == "img_scanning"&&headerData.buttonRight){
                className= "rightButton scanning";
                isScanning=true;
                callback=headerData.buttonRight.callback?headerData.buttonRight.callback:()=>{};
            }else if(headerData.buttonRight.value == "img_help"&&headerData.buttonRight){
                className= "rightButton help";
            }

            return headerContent = (
                <div className="header">
                    <button onClick={this.backToPrev.bind(this)} className={btnLeft?btnLeft:''}>{btnLeft=="img_back"||btnLeft=="tokens"||!btnLeft?"":this.translate('form.button_close')}</button>
                    <h1>{headerData.title==""?"":this.translate(headerData.title)}</h1>
                    {isScanning?
                    <Scanner onClick={this.handleRightButton.bind(this)} callback={callback} className={className}></Scanner>
                    :<button onClick={this.handleRightButton.bind(this)} className={className}></button>
                    }
                    {tipsShow?
                        <div className="tips_header">
                            <span className="arrow"></span>
                            <span className="box_tips">{headerData.buttonRight.textValue}</span>
                        </div>:""
                    }
                </div>
            )
        }
        return (
            {headerContent}
        )
    }
}

export default connect(Header, {
    listenTo(){
        return [SettingsStore];
    },
    getProps(){
        return SettingsStore.getState();
    }
})