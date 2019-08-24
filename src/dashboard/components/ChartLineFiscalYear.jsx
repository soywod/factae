import React, {useEffect, useRef} from 'react'
import {useTranslation} from 'react-i18next'
import {DateTime} from 'luxon'
import {Chart as ChartJS} from 'chart.js'
import Empty from 'antd/es/empty'
import fill from 'lodash/fp/fill'
import isNil from 'lodash/fp/isNil'
import range from 'lodash/fp/range'

import {toEuro} from '../../common/currency'
import {useThresholds} from '../hooks'

const datasetBaseOptions = color => ({
  backgroundColor: color,
  borderColor: color,
  borderWidth: 4,
  cubicInterpolationMode: 'monotone',
  fill: false,
  pointBackgroundColor: 'transparent',
  pointBorderWidth: 1,
  pointHitRadius: 30,
  pointHoverBackgroundColor: color,
  pointHoverBorderWidth: 1,
  pointHoverRadius: 5,
  pointRadius: 5,
})

function ChartLineFiscalYear({turnover, cumulativeTurnover, theoricCumulativeTurnover, ...props}) {
  const ref = useRef()
  const chart = useRef()
  const {t, i18n} = useTranslation()
  const [lowTVA, highTVA, AE] = useThresholds()

  const months = range(1, 13).map(month =>
    DateTime.local()
      .setLocale(i18n.language)
      .set({month})
      .toFormat('LLLL'),
  )

  useEffect(() => {
    if (isNil(ref.current)) return
    if (chart.current) chart.current.destroy()

    chart.current = new ChartJS(ref.current, {
      type: 'line',
      data: {
        labels: months,
        datasets: [
          {
            data: turnover,
            label: t('real-turnover'),
            hidden: !props.turnoverVisible,
            ...datasetBaseOptions('#52c41a'),
          },
          {
            data: cumulativeTurnover,
            label: t('cumulative-turnover'),
            hidden: !props.cumulativeTurnoverVisible,
            ...datasetBaseOptions('#1890ff'),
          },
          {
            data: theoricCumulativeTurnover,
            label: t('theoric-cumulative-turnover'),
            hidden: !props.theoricCumulativeTurnoverVisible,
            ...datasetBaseOptions('#d3d3d3'),
          },
          {
            type: 'line',
            data: fill(0, 12, lowTVA, Array(12)),
            label: t('threshold-vat-low'),
            fill: false,
            borderDash: [5, 5],
            borderWidth: 1,
            borderColor: '#f5222d',
            pointHitRadius: 20,
            pointBorderWidth: 0,
            pointRadius: 0,
            hidden: !props.thresholdVATLowVisible,
          },
          {
            type: 'line',
            data: fill(0, 12, highTVA, Array(12)),
            label: t('threshold-vat-high'),
            fill: false,
            borderDash: [5, 5],
            borderWidth: 1,
            borderColor: '#f5222d',
            pointHitRadius: 20,
            pointBorderWidth: 0,
            pointRadius: 0,
            hidden: !props.thresholdVATHighVisible,
          },
          {
            type: 'line',
            data: fill(0, 12, AE, Array(12)),
            label: t('threshold-me'),
            fill: false,
            borderWidth: 1,
            borderDash: [5, 5],
            borderColor: '#f5222d',
            pointHitRadius: 20,
            pointBorderWidth: 0,
            pointRadius: 0,
            hidden: !props.thresholdMEVisible,
          },
        ],
      },
      options: {
        animation: false,
        layout: {
          padding: 15,
        },
        legend: {
          display: false,
        },
        maintainAspectRatio: false,
        tooltips: {
          callbacks: {
            label: label => toEuro(label.yLabel),
          },
        },
        scales: {
          xAxes: [
            {
              gridLines: {
                color: '#f0f2f5',
              },
            },
          ],
          yAxes: [
            {
              gridLines: {
                color: '#f0f2f5',
              },
              ticks: {
                callback: toEuro,
              },
            },
          ],
        },
      },
    })
  }, [
    turnover,
    cumulativeTurnover,
    theoricCumulativeTurnover,
    props.turnoverVisible,
    props.cumulativeTurnoverVisible,
    props.theoricCumulativeTurnoverVisible,
    props.thresholdVATLowVisible,
    props.thresholdVATHighVisible,
    props.thresholdMEVisible,
  ])

  if (!turnover) {
    return <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
  }

  return (
    <div>
      <canvas ref={ref} height={400} />
    </div>
  )
}

export default ChartLineFiscalYear
