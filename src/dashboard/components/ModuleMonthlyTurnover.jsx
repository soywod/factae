import React, {useMemo} from 'react'
import {useTranslation} from 'react-i18next'
import Card from 'antd/es/card'
import Col from 'antd/es/col'
import {DateTime} from 'luxon'

import {FormCardTitle} from '../../common/components/FormCard'
import {useProfile} from '../../profile/hooks'
import {useDocuments} from '../../document/hooks'
import {getMonthlyTurnover} from '../utils'
import TurnoverChart from './TurnoverChart'

function ModuleQuarterlyTurnover() {
  const profile = useProfile()
  const documents = useDocuments()
  const {i18n} = useTranslation()
  const month = DateTime.local()
    .setLocale(i18n.language)
    .toFormat('LLLL')

  const turnover = useMemo(() => {
    if (!profile || !documents) return null
    if (profile.email === 'demo@factae.fr') return [11500, 2100]
    return getMonthlyTurnover(documents)
  }, [profile, documents])

  return (
    <Col md={12}>
      <Card title={<FormCardTitle title={'monthly-turnover'} titleData={{month}} />}>
        <TurnoverChart data={turnover} />
      </Card>
    </Col>
  )
}

export default ModuleQuarterlyTurnover
