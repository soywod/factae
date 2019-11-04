import React from "react";
import {Route, Redirect} from "react-router-dom";

import {useAuth} from "./context";

function PrivateRoute(props) {
  const user = useAuth();

  if (user === null) {
    return null;
  }

  if (user === false) {
    return <Redirect to="/auth" />;
  }

  return <Route {...props} />;
}

export default PrivateRoute;
