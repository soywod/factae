import ReactGA from 'react-ga'

ReactGA.initialize(process.env.REACT_APP_GA_ID)
ReactGA.pageview(window.location.pathname + window.location.search)
