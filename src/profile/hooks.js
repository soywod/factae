import {useEffect, useState} from "react";

import {useAuth} from "../auth/context";
import {onProfileChanged, profile$} from "./service";

export function useProfile() {
  const [profile, setProfile] = useState(profile$.value);

  useEffect(() => {
    const subscription = profile$.subscribe(setProfile);
    return () => subscription.unsubscribe();
  }, []);

  return profile;
}

export function useProfileService() {
  const user = useAuth();

  useEffect(() => {
    if (user) {
      const unsubscribe = onProfileChanged();
      return () => unsubscribe();
    }
  }, [user]);
}
