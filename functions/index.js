global.XMLHttpRequest = require('xhr2')

const firebase = require('firebase')
const functions = require('firebase-functions')
const TeaSchool = require('tea-school')
const path = require('path')

require('firebase/storage')

firebase.initializeApp({
  apiKey: 'AIzaSyBJD1hGI6mhYJwOhb6Fk0kGvuJiqYO-Lr8',
  authDomain: 'factae-53dad.firebaseapp.com',
  databaseURL: 'https://factae-53dad.firebaseio.com',
  projectId: 'factae-53dad',
  storageBucket: 'factae-53dad.appspot.com',
  messagingSenderId: '81874227248',
  appId: '1:81874227248:web:a3d61ab135d51532',
})

const storage = firebase.storage()

exports.generateInvoice = functions.https.onRequest(async (req, res) => {
  const htmlTemplatePath = path.resolve(__dirname, 'template.pug')

  const htmlTemplateOptions = {
    invoice: {
      id: 2452,
      createdAt: '2018-10-12',
      customer: {name: 'International Bank of Blueprintya'},
      shipping: 10,
      total: 104.95,
      comments: 'Do not feed him fish',
      lines: [
        {
          id: 1,
          item: 'Best dry cleaner',
          price: '52.43',
        },
        {
          id: 2,
          item: 'Not so good toaster',
          price: '11.62',
        },
      ],
    },
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
    pdfOptions,
    puppeteerOptions,
  }

  const pdf = await TeaSchool.generatePdf(teaSchoolOptions)

  await storage
    .ref()
    .child('invoices/invoice.pdf')
    .put(pdf)

  res.send('done')
})
