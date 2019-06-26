import {useEffect} from 'react'
import {withRouter} from 'react-router-dom'

import {logout} from '../service'

function Logout() {
  useEffect(() => {
    logout()
  }, [])

  return null
}

export default withRouter(Logout)
