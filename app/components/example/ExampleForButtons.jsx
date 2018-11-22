import React from "react";
import BaseComponent from "../BaseComponent";
import SettingsActions from "../../actions/SettingsActions"
import Button from "../Form/Button"

class ExampleForButtons extends BaseComponent{
    constructor(){
        super()
    }
    componentDidMount(){
        let  headerData = {
            buttonLeft: {
                value: "",
            },
            title: "按钮样式",
            canBack:true
        }
        SettingsActions.updateHeader(headerData);
    }
    render(){
        return (
            <div className="cover_full">
                <div className="bgWhite">
                    <div className="layer_button">
                        <Button value="按钮" bg="#fff" border="green" color="#333" size={34} />
                        {/*背景色为白色，绿色边框，字体大小为默认（28），按钮大小34*/}
                        <Button value="按钮" size={34} />
                        {/*背景色为默认（绿色），边框默认（无），字体大小为默认（28），按钮大小34*/}
                    </div>
                    <div className="layer_button">
                        <Button value="默认"/>
                        {/*背景色为默认（绿色），边框默认（无），字体大小为默认（28），按钮大小为默认（26）*/}
                    </div>

                    <div className="layer_button">
                        <Button value="按钮" bg="#fff" border="#ccc" color="#333" size={18} />
                        {/*背景色为白色，边框#ccc，字体大小为默认（28），按钮大小为18）*/}
                        <Button value="默认"  fontSize={26} size={18}/>
                        {/*背景色为默认（绿色），边框默认（无），字体大小为26），按钮大小为18*/}
                        <Button value="按钮" bg="#fff" border="#ccc" color="#333" size={18}/>
                        {/*背景色为#fff，边框#ccc，字体大小为默认（28），按钮大小为18*/}
                    </div>

                    <div className="layer_button">
                        <Button value="按钮" bg="#fff" border="green" color="#333" fontSize={32} size={34} />
                        {/*背景色为#fff，边框绿色，字体大小为32，按钮大小为34*/}
                        <Button value="按钮" fontSize={32} size={34}  />
                        {/*背景色为默认（绿色），边框默认（无），字体大小为32，按钮大小为34*/}
                    </div>
                    <div className="layer_button">
                        <Button value="按钮" bg="#fff" border="green" color="#333" size={34} />
                        {/*背景色为#fff，边框绿色，字体大小为默认（28），按钮大小为34*/}
                        <Button value="按钮" size={34} />
                        {/*背景色为默认（绿色），边框为默认（无），字体大小为默认（28），按钮大小为34*/}
                    </div>
                    <div className="layer_button">
                        <Button value="按钮" bg="#fff" border="#ccc" color="#333" fontSize={26} size={18}/>
                        {/*背景色为#fff，边框#ccc，字体大小为默认（26），按钮大小为18*/}
                        <Button value="默认"  fontSize={26} size={18}/>
                        {/*背景色为默认（绿色），边框默认（无），字体大小为26，按钮大小为18*/}
                        <Button value="按钮" bg="#fff" border="#ccc" color="#333" fontSize={26} size={18}/>
                        {/*背景色为#fff，边框#ccc，字体大小为26，按钮大小为18*/}
                    </div>
                    <div className="layer_button">
                        <Button disabled="disabled" value="按钮" bg="#fff" border="#ccc" color="#333" fontSize={26} size={18}/>
                    </div>
                </div>
            </div>
        )
    }
}
export default ExampleForButtons