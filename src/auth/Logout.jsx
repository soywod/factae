import {useEffect} from "react";

import $auth from "./service";

function AuthLogout() {
  useEffect(() => {
    $auth.logout();
  }, []);

  return null;
}

export default AuthLogout;
