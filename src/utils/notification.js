import notification from 'antd/es/notification'

const types = ['info', 'success', 'warning', 'error']
const placement = 'bottomLeft'

export const notify = types.reduce(
  (types, type) => ({
    ...types,
    [type]: (message, description = null) => {
      notification[type]({message, description, placement})
    },
  }),
  {},
)

export default {notify}
