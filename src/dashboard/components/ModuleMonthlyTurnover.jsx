import React, {useMemo} from 'react'
import {useTranslation} from 'react-i18next'
import Card from 'antd/es/card'
import Col from 'antd/es/col'
import {DateTime} from 'luxon'

import {FormCardTitle} from '../../common/components/FormCard'
import {useProfile} from '../../profile/hooks'
import {useDocuments} from '../../document/hooks'
import {isDemo, demoDate} from '../demo'
import {getMonthlyTurnover} from '../turnover'
import ChartDoughnutTurnover from './ChartDoughnutTurnover'

function ModuleQuarterlyTurnover() {
  const profile = useProfile()
  const documents = useDocuments()
  const {i18n} = useTranslation()

  const month = (() => {
    const date = isDemo(profile) ? demoDate : DateTime.local()
    return date.setLocale(i18n.language).toFormat('LLLL')
  })()

  const turnover = useMemo(() => {
    if (!profile || !documents) return null
    if (isDemo(profile)) return [11500, 2100]
    return getMonthlyTurnover(documents)
  }, [profile, documents])

  return (
    <Col md={12}>
      <Card title={<FormCardTitle title={'monthly-turnover'} titleData={{month}} />}>
        <ChartDoughnutTurnover data={turnover} />
      </Card>
    </Col>
  )
}

export default ModuleQuarterlyTurnover
