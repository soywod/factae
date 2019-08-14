import React, {useMemo} from 'react'
import {DateTime} from 'luxon'
import Card from 'antd/es/card'
import Col from 'antd/es/col'
import filter from 'lodash/fp/filter'
import random from 'lodash/fp/random'
import range from 'lodash/fp/range'

import {FormCardTitle} from '../../common/components/FormCard'
import {useProfile} from '../../profile/hooks'
import {useDocuments} from '../../document/hooks'
import {isDemo, demoDate} from '../demo'
import {getTurnover, getCumulativeTurnover, getTheoricCumulativeTurnover} from '../fiscalYear'
import ChartBarFiscalYear from './ChartBarFiscalYear'

function ModuleFiscalYear() {
  const profile = useProfile()
  const documents = useDocuments()

  const invoices = useMemo(() => {
    if (!profile || !documents) return null
    if (isDemo(profile)) {
      return range(0, 9).map(month => ({
        status: 'paid',
        totalHT: random(3000, 9000),
        createdAt: `2018-0${month + 1}-01`,
      }))
    }
    return filter({type: 'invoice', status: 'paid'}, documents) || null
  }, [profile, documents])

  const turnover = useMemo(() => {
    if (!profile) return null
    const now = isDemo(profile) ? demoDate : DateTime.local()
    return getTurnover(invoices, now)
  }, [profile, invoices])

  const cumulativeTurnover = useMemo(() => {
    if (!profile) return null
    return getCumulativeTurnover(invoices, turnover)
  }, [profile, invoices, turnover])

  const theoricCumulativeTurnover = useMemo(() => {
    if (!profile) return null
    return getTheoricCumulativeTurnover(turnover)
  }, [profile, turnover])

  return (
    <Col xs={24}>
      <Card
        title={
          <FormCardTitle
            title={'fiscal-year'}
            titleData={{year: isDemo(profile) ? demoDate.year : DateTime.local().year}}
          />
        }
      >
        <ChartBarFiscalYear
          turnover={turnover}
          cumulativeTurnover={cumulativeTurnover}
          theoricCumulativeTurnover={theoricCumulativeTurnover}
        />
      </Card>
    </Col>
  )
}

export default ModuleFiscalYear
