import {BehaviorSubject} from 'rxjs'

import {db, functions} from '../utils/firebase'
import {user$} from '../auth/service'

export const documents$ = new BehaviorSubject(null)

function getUpdatedAt(document) {
  switch (document.type) {
    case 'quotation':
      return document.signedAt || document.sentAt || document.createdAt
    case 'invoice':
      return document.paidAt || document.sentAt || document.createdAt
    case 'credit':
      return document.refundedAt || document.sentAt || document.createdAt
    default:
      return document.createdAt
  }
}

export function onDocumentsChanged() {
  return db(`users/${user$.value.uid}/documents`).onSnapshot((query, error) => {
    const documents = []

    if (!error) {
      query.forEach(ref => {
        const document = ref.data()
        documents.push({id: ref.id, ...document, updatedAt: getUpdatedAt(document)})
      })
    }

    documents$.next(documents)
  })
}

export function generateId() {
  return db(`users/${user$.value.uid}/documents`).doc().id
}

export async function set(document) {
  await db(`users/${user$.value.uid}/documents`, document.id).set(document, {merge: true})
}

export {_delete as delete}
async function _delete(document) {
  await db(`users/${user$.value.uid}/documents`, document.id).delete()
}

export async function generatePdf(profile, client, document) {
  const generatePdf = functions.httpsCallable('generatePdf')
  const {data} = await generatePdf({profile, client, document})
  const nextDocument = {...document, pdf: 'data:application/pdf;base64,' + data}
  await db(`users/${user$.value.uid}/documents`, document.id).set(nextDocument)

  return nextDocument
}

export async function sendMail(options) {
  await functions.httpsCallable('sendMail')(options)
}

export default {generateId, set, delete: _delete, generatePdf, sendMail}
