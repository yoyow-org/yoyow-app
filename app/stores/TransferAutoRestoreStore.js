import BaseStore from "./BaseStore";
import alt from "../altInstance";
import TransferAutoRestoreActions from '../actions/TransferAutoRestoreActions'

class TransferAutoRestoreStore extends BaseStore{
  constructor(props){
    super(props)
    this.bindActions(TransferAutoRestoreActions);
  }
}

export default alt.createStore(TransferAutoRestoreStore,"TransferAutoRestoreStore");