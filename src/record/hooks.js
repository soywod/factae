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

    const filterByType = filter(x => x.type !== 'quotation')
    const filterByStatus = filter(x => !['draft', 'sent'].includes(x.status))
    const mapToRecord = map(x => ({
      document: x.id,
      client: x.client,
      type: 'revenue',
      createdAt: x[`${x.status}At`],
      reference: x.number,
      ...pick(['id', 'nature', 'paymentMethod', 'totalHT', 'totalTVA', 'totalTTC'], x),
    }))

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
