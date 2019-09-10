import ReactGA from 'react-ga'

ReactGA.initialize(process.env.REACT_APP_GOOGLE_ANALYTICS_ID)
ReactGA.pageview(window.location.href)
