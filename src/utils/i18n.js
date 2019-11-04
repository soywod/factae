import i18n from "i18next";
import Backend from "i18next-xhr-backend";
import {initReactI18next} from "react-i18next";

i18n
  .use(Backend)
  .use(initReactI18next)
  .init({
    lng: "fr",
    load: "currentOnly",
    whitelist: ["fr"],
    fallbackLng: "fr",
    debug: process.env.NODE_ENV === "development",
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
