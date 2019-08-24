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
import {getQuarterlyTurnover} from '../turnover'

import styles from './ModuleTurnover.styles'

function getQuarter(now) {
  let quarter = DateTime.fromObject({hour: 12, minute: 0, second: 0, millisecond: 0})

  if (now.month <= 3) {
    return quarter.set({year: now.year, month: 3, day: 31})
  } else if (now.month <= 6) {
    return quarter.set({year: now.year, month: 6, day: 30})
  } else if (now.month <= 9) {
    return quarter.set({year: now.year, month: 9, day: 30})
  } else {
    return quarter.set({year: now.year, month: 12, day: 31})
  }
}

function ModuleQuarterlyTurnover() {
  const profile = useProfile()
  const documents = useDocuments()
  const {t, i18n} = useTranslation()

  const now = DateTime.local()
  const quarter = getQuarter(now).setLocale(i18n.language)
  const turnover = useMemo(() => {
    if (!profile || !documents) return null
    if (isDemo(profile)) return random(2000, 6000)
    return getQuarterlyTurnover(documents)
  }, [profile, documents])

  if (!turnover) {
    return null
  }

  const color = turnover ? {color: '#52c41a'} : {}

  return (
    <Card bodyStyle={styles.card}>
      <span style={{...styles.turnover, ...color}}>{toEuro(turnover)}</span>
      <em style={styles.info}>{t('collected-turnover-this-quarter')}</em>
      <em style={styles.info}>
        ({t('to-declare')}{' '}
        <Tooltip title={quarter.toFormat(t('date-format'))}>
          <strong style={styles.date}>{quarter.toRelative()}</strong>
        </Tooltip>
        )
      </em>
    </Card>
  )
}

export default ModuleQuarterlyTurnover
