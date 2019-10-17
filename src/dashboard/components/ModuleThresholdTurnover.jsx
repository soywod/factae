import React, {useMemo} from 'react'
import {useTranslation} from 'react-i18next'
import {DateTime} from 'luxon'
import Card from 'antd/lib/card'
import compact from 'lodash/fp/compact'
import defaultTo from 'lodash/fp/defaultTo'
import filter from 'lodash/fp/filter'
import last from 'lodash/fp/last'
import pipe from 'lodash/fp/pipe'
import random from 'lodash/fp/random'
import range from 'lodash/fp/range'

import {useProfile} from '../../profile/hooks'
import {useDocuments} from '../../document/hooks'
import {toEuro} from '../../utils/currency'
import {isDemo, demoDate} from '../demo'
import {useThresholds} from '../hooks'
import {getTurnover, getCumulativeTurnover} from '../fiscalYear'

import styles from './ModuleTurnover.styles'

function ModuleThresholdTurnover() {
  const profile = useProfile()
  const documents = useDocuments()
  const {t} = useTranslation()
  const [lowTVA, highTVA, AE] = useThresholds()

  const invoices = useMemo(() => {
    if (!profile || !documents) return null
    if (isDemo(profile)) {
      return range(0, 9).map(month => ({
        totalHT: random(3000, 9000),
        createdAt: `2018-0${month + 1}-01`,
      }))
    }
    return filter(d => d.type === 'invoice' && Boolean(d.paidAt), documents) || null
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

  const [value, threshold] = (() => {
    const turnover = pipe([compact, last, defaultTo(0)])(cumulativeTurnover)
    if (turnover < lowTVA) return [lowTVA - turnover, lowTVA]
    if (turnover < highTVA) return [highTVA - turnover, highTVA]
    return [AE - turnover, AE]
  })()

  if (!turnover) {
    return null
  }

  return (
    <Card bodyStyle={styles.card}>
      <span style={styles.turnover}>{toEuro(value)}</span>
      <em style={styles.info}>{t('before-next-threshold')}</em>
      <em style={styles.info}>
        (<strong>{toEuro(threshold)}</strong>)
      </em>
    </Card>
  )
}

export default ModuleThresholdTurnover
