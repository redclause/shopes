import type { Locale } from "./languages";

/** Shared strings used by the public site and workspace navigation. */
export type MessageKey = "language" | "home" | "dashboard" | "keywordResearch" | "signIn" | "signOut" | "freeForever" | "search" | "settings" | "loading" | "save" | "cancel" | "back" | "next" | "previous" | "noPaidPlans";

const EN: Record<MessageKey, string> = {
  language: "Language", home: "Home", dashboard: "Dashboard", keywordResearch: "Keyword Research",
  signIn: "Sign in", signOut: "Sign out", freeForever: "Free forever", search: "Search",
  settings: "Settings", loading: "Loading…", save: "Save", cancel: "Cancel", back: "Back",
  next: "Next", previous: "Previous", noPaidPlans: "No paid plans or upgrade fees."
};

const CATALOG: Record<string, Partial<Record<MessageKey, string>>> = {
  ka: { language: "ენა", home: "მთავარი", dashboard: "დეშბორდი", keywordResearch: "საკვანძო სიტყვების კვლევა", signIn: "შესვლა", signOut: "გასვლა", freeForever: "სამუდამოდ უფასო", search: "ძიება", settings: "პარამეტრები", loading: "იტვირთება…", save: "შენახვა", cancel: "გაუქმება", back: "უკან", next: "შემდეგი", previous: "წინა", noPaidPlans: "ფასიანი პაკეტებისა და განახლების საფასურის გარეშე." },
  es: { language: "Idioma", home: "Inicio", dashboard: "Panel", keywordResearch: "Investigación de palabras clave", signIn: "Iniciar sesión", signOut: "Cerrar sesión", freeForever: "Gratis para siempre", search: "Buscar", settings: "Configuración", loading: "Cargando…", save: "Guardar", cancel: "Cancelar", back: "Atrás", next: "Siguiente", previous: "Anterior", noPaidPlans: "Sin planes de pago ni cargos por actualización." },
  fr: { language: "Langue", home: "Accueil", dashboard: "Tableau de bord", keywordResearch: "Recherche de mots-clés", signIn: "Se connecter", signOut: "Se déconnecter", freeForever: "Gratuit pour toujours", search: "Rechercher", settings: "Paramètres", loading: "Chargement…", save: "Enregistrer", cancel: "Annuler", back: "Retour", next: "Suivant", previous: "Précédent", noPaidPlans: "Aucun forfait payant ni frais de mise à niveau." },
  de: { language: "Sprache", home: "Startseite", dashboard: "Dashboard", keywordResearch: "Keyword-Recherche", signIn: "Anmelden", signOut: "Abmelden", freeForever: "Dauerhaft kostenlos", search: "Suchen", settings: "Einstellungen", loading: "Wird geladen…", save: "Speichern", cancel: "Abbrechen", back: "Zurück", next: "Weiter", previous: "Zurück", noPaidPlans: "Keine kostenpflichtigen Tarife oder Upgrade-Gebühren." },
  pt: { language: "Idioma", home: "Início", dashboard: "Painel", keywordResearch: "Pesquisa de palavras-chave", signIn: "Entrar", signOut: "Sair", freeForever: "Grátis para sempre", search: "Pesquisar", settings: "Configurações", loading: "Carregando…", save: "Salvar", cancel: "Cancelar", back: "Voltar", next: "Próximo", previous: "Anterior", noPaidPlans: "Sem planos pagos ou taxas de atualização." },
  it: { language: "Lingua", home: "Home", dashboard: "Dashboard", keywordResearch: "Ricerca parole chiave", signIn: "Accedi", signOut: "Esci", freeForever: "Gratis per sempre", search: "Cerca", settings: "Impostazioni", loading: "Caricamento…", save: "Salva", cancel: "Annulla", back: "Indietro", next: "Avanti", previous: "Precedente", noPaidPlans: "Nessun piano a pagamento o costo di upgrade." },
  nl: { language: "Taal", home: "Home", dashboard: "Dashboard", keywordResearch: "Zoekwoordenonderzoek", signIn: "Inloggen", signOut: "Uitloggen", freeForever: "Altijd gratis", search: "Zoeken", settings: "Instellingen", loading: "Laden…", save: "Opslaan", cancel: "Annuleren", back: "Terug", next: "Volgende", previous: "Vorige", noPaidPlans: "Geen betaalde abonnementen of upgradekosten." },
  ru: { language: "Язык", home: "Главная", dashboard: "Панель управления", keywordResearch: "Исследование ключевых слов", signIn: "Войти", signOut: "Выйти", freeForever: "Бесплатно навсегда", search: "Поиск", settings: "Настройки", loading: "Загрузка…", save: "Сохранить", cancel: "Отмена", back: "Назад", next: "Далее", previous: "Назад", noPaidPlans: "Без платных тарифов и платы за обновление." },
  uk: { language: "Мова", home: "Головна", dashboard: "Панель керування", keywordResearch: "Дослідження ключових слів", signIn: "Увійти", signOut: "Вийти", freeForever: "Безкоштовно назавжди", search: "Пошук", settings: "Налаштування", loading: "Завантаження…", save: "Зберегти", cancel: "Скасувати", back: "Назад", next: "Далі", previous: "Назад", noPaidPlans: "Без платних тарифів і плати за оновлення." },
  tr: { language: "Dil", home: "Ana sayfa", dashboard: "Kontrol paneli", keywordResearch: "Anahtar kelime araştırması", signIn: "Giriş yap", signOut: "Çıkış yap", freeForever: "Sonsuza kadar ücretsiz", search: "Ara", settings: "Ayarlar", loading: "Yükleniyor…", save: "Kaydet", cancel: "İptal", back: "Geri", next: "İleri", previous: "Önceki", noPaidPlans: "Ücretli plan veya yükseltme ücreti yok." },
  ar: { language: "اللغة", home: "الرئيسية", dashboard: "لوحة التحكم", keywordResearch: "بحث الكلمات المفتاحية", signIn: "تسجيل الدخول", signOut: "تسجيل الخروج", freeForever: "مجاني إلى الأبد", search: "بحث", settings: "الإعدادات", loading: "جارٍ التحميل…", save: "حفظ", cancel: "إلغاء", back: "رجوع", next: "التالي", previous: "السابق", noPaidPlans: "لا توجد خطط مدفوعة أو رسوم ترقية." },
  hi: { language: "भाषा", home: "होम", dashboard: "डैशबोर्ड", keywordResearch: "कीवर्ड रिसर्च", signIn: "साइन इन", signOut: "साइन आउट", freeForever: "हमेशा मुफ़्त", search: "खोजें", settings: "सेटिंग्स", loading: "लोड हो रहा है…", save: "सेव करें", cancel: "रद्द करें", back: "वापस", next: "अगला", previous: "पिछला", noPaidPlans: "कोई सशुल्क योजना या अपग्रेड शुल्क नहीं।" },
  zh: { language: "语言", home: "首页", dashboard: "仪表盘", keywordResearch: "关键词研究", signIn: "登录", signOut: "退出登录", freeForever: "永久免费", search: "搜索", settings: "设置", loading: "加载中…", save: "保存", cancel: "取消", back: "返回", next: "下一步", previous: "上一步", noPaidPlans: "没有付费套餐或升级费用。" },
  ja: { language: "言語", home: "ホーム", dashboard: "ダッシュボード", keywordResearch: "キーワード調査", signIn: "ログイン", signOut: "ログアウト", freeForever: "永久無料", search: "検索", settings: "設定", loading: "読み込み中…", save: "保存", cancel: "キャンセル", back: "戻る", next: "次へ", previous: "前へ", noPaidPlans: "有料プランやアップグレード料金はありません。" },
  ko: { language: "언어", home: "홈", dashboard: "대시보드", keywordResearch: "키워드 조사", signIn: "로그인", signOut: "로그아웃", freeForever: "평생 무료", search: "검색", settings: "설정", loading: "불러오는 중…", save: "저장", cancel: "취소", back: "뒤로", next: "다음", previous: "이전", noPaidPlans: "유료 요금제나 업그레이드 비용이 없습니다." },
  id: { language: "Bahasa", home: "Beranda", dashboard: "Dasbor", keywordResearch: "Riset kata kunci", signIn: "Masuk", signOut: "Keluar", freeForever: "Gratis selamanya", search: "Cari", settings: "Pengaturan", loading: "Memuat…", save: "Simpan", cancel: "Batal", back: "Kembali", next: "Berikutnya", previous: "Sebelumnya", noPaidPlans: "Tanpa paket berbayar atau biaya peningkatan." },
  vi: { language: "Ngôn ngữ", home: "Trang chủ", dashboard: "Bảng điều khiển", keywordResearch: "Nghiên cứu từ khóa", signIn: "Đăng nhập", signOut: "Đăng xuất", freeForever: "Miễn phí mãi mãi", search: "Tìm kiếm", settings: "Cài đặt", loading: "Đang tải…", save: "Lưu", cancel: "Hủy", back: "Quay lại", next: "Tiếp theo", previous: "Trước", noPaidPlans: "Không có gói trả phí hoặc phí nâng cấp." },
  pl: { language: "Język", home: "Strona główna", dashboard: "Panel", keywordResearch: "Badanie słów kluczowych", signIn: "Zaloguj się", signOut: "Wyloguj się", freeForever: "Zawsze za darmo", search: "Szukaj", settings: "Ustawienia", loading: "Ładowanie…", save: "Zapisz", cancel: "Anuluj", back: "Wstecz", next: "Dalej", previous: "Poprzednia", noPaidPlans: "Bez płatnych planów i opłat za ulepszenie." },
  sv: { language: "Språk", home: "Hem", dashboard: "Instrumentpanel", keywordResearch: "Sökordsanalys", signIn: "Logga in", signOut: "Logga ut", freeForever: "Alltid gratis", search: "Sök", settings: "Inställningar", loading: "Laddar…", save: "Spara", cancel: "Avbryt", back: "Tillbaka", next: "Nästa", previous: "Föregående", noPaidPlans: "Inga betalda planer eller uppgraderingsavgifter." }
};

export function translate(locale: Locale | string, key: MessageKey): string {
  const code = typeof locale === "string" ? locale : locale.code;
  return CATALOG[code]?.[key] ?? EN[key];
}

export function hasFullCoreTranslation(code: string): boolean {
  return Object.keys(CATALOG[code] ?? {}).length === Object.keys(EN).length;
}

export const TRANSLATED_CORE_LOCALES = Object.keys(CATALOG);
