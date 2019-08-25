import React, {useMemo, useState} from 'react'
import {useTranslation} from 'react-i18next'
import {DateTime} from 'luxon'
import Button from 'antd/es/button'
import Card from 'antd/es/card'
import filter from 'lodash/fp/filter'
import random from 'lodash/fp/random'
import range from 'lodash/fp/range'

import {FormCardTitle} from '../../common/components/FormCard'
import {useProfile} from '../../profile/hooks'
import {useDocuments} from '../../document/hooks'
import {isDemo, demoDate} from '../demo'
import {getTurnover, getCumulativeTurnover, getTheoricCumulativeTurnover} from '../fiscalYear'
import ChartLineFiscalYear from './ChartLineFiscalYear'

function ModuleFiscalYear() {
  const profile = useProfile()
  const documents = useDocuments()
  const [turnoverVisible, setTurnoverVisible] = useState(true)
  const [cumulativeTurnoverVisible, setCumulativeTurnoverVisible] = useState(false)
  const [theoricCumulativeTurnoverVisible, setTheoricCumulativeTurnoverVisible] = useState(false)
  const [thresholdVATLowVisible, setThresholdVATLowVisible] = useState(false)
  const [thresholdVATHighVisible, setThresholdVATHighVisible] = useState(false)
  const [thresholdMEVisible, setThresholdMEVisible] = useState(false)
  const {t} = useTranslation()

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
    const turnover = getTurnover(invoices, now)
    if (!turnover) return null

    const shouldAdjustTurnover = DateTime.fromISO(profile.createdAt).year === now.year
    const ratio = profile.previousTurnover / (now.month - 1)
    if (shouldAdjustTurnover) {
      range(0, now.month - 1).forEach(month => {
        turnover[month] += ratio
      })
    }

    return turnover
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
    <Card
      title={
        <div style={{display: 'flex', alignItems: 'center', flexWrap: 'wrap'}}>
          <FormCardTitle
            title={'fiscal-year'}
            titleData={{year: isDemo(profile) ? demoDate.year : DateTime.local().year}}
            style={{flex: 1}}
          />
          <Button.Group>
            <Button
              size="small"
              type={turnoverVisible ? 'primary' : 'default'}
              onClick={() => setTurnoverVisible(!turnoverVisible)}
            >
              {t('real-turnover')}
            </Button>
            <Button
              size="small"
              type={cumulativeTurnoverVisible ? 'primary' : 'default'}
              onClick={() => setCumulativeTurnoverVisible(!cumulativeTurnoverVisible)}
            >
              {t('cumulative-turnover')}
            </Button>
            <Button
              size="small"
              type={theoricCumulativeTurnoverVisible ? 'primary' : 'default'}
              onClick={() => setTheoricCumulativeTurnoverVisible(!theoricCumulativeTurnoverVisible)}
            >
              {t('theoric-cumulative-turnover')}
            </Button>
            <Button
              size="small"
              type={thresholdVATLowVisible ? 'primary' : 'default'}
              onClick={() => setThresholdVATLowVisible(!thresholdVATLowVisible)}
            >
              {t('threshold-vat-low')}
            </Button>
            <Button
              size="small"
              type={thresholdVATHighVisible ? 'primary' : 'default'}
              onClick={() => setThresholdVATHighVisible(!thresholdVATHighVisible)}
            >
              {t('threshold-vat-high')}
            </Button>
            <Button
              size="small"
              type={thresholdMEVisible ? 'primary' : 'default'}
              onClick={() => setThresholdMEVisible(!thresholdMEVisible)}
            >
              {t('threshold-me')}
            </Button>
          </Button.Group>
        </div>
      }
    >
      <ChartLineFiscalYear
        turnover={turnover}
        cumulativeTurnover={cumulativeTurnover}
        theoricCumulativeTurnover={theoricCumulativeTurnover}
        turnoverVisible={turnoverVisible}
        cumulativeTurnoverVisible={cumulativeTurnoverVisible}
        theoricCumulativeTurnoverVisible={theoricCumulativeTurnoverVisible}
        thresholdVATLowVisible={thresholdVATLowVisible}
        thresholdVATHighVisible={thresholdVATHighVisible}
        thresholdMEVisible={thresholdMEVisible}
      />
    </Card>
  )
}

export default ModuleFiscalYear
