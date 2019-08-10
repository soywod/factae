import {BehaviorSubject} from 'rxjs'

import {db, functions} from '../utils/firebase'
import {user$} from '../auth/service'

export const documents$ = new BehaviorSubject(null)

export function onDocumentsChanged() {
  return db(`users/${user$.value.uid}/documents`).onSnapshot((query, error) => {
    const documents = []

    if (!error) {
      query.forEach(ref => documents.push({id: ref.id, ...ref.data()}))
    }

    documents$.next(documents)
  })
}

export async function create(document) {
  const {id} = await db(`users/${user$.value.uid}/documents`).add(document)
  return id
}

export async function update(document) {
  await db(`users/${user$.value.uid}/documents`, document.id).set(document)
}

export {_delete as delete}
async function _delete(document) {
  await db(`users/${user$.value.uid}/documents`, document.id).delete()
}

export async function generatePdf(profile, client, document) {
  try {
    const generatePdf = functions.httpsCallable('generatePdf')
    const {data} = await generatePdf({profile, client, document})
    const nextDocument = {...document, pdf: 'data:application/pdf;base64,' + data}
    await db(`users/${user$.value.uid}/documents`, document.id).set(nextDocument)
    return nextDocument
  } catch (error) {
    return document
  }
}

export default {create, update, delete: _delete, generatePdf}
