import React, {useState} from 'react'
import Modal from 'antd/es/modal'

import Link from '../../common/components/Link'
import {useProfile} from '../../profile/hooks'

const STORAGE_KEY = 'demo'

function DemoInfos() {
  const profile = useProfile()
  const [hidden, setHidden] = useState(Boolean(localStorage.getItem(STORAGE_KEY)))

  function closeModal() {
    setHidden(true)
    localStorage.setItem(STORAGE_KEY, true)
  }

  if (!profile || profile.email !== 'demo@factae.fr') {
    return null
  }

  return (
    <Modal
      title="Bienvenue sur factAE"
      visible={!hidden}
      cancelText="Fermer"
      okButtonProps={{style: {display: 'none'}}}
      onCancel={closeModal}
    >
      <p>
        <strong>factAE</strong> est un outil de facturation pour micro-entrepreneurs à
        <strong> 1 €/mois</strong>. Son objectif est simple : gérer ses clients, ses devis et ses
        factures <strong>facilement</strong> et <strong>efficacement</strong>. Rien de plus.
      </p>
      <p style={{margin: 0}}>
        Avec ce compte de test, vous avez accès à toute l'application en lecture seule. Vous pouvez
        à tout moment créer un compte gratuitement en vous <Link to="/logout">déconnectant</Link>.
      </p>
    </Modal>
  )
}

export default DemoInfos
