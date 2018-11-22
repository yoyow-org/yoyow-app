
import BaseStore from "./BaseStore";
import alt from "../altInstance";
import ChainApi from "../../lib/api/ChainApi";
import Validation from "../../lib/utils/Validation";
import walletDatabase from "../../lib/db/WalletDatabase";
import ContactsActions from "../actions/ContactsActions";
import WalletStore from "./WalletStore";


class ContactsStore extends BaseStore{
    constructor() {
        super();
        this.bindActions(ContactsActions);
        
        this.state = {
            uid:"",
            contacts: [],
            histroys:[],
            selectItems:"",
            searchKeywords:""
          };
    }

    /**
     * 验证联系人账号
     * @param {*} param0 
     */
    onValidationAccent({uid,resolve,reject}){
        ChainApi.getAccount(uid)
        .then(res=>{
            resolve(true);
        })
        .catch(e=>{
            reject(false);
        });
    }

    /**
     * 获取联系人列表
     * @param {*} param0 
     */
    onGetContactsList({resolve,reject}){
        let master=WalletStore.getWallet().yoyow_id;
        walletDatabase.instance().walletDB().loadData('contacts', {
            master: master
        })
        .then(res => {
            let {searchKeywords}=this.state;
            if(Validation.isEmpty(searchKeywords)){
                this.setState({ contacts: res });
                resolve();
            }else{
                //暂时以此遍历方式实现模糊查询
                let data = [];
                for(let obj of res){
                    if(obj.uid.toString().indexOf(searchKeywords) >= 0 || obj.remark.toUpperCase().indexOf(searchKeywords) >= 0 || obj.remark.toLowerCase().indexOf(searchKeywords) >= 0){
                        data.push(obj);
                    }
                }
                /**获取成功 */
                this.setState({ contacts: data });
                resolve();
            }
        }).catch(err => {
            reject(err.message);
        });
    }

    /**
     * 设置关键字
     * @param {*} val 
     */
    onSetKeywords(val){
        this.setState({ searchKeywords: val });
    }

    /**
     * 获取查询记录
     * @param {} param0 
     */
    onGetHistroys({master,resolve,reject}){
        walletDatabase.instance().walletDB().loadData('historys', {
            master: master
        })
        .then(res => {
            this.setState({histroys: res});
            resolve();            
        }).catch(err => {
            reject(err.message);
        });
    }

    /**
     * 新增，修改联系人
     * @param {*} param0 
     */
    onSetContact({contact,method,resolve,reject}){
        let code = 0;
        let checkPromise = [];
        //验证uid有效性
        checkPromise.push(new Promise((resolve, reject) => {
            ChainApi.getAccount(contact.uid).then(uObj => {
                if(uObj){
                    resolve();
                }else{
                    //不是有效账号
                    reject(-2);
                }
            }).catch(err => {
                //不是有效账号
                reject(-2);
            });
        }));

        // 新增时检查是否存在
        if(method == 'add'){
            checkPromise.push(new Promise((resolve, reject) => {
                walletDatabase.instance().walletDB().loadData('contacts', {
                    uid: contact.uid,
                    master: contact.master
                }).then(res => {
                    if(res.length > 0){
                        //"联系人账号已存在！"
                        reject(-3);
                    }else{
                        resolve();
                    }
                }).catch(err => {
                    //提取联系人账号已异常！
                    reject(-4);
                });
            }));
        }

        Promise.all(checkPromise).then(() => {
            walletDatabase.instance().walletDB().addStore('contacts', contact, method)
                .then(() => {
                    this.setState({qrcodeuid:""});
                    resolve();
                })
                .catch(err => {
                    //添加联系人错误
                    reject(-5);
                });

        }).catch(code => {
            reject(code)
        });
    }

    /**
     * 添加联系人，转账使用
     * @param {*} param0 
     */
    onAddContact({uid,master,resolve,reject}){
        let contact={
            uid:uid,
            master:master,
            remark:"",
            head_img:"",
            last_modify:Date.now()
        }
        
        //判断是否存在联系人中
        new Promise((resolve, reject) => {
            walletDatabase.instance().walletDB().loadData('contacts', {
                uid: contact.uid,
                master: contact.master
            })
            .then(res => {
                if(res.length== 0){
                    walletDatabase.instance().walletDB().addStore('contacts', contact, "add")
                    .then(() => {
                        resolve();
                    });
                }
                else{
                    resolve();
                }
            });
        });
    }

    /**
     * 新增历史记录
     * @param {*} param0 
     */
    onSetHistroy({history,resolve,reject}){
        walletDatabase.instance().walletDB().loadData('historys', {
            keyword: history.keyword,
            master: history.master
        }).then(res => {
            if(res.length > 0){
                walletDatabase.instance().walletDB().removeStore('historys', res[0].inx);
            }
                walletDatabase.instance().walletDB().addStore('historys', history, "add")
                .then(() => {
                    resolve();
                }).catch(err => {
                    reject(-1);
                });
            
        }).catch(err => {
            reject(-1);
        });
    }

    /**
     * 删除联系人
     * @param {*} param0 
     */
    onDelContact({inx,resolve,reject}){
        walletDatabase.instance().walletDB().removeStore('contacts', inx)
        .then(res => {
            let data=this.state.contacts;
            data.splice(data.findIndex(item => item.inx === inx), 1);
            this.setState({contacts:data});
            resolve();
        }).catch(err => {
            reject(1);
        });
    }

    /**
     * 删除查询记录
     * @param {} param0 
     */
    onDelHistroy({inx,resolve,reject}){
        walletDatabase.instance().walletDB().removeStore('historys', inx)
            .then(res => {
                let data=this.state.histroys;
                data.splice(data.findIndex(item => item.inx === inx), 1);
                this.setState({histroys:data});
                resolve();
            }).catch(err => {
                reject(1);
            });
    }
    
    /**
     * 选择联系人
     * @param {*} param0 
     */
    onSelectContact({items,resolve,reject}){
        this.setState({selectItems:items});
        resolve();
    }

    /**
     * 设置二维码联系人
     * @param {*} param0 
     */
    onSetQRcodeUid(val){
        this.setState({uid:val});
    }
}

export default alt.createStore(ContactsStore,"ContactsStore");