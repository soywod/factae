import React from 'react'

import Container from '../../common/components/Container'
import DemoInfos from './DemoInfos'
import Chart from './Chart'
import Infos from './Infos'

function Dashboard() {
  return (
    <Container>
      <h1>Chiffre d'affaire</h1>
      <Chart />
      <Infos />
      <DemoInfos />
    </Container>
  )
}

export default Dashboard
