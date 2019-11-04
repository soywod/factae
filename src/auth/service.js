import {useEffect} from "react";
import {DateTime} from "luxon";

import {auth, db} from "../utils/firebase";
import {onAuthStateChanged} from "./context";

export function useAuth() {
  useEffect(() => {
    const unsubscribe = onAuthStateChanged();
    return () => unsubscribe();
  }, []);
}

export async function register(email, password) {
  const now = DateTime.local();
  const {user} = await auth.createUserWithEmailAndPassword(email, password);
  await db("users", user.uid).set({
    id: user.uid,
    email: user.email,
    documentsTheme: "default",
    quotationConditions: "Dispensé d’immatriculation au registre du commerce et des sociétés (RCS)",
    invoiceConditions:
      "En cas de retard de paiement, une pénalité de 3 fois le taux d’intérêt légal sera appliquée, à laquelle s’ajoutera une indemnité forfaitaire pour frais de recouvrement de 40€\nDispensé d’immatriculation au registre du commerce et des sociétés (RCS)",
    createdAt: now.toISO(),
    expiresAt: now.plus({days: 30}).toJSDate(),
  });
}

export async function resetPassword(email) {
  await auth.sendPasswordResetEmail(email);
}

export async function login(email, password) {
  await auth.signInWithEmailAndPassword(email, password);
}

export async function logout() {
  await auth.signOut();
}

export default {useAuth, register, resetPassword, login, logout};
