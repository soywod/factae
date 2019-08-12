import React, {Suspense} from 'react'
import ReactDOM from 'react-dom'

import Loader from './common/components/Loader'
import App from './common/components/App'
import serviceWorker from './utils/serviceWorker'

import './utils/i18n'

ReactDOM.render(
  <Suspense fallback={<Loader />}>
    <App />
  </Suspense>,
  document.getElementById('root'),
)

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister()
