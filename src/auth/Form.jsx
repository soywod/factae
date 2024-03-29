import React, {useEffect, useState} from "react";
import {useTranslation} from "react-i18next";
import {withRouter} from "react-router-dom";
import isNull from "lodash/fp/isNull";
import Button from "antd/lib/button";
import Card from "antd/lib/card";
import Form from "antd/lib/form";
import Icon from "antd/lib/icon";
import Input from "antd/lib/input";
import Spin from "antd/lib/spin";

import Logo from "../common/components/Logo";
import Link from "../common/components/Link";
import {notify} from "../utils/notification";
import {useProfile} from "../profile/hooks";
import $auth from "./service";
import {useAuth} from "./context";
import background from "./background.jpeg";

const styles = {
  container: {
    alignItems: "center",
    backgroundSize: "cover",
    background: `url(${background}) no-repeat center center`,
    bottom: 0,
    padding: 15,
    display: "flex",
    height: "100vh",
    justifyContent: "center",
    width: "100%",
  },
  card: {
    maxWidth: 450,
    width: "100%",
  },
  title: {
    position: "relative",
    alignItems: "center",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    width: "100%",
  },
  subtitle: {
    margin: "8px 0 0 0",
    opacity: 0.3,
    fontSize: ".9em",
    fontStyle: "italic",
  },
  demo: {
    position: "absolute",
    right: 0,
    top: 0,
  },
};

const withHOCs = Component => Form.create()(withRouter(Component));
const AuthForm = withHOCs(props => {
  const {getFieldDecorator} = props.form;
  const params = new URLSearchParams(props.location.search);
  const [loading, setLoading] = useState(false);
  const user = useAuth();
  const profile = useProfile();
  const {t, i18n} = useTranslation();
  const defaultEmail = params.get("email") || "";
  const isFormDirty = !props.form.isFieldsTouched();

  const doAsyncTask = action => async event => {
    event.preventDefault();
    setLoading(true);

    try {
      await action();
    } catch (error) {
      if (error.code) notify.error(t("/auth." + error.code));
      else if (error.message) notify.error(error.message);
      setLoading(false);
    }
  };

  async function login() {
    const {email, password} = await props.form.validateFields();
    await $auth.login(email, password);
  }

  async function register() {
    const {email, password} = await props.form.validateFields();
    await $auth.register(email, password);
    notify.success(t("/auth.registered-successfully"));
  }

  async function resetPassword() {
    const {email} = await props.form.validateFields(["email"]);
    await $auth.resetPassword(email);
    props.form.resetFields();
    notify.success(t("/auth.password-reset-successfully"));
    setLoading(false);
  }

  useEffect(() => {
    if (user && profile) {
      const diff = profile.expiresAt.toRelative({locale: i18n.language});
      const name = profile && profile.firstName ? profile.firstName.trim() : "";
      notify.info(t("/auth.logged-in-successfully", {name, date: diff}));
      props.history.push("/");
    }
  }, [user, profile, props.history]);

  return (
    <div style={styles.container}>
      <Card
        id="auth"
        title={
          <div style={styles.title}>
            <Logo width={150} />
            <div style={styles.subtitle}>{t("/auth.tagline")}</div>
            <Link to="/demo" tabIndex="-1" style={styles.demo}>
              {t("demo")} <Icon type="arrow-right" style={{marginTop: 5}} />
            </Link>
          </div>
        }
      >
        <Spin size="large" spinning={loading || isNull(user) || (user && isNull(profile))}>
          <Form onSubmit={doAsyncTask(login)}>
            <Form.Item>
              {getFieldDecorator("email", {
                initialValue: defaultEmail,
                rules: [
                  {type: "email", message: t("email-invalid")},
                  {required: true, message: t("email-required")},
                ],
              })(
                <Input
                  size="large"
                  prefix={<Icon type="user" style={{color: "rgba(0, 0, 0, .25)"}} />}
                  placeholder={t("email")}
                  autoComplete="email"
                  autoFocus={!Boolean(defaultEmail)}
                />,
              )}
            </Form.Item>
            <Form.Item>
              {getFieldDecorator("password", {
                rules: [
                  {min: 6, message: t("password-too-short")},
                  {required: true, message: t("password-required")},
                ],
              })(
                <Input
                  size="large"
                  prefix={<Icon type="lock" style={{color: "rgba(0, 0, 0, .25)"}} />}
                  type="password"
                  placeholder={t("password")}
                  autoComplete="current-password"
                  autoFocus={Boolean(defaultEmail)}
                />,
              )}
            </Form.Item>
            <div>
              <Button
                block
                size="large"
                type="primary"
                htmlType="submit"
                disabled={isFormDirty}
                style={{marginBottom: 8}}
              >
                {t("sign-in")}
              </Button>
              <Button
                block
                type="dashed"
                onClick={doAsyncTask(register)}
                disabled={isFormDirty}
                style={{marginBottom: 8}}
              >
                {t("sign-up")}
              </Button>
              <Button
                block
                type="link"
                to="/reset-password"
                onClick={doAsyncTask(resetPassword)}
                disabled={isFormDirty}
              >
                {t("forgotten-password")}
              </Button>
            </div>
          </Form>
        </Spin>
      </Card>
    </div>
  );
});

export default AuthForm;
