import React, {useEffect, useRef} from 'react'
import {useTranslation} from 'react-i18next'
import {DateTime} from 'luxon'
import {Chart as ChartJS} from 'chart.js'
import Empty from 'antd/es/empty'
import isNil from 'lodash/fp/isNil'
import range from 'lodash/fp/range'

import {toEuro} from '../../common/currency'

function ChartBarFiscalYear({turnover, cumulativeTurnover, theoricCumulativeTurnover}) {
  const ref = useRef()
  const chart = useRef()
  const {t, i18n} = useTranslation()

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
      type: 'bar',
      data: {
        labels: months,
        datasets: [
          {
            data: turnover,
            label: t('real-turnover'),
            backgroundColor: '#52c41a',
          },
          {
            data: cumulativeTurnover,
            label: t('cumulative-turnover'),
            backgroundColor: '#1890ff',
          },
          {
            data: theoricCumulativeTurnover,
            label: t('theoric-cumulative-turnover'),
            backgroundColor: 'rgba(0, 0, 0, .15)',
          },
        ],
      },
      options: {
        maintainAspectRatio: false,
        tooltips: {
          callbacks: {
            label: label => toEuro(label.yLabel),
          },
        },
        scales: {
          yAxes: [
            {
              ticks: {
                callback: toEuro,
              },
            },
          ],
        },
      },
    })
  }, [turnover, cumulativeTurnover, theoricCumulativeTurnover])

  if (!turnover) {
    return <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
  }

  return (
    <div>
      <canvas ref={ref} height="400" />
    </div>
  )
}

export default ChartBarFiscalYear
