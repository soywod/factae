const functions = require('firebase-functions')
const TeaSchool = require('tea-school')
const path = require('path')

exports.generatePdf = functions.https.onCall(async htmlTemplateOptions => {
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
