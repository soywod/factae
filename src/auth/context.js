import {useEffect, useState} from "react";
import {BehaviorSubject} from "rxjs";

import {auth} from "../utils/firebase";

export const user$ = new BehaviorSubject(null);

export function onAuthStateChanged() {
  return auth.onAuthStateChanged((user, error) => user$.next(error || !user ? false : user));
}

export function useAuth() {
  const [user, setUser] = useState(user$.value);

  useEffect(() => {
    const subscription = user$.subscribe(setUser);
    return () => subscription.unsubscribe();
  }, []);

  return user;
}

export default {user$, onAuthStateChanged, useAuth};
