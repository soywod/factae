const functions = require('firebase-functions')
const {DateTime} = require('luxon')
const TeaSchool = require('tea-school')
const Stripe = require('stripe')
const admin = require('firebase-admin')
const path = require('path')

const firestore = admin.initializeApp().firestore()
const stripe = new Stripe(String(process.env.STRIPE_API_KEY))

function formatDate(iso) {
  return DateTime.fromISO(iso).toFormat('dd/LL/yyyy')
}

exports.generatePdf = functions.https.onCall(async data => {
  let htmlTemplateOptions = {...data}

  htmlTemplateOptions.document.createdAt = formatDate(htmlTemplateOptions.document.createdAt)

  if (htmlTemplateOptions.document.expiresAt) {
    htmlTemplateOptions.document.expiresAt = formatDate(htmlTemplateOptions.document.expiresAt)
  }

  if (htmlTemplateOptions.document.startsAt) {
    htmlTemplateOptions.document.startsAt = formatDate(htmlTemplateOptions.document.startsAt)
  }

  if (htmlTemplateOptions.document.endsAt) {
    htmlTemplateOptions.document.endsAt = formatDate(htmlTemplateOptions.document.endsAt)
  }

  const htmlTemplatePath = path.resolve(__dirname, 'template.pug')

  const styleOptions = {
    file: path.resolve(__dirname, 'styles.scss'),
  }

  const pdfOptions = {
    format: 'A4',
  }

  const puppeteerOptions = {
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  }

  const teaSchoolOptions = {
    htmlTemplatePath,
    htmlTemplateOptions,
    styleOptions,
    pdfOptions,
    puppeteerOptions,
  }

  const buffer = await TeaSchool.generatePdf(teaSchoolOptions)
  return buffer.toString('base64')
})

exports.charge = functions.https.onCall(async ({userId, token}) => {
  const userDoc = firestore.collection('users').doc(userId)
  const ref = await userDoc.get()
  const transaction = await stripe.charges.create({
    amount: 1200,
    currency: 'EUR',
    description: 'Abonnement 12 mois factAE',
    receipt_email: ref.data().email,
    source: token,
  })

  if (!transaction.paid) {
    return {success: false, error: transaction.failure_message}
  }

  const createdAt = DateTime.fromSeconds(transaction.created)
  const expiresAt = createdAt.plus({months: 12})
  await userDoc.update({expiresAt: expiresAt.toJSDate()})

  return {success: true, expiresAt: expiresAt.toISO()}
})
