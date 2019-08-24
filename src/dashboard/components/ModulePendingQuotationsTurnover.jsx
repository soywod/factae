import React, {useMemo} from 'react'
import {useTranslation} from 'react-i18next'
import Card from 'antd/es/card'
import random from 'lodash/fp/random'

import {useProfile} from '../../profile/hooks'
import {useDocuments} from '../../document/hooks'
import {toEuro} from '../../utils/currency'
import {isDemo} from '../demo'
import {getPendingQuotationsTurnover} from '../turnover'

import styles from './ModuleTurnover.styles'

function ModulePendingQuotationsTurnover() {
  const profile = useProfile()
  const documents = useDocuments()
  const {t} = useTranslation()

  const turnover = useMemo(() => {
    if (!profile || !documents) return null
    if (isDemo(profile)) return random(100, 2000)
    return getPendingQuotationsTurnover(documents)
  }, [profile, documents])

  const color = turnover ? {color: '#1890ff'} : {}

  return (
    <Card bodyStyle={styles.card}>
      <span style={{...styles.turnover, ...color}}>{toEuro(turnover)}</span>
      <em style={styles.info}>{t('pending-quotations-turnover')}</em>
    </Card>
  )
}

export default ModulePendingQuotationsTurnover
