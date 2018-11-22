import React from "react";
import BaseComponent from "./BaseComponent";
import KeyBoardsActions from "../actions/KeyBoardsActions";
import {PrivateKey, key, Aes, AccountUtils, TransactionBuilder, Signature} from "yoyowjs-lib";
class Test extends BaseComponent {
    constructor() {
        super();
    }

    componentDidMount() {

    }
    dd(e){
       console.log(e.target.value)

    }

    test(){

        let owner_private = key.get_random_key();
        let owner_pub = owner_private.toPublicKey();
        let owner_pubToString = owner_private.toPublicKey().toPublicKeyString();
        let owner_toWif = owner_private.toWif();
        let owner_key = PrivateKey.fromWif(owner_toWif);
        let pubkey=owner_key.toPublicKey().toPublicKeyString();
        let pwd= "123456";
        let password_aes = Aes.fromSeed(pwd);
        let encryption_buffer = key.get_random_key().toBuffer();
        let encryption_key = password_aes.encryptToHex(encryption_buffer);
        console.log("私钥========",owner_private);
        console.log("公钥========",owner_pub)
        console.log("公钥字符串========",owner_pubToString);
        console.log("owner_toWif========",owner_toWif)
        console.log("密码========",pwd);
        console.log("password_aes========",password_aes);
        console.log("owner_key========",owner_key);
        console.log("pubkey========",pubkey);
        console.log(owner_key == owner_private);

    }
    render() {

        return (
            <div>
                <input value={0} ref="in" onChange={this.dd.bind(this)} />
                <div onClick={this.test.bind(this)}>1111111</div>
            </div>

        )
    }
}
export default Test;