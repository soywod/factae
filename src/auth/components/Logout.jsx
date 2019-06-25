import {useEffect} from 'react'
import {withRouter} from 'react-router-dom'

import useAuthContext from '../context'
import service from '../service'

function Logout(props) {
  const user = useAuthContext()

  useEffect(() => {
    service.logout()
  }, [])

  useEffect(() => {
    if (!user) {
      props.history.push('/login')
    }
  }, [user])

  return null
}

export default withRouter(Logout)
