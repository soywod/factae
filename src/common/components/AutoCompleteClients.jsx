import React, {forwardRef, useMemo} from 'react'
import AutoComplete from 'antd/es/auto-complete'
import map from 'lodash/fp/map'
import pipe from 'lodash/fp/pipe'
import sortedUniq from 'lodash/fp/sortedUniq'

import {useClients} from '../../client/hooks'

const AutoCompleteClients = forwardRef((props, ref) => {
  const clients = useClients()

  const clientsDataSource = useMemo(() => {
    if (!clients) return []
    return pipe([map('name'), sortedUniq])(clients)
  }, [clients])

  return (
    <AutoComplete
      ref={ref}
      dataSource={clientsDataSource}
      size="large"
      style={{width: '100%'}}
      {...props}
    />
  )
})

export default AutoCompleteClients
