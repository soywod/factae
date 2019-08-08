const functions = require('firebase-functions')
const TeaSchool = require('tea-school')
const path = require('path')

exports.generatePdf = functions.https.onCall(async htmlTemplateOptions => {
  console.log(htmlTemplateOptions)
  const htmlTemplatePath = path.resolve(__dirname, 'template.pug')

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

  const buffer = await TeaSchool.generatePdf(teaSchoolOptions)
  return buffer.toString('base64')
})
