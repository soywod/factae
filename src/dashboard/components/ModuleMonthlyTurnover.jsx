import React, {useMemo} from 'react'
import {useTranslation} from 'react-i18next'
import Card from 'antd/es/card'
import Tooltip from 'antd/es/tooltip'
import {DateTime} from 'luxon'
import random from 'lodash/fp/random'

import {useProfile} from '../../profile/hooks'
import {useDocuments} from '../../document/hooks'
import {toEuro} from '../../utils/currency'
import {isDemo} from '../demo'
import {getMonthlyTurnover} from '../turnover'

import styles from './ModuleTurnover.styles'

function ModuleMonthlyTurnover() {
  const profile = useProfile()
  const documents = useDocuments()
  const {t, i18n} = useTranslation()

  const lastDayOfMonth = DateTime.local()
    .setLocale(i18n.language)
    .plus({months: 1})
    .set({days: 1, hour: 12, minute: 0, second: 0, millisecond: 0})
    .minus({days: 1})

  const turnover = useMemo(() => {
    if (!profile || !documents) return null
    if (isDemo(profile)) return random(2000, 6000)
    return getMonthlyTurnover(documents)
  }, [profile, documents])

  if (!turnover) {
    return null
  }

  const color = turnover ? {color: '#52c41a'} : {}

  return (
    <Card bodyStyle={styles.card}>
      <span style={{...styles.turnover, ...color}}>{toEuro(turnover)}</span>
      <em style={styles.info}>{t('collected-turnover-this-month')}</em>
      <em style={styles.info}>
        ({t('to-declare')}{' '}
        <Tooltip title={lastDayOfMonth.toFormat(t('date-format'))}>
          <strong style={styles.date}>{lastDayOfMonth.toRelative()}</strong>
        </Tooltip>
        )
      </em>
    </Card>
  )
}

export default ModuleMonthlyTurnover
