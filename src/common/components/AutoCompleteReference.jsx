import React, {forwardRef, useMemo} from 'react'
import AutoComplete from 'antd/lib/auto-complete'
import compact from 'lodash/fp/compact'
import filter from 'lodash/fp/filter'
import map from 'lodash/fp/map'
import orderBy from 'lodash/fp/orderBy'
import pipe from 'lodash/fp/pipe'

import {useDocuments} from '../../document/hooks'

const AutoCompleteReference = forwardRef((props, ref) => {
  const documents = useDocuments()
  const referenceDataSource = useMemo(() => {
    if (!documents) return []

    const filterByType = filter(x => props.types.includes(x.type))
    const filterByStatus = filter(x => !['draft', 'sent'].includes(x.status))

    return pipe([
      filterByType,
      filterByStatus,
      map('number'),
      compact,
      orderBy('createdAt', 'desc'),
    ])(documents)
  }, [documents])

  return (
    <AutoComplete
      ref={ref}
      dataSource={referenceDataSource}
      size="large"
      style={{width: '100%'}}
      {...props}
    />
  )
})

export default AutoCompleteReference
