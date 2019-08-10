const functions = require('firebase-functions')
const {DateTime} = require('luxon')
const TeaSchool = require('tea-school')
const path = require('path')

function formatDate(iso) {
  return DateTime.fromISO(iso, {locale: 'fr'}).toFormat('d LLL yyyy')
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
