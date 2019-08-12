import React, {useEffect, useState} from 'react'
import {Elements, StripeProvider} from 'react-stripe-elements'

import StripeForm from './StripeForm'

export default function() {
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const stripeElement = document.createElement('script')
    stripeElement.onload = () => setReady(true)
    document.body.appendChild(stripeElement)
    stripeElement.src = 'https://js.stripe.com/v3/'

    return () => {
      document.body.removeChild(stripeElement)
    }
  }, [])

  return ready ? (
    <StripeProvider apiKey={String(process.env.REACT_APP_STRIPE_API_KEY)}>
      <Elements locale="fr">
        <StripeForm />
      </Elements>
    </StripeProvider>
  ) : null
}
