import React, {useEffect, useState} from 'react'
import {useTranslation} from 'react-i18next'
import {CardElement, Elements, injectStripe, StripeProvider} from 'react-stripe-elements'
import {DateTime} from 'luxon'
import Alert from 'antd/lib/alert'
import Button from 'antd/lib/button'
import Modal from 'antd/lib/modal'
import getOr from 'lodash/fp/getOr'

import Link from '../../common/components/Link'
import {isDemo} from '../../common/demo'
import {notify} from '../../utils/notification'
import {functions} from '../../utils/firebase'
import {useProfile} from '../../profile/hooks'

const StripeForm = injectStripe(({stripe}) => {
  const profile = useProfile()
  const [loading, setLoading] = useState(false)

  async function charge(event) {
    if (event) event.preventDefault()
    if (loading) return
    if (!stripe) return
    if (!profile) return

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

    setLoading(false)
  }

  return (
    <>
      <div>
        Votre abonnement est arrivé à échéance. L'abonnement de base est de 12 mois, et le paiement
        s'effectue par carte bancaire :
      </div>

      <form onSubmit={charge} style={{display: 'flex', margin: '1em 0'}}>
        <CardElement className="stripe-input" hidePostalCode />
        <Button type="primary" htmlType="submit" loading={loading} style={{height: 40}}>
          Payer 12 €
        </Button>
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
        <strong>Pourquoi l'abonnement est de 12 mois minimum ?</strong>
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

function Subscription() {
  const profile = useProfile()
  const [ready, setReady] = useState(false)
  const [visible, setVisible] = useState(false)
  const {t, i18n} = useTranslation()

  useEffect(() => {
    const stripeElement = document.createElement('script')
    stripeElement.onload = () => setReady(true)
    document.body.appendChild(stripeElement)
    stripeElement.src = 'https://js.stripe.com/v3/'

    return () => {
      document.body.removeChild(stripeElement)
    }
  }, [])

  if (!profile || !ready) {
    return null
  }

  const now = DateTime.local()
  const date = profile.expiresAt.setLocale(i18n.language).toFormat(t('date-format'))
  const diff = profile.expiresAt.toRelative({locale: i18n.language})

  if (isDemo(profile) || profile.expiresAt > now) {
    return (
      <Alert
        type="success"
        showIcon
        message={t('/profile.subscription-expires-in', {date, diff})}
      />
    )
  }

  function showPaymentModal(event) {
    event.preventDefault()
    setVisible(true)
  }

  return (
    <>
      <Alert
        type="error"
        showIcon
        message={
          <div style={{display: 'flex'}}>
            <span style={{flex: 1}}>{t('/profile.subscription-expired', {date, diff})}</span>
            <Link onClick={showPaymentModal}>{t('subscribe-now')}</Link>
          </div>
        }
      />

      <Modal
        title={t('subscription')}
        footer={null}
        visible={visible}
        onCancel={() => setVisible(false)}
      >
        <StripeProvider apiKey={String(process.env.REACT_APP_STRIPE_API_KEY)}>
          <Elements locale={i18n.language}>
            <StripeForm />
          </Elements>
        </StripeProvider>
      </Modal>
    </>
  )
}

export default Subscription
