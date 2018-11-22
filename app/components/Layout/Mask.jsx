import React from "react"
class Mask extends React.Component{
    constructor(){
        super();
    }
    render(){
        let {onClick} = this.props
        return (
            <div onClick={onClick} className="mask"></div>
        )
    }
}
export default Mask