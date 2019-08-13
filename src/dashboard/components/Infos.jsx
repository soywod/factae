import React from 'react'
import {useTranslation} from 'react-i18next'

import Link from '../../common/components/Link'
import {toEuro} from '../../common/currency'
import {useThresholds} from '../hooks'

const links = [
  'https://www.service-public.fr/professionnels-entreprises/vosdroits/F32353',
  'https://www.shine.fr/blog/assujetti-tva-auto-entrepreneur',
  'https://www.portail-autoentrepreneur.fr/actualites/comment-faire-declaration-tva',
  'https://www.auto-entrepreneur.fr/statut-auto-entrepreneur/limites/plafonds.html',
]

function Infos() {
  const [lowTVA, highTVA, AE] = useThresholds()
  const {t} = useTranslation()

  return (
    <>
      <h2>{t('thresholds')}</h2>
      <div dangerouslySetInnerHTML={{__html: t('/dashboard.part-a', {value: toEuro(lowTVA)})}} />
      <ul>
        <li>
          {t('/dashboard.part-a-1')}
          <ul>
            <li>{t('/dashboard.part-a-2')}</li>
            <li>{t('/dashboard.part-a-3')}</li>
            <li>{t('/dashboard.part-a-4')}</li>
          </ul>
        </li>
      </ul>
      <div dangerouslySetInnerHTML={{__html: t('/dashboard.part-b', {value: toEuro(highTVA)})}} />
      <ul>
        <li>{t('/dashboard.part-b-1')}</li>
        <li>{t('/dashboard.part-b-2')}</li>
        <li>{t('/dashboard.part-b-3')}</li>
      </ul>
      <div dangerouslySetInnerHTML={{__html: t('/dashboard.part-c', {value: toEuro(AE)})}} />
      <ul>
        <li>{t('/dashboard.part-c-1')}</li>
      </ul>
      <h2>{t('useful-links')}</h2>
      <ul>
        {links.map((link, key) => (
          <li key={key}>
            <Link to={link} />
          </li>
        ))}
      </ul>
    </>
  )
}

export default Infos
