import React from 'react'

import Container from '../../common/components/Container'
import DemoInfos from './DemoInfos'
import Subscription from './Subscription'
import Chart from './Chart'
import Infos from './Infos'

function Dashboard() {
  return (
    <Container>
      <h1>Vue d'ensemble</h1>
      <Subscription />
      <Chart />
      <Infos />
      <DemoInfos />
    </Container>
  )
}

export default Dashboard
