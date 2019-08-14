import React, {useEffect, useState} from 'react'
import {useTranslation} from 'react-i18next'
import {CardElement, Elements, injectStripe, StripeProvider} from 'react-stripe-elements'
import {DateTime} from 'luxon'
import Button from 'antd/es/button'
import Col from 'antd/es/col'
import Row from 'antd/es/row'
import getOr from 'lodash/fp/getOr'
import isNil from 'lodash/fp/isNil'

import Link from '../../common/components/Link'
import {notify} from '../../utils/notification'
import {functions} from '../../utils/firebase'
import {useProfile} from '../../profile/hooks'

const StripeForm = injectStripe(({stripe}) => {
  const profile = useProfile()
  const [loading, setLoading] = useState(false)

  async function charge(event) {
    if (event) event.preventDefault()
    if (loading) return
    if (isNil(stripe)) return
    if (isNil(profile)) return

    setLoading(true)

    try {
      const name = `${profile.firstName} ${profile.lastName}`
      const tokenRes = await stripe.createToken({name})
      const token = getOr(null, 'token.id', tokenRes)
      const charge = functions.httpsCallable('charge')
      const {data} = await charge({userId: profile.id, token})

      if (!data.success) {
        throw new Error(data.error)
      }

      const expireFormat = "d LLLL yyyy 'à' HH'h'mm"
      const expireString = DateTime.fromISO(data.expiresAt, {locale: 'fr'}).toFormat(expireFormat)
      notify.success(`Paiement effectué. Votre abonnement expirera le ${expireString}.`)
    } catch (error) {
      notify.error(error.message)
    }
  }

  return (
    <>
      <div>
        Votre abonnement est arrivé à échéance. L'abonnement de base est de 12 mois, et le paiement
        s'effectue par carte bancaire :
      </div>

      <form onSubmit={charge} style={{margin: '1em 0'}}>
        <Row gutter={8}>
          <Col xs={24} sm={18} md={19} lg={20}>
            <CardElement className="stripe-input" hidePostalCode />
          </Col>
          <Col xs={24} sm={6} md={5} lg={4}>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              style={{width: '100%', height: 42}}
            >
              Payer 12 €
            </Button>
          </Col>
        </Row>
      </form>

      <div>
        <em>
          Le paiement est <strong>sécurisé</strong> et <strong>anonyme</strong>.
        </em>
      </div>

      <div>
        <em>Aucune information liée à votre transaction n'est conservée.</em>
      </div>

      <br />

      <div>
        <strong>Pourquoi je ne peux pas choisir un mois d'abonnement ?</strong>
      </div>

      <div>
        <Link to="https://stripe.com/">Stripe</Link>, la solution de paiement en ligne utilisée par
        factAE, <Link to="https://stripe.com/fr-FR/pricing">prélève 1,4% + 25 centimes</Link> par
        transaction réussie. Sur un paiement d'1 €, c'est plus de 25% de perdu. factAE définit donc
        un minimum de 12 mois (12 €) pour limiter les coûts liés aux transactions.
      </div>
    </>
  )
})

function StripeFormContainer() {
  const [ready, setReady] = useState(false)
  const {i18n} = useTranslation()

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
      <Elements locale={i18n.language}>
        <StripeForm />
      </Elements>
    </StripeProvider>
  ) : null
}

export default StripeFormContainer
