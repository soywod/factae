import {useEffect, useRef, useState} from 'react'
import concat from 'lodash/fp/concat'
import find from 'lodash/fp/find'
import getOr from 'lodash/fp/getOr'
import orderBy from 'lodash/fp/orderBy'
import pick from 'lodash/fp/pick'
import filter from 'lodash/fp/filter'
import map from 'lodash/fp/map'
import pipe from 'lodash/fp/pipe'

import {useAuth} from '../auth/hooks'
import {useDocuments} from '../document/hooks'
import {useClients} from '../client/hooks'
import {onRecordsChanged, records$} from './service'

export function useRecords() {
  const subscription = useRef()
  const documents = useDocuments()
  const clients = useClients()
  const [records, setRecords] = useState(records$.value)

  function buildRecords(nextRecords) {
    if (!nextRecords) return

    const filterByType = filter(x => x.type !== 'quotation')
    const filterByStatus = filter(x => !['draft', 'sent'].includes(x.status))
    const mapToRecord = map(x => ({
      document: x.id,
      type: 'revenue',
      client: pipe([find({id: x.client}), getOr('', 'name')])(clients),
      reference: x.number,
      nature: x.title,
      ...pick(['id', 'createdAt', 'totalHT', 'totalTVA', 'totalTTC'], x),
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
    if (documents && clients && !subscription.current) {
      subscription.current = records$.subscribe(buildRecords)
      return () => subscription.current.unsubscribe()
    }
  }, [documents, clients])

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
