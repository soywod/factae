import isNil from 'lodash/fp/isNil'

function toEuro(value) {
  if (isNil(value)) return ''

  const intl = new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
  })

  return intl.format(Number(value)).replace(/\u202F/g, ' ')
}

export {toEuro}
export default {toEuro}
