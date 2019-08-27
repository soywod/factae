import React, {forwardRef, useMemo} from 'react'
import AutoComplete from 'antd/es/auto-complete'
import sortedUniq from 'lodash/fp/sortedUniq'
import pipe from 'lodash/fp/pipe'
import map from 'lodash/fp/map'
import compact from 'lodash/fp/compact'

import {useRecords} from '../../record/hooks'

const AutoCompleteNature = forwardRef((props, ref) => {
  const records = useRecords()
  const natureDataSource = useMemo(() => {
    if (!records) return []
    return pipe([map('nature'), compact, sortedUniq])(records)
  }, [records])

  return (
    <AutoComplete
      ref={ref}
      dataSource={natureDataSource}
      size="large"
      style={{width: '100%'}}
      {...props}
    />
  )
})

export default AutoCompleteNature
