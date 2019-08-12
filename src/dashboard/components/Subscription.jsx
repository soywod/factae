import React from 'react'
import {DateTime} from 'luxon'

import {useProfile} from '../../profile/hooks'
import StripeForm from './StripeFormContainer'

function Subscription() {
  const profile = useProfile()

  if (!profile || profile.email === 'demo@factae.fr') {
    return null
  }

  const now = DateTime.local()
  const fullDate = profile.expiresAt.toFormat("d LLL yyyy 'à' HH'h'mm")
  const diff = profile.expiresAt.toRelative({locale: 'fr'})

  return (
    <>
      <h2>Abonnement</h2>
      {profile.expiresAt > now ? (
        <div>
          Votre abonnement expire le {fullDate} ({diff}).
        </div>
      ) : (
        <StripeForm />
      )}
    </>
  )
}

export default Subscription
