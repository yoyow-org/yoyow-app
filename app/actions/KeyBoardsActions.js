/**
 * Created by lucker on 2018/5/17.
 */

import alt from "../altInstance";

class KeyBoardsActions {

    setObj(obj){
        return obj;
    }
    setPointLength(num){
        return num
    }
    setKeyBoardsVisibal(bool){
        return bool;
    }
    setKeyBoardsIsPoint(bool){
        return bool;
    }
    setSelectionIndex(num){
        return num
    }
}
export default alt.createActions(KeyBoardsActions);