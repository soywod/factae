import React, {forwardRef, useMemo} from 'react'
import AutoComplete from 'antd/lib/auto-complete'
import map from 'lodash/fp/map'
import pipe from 'lodash/fp/pipe'
import sortBy from 'lodash/fp/sortBy'
import uniq from 'lodash/fp/uniq'

import {useClients} from '../../client/hooks'

const AutoCompleteClients = forwardRef((props, ref) => {
  const clients = useClients()

  const clientsDataSource = useMemo(() => {
    if (!clients) return []
    return pipe([sortBy('name'), map('name'), uniq])(clients)
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
