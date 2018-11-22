import React from "react";
import {Route, IndexRoute} from "react-router";
import enterTransition from "./EnterTransition";
import App from "./App";
import InitError from "./components/InitError";
import Example from "./components/example/Example";
import ExampleForButtons from "./components/example/ExampleForButtons";
import ExampleForInputs from "./components/example/ExampleForInputs";
import ExampleForLayerOut from "./components/example/ExampleForLayerOut";
import ExampleForDrawBar from "./components/example/ExampleForDrawBar";
import PageSearch from "./components/Layout/PageSearch";
import Transfer from "./components/Transfer/Transfer";
import About from "./components/About/About";
import AboutServiceTerms from "./components/About/AboutServiceTerms";
import AboutVersionLog from "./components/About/AboutVersionLog";
import AboutProductGuide from "./components/About/AboutProductGuide";
import AboutDetectionVersion from "./components/About/AboutDetectionVersion";
import ContactsList from "./components/Contacts/ContactsList";
import ContactsSelect from "./components/Contacts/ContactsSelect";
import ContactsAdd from "./components/Contacts/ContactsAdd";
import ContactsSearch from "./components/Contacts/ContactsSearch";
import ContactsSearchResult from "./components/Contacts/ContactsSearchResult";
import ContactsSelectSearch from "./components/Contacts/ContactsSelectSearch";
import ContactsSelectSearchResult from "./components/Contacts/ContactsSelectSearchResult";
import Index from "./components/Index"
import CreateAccount from "./components/Account/CreateAccount";
import CreateSuccess from "./components/Account/CreateSuccess";
import ImportAccount from "./components/Account/ImportAccount";
import AccountManage from "./components/Account/AccountManage";
import AccountDetail from "./components/Account/AccountDetail";
import ChangePassword from "./components/Account/ChangePassword";
import ImportAuth from "./components/Account/ImportAuth";
import CreateAuth from "./components/Account/CreateAuth";
import PlatformContainer from "./components/Platform/PlatformContainer";
import PlatformSearch from "./components/Platform/PlatformSearch";
import Settings from "./components/Settings/Index";
import Language from "./components/Settings/Language";
import History from "./components/History";
import TransferForSelf from "./components/Transfer/TransferForSelf";
import IntegralManage from "./components/Integral/IntegralManage";
import Integral from "./components/Integral/Integral";
import QRReceive from "./components/Transfer/QRReceive";
import SetQRAmount from "./components/Transfer/SetQRAmount";
import TransferForFix from "./components/Transfer/TransferForFix";
import TokensList from "./components/Tokens/TokensList";
import TokensAdd from "./components/Tokens/TokensAdd";
import TokensViewList from "./components/Tokens/TokensViewList";
import TokensViewSearchList from "./components/Tokens/TokensViewSearchList";
import WebScan from "./components/Layout/WebScan";
import Platform from "./components/Platform/Platform";
import MyAccount from "./components/MyAccount"
import AutomaticTransferList from "./components/AutomaticTransfer/AutomaticTransferList";
import RuleAdd from "./components/AutomaticTransfer/RuleAdd";
import RuleEdit from "./components/AutomaticTransfer/RuleEdit";
import RestoreQRR from './components/AutomaticTransfer/RestoreQRR';
import ShowRestoreInfo from './components/AutomaticTransfer/ShowRestoreInfo'
import ReturnInfoList from "./components/ReturnInfoList/ReturnInfoList";
import ShowReturnInfo from "./components/ReturnInfoList/ShowReturnInfo";
import SelectTransferRestoreList from './components/SelectTransferRestore/SelectTransferRestoreList';
import AutoRestoreTransfer from './components/SelectTransferRestore/AutoRestoreTransfer';


const routes = (
    <Route path="/" component={App} onEnter={enterTransition}>
        <IndexRoute component={Index}/>
        <Route path="index" component={Index}/>
        <Route path="init-error" component={InitError}/>
        <Route path="platformindex" component={Platform}/>
        <Route path="myaccount" component={MyAccount}/>
        <Route path="example" component={Example}/>
        <Route path="example-for-buttons" component={ExampleForButtons}/>
        <Route path="example-for-inputs" component={ExampleForInputs}/>
        <Route path="example-for-layerOut" component={ExampleForLayerOut}/>
        <Route path="example-for-draw-bar" component={ExampleForDrawBar}/>
        <Route path="page-search" component={PageSearch}/>
        <Route path="transfer" component={Transfer}/>
        <Route path="about" component={About}/>
        <Route path="about/service-terms" component={AboutServiceTerms}/>
        <Route path="about/version-log" component={AboutVersionLog}/>
        <Route path="about/product-guide" component={AboutProductGuide}/>
        <Route path="about/detection-version" component={AboutDetectionVersion}/>
        <Route path="contacts" component={ContactsList}/>
        <Route path="contacts/add" component={ContactsAdd}/>
        <Route path="contacts/search" component={ContactsSearch}/>
        <Route path="contacts/search/result" component={ContactsSearchResult}/>
        <Route path="contacts-select" component={ContactsSelect}/>
        <Route path="contacts-select/search" component={ContactsSelectSearch}/>
        <Route path="contacts-select/search/result" component={ContactsSelectSearchResult}/>
        <Route path="create-account" component={CreateAccount}/>
        <Route path="create-success" component={CreateSuccess}/>
        <Route path="web-scan" component={WebScan}/>
        <Route path="import-account" component={ImportAccount}/>
        <Route path="account-manage" component={AccountManage}/>
        <Route path="account-detail" component={AccountDetail}/>
        <Route path="change-password" component={ChangePassword}/>
        <Route path="import-auth" component={ImportAuth}/>
        <Route path="create-auth" component={CreateAuth}/>
        <Route path="history" component={History}/>
        <Route path="history/:type" component={History}/>
        <Route path="platform" component={PlatformContainer}/>
        <Route path="platform/search" component={PlatformSearch}/>
        <Route path="settings" component={Settings}/>
        <Route path="settings/language" component={Language}/>
        <Route path="transfer-for-self/:type" components={TransferForSelf}/>
        <Route path="integral-manage" components={IntegralManage}/>
        <Route path="integral" components={Integral}/>
        <Route path="QRReceive" components={QRReceive}/>
        <Route path="setQRAmount" components={SetQRAmount}/>
        <Route path="transfer-for-fix" components={TransferForFix}/>

        {/* <Route path="resource-sold" components={ResourceSold}/>
         <Route path="third-add-rule" components={ThirdAdd}/>
         <Route path="resource-bought" components={ResourceBought}/> */}

        <Route path="tokens" components={TokensList}/>
        <Route path="tokens/add" components={TokensAdd}/>
        <Route path="tokens/view" components={TokensViewList}/>
        <Route path="tokens/search" components={TokensViewSearchList}/>
        <Route path="automaticTransfer" components={AutomaticTransferList}/>
        <Route path="automaticTransfer/add" components={RuleAdd}/>
        <Route path="automaticTransfer/edit" components={RuleEdit}/>
        <Route path="automaticTransfer/restoreQRR" components={RestoreQRR}/>
        <Route path="automaticTransfer/showRestoreInfo" components={ShowRestoreInfo}/>
        <Route path="returnInfoList" components={ReturnInfoList}/>
        <Route path="returnInfoList/showReturnInfo" components={ShowReturnInfo}/>
        <Route path="selectTransferRestoreList" components={SelectTransferRestoreList}/>
        <Route path="autoRestoreTransfer" components={AutoRestoreTransfer}/>

    </Route>);

export default routes;
