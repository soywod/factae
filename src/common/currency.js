import isNil from 'lodash/fp/isNil'

export function toEuro(amount) {
  if (isNil(amount)) return ''

  const intl = new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
  })

  return intl.format(Number(amount)).replace(/\u202F/g, ' ')
}

export default {toEuro}
