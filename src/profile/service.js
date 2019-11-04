import {BehaviorSubject} from "rxjs";
import {DateTime} from "luxon";
import omit from "lodash/fp/omit";

import {db} from "../utils/firebase";
import {user$} from "../auth/context";

export const profile$ = new BehaviorSubject(null);

export async function set(profile) {
  await db("users", user$.value.uid).set(omit("expiresAt", profile), {merge: true});
}

export function onProfileChanged() {
  return db("users", user$.value.uid).onSnapshot((doc, error) => {
    if (error || !doc) return profile$.next({});
    const profile = doc.data() || {};

    profile$.next({
      ...profile,
      expiresAt: DateTime.fromSeconds(profile.expiresAt.seconds),
    });
  });
}

export default {set};
