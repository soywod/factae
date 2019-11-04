import "moment/locale/fr";

import React, {useEffect, useState} from "react";
import {useTranslation} from "react-i18next";
import {BrowserRouter as Router, Route, Redirect, Switch} from "react-router-dom";
import moment from "moment";
import AntdProvider from "antd/lib/config-provider";
import Icon from "antd/lib/icon";
import Layout from "antd/lib/layout";
import Menu from "antd/lib/menu";
import fr from "antd/lib/locale-provider/fr_FR";

import CookieConsent from "./common/components/CookieConsent";
import Settings from "./common/components/Settings";
import Support from "./common/components/Support";
import Sider from "./common/components/Sider";
import Logo from "./common/components/Logo";
import Link from "./common/components/Link";
import {useAuth} from "./auth/service";
import AuthForm from "./auth/Form";
import Demo from "./auth/Demo";
import Logout from "./auth/Logout";
import PrivateRoute from "./auth/PrivateRoute";
import {useProfileService} from "./profile/hooks";
import {useClientService} from "./client/hooks";
import ClientList from "./client/components/List";
import ClientEdit from "./client/components/Edit";
import {useRecordService} from "./record/hooks";
import RecordList from "./record/components/List";
import RecordEdit from "./record/components/Edit";
import {useDocumentService} from "./document/hooks";
import DocumentList from "./document/components/List";
import DocumentEdit from "./document/components/Edit";
import Dashboard from "./dashboard/components";

function App() {
  const locales = {fr};
  const {i18n} = useTranslation();

  useAuth();
  useProfileService();
  useClientService();
  useDocumentService();
  useRecordService();

  useEffect(() => {
    moment.locale(i18n.language);
  }, [i18n.language]);

  return (
    <AntdProvider locale={locales[i18n.language]}>
      <Router>
        <Switch>
          <Route path="/auth" component={AuthForm} />
          <Route path="/demo" component={Demo} />
          <PrivateRoute path="/logout" component={Logout} />
          <PrivateRoute path="/support" component={withLayout(Support)} />
          <PrivateRoute path="/clients/:id" component={withLayout(ClientEdit)} />
          <PrivateRoute path="/clients" component={withLayout(ClientList)} />
          <PrivateRoute path="/records/:id" component={withLayout(RecordEdit)} />
          <PrivateRoute path="/records" component={withLayout(RecordList)} />
          <PrivateRoute path="/documents/:id" component={withLayout(DocumentEdit)} />
          <PrivateRoute path="/documents" component={withLayout(DocumentList)} />
          <PrivateRoute path="/settings/:tab?" component={withLayout(Settings)} />
          <PrivateRoute expact path="/" component={withLayout(Dashboard)} />
          <Redirect to="/" />
        </Switch>
      </Router>
      <CookieConsent />
    </AntdProvider>
  );
}

const withLayout = Component => props => {
  const [siderVisible, setSiderVisible] = useState(false);

  return (
    <Layout>
      <Layout.Header>
        <Link className="ant-layout-header-logo" to="/">
          <Logo light="#ffffff" dark="hsla(0, 0%, 100%, .65)" width={75} />
        </Link>
        <div style={{flex: 1}}>
          <Menu className="ant-layout-header-menu" mode="horizontal" theme="dark" selectedKeys={[]}>
            <Menu.Item key="burger" onClick={() => setSiderVisible(!siderVisible)}>
              <Icon type="menu" />
            </Menu.Item>
          </Menu>
        </div>
      </Layout.Header>
      <Layout.Sider breakpoint="md" className={`ant-layout-sider-${siderVisible ? "on" : "off"}`}>
        <Sider />
      </Layout.Sider>
      <Layout.Content>
        <Component {...props} />
      </Layout.Content>
    </Layout>
  );
};

export default App;
