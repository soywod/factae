import {DateTime} from 'luxon'

import {getTurnover} from '../utils'

describe('getTurnover', () => {
  const date = DateTime.fromISO('2018-04-01')

  it('should return null if empty', () => {
    expect(getTurnover(null, date, 2)).toEqual(null)
    expect(getTurnover([], date, 2)).toEqual(null)
  })

  it('should get basic turnover', () => {
    const documents = [
      {
        type: 'invoice',
        status: 'paid',
        totalHT: 2000,
        createdAt: '2018-02-01',
      },
    ]

    expect(getTurnover(documents, date, 2)).toEqual([2000, 0])
  })

  it('should get turnover with month shift', () => {
    const documents = [
      {
        type: 'invoice',
        status: 'paid',
        totalHT: 2000,
        createdAt: '2018-02-01',
      },
      {
        type: 'invoice',
        status: 'paid',
        totalHT: 2000,
        createdAt: '2018-03-01',
      },
      {
        type: 'invoice',
        status: 'paid',
        totalHT: 2000,
        createdAt: '2018-04-01',
      },
    ]

    expect(getTurnover(documents, date, 0)).toEqual([2000, 0])
  })

  it('should get turnover with mixed dates', () => {
    const documents = [
      {
        type: 'invoice',
        status: 'paid',
        totalHT: 2000,
        createdAt: '2018-03-01',
      },
      {
        type: 'invoice',
        status: 'paid',
        totalHT: 3000,
        createdAt: '2018-02-01',
      },
      {
        type: 'invoice',
        status: 'paid',
        totalHT: 1000,
        createdAt: '2018-01-01',
      },
    ]

    expect(getTurnover(documents, date, 2)).toEqual([5000, 0])
  })

  it('should get turnover with mixed documents', () => {
    const documents = [
      {
        type: 'invoice',
        status: 'paid',
        totalHT: 2000,
        createdAt: '2018-03-01',
      },
      {
        type: 'quotation',
        status: 'paid',
        totalHT: 3000,
        createdAt: '2018-03-01',
      },
      {
        type: 'credit',
        status: 'paid',
        totalHT: 1000,
        createdAt: '2018-03-01',
      },
    ]

    expect(getTurnover(documents, date, 2)).toEqual([2000, 0])
  })

  it('should get turnover with mixed status', () => {
    const documents = [
      {
        type: 'invoice',
        status: 'paid',
        totalHT: 2000,
        createdAt: '2018-03-01',
      },
      {
        type: 'invoice',
        status: 'draft',
        totalHT: 3000,
        createdAt: '2018-03-01',
      },
      {
        type: 'invoice',
        status: 'sent',
        totalHT: 1000,
        createdAt: '2018-03-01',
      },
    ]

    expect(getTurnover(documents, date, 2)).toEqual([2000, 1000])
  })
})
