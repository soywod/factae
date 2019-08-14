import React, {useMemo} from 'react'
import Card from 'antd/es/card'
import Col from 'antd/es/col'

import {FormCardTitle} from '../../common/components/FormCard'
import {useProfile} from '../../profile/hooks'
import {useDocuments} from '../../document/hooks'
import {getQuarterlyTurnover} from '../utils'
import TurnoverChart from './TurnoverChart'

function ModuleQuarterlyTurnover() {
  const profile = useProfile()
  const documents = useDocuments()

  const turnover = useMemo(() => {
    if (!profile || !documents) return null
    if (profile.email === 'demo@factae.fr') return [4000, 500]
    return getQuarterlyTurnover(documents)
  }, [profile, documents])

  return (
    <Col md={12}>
      <Card title={<FormCardTitle title={'quarterly-turnover'} />}>
        <TurnoverChart data={turnover} />
      </Card>
    </Col>
  )
}

export default ModuleQuarterlyTurnover
