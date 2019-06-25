import {createContext, useContext} from 'react'

const AuthContext = createContext()

function useAuthContext() {
  return useContext(AuthContext)
}

export default useAuthContext
export {AuthContext}
