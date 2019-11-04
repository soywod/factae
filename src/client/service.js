import {BehaviorSubject} from "rxjs";

import {db} from "../utils/firebase";
import {user$} from "../auth/context";

export const clients$ = new BehaviorSubject(null);

export function onClientsChanged() {
  return db(`users/${user$.value.uid}/clients`).onSnapshot((query, error) => {
    const clients = [];

    if (!error) {
      query.forEach(ref => clients.push({id: ref.id, ...ref.data()}));
    }

    clients$.next(clients);
  });
}

export function generateId() {
  return db(`users/${user$.value.uid}/clients`).doc().id;
}

export async function set(client) {
  await db(`users/${user$.value.uid}/clients`, client.id).set(client, {merge: true});
}

export {_delete as delete};
async function _delete(client) {
  await db(`users/${user$.value.uid}/clients`, client.id).delete();
}

export default {generateId, set, delete: _delete};
