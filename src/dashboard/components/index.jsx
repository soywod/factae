import React from 'react'
import {useTranslation} from 'react-i18next'

import Container from '../../common/components/Container'
import DemoInfos from './DemoInfos'
import Subscription from './Subscription'
import Chart from './Chart'
import Infos from './Infos'

function Dashboard() {
  const {t} = useTranslation()

  return (
    <Container>
      <h1>{t('overview')}</h1>
      <Subscription />
      <Chart />
      <Infos />
      <DemoInfos />
    </Container>
  )
}

export default Dashboard
