import React from "react";

class Loading extends React.Component{
    constructor(){
        super();
    }
    componentDidMount(){
        let nodes = this.refs.ul.childNodes
        for(let i =0; i < nodes.length; i++) {
            nodes[i].style.transform = `rotate(${i*30+"deg"})`;
            nodes[i].childNodes[0].style.animation = `loading 0.5s linear ${i*0.1+"s"} infinite alternate`;
        }
    }
    render(){
        let {size} = this.props;
        var list = (length) => {
            var res = [];
            for(var i = 0; i < length; i++) {
                res.push(<li key={i}><span></span></li>)
            }
            return res
        }
        return (
            <div className="loading">
                <ul ref="ul" style={{width:size,height:size}}>
                    {list(12)}
                </ul>
                <div>正在努力加载</div>
            </div>
        )
    }
}
export default Loading