export type Locale = { code: string; englishName: string; nativeName: string; direction?: "rtl" };

/**
 * Supported locale catalog. A locale being listed means the UI can select it;
 * it does not imply that every translation or language-specific keyword rule
 * has been completed. Keep that distinction visible in the product.
 */
export const LOCALES: Locale[] = [
  { code: "en", englishName: "English", nativeName: "English" },
  { code: "eo", englishName: "Esperanto", nativeName: "Esperanto" },
  { code: "af", englishName: "Afrikaans", nativeName: "Afrikaans" },
  { code: "sq", englishName: "Albanian", nativeName: "Shqip" },
  { code: "am", englishName: "Amharic", nativeName: "አማርኛ" },
  { code: "ar", englishName: "Arabic", nativeName: "العربية", direction: "rtl" },
  { code: "hy", englishName: "Armenian", nativeName: "Հայերեն" },
  { code: "az", englishName: "Azerbaijani", nativeName: "Azərbaycanca" },
  { code: "eu", englishName: "Basque", nativeName: "Euskara" },
  { code: "be", englishName: "Belarusian", nativeName: "Беларуская" },
  { code: "bn", englishName: "Bengali", nativeName: "বাংলা" },
  { code: "bs", englishName: "Bosnian", nativeName: "Bosanski" },
  { code: "bg", englishName: "Bulgarian", nativeName: "Български" },
  { code: "my", englishName: "Burmese", nativeName: "မြန်မာ" },
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
  { code: "gl", englishName: "Galician", nativeName: "Galego" },
  { code: "ka", englishName: "Georgian", nativeName: "ქართული" },
  { code: "de", englishName: "German", nativeName: "Deutsch" },
  { code: "el", englishName: "Greek", nativeName: "Ελληνικά" },
  { code: "gu", englishName: "Gujarati", nativeName: "ગુજરાતી" },
  { code: "ht", englishName: "Haitian Creole", nativeName: "Kreyòl ayisyen" },
  { code: "ha", englishName: "Hausa", nativeName: "Hausa" },
  { code: "he", englishName: "Hebrew", nativeName: "עברית", direction: "rtl" },
  { code: "hi", englishName: "Hindi", nativeName: "हिन्दी" },
  { code: "hu", englishName: "Hungarian", nativeName: "Magyar" },
  { code: "is", englishName: "Icelandic", nativeName: "Íslenska" },
  { code: "ig", englishName: "Igbo", nativeName: "Igbo" },
  { code: "id", englishName: "Indonesian", nativeName: "Bahasa Indonesia" },
  { code: "ga", englishName: "Irish", nativeName: "Gaeilge" },
  { code: "it", englishName: "Italian", nativeName: "Italiano" },
  { code: "ja", englishName: "Japanese", nativeName: "日本語" },
  { code: "jv", englishName: "Javanese", nativeName: "Basa Jawa" },
  { code: "kn", englishName: "Kannada", nativeName: "ಕನ್ನಡ" },
  { code: "kk", englishName: "Kazakh", nativeName: "Қазақша" },
  { code: "km", englishName: "Khmer", nativeName: "ខ្មែរ" },
  { code: "ko", englishName: "Korean", nativeName: "한국어" },
  { code: "lo", englishName: "Lao", nativeName: "ລາວ" },
  { code: "lv", englishName: "Latvian", nativeName: "Latviešu" },
  { code: "lt", englishName: "Lithuanian", nativeName: "Lietuvių" },
  { code: "lb", englishName: "Luxembourgish", nativeName: "Lëtzebuergesch" },
  { code: "mk", englishName: "Macedonian", nativeName: "Македонски" },
  { code: "ms", englishName: "Malay", nativeName: "Bahasa Melayu" },
  { code: "ml", englishName: "Malayalam", nativeName: "മലയാളം" },
  { code: "mt", englishName: "Maltese", nativeName: "Malti" },
  { code: "mi", englishName: "Māori", nativeName: "Te Reo Māori" },
  { code: "mr", englishName: "Marathi", nativeName: "मराठी" },
  { code: "mn", englishName: "Mongolian", nativeName: "Монгол" },
  { code: "ne", englishName: "Nepali", nativeName: "नेपाली" },
  { code: "no", englishName: "Norwegian", nativeName: "Norsk" },
  { code: "ps", englishName: "Pashto", nativeName: "پښتو", direction: "rtl" },
  { code: "fa", englishName: "Persian", nativeName: "فارسی", direction: "rtl" },
  { code: "pl", englishName: "Polish", nativeName: "Polski" },
  { code: "pt", englishName: "Portuguese", nativeName: "Português" },
  { code: "pa", englishName: "Punjabi", nativeName: "ਪੰਜਾਬੀ" },
  { code: "ro", englishName: "Romanian", nativeName: "Română" },
  { code: "ru", englishName: "Russian", nativeName: "Русский" },
  { code: "sr", englishName: "Serbian", nativeName: "Српски" },
  { code: "si", englishName: "Sinhala", nativeName: "සිංහල" },
  { code: "sk", englishName: "Slovak", nativeName: "Slovenčina" },
  { code: "sl", englishName: "Slovenian", nativeName: "Slovenščina" },
  { code: "so", englishName: "Somali", nativeName: "Soomaali" },
  { code: "es", englishName: "Spanish", nativeName: "Español" },
  { code: "sw", englishName: "Swahili", nativeName: "Kiswahili" },
  { code: "sv", englishName: "Swedish", nativeName: "Svenska" },
  { code: "tl", englishName: "Tagalog", nativeName: "Tagalog" },
  { code: "tg", englishName: "Tajik", nativeName: "Тоҷикӣ" },
  { code: "ta", englishName: "Tamil", nativeName: "தமிழ்" },
  { code: "te", englishName: "Telugu", nativeName: "తెలుగు" },
  { code: "th", englishName: "Thai", nativeName: "ไทย" },
  { code: "tr", englishName: "Turkish", nativeName: "Türkçe" },
  { code: "uk", englishName: "Ukrainian", nativeName: "Українська" },
  { code: "ur", englishName: "Urdu", nativeName: "اردو", direction: "rtl" },
  { code: "uz", englishName: "Uzbek", nativeName: "Oʻzbekcha" },
  { code: "vi", englishName: "Vietnamese", nativeName: "Tiếng Việt" },
  { code: "cy", englishName: "Welsh", nativeName: "Cymraeg" },
  { code: "yo", englishName: "Yoruba", nativeName: "Yorùbá" },
  { code: "zu", englishName: "Zulu", nativeName: "isiZulu" }
];

export const DEFAULT_LOCALE = "en";
export const LOCALE_STORAGE_KEY = "shopes-locale";

export function getLocale(code: string | null | undefined): Locale {
  return LOCALES.find((locale) => locale.code === code) ?? LOCALES[0];
}

export function getDirection(code: string): "ltr" | "rtl" {
  return getLocale(code).direction ?? "ltr";
}
