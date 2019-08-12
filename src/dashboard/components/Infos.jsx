import React from 'react'

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

  return (
    <>
      <h2>Plafonds</h2>
      <div>
        <strong>Le plafond de TVA bas</strong> <em>({toEuro(lowTVA)} HT)</em> correspond au plafond
        à partir du quel vous pouvez devenir redevable de la TVA (en fonction de votre chiffre
        d'affaire passé). Un dépassement implique :
      </div>
      <ul>
        <li>
          de vérifier votre chiffre d'affaire de l'année passée :
          <ul>
            <li>
              si votre chiffre d'affaire de l'année passée est inférieur au plafond de TVA bas =>
              non redevable
            </li>
            <li>
              si votre chiffre d'affaire de l'année passée est supérieur au plafond de TVA haut =>
              redevable
            </li>
            <li>
              si votre chiffre d'affaire de l'année passée est entre le plafond de TVA bas et haut
              => vérifier l'année encore d'avant
            </li>
          </ul>
        </li>
      </ul>
      <div>
        <strong>Le plafond de TVA haut</strong> <em>({toEuro(highTVA)} HT)</em> correspond au
        plafond à partir du quel vous devenez redevable de la TVA. Ceci prend effet le premier jour
        du mois dont le chiffre d'affaire hors taxe dépasse ce seuil. Un dépassement implique :
      </div>
      <ul>
        <li>
          d'inscrire la TVA sur vos nouvelles factures + refacturer toutes celles du mois en cours
        </li>
        <li>de créer un compte pro sur impot.gouv.fr</li>
        <li>
          de faire une demande de numéro de TVA intracommunautaire auprès du SIE (Service des Impôts
          des Entreprises)
        </li>
      </ul>
      <div>
        <strong>Le plafond micro-entrepreneur</strong> <em>({toEuro(AE)} HT)</em> correspond au
        plafond maximum autorisé par le micro-entrepreneur. Un dépassement sur deux années
        consécutives implique :
      </div>
      <ul>
        <li>
          la perte de votre statut mirco-entrepreneur (basculement dans le régime de l'entreprise
          individuelle)
        </li>
      </ul>

      <h2>Liens utiles</h2>
      {links.map((link, key) => (
        <div key={key}>
          <Link to={link} />
        </div>
      ))}
    </>
  )
}

export default Infos
