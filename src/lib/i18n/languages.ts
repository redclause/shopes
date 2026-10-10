export type Locale = { code: string; englishName: string; nativeName: string; direction?: "rtl" };

/**
 * Locale catalog restricted to languages listed in Google's current
 * AdSense-supported publisher-language policy. This is an eligibility filter,
 * not a guarantee of AdSense approval or ad serving.
 */
export const LOCALES: Locale[] = [
  { code: "en", englishName: "English", nativeName: "English" },
  { code: "ar", englishName: "Arabic", nativeName: "العربية", direction: "rtl" },
  { code: "bn", englishName: "Bengali (Bangla)", nativeName: "বাংলা" },
  { code: "bg", englishName: "Bulgarian", nativeName: "Български" },
  { code: "ca", englishName: "Catalan", nativeName: "Català" },
  { code: "zh", englishName: "Chinese (Simplified)", nativeName: "简体中文" },
  { code: "zh-TW", englishName: "Chinese (Traditional)", nativeName: "繁體中文" },
  { code: "hr", englishName: "Croatian", nativeName: "Hrvatski" },
  { code: "cs", englishName: "Czech", nativeName: "Čeština" },
  { code: "da", englishName: "Danish", nativeName: "Dansk" },
  { code: "nl", englishName: "Dutch", nativeName: "Nederlands" },
  { code: "et", englishName: "Estonian", nativeName: "Eesti" },
  { code: "fi", englishName: "Finnish", nativeName: "Suomi" },
  { code: "fr", englishName: "French", nativeName: "Français" },
  { code: "de", englishName: "German", nativeName: "Deutsch" },
  { code: "el", englishName: "Greek", nativeName: "Ελληνικά" },
  { code: "gu", englishName: "Gujarati", nativeName: "ગુજરાતી" },
  { code: "he", englishName: "Hebrew", nativeName: "עברית", direction: "rtl" },
  { code: "hi", englishName: "Hindi", nativeName: "हिन्दी" },
  { code: "hu", englishName: "Hungarian", nativeName: "Magyar" },
  { code: "id", englishName: "Indonesian", nativeName: "Bahasa Indonesia" },
  { code: "it", englishName: "Italian", nativeName: "Italiano" },
  { code: "ja", englishName: "Japanese", nativeName: "日本語" },
  { code: "kn", englishName: "Kannada", nativeName: "ಕನ್ನಡ" },
  { code: "ko", englishName: "Korean", nativeName: "한국어" },
  { code: "lv", englishName: "Latvian", nativeName: "Latviešu" },
  { code: "lt", englishName: "Lithuanian", nativeName: "Lietuvių" },
  { code: "ms", englishName: "Malay", nativeName: "Bahasa Melayu" },
  { code: "ml", englishName: "Malayalam", nativeName: "മലയാളം" },
  { code: "mr", englishName: "Marathi", nativeName: "मराठी" },
  { code: "no", englishName: "Norwegian", nativeName: "Norsk" },
  { code: "pa", englishName: "Punjabi", nativeName: "ਪੰਜਾਬੀ" },
  { code: "pl", englishName: "Polish", nativeName: "Polski" },
  { code: "pt", englishName: "Portuguese", nativeName: "Português" },
  { code: "ro", englishName: "Romanian", nativeName: "Română" },
  { code: "ru", englishName: "Russian", nativeName: "Русский" },
  { code: "sr", englishName: "Serbian", nativeName: "Српски" },
  { code: "sk", englishName: "Slovak", nativeName: "Slovenčina" },
  { code: "sl", englishName: "Slovenian", nativeName: "Slovenščina" },
  { code: "es", englishName: "Spanish", nativeName: "Español" },
  { code: "sv", englishName: "Swedish", nativeName: "Svenska" },
  { code: "ta", englishName: "Tamil", nativeName: "தமிழ்" },
  { code: "te", englishName: "Telugu", nativeName: "తెలుగు" },
  { code: "th", englishName: "Thai", nativeName: "ไทย" },
  { code: "tr", englishName: "Turkish", nativeName: "Türkçe" },
  { code: "uk", englishName: "Ukrainian", nativeName: "Українська" },
  { code: "ur", englishName: "Urdu", nativeName: "اردو", direction: "rtl" },
  { code: "vi", englishName: "Vietnamese", nativeName: "Tiếng Việt" },
  { code: "tl", englishName: "Filipino", nativeName: "Filipino" }
];

export const DEFAULT_LOCALE = "en";
export const LOCALE_STORAGE_KEY = "shopes-locale";

export function getLocale(code: string | null | undefined): Locale {
  return LOCALES.find((locale) => locale.code === code) ?? LOCALES[0];
}

export function getDirection(code: string): "ltr" | "rtl" {
  return getLocale(code).direction ?? "ltr";
}
