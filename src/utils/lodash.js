import differenceBy from 'lodash/fp/differenceBy'
import fromPairs from 'lodash/fp/fromPairs'
import sum from 'lodash/fp/sum'
import toPairs from 'lodash/fp/toPairs'

export function difference(a, b) {
  const pairsDiff = differenceBy(sum, toPairs(a), toPairs(b))
  return fromPairs(pairsDiff)
}

export default {difference}
