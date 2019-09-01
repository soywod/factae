import React, {forwardRef, useMemo} from 'react'
import AutoComplete from 'antd/es/auto-complete'
import compact from 'lodash/fp/compact'
import map from 'lodash/fp/map'
import pipe from 'lodash/fp/pipe'
import sortBy from 'lodash/fp/sortBy'
import uniq from 'lodash/fp/uniq'

import {useRecords} from '../../record/hooks'

const AutoCompleteNature = forwardRef((props, ref) => {
  const records = useRecords()
  const natureDataSource = useMemo(() => {
    if (!records) return []
    return pipe([sortBy('nature'), map('nature'), compact, uniq])(records)
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
