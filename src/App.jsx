import React from 'react'
import {BrowserRouter as Router, Route, Switch} from 'react-router-dom'

import Login from './auth/components/Login'
import Register from './auth/components/Register'

function App() {
  return (
    <Router>
      <Switch>
        <Route path="/login" component={Login} />
        <Route path="/register" component={Register} />
      </Switch>
    </Router>
  )
}

export default App
