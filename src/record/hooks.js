import {useEffect, useRef, useState} from 'react'
import concat from 'lodash/fp/concat'
import filter from 'lodash/fp/filter'
import map from 'lodash/fp/map'
import orderBy from 'lodash/fp/orderBy'
import pick from 'lodash/fp/pick'
import pipe from 'lodash/fp/pipe'

import {useAuth} from '../auth/hooks'
import {useDocuments} from '../document/hooks'
import {onRecordsChanged, records$} from './service'

export function useRecords() {
  const subscription = useRef()
  const documents = useDocuments()
  const [records, setRecords] = useState(records$.value)

  function buildRecords(nextRecords) {
    if (!nextRecords) return

    const filterByType = filter(d => ['invoice', 'credit'].includes(d.type))
    const filterByStatus = filter(d => d.paidAt || d.refundedAt)
    const mapToRecord = map(d => {
      const sign = d.type === 'invoice' ? 1 : -1

      return {
        document: d.id,
        client: d.client,
        type: 'revenue',
        createdAt: d.paidAt || d.refundedAt,
        reference: d.number,
        ...pick(['id', 'nature', 'paymentMethod', 'totalHT', 'totalTVA', 'totalTTC'], d),
        totalHT: d.totalHT * sign,
        totalTVA: d.totalTVA * sign,
        totalTTC: d.totalTTC * sign,
      }
    })

    setRecords(
      pipe([
        filterByType,
        filterByStatus,
        mapToRecord,
        concat(nextRecords),
        orderBy('createdAt', 'desc'),
      ])(documents),
    )
  }

  useEffect(() => {
    if (documents && !subscription.current) {
      subscription.current = records$.subscribe(buildRecords)
      return () => subscription.current.unsubscribe()
    }
  }, [documents])

  return records
}

export function useRecordService() {
  const user = useAuth()

  useEffect(() => {
    if (user) {
      const unsubscribe = onRecordsChanged()
      return () => unsubscribe()
    }
  }, [user])
}
