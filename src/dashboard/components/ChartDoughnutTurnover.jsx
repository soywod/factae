import React, {useEffect, useRef} from 'react'
import {useTranslation} from 'react-i18next'
import {Chart as ChartJS} from 'chart.js'
import Empty from 'antd/es/empty'
import isNil from 'lodash/fp/isNil'

import {toEuro} from '../../common/currency'

function ChartDoughnutTurnover({data}) {
  const ref = useRef()
  const chart = useRef()
  const {t} = useTranslation()

  useEffect(() => {
    if (isNil(ref.current)) return
    if (chart.current) chart.current.destroy()

    chart.current = new ChartJS(ref.current, {
      type: 'doughnut',
      data: {
        datasets: [
          {
            data,
            backgroundColor: ['#52c41a', '#1890ff'],
          },
        ],
        labels: [t('paid'), t('pending')],
      },
      options: {
        tooltips: {
          callbacks: {
            label: ({index}) => toEuro(data[index]),
          },
        },
      },
    })
  }, [data])

  if (isNil(data)) {
    return <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
  }

  return (
    <div>
      <canvas ref={ref} />
    </div>
  )
}

export default ChartDoughnutTurnover
