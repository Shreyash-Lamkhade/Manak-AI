import { createContext, useContext, useState } from 'react'

export const translations = {
  EN: {
    // Sidebar
    dashboard: 'Dashboard', search: 'Search', docAnalysis: 'Doc Analysis',
    qcoChecker: 'QCO Checker', history: 'History & Saved', settings: 'Settings',
    navigation: 'Navigation', account: 'Account',

    // TopBar
    notifications: 'Notifications',

    // Dashboard
    welcomeSubtitle: 'Bureau of Indian Standards · MANAK-AI',
    welcomeBack: 'Welcome back',
    newSearch: 'New Search',
    searchesMonth: 'Searches this month',
    standardsDb: 'Standards in database',
    qcoDeadlines30: 'QCO deadlines (30d)',
    activeQco: 'Active QCO products',
    recentSearches: 'Recent Searches',
    qcoDeadlines: 'QCO Deadlines',
    viewAll: 'View all',
    checker: 'Checker',
    reopen: 'Reopen',

    // Search page
    searchPageTitle: 'Search Standards',
    searchHeading: 'Find the right Indian Standard',
    searchSubtitle: 'Describe a product or upload a tender document to find applicable IS references and certification requirements.',
    describeProduct: 'Describe Product',
    uploadDocument: 'Upload Document',
    searchPlaceholder: 'e.g. LED street light 100W IP65 outdoor installation',
    searchBtn: 'Search Standards',
    matching: 'Matching against Indian Standards...',
    tryExample: 'Try an example',
    dropHere: 'Drop your document here',
    dropFormats: 'PDF, DOCX, or TXT accepted',
    browseFiles: 'Browse files',
    analyseDoc: 'Analyse Document',
    analysing: 'Analysing document...',

    // Results page
    resultsFor: 'Results for',
    newSearchBtn: 'New search',
    standardsFound: 'standards found',
    standardFound: 'standard found',
    scoringBreakdown: 'Scoring breakdown',
    semanticSim: 'Semantic similarity',
    keywordOverlap: 'Keyword overlap',
    specMatch: 'Specification match',
    evidence: 'Evidence',
    matchedSpecs: 'Matched specifications:',
    overlapKw: 'Overlapping keywords:',
    versionAmend: 'Version & Amendments',
    normativeRefs: 'Normative References',
    relatedStds: 'Related Standards',
    certification: 'Certification',
    openFullStd: 'Open Full Standard',
    accept: 'Accept', reject: 'Reject', flag: 'Flag',
    noMatchFound: 'No confident match found',
    noMatchDesc: 'No sufficiently reliable standard could be identified. Manual research is recommended.',
    tryAnotherSearch: 'Try another search',

    // QCO Checker
    qcoCheckerTitle: 'QCO Checker',
    qcoHeading: 'Quality Control Order Checker',
    qcoSubtitle: 'Enter a product name to check whether mandatory BIS certification is required under a QCO.',
    qcoPlaceholder: 'Enter a product name, e.g. LED lamp',
    checkBtn: 'Check',
    mandatoryRequired: 'Mandatory Certification Required',
    mandatoryCoveredUnder: 'This product is covered under a Quality Control Order',
    noMandatoryCert: 'No Mandatory Certification',
    noMatchProduct: 'No matching product found',
    noMatchProductDesc: 'Try a different product name or use the Search screen for broader results.',
    product: 'Product', applicableStandard: 'Applicable Standard',
    enforcementDate: 'Enforcement Date', qcoRef: 'QCO Reference',
    sampleProducts: 'Sample products to check',
    qcoDisclaimer: 'QCO data reflects August 2026. Always verify with official DPIIT Gazette.',

    // Standard Detail
    scope: 'Scope', testMethods: 'Test Methods', amendHistory: 'Amendments & History',
    qcoStatus: 'QCO Status', intlEquivalent: 'International Equivalent',
    copyRef: 'Copy reference', save: 'Save',
    mandatoryCertification: 'Mandatory Certification',
    noMandatoryCertification: 'No mandatory certification',
    certBody: 'Certification Body', version: 'Version', lastUpdated: 'Last updated',

    // Settings
    settingsTitle: 'Settings',
    profile: 'Profile', fullName: 'Full name', department: 'Department',
    designation: 'Designation', languagePref: 'Language Preference',
    interfaceLang: 'Interface language', notifPref: 'Notification Preferences',
    emailNotif: 'Email notifications', emailNotifDesc: 'Receive updates via email',
    qcoAlerts: 'QCO deadline alerts', qcoAlertsDesc: 'Alert 30 days before enforcement dates',
    amendAlerts: 'Standard amendment alerts', amendAlertsDesc: 'Alert when saved standards are amended',
    aboutApp: 'About MANAK-AI',
    saveSettings: 'Save settings',

    // History    historyTitle: 'History & Saved', searchHistory: 'Search History',
    savedStandards: 'Saved Standards', query: 'Query', date: 'Date',
    topResult: 'Top Result', results: 'Results',
    noHistory: 'No search history', noHistoryDesc: 'Your past searches will appear here.',
    noSaved: 'No saved standards', noSavedDesc: 'Save standards from Search results to access them later.',
    searchStandardsBtn: 'Search standards',
  },

  HI: {
    // Sidebar
    dashboard: 'डैशबोर्ड', search: 'खोज', docAnalysis: 'दस्तावेज़ विश्लेषण',
    qcoChecker: 'QCO जाँचकर्ता', history: 'इतिहास और सहेजे गए', settings: 'सेटिंग्स',
    navigation: 'नेविगेशन', account: 'खाता',

    // TopBar
    notifications: 'सूचनाएँ',

    // Dashboard
    welcomeSubtitle: 'भारतीय मानक ब्यूरो · MANAK-AI',
    welcomeBack: 'वापस स्वागत है',
    newSearch: 'नई खोज',
    searchesMonth: 'इस माह की खोजें',
    standardsDb: 'डेटाबेस में मानक',
    qcoDeadlines30: 'QCO समय-सीमाएँ (30 दिन)',
    activeQco: 'सक्रिय QCO उत्पाद',
    recentSearches: 'हाल की खोजें',
    qcoDeadlines: 'QCO समय-सीमाएँ',
    viewAll: 'सभी देखें',
    checker: 'जाँचकर्ता',
    reopen: 'फिर खोलें',

    // Search page
    searchPageTitle: 'मानक खोजें',
    searchHeading: 'सही भारतीय मानक खोजें',
    searchSubtitle: 'उत्पाद का वर्णन करें या टेंडर दस्तावेज़ अपलोड करें — हम लागू IS संदर्भ और प्रमाणन आवश्यकताएँ खोजेंगे।',
    describeProduct: 'उत्पाद का वर्णन करें',
    uploadDocument: 'दस्तावेज़ अपलोड करें',
    searchPlaceholder: 'उदाहरण: LED स्ट्रीट लाइट 100W IP65 बाहरी स्थापना',
    searchBtn: 'मानक खोजें',
    matching: 'भारतीय मानकों से मिलान हो रहा है...',
    tryExample: 'उदाहरण आज़माएं',
    dropHere: 'अपना दस्तावेज़ यहाँ छोड़ें',
    dropFormats: 'PDF, DOCX, या TXT स्वीकार्य है',
    browseFiles: 'फ़ाइलें ब्राउज़ करें',
    analyseDoc: 'दस्तावेज़ विश्लेषण करें',
    analysing: 'दस्तावेज़ का विश्लेषण हो रहा है...',

    // Results page
    resultsFor: 'के परिणाम',
    newSearchBtn: 'नई खोज',
    standardsFound: 'मानक मिले',
    standardFound: 'मानक मिला',
    scoringBreakdown: 'स्कोर विवरण',
    semanticSim: 'शब्दार्थ समानता',
    keywordOverlap: 'कीवर्ड ओवरलैप',
    specMatch: 'विशिष्टता मिलान',
    evidence: 'साक्ष्य',
    matchedSpecs: 'मिले हुए विनिर्देश:',
    overlapKw: 'समान कीवर्ड:',
    versionAmend: 'संस्करण और संशोधन',
    normativeRefs: 'आदर्श संदर्भ',
    relatedStds: 'संबंधित मानक',
    certification: 'प्रमाणन',
    openFullStd: 'पूरा मानक खोलें',
    accept: 'स्वीकार', reject: 'अस्वीकार', flag: 'चिह्नित करें',
    noMatchFound: 'कोई विश्वसनीय मिलान नहीं मिला',
    noMatchDesc: 'उपलब्ध मानक कोष से कोई विश्वसनीय मानक नहीं मिला। मैन्युअल शोध की सलाह दी जाती है।',
    tryAnotherSearch: 'दूसरी खोज करें',

    // QCO Checker
    qcoCheckerTitle: 'QCO जाँचकर्ता',
    qcoHeading: 'गुणवत्ता नियंत्रण आदेश जाँचकर्ता',
    qcoSubtitle: 'उत्पाद का नाम दर्ज करें — हम बताएंगे कि QCO के तहत अनिवार्य BIS प्रमाणन आवश्यक है या नहीं।',
    qcoPlaceholder: 'उत्पाद नाम दर्ज करें, जैसे LED लैंप',
    checkBtn: 'जाँचें',
    mandatoryRequired: 'अनिवार्य प्रमाणन आवश्यक है',
    mandatoryCoveredUnder: 'यह उत्पाद गुणवत्ता नियंत्रण आदेश के अंतर्गत है',
    noMandatoryCert: 'अनिवार्य प्रमाणन नहीं',
    noMatchProduct: 'कोई मिलान उत्पाद नहीं मिला',
    noMatchProductDesc: 'अलग उत्पाद नाम आज़माएं या व्यापक परिणामों के लिए खोज स्क्रीन उपयोग करें।',
    product: 'उत्पाद', applicableStandard: 'लागू मानक',
    enforcementDate: 'प्रवर्तन तिथि', qcoRef: 'QCO संदर्भ',
    sampleProducts: 'जाँचने के लिए नमूना उत्पाद',
    qcoDisclaimer: 'QCO डेटा अगस्त 2026 का है। हमेशा आधिकारिक DPIIT गजट से सत्यापित करें।',

    // Standard Detail
    scope: 'दायरा', testMethods: 'परीक्षण विधियाँ', amendHistory: 'संशोधन और इतिहास',
    qcoStatus: 'QCO स्थिति', intlEquivalent: 'अंतर्राष्ट्रीय समकक्ष',
    copyRef: 'संदर्भ कॉपी करें', save: 'सहेजें',
    mandatoryCertification: 'अनिवार्य प्रमाणन',
    noMandatoryCertification: 'कोई अनिवार्य प्रमाणन नहीं',
    certBody: 'प्रमाणन निकाय', version: 'संस्करण', lastUpdated: 'अंतिम अपडेट',

    // Settings
    settingsTitle: 'सेटिंग्स',
    profile: 'प्रोफ़ाइल', fullName: 'पूरा नाम', department: 'विभाग',
    designation: 'पदनाम', languagePref: 'भाषा प्राथमिकता',
    interfaceLang: 'इंटरफ़ेस भाषा', notifPref: 'अधिसूचना प्राथमिकताएँ',
    emailNotif: 'ईमेल सूचनाएँ', emailNotifDesc: 'ईमेल के माध्यम से अपडेट प्राप्त करें',
    qcoAlerts: 'QCO समय-सीमा अलर्ट', qcoAlertsDesc: 'प्रवर्तन तिथि से 30 दिन पहले अलर्ट',
    amendAlerts: 'मानक संशोधन अलर्ट', amendAlertsDesc: 'सहेजे गए मानक संशोधित होने पर अलर्ट',
    aboutApp: 'MANAK-AI के बारे में',
    saveSettings: 'सेटिंग्स सहेजें',

    // History
    historyTitle: 'इतिहास और सहेजे गए', searchHistory: 'खोज इतिहास',
    savedStandards: 'सहेजे गए मानक', query: 'क्वेरी', date: 'तिथि',
    topResult: 'शीर्ष परिणाम', results: 'परिणाम',
    noHistory: 'कोई खोज इतिहास नहीं', noHistoryDesc: 'आपकी पिछली खोजें यहाँ दिखेंगी।',
    noSaved: 'कोई सहेजे गए मानक नहीं', noSavedDesc: 'बाद में एक्सेस करने के लिए खोज परिणामों से मानक सहेजें।',
    searchStandardsBtn: 'मानक खोजें',
  }
}

const LangContext = createContext({ lang: 'EN', t: k => translations.EN[k] || k, setLang: () => {} })

export function LangProvider({ children }) {
  const [lang, setLangState] = useState(() => localStorage.getItem('lang') || 'EN')
  const t = (key) => translations[lang]?.[key] || translations.EN[key] || key
  const setLang = (l) => { setLangState(l); localStorage.setItem('lang', l) }
  return (
    <LangContext.Provider value={{ lang, t, setLang }}>
      {children}
    </LangContext.Provider>
  )
}

export const useLang = () => useContext(LangContext)
