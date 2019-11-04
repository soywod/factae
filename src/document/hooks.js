import {useEffect, useState} from "react";

import {useAuth} from "../auth/context";
import {onDocumentsChanged, documents$} from "./service";

export function useDocuments() {
  const [documents, setDocuments] = useState(documents$.value);

  useEffect(() => {
    const subscription = documents$.subscribe(setDocuments);
    return () => subscription.unsubscribe();
  }, []);

  return documents;
}

export function useDocumentService() {
  const user = useAuth();

  useEffect(() => {
    if (user) {
      const unsubscribe = onDocumentsChanged();
      return () => unsubscribe();
    }
  }, [user]);
}
