import React from "react";
import {Route, IndexRoute} from "react-router";
import enterTransition from "./EnterTransition";
import App from "./App";


function loadRoute(cb, moduleName = "default") {
    return (module) => cb(null, module[moduleName]);
}

function errorLoading(err) {
    console.error("动态加载组件失败：", err);
}

const routes = (
    <Route path="/" component={App} onEnter={enterTransition}>
        <IndexRoute getComponent={(location, cb) => {
            System.import("components/Index").then(loadRoute(cb)).catch(errorLoading);
        }}/>
        <Route path="/index" getComponent={(location, cb) => {
            System.import("components/Index").then(loadRoute(cb)).catch(errorLoading);
        }}/>
        <Route path="/init-error" getComponent={(location, cb) => {
            System.import("components/InitError").then(loadRoute(cb)).catch(errorLoading);
        }}/>
        <Route path="/platformindex" getComponent={(location, cb) => {
            System.import("components/Platform/Platform").then(loadRoute(cb)).catch(errorLoading);
        }}/>
        <Route path="/myaccount" getComponent={(location, cb) => {
            System.import("components/MyAccount").then(loadRoute(cb)).catch(errorLoading);
        }}/>
        <Route path="/transfer" getComponent={(location, cb) => {
            System.import("components/Transfer/Transfer").then(loadRoute(cb)).catch(errorLoading);
        }}/>
        <Route path="/about" getComponent={(location, cb) => {
            System.import("components/About/About").then(loadRoute(cb)).catch(errorLoading);
        }}/>
        <Route path="/about/service-terms" getComponent={(location, cb) => {
            System.import("components/About/AboutServiceTerms").then(loadRoute(cb)).catch(errorLoading);
        }}/>
        <Route path="/about/version-log" getComponent={(location, cb) => {
            System.import("components/About/AboutVersionLog").then(loadRoute(cb)).catch(errorLoading);
        }}/>
        <Route path="/about/product-guide" getComponent={(location, cb) => {
            System.import("components/About/AboutProductGuide").then(loadRoute(cb)).catch(errorLoading);
        }}/>
        <Route path="/about/detection-version" getComponent={(location, cb) => {
            System.import("components/About/AboutDetectionVersion").then(loadRoute(cb)).catch(errorLoading);
        }}/>
        <Route path="/contacts" getComponent={(location, cb) => {
            System.import("components/Contacts/ContactsList").then(loadRoute(cb)).catch(errorLoading);
        }}/>
        <Route path="/contacts/add" getComponent={(location, cb) => {
            System.import("components/Contacts/ContactsAdd").then(loadRoute(cb)).catch(errorLoading);
        }}/>
        <Route path="/contacts/search" getComponent={(location, cb) => {
            System.import("components/Contacts/ContactsSearch").then(loadRoute(cb)).catch(errorLoading);
        }}/>
        <Route path="/contacts/search/result" getComponent={(location, cb) => {
            System.import("components/Contacts/ContactsSearchResult").then(loadRoute(cb)).catch(errorLoading);
        }}/>
        <Route path="/contacts-select" getComponent={(location, cb) => {
            System.import("components/Contacts/ContactsSelect").then(loadRoute(cb)).catch(errorLoading);
        }}/>
        <Route path="/contacts-select/search" getComponent={(location, cb) => {
            System.import("components/Contacts/ContactsSelectSearch").then(loadRoute(cb)).catch(errorLoading);
        }}/>
        <Route path="/contacts-select/search/result" getComponent={(location, cb) => {
            System.import("components/Contacts/ContactsSelectSearchResult").then(loadRoute(cb)).catch(errorLoading);
        }}/>
        <Route path="/create-account" getComponent={(location, cb) => {
            System.import("components/Account/CreateAccount").then(loadRoute(cb)).catch(errorLoading);
        }}/>
        <Route path="/create-success" getComponent={(location, cb) => {
            System.import("components/Account/CreateSuccess").then(loadRoute(cb)).catch(errorLoading);
        }}/>
        <Route path="/import-account" getComponent={(location, cb) => {
            System.import("components/Account/ImportAccount").then(loadRoute(cb)).catch(errorLoading);
        }}/>
        <Route path="/account-manage" getComponent={(location, cb) => {
            System.import("components/Account/AccountManage").then(loadRoute(cb)).catch(errorLoading);
        }}/>
        <Route path="/account-detail" getComponent={(location, cb) => {
            System.import("components/Account/AccountDetail").then(loadRoute(cb)).catch(errorLoading);
        }}/>
        <Route path="/change-password" getComponent={(location, cb) => {
            System.import("components/Account/ChangePassword").then(loadRoute(cb)).catch(errorLoading);
        }}/>
        <Route path="/import-auth" getComponent={(location, cb) => {
            System.import("components/Account/ImportAuth").then(loadRoute(cb)).catch(errorLoading);
        }}/>
        <Route path="/create-auth" getComponent={(location, cb) => {
            System.import("components/Account/CreateAuth").then(loadRoute(cb)).catch(errorLoading);
        }}/>
        <Route path="/history" getComponent={(location, cb) => {
            System.import("components/History").then(loadRoute(cb)).catch(errorLoading);
        }}/>
        <Route path="/history/:type" getComponent={(location, cb) => {
            System.import("components/History").then(loadRoute(cb)).catch(errorLoading);
        }}/>
        <Route path="/platform" getComponent={(location, cb) => {
            System.import("components/Platform/PlatformContainer").then(loadRoute(cb)).catch(errorLoading);
        }}/>
        <Route path="/platform/search" getComponent={(location, cb) => {
            System.import("components/Platform/PlatformSearch").then(loadRoute(cb)).catch(errorLoading);
        }}/>
        <Route path="/settings" getComponent={(location, cb) => {
            System.import("components/Settings/Index").then(loadRoute(cb)).catch(errorLoading);
        }}/>
        <Route path="/settings/language" getComponent={(location, cb) => {
            System.import("components/Settings/Language").then(loadRoute(cb)).catch(errorLoading);
        }}/>
        <Route path="/transfer-for-self/:type" getComponent={(location, cb) => {
            System.import("components/Transfer/TransferForSelf").then(loadRoute(cb)).catch(errorLoading);
        }}/>
        <Route path="/integral-manage" getComponent={(location, cb) => {
            System.import("components/Integral/IntegralManage").then(loadRoute(cb)).catch(errorLoading);
        }}/>
        <Route path="/integral" getComponent={(location, cb) => {
            System.import("components/Integral/Integral").then(loadRoute(cb)).catch(errorLoading);
        }}/>
        <Route path="/QRReceive" getComponent={(location, cb) => {
            System.import("components/Transfer/QRReceive").then(loadRoute(cb)).catch(errorLoading);
        }}/>
        <Route path="/setQRAmount" getComponent={(location, cb) => {
            System.import("components/Transfer/SetQRAmount").then(loadRoute(cb)).catch(errorLoading);
        }}/>
        <Route path="/transfer-for-fix" getComponent={(location, cb) => {
            System.import("components/Transfer/TransferForFix").then(loadRoute(cb)).catch(errorLoading);
        }}/>
        <Route path="/tokens" getComponent={(location, cb) => {
            System.import("components/Tokens/TokensList").then(loadRoute(cb)).catch(errorLoading);
        }}/>
        <Route path="/tokens/add" getComponent={(location, cb) => {
            System.import("components/Tokens/TokensAdd").then(loadRoute(cb)).catch(errorLoading);
        }}/>
        <Route path="/tokens/view" getComponent={(location, cb) => {
            System.import("components/Tokens/TokensViewList").then(loadRoute(cb)).catch(errorLoading);
        }}/>
        <Route path="/tokens/search" getComponent={(location, cb) => {
            System.import("components/Tokens/TokensViewSearchList").then(loadRoute(cb)).catch(errorLoading);
        }}/>
        <Route path="/web-scan" getComponent={(location, cb) => {
            System.import("components/Layout/WebScan").then(loadRoute(cb)).catch(errorLoading);
        }}/>

        <Route path="automaticTransfer" getComponent={(location, cb) => { 
            System.import("components/AutomaticTransfer/AutomaticTransferList").then(loadRoute(cb)).catch(errorLoading);
        }} />
        <Route path="automaticTransfer/add" getComponent={(location, cb) => { 
            System.import("components/AutomaticTransfer/RuleAdd").then(loadRoute(cb)).catch(errorLoading);
        }} />
        <Route path="automaticTransfer/edit" getComponent={(location, cb) => {
            System.import("components/AutomaticTransfer/RuleEdit").then(loadRoute(cb)).catch(errorLoading);
        }} />
        <Route path="automaticTransfer/restoreQRR" getComponent={(location, cb) => {
            System.import("components/AutomaticTransfer/RestoreQRR").then(loadRoute(cb)).catch(errorLoading);
        }} />
        <Route path="automaticTransfer/showRestoreInfo" getComponent={(location, cb) => {
            System.import("components/AutomaticTransfer/ShowRestoreInfo").then(loadRoute(cb)).catch(errorLoading);
        }} />
        <Route path="returnInfoList" getComponent={(location, cb) => {
            System.import("components/ReturnInfoList/ReturnInfoList").then(loadRoute(cb)).catch(errorLoading); 
        }}/>
        <Route path="returnInfoList/showReturnInfo" getComponent={(location, cb) => {
            System.import("components/ReturnInfoList/ShowReturnInfo").then(loadRoute(cb)).catch(errorLoading);
        }} />
        <Route path="selectTransferRestoreList" getComponent={(location, cb) => {
            System.import("components/SelectTransferRestore/SelectTransferRestoreList").then(loadRoute(cb)).catch(errorLoading);
        }} />
        <Route path="autoRestoreTransfer" getComponent={(location, cb) => {
            System.import("components/SelectTransferRestore/AutoRestoreTransfer").then(loadRoute(cb)).catch(errorLoading);
        }} />
    </Route>
);

export default routes;