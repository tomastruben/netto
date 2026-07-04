export const LOCALES = ["de", "en", "fr", "it"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "de";

export interface Dict {
  meta: { title: string; description: string };
  form: {
    legend: string;
    gross: string;
    monthly: string;
    annual: string;
    thirteenth: string;
    thirteenthHint: string;
    age: string;
    ageUnder25: string;
    canton: string;
    cantonPlaceholder: string;
    marital: string;
    single: string;
    married: string;
    doubleIncome: string;
    doubleIncomeHint: string;
    children: string;
    childrenHint: string;
    church: string;
    churchHint: string;
    churchNone: string;
    churchAlways: string;
    permit: string;
    permitCH: string;
    permitBL: string;
    permitHint: string;
    advanced: string;
    nbu: string;
    nbuHint: string;
    ktg: string;
    ktgHint: string;
    bvgShare: string;
    bvgShareHint: string;
  };
  results: {
    netMonthly: string;
    netMonthlyQst: string;
    perMonth: string;
    ofGross: string;
    netAnnual: string;
    afterTax: string;
    afterTaxHint: string;
    taxWithheld: string;
    deductions: string;
    item: string;
    rate: string;
    monthlyCol: string;
    annualCol: string;
    grossLabel: string;
    ahv: string;
    ahvHint: string;
    alv: string;
    alvHint: string;
    nbu: string;
    nbuHint: string;
    ktg: string;
    ktgHint: string;
    bvg: string;
    bvgHint: string;
    bvgNone: string;
    tax: string;
    taxQst: string;
    taxHint: string;
    totalDeductions: string;
    childAllowance: string;
    childAllowanceHint: string;
    composition: string;
    net: string;
    estimateNote: string;
    qstNote: string;
    estimateLink: string;
    ceilingNote: string;
  };
  nav: {
    calculator: string;
    guide: string;
  };
  insights: {
    title: string;
    pillar3a: string;
    canton: string;
    familyGapSingle: string;
    familyGapFamily: string;
    church: string;
    qst13: string;
    disclaimer: string;
    more: string;
  };
  employer: {
    employeeTab: string;
    employerTab: string;
    totalCost: string;
    totalCostHint: string;
    fak: string;
    bu: string;
    onTop: string;
  };
  compare: {
    title: string;
    hint: string;
    yourCanton: string;
    showAll: string;
    showLess: string;
    rank: string;
  };
  monetize: {
    adLabel: string;
    partnerLabel: string;
    pillar3aTitle: string;
    pillar3aDesc: string;
    pillar3aCta: string;
    healthTitle: string;
    healthDesc: string;
    healthCta: string;
    relocationTitle: string;
    relocationDesc: string;
    relocationCta: string;
  };
  footer: {
    disclaimer: string;
    sources: string;
    official: string;
    year: string;
    madeIn: string;
  };
}

const de: Dict = {
  meta: {
    title: "Brutto-Netto-Rechner Schweiz 2026: Nettolohn berechnen",
    description:
      "Berechnen Sie Ihren Nettolohn 2026 für alle 26 Kantone: AHV, ALV, NBU, BVG, Quellensteuer und Steuerschätzung. Transparent, mit allen Sätzen. Kostenlos und ohne Anmeldung.",
  },
  form: {
    legend: "Ihre Angaben",
    gross: "Bruttolohn",
    monthly: "Monat",
    annual: "Jahr",
    thirteenth: "13. Monatslohn",
    thirteenthHint: "Auszahlung in 13 Teilen",
    age: "Alter",
    ageUnder25: "unter 25",
    canton: "Kanton",
    cantonPlaceholder: "Kanton wählen",
    marital: "Zivilstand",
    single: "Ledig",
    married: "Verheiratet",
    doubleIncome: "Doppelverdiener",
    doubleIncomeHint: "Beide Partner erwerbstätig",
    children: "Kinder",
    childrenHint: "Kinderzulagen & Steuerabzüge",
    church: "Kirchensteuer",
    churchHint: "Mitglied einer Landeskirche",
    churchNone: "Im Kanton keine Kirchensteuer im Tarif",
    churchAlways: "Im Kanton JU immer im Tarif enthalten",
    permit: "Aufenthaltsstatus",
    permitCH: "CH / Niederlassung C",
    permitBL: "Ausweis B / L",
    permitHint: "B/L: Quellensteuer direkt vom Lohn",
    advanced: "Erweiterte Annahmen",
    nbu: "NBU-Beitrag",
    nbuHint: "Nichtberufsunfall, 0.7–1.7% je nach Arbeitgeber",
    ktg: "KTG-Beitrag",
    ktgHint: "Krankentaggeld, oft vom Arbeitgeber übernommen",
    bvgShare: "BVG-Anteil Arbeitnehmer",
    bvgShareHint: "Gesetzlich max. 50%, viele Kassen zahlen mehr",
  },
  results: {
    netMonthly: "Nettolohn auf der Abrechnung",
    netMonthlyQst: "Nettolohn nach Quellensteuer",
    perMonth: "pro Monat",
    ofGross: "vom Brutto",
    netAnnual: "pro Jahr",
    afterTax: "Nach Einkommenssteuern",
    afterTaxHint:
      "Steuern werden separat veranlagt. So viel bleibt effektiv verfügbar.",
    taxWithheld: "Quellensteuer ist im Abzug enthalten.",
    deductions: "Abzüge",
    item: "Position",
    rate: "Satz",
    monthlyCol: "Monat",
    annualCol: "Jahr",
    grossLabel: "Bruttolohn",
    ahv: "AHV / IV / EO",
    ahvHint: "Alters-, Hinterlassenen- & Invalidenversicherung",
    alv: "ALV",
    alvHint: "Arbeitslosenversicherung, bis 148'200",
    nbu: "NBU",
    nbuHint: "Nichtberufsunfallversicherung, bis 148'200",
    ktg: "KTG",
    ktgHint: "Krankentaggeldversicherung",
    bvg: "BVG (Pensionskasse)",
    bvgHint: "Berufliche Vorsorge, altersabhängig",
    bvgNone: "Unter der BVG-Eintrittsschwelle von 22'680",
    tax: "Steuerrückstellung",
    taxQst: "Quellensteuer",
    taxHint: "Bund, Kanton & Gemeinde (Hauptort)",
    totalDeductions: "Total Abzüge",
    childAllowance: "Kinderzulagen",
    childAllowanceHint: "Zulagen sind steuerbares Einkommen",
    composition: "So teilt sich Ihr Bruttolohn auf",
    net: "Netto",
    estimateNote:
      "Steuerbetrag geschätzt (Kantonshauptort, Durchschnittsabzüge). Verbindlich rechnet der offizielle Rechner:",
    qstNote:
      "Quellensteuer nach offiziellem ESTV-Tarif 2026. Verbindlich ist die Lohnabrechnung des Arbeitgebers:",
    estimateLink: "Steuerrechner ESTV",
    ceilingNote: "Plafonds berücksichtigt",
  },
  nav: {
    calculator: "Rechner",
    guide: "Ratgeber",
  },
  insights: {
    title: "Ihre Steuerhebel",
    pillar3a:
      "Maximalbetrag in die Säule 3a ({max}) einzahlen spart rund {savings} Steuern pro Jahr.",
    canton: "Gleiches Profil in {canton}: {gain} mehr Netto pro Jahr.",
    familyGapSingle:
      "{canton} besteuert Alleinstehende am härtesten: Sie zahlen {single}, ein Ehepaar mit zwei Kindern zahlt {family} beim gleichen Lohn.",
    familyGapFamily:
      "{canton} entlastet Familien stark: Sie zahlen {family}, Alleinstehende zahlen {single} beim gleichen Lohn.",
    church: "Die Kirchenmitgliedschaft kostet bei Ihrem Lohn rund {cost} pro Jahr.",
    qst13:
      "Der Monat mit dem 13. wird zum Doppelmonatssatz besteuert: {december} statt {normal}.",
    disclaimer: "Grobe Effekte aus den offiziellen Kurven 2026, keine Steuerberatung.",
    more: "Mehr im Ratgeber",
  },
  employer: {
    employeeTab: "Arbeitnehmer",
    employerTab: "Arbeitgeber",
    totalCost: "Totale Lohnkosten",
    totalCostHint: "Bruttolohn plus Arbeitgeberbeiträge",
    fak: "FAK (Familienzulagen)",
    bu: "BU (Berufsunfall)",
    onTop: "zusätzlich zum Brutto",
  },
  compare: {
    title: "Kantone im Vergleich",
    hint: "Netto pro Jahr bei Ihrem Profil, je Kantonshauptort",
    yourCanton: "Ihr Kanton",
    showAll: "Alle 26 Kantone",
    showLess: "Weniger anzeigen",
    rank: "Rang",
  },
  monetize: {
    adLabel: "Anzeige",
    partnerLabel: "Partner-Empfehlungen",
    pillar3aTitle: "Säule 3a optimieren",
    pillar3aDesc:
      "Bis 7'258 pro Jahr einzahlen und Steuern sparen. Apps im Vergleich.",
    pillar3aCta: "3a-Anbieter vergleichen",
    healthTitle: "Krankenkasse wechseln",
    healthDesc: "Prämien 2026 vergleichen und mehrere hundert Franken sparen.",
    healthCta: "Prämien vergleichen",
    relocationTitle: "Neu in der Schweiz?",
    relocationDesc: "Umzug, Versicherungen, Konto: die wichtigsten Schritte.",
    relocationCta: "Checkliste öffnen",
  },
  footer: {
    disclaimer:
      "Alle Angaben ohne Gewähr. Sozialversicherungen exakt nach Parametern 2026 (BSV); Steuern als Schätzung auf Basis der Kantonshauptorte.",
    sources: "Quellen: BSV, ESTV, AHV/IV",
    official: "Offizieller Steuerrechner",
    year: "Stand: 2026",
    madeIn: "Berechnet in Ihrem Browser",
  },
};

const en: Dict = {
  meta: {
    title: "Switzerland Net Salary Calculator 2026: Gross to Net",
    description:
      "Calculate your 2026 Swiss net salary for all 26 cantons: AHV, ALV, accident insurance, BVG pension, withholding tax and an income tax estimate. Fully transparent, every rate shown. Free, no sign-up.",
  },
  form: {
    legend: "Your details",
    gross: "Gross salary",
    monthly: "Month",
    annual: "Year",
    thirteenth: "13th salary",
    thirteenthHint: "Paid in 13 instalments",
    age: "Age",
    ageUnder25: "under 25",
    canton: "Canton",
    cantonPlaceholder: "Select canton",
    marital: "Marital status",
    single: "Single",
    married: "Married",
    doubleIncome: "Dual income",
    doubleIncomeHint: "Both partners employed",
    children: "Children",
    childrenHint: "Child allowances & tax deductions",
    church: "Church tax",
    churchHint: "Member of a recognised church",
    churchNone: "No church tax in this canton's tariff",
    churchAlways: "Always included in canton JU",
    permit: "Residence status",
    permitCH: "Swiss / C permit",
    permitBL: "B / L permit",
    permitHint: "B/L: tax withheld directly from salary",
    advanced: "Advanced assumptions",
    nbu: "NBU contribution",
    nbuHint: "Non-occupational accident, 0.7–1.7% depending on employer",
    ktg: "KTG contribution",
    ktgHint: "Daily sickness allowance, often employer-paid",
    bvgShare: "BVG employee share",
    bvgShareHint: "Max. 50% by law, many plans pay more",
  },
  results: {
    netMonthly: "Net salary on your payslip",
    netMonthlyQst: "Net salary after withholding tax",
    perMonth: "per month",
    ofGross: "of gross",
    netAnnual: "per year",
    afterTax: "After income tax",
    afterTaxHint:
      "Swiss residents pay income tax separately. This is what's actually left.",
    taxWithheld: "Withholding tax is included in the deductions.",
    deductions: "Deductions",
    item: "Item",
    rate: "Rate",
    monthlyCol: "Month",
    annualCol: "Year",
    grossLabel: "Gross salary",
    ahv: "AHV / IV / EO",
    ahvHint: "Old-age, survivors' & disability insurance",
    alv: "ALV",
    alvHint: "Unemployment insurance, up to 148'200",
    nbu: "NBU",
    nbuHint: "Non-occupational accident insurance, up to 148'200",
    ktg: "KTG",
    ktgHint: "Daily sickness allowance insurance",
    bvg: "BVG (pension fund)",
    bvgHint: "Occupational pension, age-dependent",
    bvgNone: "Below the BVG entry threshold of 22'680",
    tax: "Income tax reserve",
    taxQst: "Withholding tax",
    taxHint: "Federal, cantonal & communal (capital)",
    totalDeductions: "Total deductions",
    childAllowance: "Child allowances",
    childAllowanceHint: "Allowances are taxable income",
    composition: "How your gross salary splits",
    net: "Net",
    estimateNote:
      "Tax amount is an estimate (canton capital, average deductions). For binding figures use the official calculator:",
    qstNote:
      "Withholding tax per the official 2026 ESTV tariff. Your employer's payslip is binding:",
    estimateLink: "ESTV tax calculator",
    ceilingNote: "Ceilings applied",
  },
  nav: {
    calculator: "Calculator",
    guide: "Guide",
  },
  insights: {
    title: "Your tax levers",
    pillar3a: "Maxing your pillar 3a ({max}) saves about {savings} in tax per year.",
    canton: "Same profile in {canton}: {gain} more net per year.",
    familyGapSingle:
      "{canton} taxes singles hardest: you pay {single}, a married couple with two children pays {family} on the same salary.",
    familyGapFamily:
      "{canton} strongly favours families: you pay {family}, a single person pays {single} on the same salary.",
    church: "Church membership costs about {cost} per year at your salary.",
    qst13:
      "Your 13th-salary month is withheld at the double-month rate: {december} instead of {normal}.",
    disclaimer: "Rough effects from the official 2026 curves, not tax advice.",
    more: "More in the guide",
  },
  employer: {
    employeeTab: "Employee",
    employerTab: "Employer",
    totalCost: "Total cost of employment",
    totalCostHint: "Gross salary plus employer contributions",
    fak: "FAK (family allowance fund)",
    bu: "BU (occupational accident)",
    onTop: "on top of gross",
  },
  compare: {
    title: "Cantons compared",
    hint: "Net per year for your profile, per canton capital",
    yourCanton: "Your canton",
    showAll: "All 26 cantons",
    showLess: "Show less",
    rank: "Rank",
  },
  monetize: {
    adLabel: "Ad",
    partnerLabel: "Partner picks",
    pillar3aTitle: "Optimise pillar 3a",
    pillar3aDesc:
      "Pay in up to 7'258 per year and cut your taxes. Apps compared.",
    pillar3aCta: "Compare 3a providers",
    healthTitle: "Switch health insurance",
    healthDesc: "Compare 2026 premiums and save several hundred francs.",
    healthCta: "Compare premiums",
    relocationTitle: "New to Switzerland?",
    relocationDesc: "Moving, insurance, banking: the essential steps.",
    relocationCta: "Open the checklist",
  },
  footer: {
    disclaimer:
      "No guarantee for any figures. Social insurance follows exact 2026 parameters (BSV); taxes are estimated from canton-capital data.",
    sources: "Sources: BSV, ESTV, AHV/IV",
    official: "Official tax calculator",
    year: "As of 2026",
    madeIn: "Computed in your browser",
  },
};

const fr: Dict = {
  meta: {
    title: "Calculateur salaire net Suisse 2026 : du brut au net",
    description:
      "Calculez votre salaire net 2026 pour les 26 cantons : AVS, AC, AANP, LPP, impôt à la source et estimation fiscale. Transparent, tous les taux affichés. Gratuit, sans inscription.",
  },
  form: {
    legend: "Vos données",
    gross: "Salaire brut",
    monthly: "Mois",
    annual: "Année",
    thirteenth: "13e salaire",
    thirteenthHint: "Versé en 13 mensualités",
    age: "Âge",
    ageUnder25: "moins de 25",
    canton: "Canton",
    cantonPlaceholder: "Choisir le canton",
    marital: "État civil",
    single: "Célibataire",
    married: "Marié·e",
    doubleIncome: "Double revenu",
    doubleIncomeHint: "Les deux partenaires travaillent",
    children: "Enfants",
    childrenHint: "Allocations familiales & déductions",
    church: "Impôt ecclésiastique",
    churchHint: "Membre d'une Église reconnue",
    churchNone: "Pas d'impôt ecclésiastique dans le barème cantonal",
    churchAlways: "Toujours inclus dans le canton du Jura",
    permit: "Statut de séjour",
    permitCH: "Suisse / permis C",
    permitBL: "Permis B / L",
    permitHint: "B/L : impôt prélevé à la source",
    advanced: "Hypothèses avancées",
    nbu: "Cotisation AANP",
    nbuHint: "Accidents non professionnels, 0.7–1.7% selon l'employeur",
    ktg: "Cotisation IJM",
    ktgHint: "Indemnités journalières maladie, souvent payées par l'employeur",
    bvgShare: "Part LPP de l'employé",
    bvgShareHint: "Max. 50% selon la loi, souvent moins",
  },
  results: {
    netMonthly: "Salaire net sur la fiche de paie",
    netMonthlyQst: "Salaire net après impôt à la source",
    perMonth: "par mois",
    ofGross: "du brut",
    netAnnual: "par an",
    afterTax: "Après impôts sur le revenu",
    afterTaxHint:
      "Les impôts sont taxés séparément. Voici ce qui reste réellement.",
    taxWithheld: "L'impôt à la source est inclus dans les retenues.",
    deductions: "Retenues",
    item: "Poste",
    rate: "Taux",
    monthlyCol: "Mois",
    annualCol: "Année",
    grossLabel: "Salaire brut",
    ahv: "AVS / AI / APG",
    ahvHint: "Assurance vieillesse, survivants et invalidité",
    alv: "AC",
    alvHint: "Assurance chômage, jusqu'à 148'200",
    nbu: "AANP",
    nbuHint: "Accidents non professionnels, jusqu'à 148'200",
    ktg: "IJM",
    ktgHint: "Indemnités journalières en cas de maladie",
    bvg: "LPP (caisse de pension)",
    bvgHint: "Prévoyance professionnelle, selon l'âge",
    bvgNone: "Sous le seuil d'entrée LPP de 22'680",
    tax: "Provision pour impôts",
    taxQst: "Impôt à la source",
    taxHint: "Confédération, canton & commune (chef-lieu)",
    totalDeductions: "Total des retenues",
    childAllowance: "Allocations familiales",
    childAllowanceHint: "Les allocations sont un revenu imposable",
    composition: "Répartition de votre salaire brut",
    net: "Net",
    estimateNote:
      "Montant d'impôt estimé (chef-lieu, déductions moyennes). Pour un calcul officiel :",
    qstNote:
      "Impôt à la source selon le barème officiel AFC 2026. Le décompte de l'employeur fait foi :",
    estimateLink: "Calculateur AFC",
    ceilingNote: "Plafonds appliqués",
  },
  nav: {
    calculator: "Calculateur",
    guide: "Guide",
  },
  insights: {
    title: "Vos leviers fiscaux",
    pillar3a:
      "Verser le maximum au pilier 3a ({max}) économise env. {savings} d'impôts par an.",
    canton: "Même profil à {canton} : {gain} de net en plus par an.",
    familyGapSingle:
      "{canton} impose le plus durement les célibataires : vous payez {single}, un couple marié avec deux enfants paie {family} à salaire égal.",
    familyGapFamily:
      "{canton} allège fortement les familles : vous payez {family}, une personne seule paie {single} à salaire égal.",
    church: "L'appartenance à une Église coûte env. {cost} par an à votre salaire.",
    qst13:
      "Le mois du 13e salaire est retenu au taux du mois double : {december} au lieu de {normal}.",
    disclaimer:
      "Effets approximatifs selon les courbes officielles 2026, pas un conseil fiscal.",
    more: "Plus dans le guide",
  },
  employer: {
    employeeTab: "Employé·e",
    employerTab: "Employeur",
    totalCost: "Coût total de l'emploi",
    totalCostHint: "Salaire brut plus charges patronales",
    fak: "CAF (allocations familiales)",
    bu: "AP (accidents professionnels)",
    onTop: "en plus du brut",
  },
  compare: {
    title: "Cantons comparés",
    hint: "Net par an pour votre profil, par chef-lieu",
    yourCanton: "Votre canton",
    showAll: "Les 26 cantons",
    showLess: "Réduire",
    rank: "Rang",
  },
  monetize: {
    adLabel: "Publicité",
    partnerLabel: "Recommandations",
    pillar3aTitle: "Optimiser le pilier 3a",
    pillar3aDesc:
      "Versez jusqu'à 7'258 par an et réduisez vos impôts. Comparatif des apps.",
    pillar3aCta: "Comparer les offres 3a",
    healthTitle: "Changer de caisse maladie",
    healthDesc: "Comparez les primes 2026 et économisez plusieurs centaines de francs.",
    healthCta: "Comparer les primes",
    relocationTitle: "Nouveau en Suisse ?",
    relocationDesc: "Déménagement, assurances, compte : l'essentiel.",
    relocationCta: "Ouvrir la checklist",
  },
  footer: {
    disclaimer:
      "Toutes les indications sans garantie. Assurances sociales selon les paramètres exacts 2026 (OFAS) ; impôts estimés sur la base des chefs-lieux.",
    sources: "Sources : OFAS, AFC, AVS/AI",
    official: "Calculateur fiscal officiel",
    year: "État : 2026",
    madeIn: "Calculé dans votre navigateur",
  },
};

const it: Dict = {
  meta: {
    title: "Calcolatore stipendio netto Svizzera 2026: dal lordo al netto",
    description:
      "Calcola il tuo stipendio netto 2026 per tutti i 26 cantoni: AVS, AD, AINP, LPP, imposta alla fonte e stima fiscale. Trasparente, con tutte le aliquote. Gratuito, senza registrazione.",
  },
  form: {
    legend: "I tuoi dati",
    gross: "Stipendio lordo",
    monthly: "Mese",
    annual: "Anno",
    thirteenth: "13a mensilità",
    thirteenthHint: "Pagamento in 13 rate",
    age: "Età",
    ageUnder25: "meno di 25",
    canton: "Cantone",
    cantonPlaceholder: "Scegli il cantone",
    marital: "Stato civile",
    single: "Celibe/nubile",
    married: "Sposato/a",
    doubleIncome: "Doppio reddito",
    doubleIncomeHint: "Entrambi i partner lavorano",
    children: "Figli",
    childrenHint: "Assegni familiari e deduzioni",
    church: "Imposta di culto",
    churchHint: "Membro di una Chiesa riconosciuta",
    churchNone: "Nessuna imposta di culto nella tariffa cantonale",
    churchAlways: "Sempre inclusa nel canton Giura",
    permit: "Statuto di soggiorno",
    permitCH: "Svizzera / permesso C",
    permitBL: "Permesso B / L",
    permitHint: "B/L: imposta trattenuta alla fonte",
    advanced: "Ipotesi avanzate",
    nbu: "Contributo AINP",
    nbuHint: "Infortuni non professionali, 0.7–1.7% secondo il datore",
    ktg: "Contributo IGM",
    ktgHint: "Indennità giornaliera malattia, spesso a carico del datore",
    bvgShare: "Quota LPP del dipendente",
    bvgShareHint: "Max. 50% per legge",
  },
  results: {
    netMonthly: "Stipendio netto in busta paga",
    netMonthlyQst: "Netto dopo l'imposta alla fonte",
    perMonth: "al mese",
    ofGross: "del lordo",
    netAnnual: "all'anno",
    afterTax: "Dopo le imposte sul reddito",
    afterTaxHint:
      "Le imposte si pagano separatamente. Questo è ciò che resta davvero.",
    taxWithheld: "L'imposta alla fonte è inclusa nelle trattenute.",
    deductions: "Trattenute",
    item: "Voce",
    rate: "Aliquota",
    monthlyCol: "Mese",
    annualCol: "Anno",
    grossLabel: "Stipendio lordo",
    ahv: "AVS / AI / IPG",
    ahvHint: "Assicurazione vecchiaia, superstiti e invalidità",
    alv: "AD",
    alvHint: "Assicurazione disoccupazione, fino a 148'200",
    nbu: "AINP",
    nbuHint: "Infortuni non professionali, fino a 148'200",
    ktg: "IGM",
    ktgHint: "Indennità giornaliera di malattia",
    bvg: "LPP (cassa pensioni)",
    bvgHint: "Previdenza professionale, secondo l'età",
    bvgNone: "Sotto la soglia d'entrata LPP di 22'680",
    tax: "Riserva per imposte",
    taxQst: "Imposta alla fonte",
    taxHint: "Confederazione, cantone e comune (capoluogo)",
    totalDeductions: "Totale trattenute",
    childAllowance: "Assegni familiari",
    childAllowanceHint: "Gli assegni sono reddito imponibile",
    composition: "Come si divide il tuo stipendio lordo",
    net: "Netto",
    estimateNote:
      "Imposta stimata (capoluogo, deduzioni medie). Per il calcolo ufficiale:",
    qstNote:
      "Imposta alla fonte secondo la tariffa ufficiale AFC 2026. Fa stato il conteggio del datore di lavoro:",
    estimateLink: "Calcolatore AFC",
    ceilingNote: "Massimali applicati",
  },
  nav: {
    calculator: "Calcolatore",
    guide: "Guida",
  },
  insights: {
    title: "Le tue leve fiscali",
    pillar3a:
      "Versare il massimo nel pilastro 3a ({max}) fa risparmiare circa {savings} di imposte all'anno.",
    canton: "Stesso profilo a {canton}: {gain} di netto in più all'anno.",
    familyGapSingle:
      "{canton} tassa più duramente i single: paghi {single}, una coppia sposata con due figli paga {family} a parità di stipendio.",
    familyGapFamily:
      "{canton} alleggerisce molto le famiglie: paghi {family}, un single paga {single} a parità di stipendio.",
    church: "L'appartenenza alla Chiesa costa circa {cost} all'anno al tuo stipendio.",
    qst13:
      "Il mese della tredicesima è trattenuto al tasso del mese doppio: {december} invece di {normal}.",
    disclaimer:
      "Effetti approssimativi dalle curve ufficiali 2026, non è consulenza fiscale.",
    more: "Di più nella guida",
  },
  employer: {
    employeeTab: "Dipendente",
    employerTab: "Datore di lavoro",
    totalCost: "Costo totale del lavoro",
    totalCostHint: "Stipendio lordo più contributi del datore",
    fak: "CAF (assegni familiari)",
    bu: "IP (infortuni professionali)",
    onTop: "oltre al lordo",
  },
  compare: {
    title: "Cantoni a confronto",
    hint: "Netto annuo per il tuo profilo, per capoluogo",
    yourCanton: "Il tuo cantone",
    showAll: "Tutti i 26 cantoni",
    showLess: "Mostra meno",
    rank: "Posizione",
  },
  monetize: {
    adLabel: "Annuncio",
    partnerLabel: "Consigli dei partner",
    pillar3aTitle: "Ottimizza il pilastro 3a",
    pillar3aDesc:
      "Versa fino a 7'258 all'anno e risparmia sulle imposte. App a confronto.",
    pillar3aCta: "Confronta i fornitori 3a",
    healthTitle: "Cambia cassa malati",
    healthDesc: "Confronta i premi 2026 e risparmia centinaia di franchi.",
    healthCta: "Confronta i premi",
    relocationTitle: "Nuovo in Svizzera?",
    relocationDesc: "Trasloco, assicurazioni, conto: i passi essenziali.",
    relocationCta: "Apri la checklist",
  },
  footer: {
    disclaimer:
      "Tutte le indicazioni senza garanzia. Assicurazioni sociali secondo i parametri esatti 2026 (UFAS); imposte stimate sulla base dei capoluoghi.",
    sources: "Fonti: UFAS, AFC, AVS/AI",
    official: "Calcolatore fiscale ufficiale",
    year: "Stato: 2026",
    madeIn: "Calcolato nel tuo browser",
  },
};

export const DICTS: Record<Locale, Dict> = { de, en, fr, it };

export function isLocale(v: string): v is Locale {
  return (LOCALES as readonly string[]).includes(v);
}
