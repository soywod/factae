import {DateTime} from 'luxon'
import multiply from 'lodash/fp/multiply'
import range from 'lodash/fp/range'

import {getTurnover, getCumulativeTurnover, getTheoricCumulativeTurnover} from '../fiscalYear'

describe('getTurnover', () => {
  const date = DateTime.fromISO('2018-05-01')

  it('should return null if null or empty', () => {
    expect(getTurnover(null, date)).toEqual(null)
    expect(getTurnover(undefined, date)).toEqual(null)
    expect(getTurnover([], date)).toEqual(null)
  })

  it('should get turnover', () => {
    const invoicesA = [{type: 'invoice', status: 'paid', totalHT: 2000, createdAt: '2018-04-01'}]
    const invoicesB = [
      {type: 'invoice', status: 'paid', totalHT: 3000, createdAt: '2018-04-01'},
      {type: 'invoice', status: 'paid', totalHT: 1500, createdAt: '2018-03-01'},
    ]
    const invoicesC = [{type: 'invoice', status: 'paid', totalHT: 200, createdAt: '2018-01-01'}]

    const cases = [
      [
        invoicesA,
        [0, 0, 0, 2000, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined], // prettier-ignore
      ],
      [
        invoicesB,
        [0, 0, 1500, 3000, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined], // prettier-ignore
      ],
      [
        invoicesC,
        [200, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined], // prettier-ignore
      ],
      [
        [...invoicesA, ...invoicesB],
        [0, 0, 1500, 5000, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined], // prettier-ignore
      ],
      [
        [...invoicesA, ...invoicesB, ...invoicesC],
        [200, 0, 1500, 5000, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined], // prettier-ignore
      ],
    ]

    for (const [invoices, result] of cases) {
      expect(getTurnover(invoices, date)).toEqual(result)
    }
  })
})

describe('getCumulativeTurnover', () => {
  it('should return null if null or empty', () => {
    expect(getCumulativeTurnover(null, null)).toEqual(null)
    expect(getCumulativeTurnover(undefined, undefined)).toEqual(null)
    expect(getCumulativeTurnover([], [])).toEqual(null)
  })

  it('should get cumulative turnover', () => {
    const cases = [
      [
        [{createdAt: '2018-04-01'}],
        [0, 0, 0, 2000, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined], // prettier-ignore
        [0, 0, 0, 2000, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined], // prettier-ignore
      ],
      [
        [{createdAt: '2018-04-01'}],
        [0, 1000, 0, 2000, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined], // prettier-ignore
        [0, 1000, 1000, 3000, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined], // prettier-ignore
      ],
      [
        [{createdAt: '2018-06-01'}],
        [0, 1000, 0, 2000, 4000, undefined, undefined, undefined, undefined, undefined, undefined, undefined], // prettier-ignore
        [0, 1000, 1000, 3000, 7000, 7000, undefined, undefined, undefined, undefined, undefined, undefined], // prettier-ignore
      ],
    ]

    for (const [invoices, turnover, result] of cases) {
      expect(getCumulativeTurnover(invoices, turnover)).toEqual(result)
    }
  })
})

describe('getTheoricCumulativeTurnover', () => {
  it('should return null if null or empty', () => {
    expect(getTheoricCumulativeTurnover(null, null)).toEqual(null)
    expect(getTheoricCumulativeTurnover(undefined, undefined)).toEqual(null)
    expect(getTheoricCumulativeTurnover([], [])).toEqual(null)
  })

  it('should get theoric cumulative turnover', () => {
    const cases = [
      [
        [0, 0, 0, 2000, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined], // prettier-ignore
        range(1, 13).map(multiply((0 + 0 + 0 + 2000) / 4)),
      ],
      [
        [0, 1000, 0, 2000, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined], // prettier-ignore
        range(1, 13).map(multiply((0 + 1000 + 0 + 2000) / 4)),
      ],
    ]

    for (const [turnover, result] of cases) {
      expect(getTheoricCumulativeTurnover(turnover)).toEqual(result)
    }
  })
})
