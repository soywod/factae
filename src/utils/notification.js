import {useTranslation} from 'react-i18next'
import notification from 'antd/lib/notification'
import isString from 'lodash/fp/isString'
import noop from 'lodash/fp/noop'

import {useProfile} from '../profile/hooks'
import {isDemo} from '../dashboard/demo'

const types = ['info', 'success', 'error']
const placement = 'bottomRight'
const duration = 3.5
const bottom = 0

export const notify = types.reduce(
  (types, type) => ({
    ...types,
    [type]: (message, description = null) =>
      notification[type]({
        className: `ant-notification-${type}`,
        message,
        description,
        placement,
        duration,
        bottom,
      }),
  }),
  {},
)

export function useNotification() {
  const profile = useProfile()
  const {t} = useTranslation()

  if (!profile) {
    return noop
  }

  function getErrorMessage(error) {
    switch (error.code) {
      case 'permission-denied':
        return t(isDemo(profile) ? '/auth.locked-data-demo' : '/auth.subscription-expired')
      default:
        if (isString(error.message)) {
          return t(error.message)
        }
    }
  }

  return async (resolve, reject) => {
    try {
      const message = await resolve()
      if (message) notify.success(message)
    } catch (error) {
      const message = getErrorMessage(error)
      if (message) notify.error(message)
      if (reject) await reject(error)
    }
  }
}

export default {notify, useNotification}
