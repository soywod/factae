import {useEffect} from 'react'
import {withRouter} from 'react-router-dom'

import useAuthContext from '../context'
import {logout} from '../service'

function Logout(props) {
  const setUser = useAuthContext()[1]

  useEffect(() => {
    logout().then(() => {
      setUser(false)
      props.history.push('/login')
    })
  }, [])

  return null
}

export default withRouter(Logout)
