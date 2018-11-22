/**
 * Created by lucker on 2018/5/17.
 */
import BaseStore from "./BaseStore";
import alt from "../altInstance";
import KeyBoardsActions from "../actions/KeyBoardsActions";

class KeyBoardsStore extends BaseStore {
    constructor() {
        super();
        this.state = {
            obj:{},
            isPoint:true,
            isShow:false,
            valArr:[],
            pointLength:5,
            selectionIndex:0
        }
        this.bindActions(KeyBoardsActions);
    }


    onSetObj(obj) {
        this.setState({
            obj: obj
        })
    }
    ontSePointLength(num){
        this.setState({
            pointLength: num
        })
    }
    onSetKeyBoardsVisibal(bool){
        this.setState({
            isShow: bool
        })
    }
    onSetKeyBoardsIsPoint(bool){
        this.setState({
            isPoint: bool
        })
    }
    onSetSelectionIndex(num){
        this.setState({
            isPoint: num
        })
    }
}
export default alt.createStore(KeyBoardsStore, "KeyBoardsStore")