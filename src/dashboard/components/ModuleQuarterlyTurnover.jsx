import React, {useMemo} from 'react'
import Card from 'antd/es/card'
import Col from 'antd/es/col'

import {FormCardTitle} from '../../common/components/FormCard'
import {useProfile} from '../../profile/hooks'
import {useDocuments} from '../../document/hooks'
import {isDemo} from '../demo'
import {getQuarterlyTurnover} from '../turnover'
import ChartDoughnutTurnover from './ChartDoughnutTurnover'

function ModuleQuarterlyTurnover() {
  const profile = useProfile()
  const documents = useDocuments()

  const turnover = useMemo(() => {
    if (!profile || !documents) return null
    if (isDemo(profile)) return [4000, 500]
    return getQuarterlyTurnover(documents)
  }, [profile, documents])

  return (
    <Col md={12}>
      <Card title={<FormCardTitle title={'quarterly-turnover'} />}>
        <ChartDoughnutTurnover data={turnover} />
      </Card>
    </Col>
  )
}

export default ModuleQuarterlyTurnover
