import path from 'path';
import i18next from 'i18next';
import Backend from 'i18next-fs-backend';
import i18nextMiddleware from 'i18next-http-middleware';

i18next
  .use(Backend)
  .use(i18nextMiddleware.LanguageDetector)
  .init({
    lng: 'en', // Default language
    fallbackLng: 'en',
    backend: {
      loadPath: path.join(__dirname, '../locales/{{lng}}/{{ns}}.json'), // Path to your translation files
    },
    detection: {
      lookupHeader: 'accept-language',
    },
    interpolation: {
      escapeValue: false, // Set to false because you handle escaping elsewhere
    },
  });

export default i18next;
