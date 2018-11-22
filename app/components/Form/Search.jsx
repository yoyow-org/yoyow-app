import React from "react";
import BaseComponent from "../BaseComponent";
import {Utils} from "../../../lib";
class Search extends BaseComponent{
    constructor(){
        super();
    }
    componentDidMount(){
        let {width,height} = this.props;
        width?this.refs.search.style.width:null;
        height?this.refs.search.style.height:null;
    }
    clearValue(){
        this.refs.input.value="";
        let {claerEvent} = this.props;
        if(claerEvent) claerEvent();
    }
    handleClick(type,e){
        if(type==="button"){
            this.routerPush("/page-search")
        }else if(type==="search"){
            e.stopPropagation();
        }
    }

    handleSubmit(e){
        e.preventDefault();
        let {onSubmit} = this.props;
        if(onSubmit) onSubmit();
    }

    render(){
        let isAndroid  = Utils.checkPlatform() //判断搜索框根据平添加class=anzhuo
        let {placeholder,type,textChangeEvent,onChange, onSubmit, readOnly} = this.props;
        return (
            <div  ref="search" className="search">
                <span></span>
                <form action="" onSubmit={this.handleSubmit.bind(this)}>
                    <input onChange={onChange?onChange:textChangeEvent} ref="input" type="search" placeholder={placeholder} readOnly={readOnly} className={isAndroid ==='ios'?"":"anzhuo"}/>
                </form>
                {type=="search"?<button onClick={this.clearValue.bind(this)}></button>:""}
            </div>
        )
    }
}

export default Search