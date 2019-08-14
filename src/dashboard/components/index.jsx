import React from 'react'
import {useTranslation} from 'react-i18next'
import Row from 'antd/es/row'

import Container from '../../common/components/Container'
import ModuleSubscription from './ModuleSubscription'
import ModuleFiscalYear from './ModuleFiscalYear'
import ModuleMonthlyTurnover from './ModuleMonthlyTurnover'
import ModuleQuarterlyTurnover from './ModuleQuarterlyTurnover'
import ModuleThresholds from './ModuleThresholds'
import ModuleWelcomeDemo from './ModuleWelcomeDemo'

function Dashboard() {
  const {t} = useTranslation()

  return (
    <Container>
      <h1>{t('overview')}</h1>

      <Row gutter={15} style={{marginBottom: 15}}>
        <ModuleSubscription />
      </Row>

      <Row gutter={15} style={{marginBottom: 15}}>
        <ModuleFiscalYear />
      </Row>

      <Row gutter={15} style={{marginBottom: 15}}>
        <ModuleMonthlyTurnover />
        <ModuleQuarterlyTurnover />
      </Row>

      <Row gutter={15} style={{marginBottom: 15}}>
        <ModuleThresholds />
      </Row>

      <ModuleWelcomeDemo />
    </Container>
  )
}

export default Dashboard
