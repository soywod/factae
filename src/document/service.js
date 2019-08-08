import {BehaviorSubject} from 'rxjs'
import omitBy from 'lodash/fp/omitBy'
import isNil from 'lodash/fp/isNil'

import {db, functions} from '../utils/firebase'
import {notify} from '../utils/notification'
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

export async function create(rawDocument) {
  try {
    const document = omitBy(isNil, rawDocument)
    const {id} = await db(`users/${user$.value.uid}/documents`).add(document)
    notify.success('Document créé avec succès.')
    return {id, ...document}
  } catch (error) {
    notify.error(error.message)
    throw error
  }
}

export async function update(document) {
  try {
    await db(`users/${user$.value.uid}/documents`, document.id).set(document)
    notify.success('Document mis à jour avec succès.')
  } catch (error) {
    notify.error(error.message)
    throw error
  }
}

export {_delete as delete}
async function _delete(document) {
  try {
    await db(`users/${user$.value.uid}/documents`, document.id).delete()
    notify.success('Document supprimé avec succès.')
  } catch (error) {
    notify.error(error.message)
    throw error
  }
}

export async function generatePdf(profile, client, document) {
  try {
    const generatePdf = functions.httpsCallable('generatePdf')
    const {data} = await generatePdf({profile, client, document})
    const nextDocument = {...document, pdf: 'data:application/pdf;base64,' + data}
    await db(`users/${user$.value.uid}/documents`, document.id).set(nextDocument)
    return nextDocument
  } catch (error) {
    notify.error(error.message)
    return document
  }
}

export default {create, update, delete: _delete, generatePdf}
