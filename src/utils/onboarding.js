import isEmpty from 'lodash/fp/isEmpty'

import {useProfile} from '../profile/hooks'
import {useClients} from '../client/hooks'
import {useDocuments} from '../document/hooks'
import {isAccountProfileValid, isEnterpriseProfileValid} from '../profile/utils'

export function useOnboarding() {
  const profile = useProfile()
  const clients = useClients()
  const documents = useDocuments()

  if (!profile || !clients || !documents) {
    return null
  }

  const hasValidAccountProfile = isAccountProfileValid(profile)
  const hasValidEnterpriseProfile = isEnterpriseProfileValid(profile)
  const hasValidProfile = hasValidAccountProfile && hasValidEnterpriseProfile
  const hasOneClient = !isEmpty(clients)
  const hasOneDocument = !isEmpty(documents)
  const isDone = hasValidProfile && hasOneClient && hasOneDocument

  return {
    hasValidAccountProfile,
    hasValidEnterpriseProfile,
    hasValidProfile,
    hasOneClient,
    hasOneDocument,
    isDone,
  }
}
