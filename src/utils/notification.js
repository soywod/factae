import notification from 'antd/es/notification'

const types = ['success', 'error']
const placement = 'topRight'
const duration = 3
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

export default {notify}
