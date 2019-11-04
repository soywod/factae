import React, {useCallback, useEffect} from "react";

import Loader from "../common/components/Loader";
import {notify} from "../utils/notification";
import $auth from "./service";

function AuthDemo(props) {
  const login = useCallback(async () => {
    try {
      await $auth.login("demo@factae.fr", "factae");
      props.history.push("/");
    } catch (error) {
      notify.error(error.message);
    }
  }, [props.history]);

  useEffect(() => {
    login();
  }, [login]);

  return <Loader />;
}

export default AuthDemo;
