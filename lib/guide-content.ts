import type { Locale } from "./i18n";

/**
 * Tax-optimisation guide copy, all four locales. Numbers quoted in the prose
 * come from the official 2026 data the engine runs on (ESTV curves, QST
 * tariff files, BSV allowance table); keep them in sync when the yearly
 * data refresh changes them materially. The two tables are computed live
 * from TAX_CURVES in the page, so they update themselves.
 */
export interface GuideSection {
  id: "pillar-3a" | "canton" | "family" | "church" | "withholding" | "limits";
  heading: string;
  body: string[];
  /** Ranking table rendered after the first paragraph. */
  table?: "single" | "family";
  /** "See it with your numbers" link back to the calculator. */
  tryLabel?: string;
  /** Query string appended to /{locale} (empty = plain calculator). */
  tryQuery?: string;
}

export interface GuideContent {
  metaTitle: string;
  metaDescription: string;
  title: string;
  intro: string;
  tableSingle: { caption: string };
  tableFamily: { caption: string };
  cheapest: string;
  priciest: string;
  dataNote: string;
  sections: GuideSection[];
}

export const GUIDE: Record<Locale, GuideContent> = {
  de: {
    metaTitle: "Steuern optimieren in der Schweiz 2026: die 6 Hebel | netto.",
    metaDescription:
      "Säule 3a, Kantonswahl, Familie, Kirchensteuer, Quellensteuer: was 2026 wirklich zählt, mit offiziellen Zahlen für alle 26 Kantonshauptorte.",
    title: "Sechs Hebel, die Ihr Netto wirklich bewegen",
    intro:
      "Steueroptimierung in der Schweiz ist kein Geheimwissen. Es sind sechs Hebel, und jeder Abschnitt rechnet mit den offiziellen Zahlen 2026, auf denen auch dieser Rechner läuft.",
    tableSingle: { caption: "Einkommenssteuer bei CHF 100'000, ledig, ohne Kirche (Hauptort, 2026)" },
    tableFamily: { caption: "Einkommenssteuer bei CHF 100'000, verheiratet, zwei Kinder (Hauptort, 2026)" },
    cheapest: "am günstigsten",
    priciest: "am teuersten",
    dataNote: "Alle Sätze: offizielle Daten ESTV/BSV, Steuerjahr 2026. Stand 04.07.2026.",
    sections: [
      {
        id: "pillar-3a",
        heading: "Säule 3a: der erste Franken der Optimierung",
        body: [
          "Wer einer Pensionskasse angehört, darf 2026 bis zu CHF 7'258 in die Säule 3a einzahlen. Der Betrag geht direkt vom steuerbaren Einkommen weg. Gespart wird also zum Grenzsteuersatz, und der steigt mit Einkommen und kantonaler Progression.",
          "Bei CHF 100'000 in Zürich sind das rund CHF 1'540 pro Jahr, bei CHF 150'000 in Genf über CHF 2'200. Der Rechner zeigt den Betrag für Ihr eigenes Profil.",
          "Quellenbesteuert (B/L-Bewilligung)? Der Abzug wirkt trotzdem: via Tarifkorrektur oder nachträglicher ordentlicher Veranlagung, Antrag bis 31. März des Folgejahres.",
        ],
        tryLabel: "Ihre 3a-Ersparnis im Rechner",
        tryQuery: "",
      },
      {
        id: "canton",
        heading: "Der Kanton ist der grösste einzelne Hebel",
        body: [
          "Gleicher Lohn, gleiches Profil. Die Hauptorte besteuern ihn trotzdem sehr unterschiedlich:",
          "Wer innerhalb der Schweiz umzieht, versteuert das ganze Jahr in der Regel dort, wo er am 31. Dezember wohnt. Die Quellensteuer folgt dem Wohnsitz dagegen Monat für Monat.",
        ],
        table: "single",
        tryLabel: "Alle 26 Kantone für Ihr Profil",
        tryQuery: "",
      },
      {
        id: "family",
        heading: "In manchen Kantonen versetzen Heirat und Kinder Berge",
        body: [
          "Kantone mit Vollsplitting oder Familienquotient (GE, VD, FR, VS) entlasten Einverdiener-Familien dramatisch:",
          "Genf ist das Lehrbuchbeispiel: Bei CHF 9'750 pro Monat werden Ledigen an der Quelle 15.3% abgezogen, verheirateten Alleinverdienern mit zwei Kindern 2.1%.",
          "Die Kehrseite: Ehepaare werden gemeinsam besteuert, das zweite Einkommen startet beim Grenzsteuersatz des Haushalts. Der Doppelverdiener-Modus des Rechners modelliert einen 50/50-Haushalt.",
        ],
        table: "family",
        tryLabel: "Der Genfer Familienfall",
        tryQuery: "?c=GE&m=1&k=2&q=1",
      },
      {
        id: "church",
        heading: "Kirchensteuer ist ein Mitgliederbeitrag",
        body: [
          "Mitglieder zahlen einen Kirchgemeinde-Zuschlag auf die Kantonssteuer: bei CHF 100'000 rund CHF 480 pro Jahr in Zürich, etwa CHF 820 in Luzern. Der Austritt beendet ihn (in den meisten Kantonen ein formloser Brief).",
          "GE, NE und TI erheben von Privatpersonen keine obligatorische Kirchensteuer; in VD und VS werden die Kirchen aus dem allgemeinen Haushalt finanziert, da gibt es nichts abzuwählen. Im JU ist die Abgabe im Quellensteuertarif immer enthalten.",
        ],
      },
      {
        id: "withholding",
        heading: "Mit B/L-Bewilligung entscheidet der Tarifcode",
        body: [
          "Quellensteuer ist ein Tabellen-Lookup: A (ledig), B (verheiratet, ein Einkommen), C (verheiratet, zwei Einkommen) oder H (alleinerziehend), dazu Kinderzahl und Kirchen-Flag. Jeder Kanton publiziert seine eigene Tabelle; diese App enthält die offiziellen Dateien 2026.",
          "In Monatsmodell-Kantonen wird der Monat mit dem 13. zum Doppelmonatssatz besteuert: in Zürich 16.0% statt 8.7% bei CHF 8'000. FR, GE, TI, VD und VS glätten das mit dem Jahresmodell.",
          "Über CHF 120'000 pro Jahr folgt zwingend die nachträgliche ordentliche Veranlagung. Darunter kann sich der freiwillige Antrag lohnen, sobald Abzüge da sind: Säule 3a, Pendeln, Weiterbildung. Frist: 31. März.",
        ],
        tryLabel: "Ihre Quellensteuer prüfen",
        tryQuery: "?q=1",
      },
      {
        id: "limits",
        heading: "Was dieser Ratgeber auslässt",
        body: [
          "Alle Zahlen gelten für den Kantonshauptort; der Steuerfuss Ihrer Gemeinde verschiebt die Rechnung in beide Richtungen. Die Kurven unterstellen Standardabzüge und ignorieren die Vermögenssteuer.",
          "Pensionskassen-Einkäufe sind der andere grosse Abzugshebel: wirkungsvoll, aber zu individuell für eine Pauschalzahl. Verbindlich rechnet der offizielle ESTV-Rechner oder eine Steuerfachperson.",
        ],
      },
    ],
  },

  en: {
    metaTitle: "Tax optimisation in Switzerland 2026: the 6 levers | netto.",
    metaDescription:
      "Pillar 3a, canton choice, family, church tax, withholding: what actually matters in 2026, with official numbers for all 26 canton capitals.",
    title: "Six levers that actually move your net salary",
    intro:
      "Swiss tax optimisation is not secret knowledge. It is six levers, and every section below runs on the official 2026 numbers this calculator is built on.",
    tableSingle: { caption: "Income tax at CHF 100'000, single, no church (capital city, 2026)" },
    tableFamily: { caption: "Income tax at CHF 100'000, married, two children (capital city, 2026)" },
    cheapest: "cheapest",
    priciest: "most expensive",
    dataNote: "All rates: official ESTV/BSV data, tax year 2026. As of 04.07.2026.",
    sections: [
      {
        id: "pillar-3a",
        heading: "Pillar 3a: the first franc of optimisation",
        body: [
          "Anyone with a pension fund may pay up to CHF 7'258 into pillar 3a in 2026. The contribution comes straight off your taxable income, so it saves at your marginal rate. That rate grows with income and your canton's progression.",
          "At CHF 100'000 in Zurich that is worth about CHF 1'540 a year; at CHF 150'000 in Geneva, over CHF 2'200. The calculator shows the number for your own profile.",
          "On withholding tax (B/L permit)? The deduction still works: via a tariff correction or retroactive ordinary assessment, requested by 31 March of the following year.",
        ],
        tryLabel: "See your own 3a saving",
        tryQuery: "",
      },
      {
        id: "canton",
        heading: "The canton is the biggest single lever",
        body: [
          "Same salary, same household. The capitals still tax it very differently:",
          "If you move within Switzerland, ordinary taxation for the whole year generally follows where you live on 31 December. Withholding tax instead follows your residence month by month.",
        ],
        table: "single",
        tryLabel: "Rank all 26 cantons for your profile",
        tryQuery: "",
      },
      {
        id: "family",
        heading: "In some cantons, marriage and children move mountains",
        body: [
          "Cantons with full splitting or a family quotient (GE, VD, FR, VS) relieve single-earner families dramatically:",
          "Geneva is the textbook case: at CHF 9'750 a month, a single person is withheld 15.3% at source, a married sole earner with two children 2.1%.",
          "The flip side: spouses are taxed jointly, so a second income starts at the household's marginal rate. The calculator's two-earner mode models a 50/50 household.",
        ],
        table: "family",
        tryLabel: "Try the Geneva family case",
        tryQuery: "?c=GE&m=1&k=2&q=1",
      },
      {
        id: "church",
        heading: "Church tax is a membership fee",
        body: [
          "Members pay a parish surcharge on the cantonal tax: at CHF 100'000 roughly CHF 480 a year in Zurich, about CHF 820 in Lucerne. Leaving the church ends it (a formal letter in most cantons).",
          "GE, NE and TI collect no compulsory church tax from individuals; in VD and VS the churches are financed from the general budget, so there is nothing to opt out of. In JU the levy is always part of the withholding tariff.",
        ],
      },
      {
        id: "withholding",
        heading: "On a B/L permit, the tariff code decides",
        body: [
          "Withholding is a table lookup: A (single), B (married, one income), C (married, two incomes) or H (single parent), plus the number of children and a church flag. Every canton publishes its own table; this app embeds the official 2026 files.",
          "In month-model cantons, the month with your 13th salary is withheld at the double-month rate: in Zurich 16.0% instead of 8.7% at CHF 8'000. FR, GE, TI, VD and VS smooth this by annualising the rate.",
          "Earning over CHF 120'000 a year triggers a mandatory retroactive ordinary assessment. Below that, filing voluntarily can pay off once you have deductions: pillar 3a, commuting, further training. Deadline: 31 March.",
        ],
        tryLabel: "Check your withholding",
        tryQuery: "?q=1",
      },
      {
        id: "limits",
        heading: "What this guide leaves out",
        body: [
          "All figures use the canton capital; your commune's multiplier shifts the bill in either direction. The curves assume standard deductions and ignore wealth tax.",
          "Pension-fund buy-ins are the other big deductible lever: powerful, but too personal for a single headline number. For binding figures, use the official ESTV calculator or a tax professional.",
        ],
      },
    ],
  },

  fr: {
    metaTitle: "Optimiser ses impôts en Suisse 2026 : les 6 leviers | netto.",
    metaDescription:
      "Pilier 3a, choix du canton, famille, impôt ecclésiastique, impôt à la source : ce qui compte vraiment en 2026, avec les chiffres officiels des 26 chefs-lieux.",
    title: "Six leviers qui bougent vraiment votre salaire net",
    intro:
      "L'optimisation fiscale suisse n'a rien d'ésotérique : ce sont six leviers. Chaque section s'appuie sur les chiffres officiels 2026 qui font tourner ce calculateur.",
    tableSingle: { caption: "Impôt sur le revenu à CHF 100'000, célibataire, sans église (chef-lieu, 2026)" },
    tableFamily: { caption: "Impôt sur le revenu à CHF 100'000, marié·e, deux enfants (chef-lieu, 2026)" },
    cheapest: "les moins chers",
    priciest: "les plus chers",
    dataNote: "Tous les taux : données officielles AFC/OFAS, année fiscale 2026. État au 04.07.2026.",
    sections: [
      {
        id: "pillar-3a",
        heading: "Pilier 3a : le premier franc d'optimisation",
        body: [
          "Toute personne affiliée à une caisse de pension peut verser jusqu'à CHF 7'258 au pilier 3a en 2026. Le montant se déduit directement du revenu imposable : l'économie se fait au taux marginal, qui grimpe avec le revenu et la progression cantonale.",
          "À CHF 100'000 à Zurich, cela vaut environ CHF 1'540 par an ; à CHF 150'000 à Genève, plus de CHF 2'200. Le calculateur affiche le montant pour votre propre profil.",
          "Imposé·e à la source (permis B/L) ? La déduction fonctionne quand même : via une rectification du barème ou une taxation ordinaire ultérieure, à demander avant le 31 mars de l'année suivante.",
        ],
        tryLabel: "Votre économie 3a dans le calculateur",
        tryQuery: "",
      },
      {
        id: "canton",
        heading: "Le canton est le plus grand levier individuel",
        body: [
          "Même salaire, même ménage. Les chefs-lieux ne l'imposent pourtant pas du tout pareil :",
          "En cas de déménagement en Suisse, l'imposition ordinaire de toute l'année suit en principe le domicile au 31 décembre. L'impôt à la source, lui, suit le domicile mois par mois.",
        ],
        table: "single",
        tryLabel: "Classer les 26 cantons pour votre profil",
        tryQuery: "",
      },
      {
        id: "family",
        heading: "Dans certains cantons, mariage et enfants déplacent des montagnes",
        body: [
          "Les cantons à splitting intégral ou quotient familial (GE, VD, FR, VS) allègent massivement les familles à revenu unique :",
          "Genève est le cas d'école : à CHF 9'750 par mois, une personne seule se voit retenir 15.3% à la source, un soutien de famille marié avec deux enfants 2.1%.",
          "Le revers : les époux sont imposés ensemble, le deuxième revenu démarre donc au taux marginal du ménage. Le mode double revenu du calculateur modélise un ménage 50/50.",
        ],
        table: "family",
        tryLabel: "Essayer le cas genevois",
        tryQuery: "?c=GE&m=1&k=2&q=1",
      },
      {
        id: "church",
        heading: "L'impôt ecclésiastique est une cotisation de membre",
        body: [
          "Les membres paient un supplément paroissial sur l'impôt cantonal : à CHF 100'000, environ CHF 480 par an à Zurich, CHF 820 à Lucerne. Quitter l'Église y met fin (une simple lettre dans la plupart des cantons).",
          "GE, NE et TI ne prélèvent pas d'impôt ecclésiastique obligatoire auprès des particuliers ; dans VD et VS, les Églises sont financées par le budget général, il n'y a rien à désactiver. Dans le JU, la contribution fait toujours partie du barème de l'impôt à la source.",
        ],
      },
      {
        id: "withholding",
        heading: "Avec un permis B/L, le code du barème décide",
        body: [
          "L'impôt à la source est une lecture de table : A (célibataire), B (marié·e, un revenu), C (marié·e, deux revenus) ou H (parent seul), plus le nombre d'enfants et l'indicateur d'église. Chaque canton publie son propre barème ; cette app embarque les fichiers officiels 2026.",
          "Dans les cantons au modèle mensuel, le mois du 13e salaire est retenu au taux du mois double : à Zurich 16.0% au lieu de 8.7% à CHF 8'000. FR, GE, TI, VD et VS lissent cela en annualisant le taux.",
          "Au-delà de CHF 120'000 par an, la taxation ordinaire ultérieure est obligatoire. En dessous, la demande volontaire peut payer dès qu'il y a des déductions : pilier 3a, trajets, formation continue. Délai : 31 mars.",
        ],
        tryLabel: "Vérifier votre impôt à la source",
        tryQuery: "?q=1",
      },
      {
        id: "limits",
        heading: "Ce que ce guide laisse de côté",
        body: [
          "Tous les chiffres valent pour le chef-lieu ; le coefficient de votre commune déplace la facture dans les deux sens. Les courbes supposent des déductions standard et ignorent l'impôt sur la fortune.",
          "Les rachats de caisse de pension sont l'autre grand levier déductible : puissant, mais trop personnel pour un chiffre unique. Pour un calcul officiel : le calculateur AFC ou un·e fiscaliste.",
        ],
      },
    ],
  },

  it: {
    metaTitle: "Ottimizzare le imposte in Svizzera 2026: le 6 leve | netto.",
    metaDescription:
      "Pilastro 3a, scelta del cantone, famiglia, imposta di culto, imposta alla fonte: cosa conta davvero nel 2026, con i numeri ufficiali dei 26 capoluoghi.",
    title: "Sei leve che muovono davvero il tuo netto",
    intro:
      "L'ottimizzazione fiscale svizzera non è sapere segreto: sono sei leve. Ogni sezione usa i numeri ufficiali 2026 su cui gira questo calcolatore.",
    tableSingle: { caption: "Imposta sul reddito a CHF 100'000, single, senza chiesa (capoluogo, 2026)" },
    tableFamily: { caption: "Imposta sul reddito a CHF 100'000, coniugati, due figli (capoluogo, 2026)" },
    cheapest: "i più convenienti",
    priciest: "i più cari",
    dataNote: "Tutte le aliquote: dati ufficiali AFC/UFAS, anno fiscale 2026. Stato: 04.07.2026.",
    sections: [
      {
        id: "pillar-3a",
        heading: "Pilastro 3a: il primo franco di ottimizzazione",
        body: [
          "Chi è affiliato a una cassa pensioni può versare fino a CHF 7'258 nel pilastro 3a nel 2026. L'importo si deduce direttamente dal reddito imponibile: il risparmio avviene all'aliquota marginale, che cresce con il reddito e la progressione cantonale.",
          "A CHF 100'000 a Zurigo vale circa CHF 1'540 all'anno; a CHF 150'000 a Ginevra, oltre CHF 2'200. Il calcolatore mostra la cifra per il tuo profilo.",
          "Tassato alla fonte (permesso B/L)? La deduzione funziona comunque: tramite correzione della tariffa o tassazione ordinaria ulteriore, da richiedere entro il 31 marzo dell'anno successivo.",
        ],
        tryLabel: "Il tuo risparmio 3a nel calcolatore",
        tryQuery: "",
      },
      {
        id: "canton",
        heading: "Il cantone è la leva singola più grande",
        body: [
          "Stesso stipendio, stessa famiglia. Eppure i capoluoghi lo tassano in modo molto diverso:",
          "Chi trasloca all'interno della Svizzera paga di regola l'intero anno dove abita il 31 dicembre (tassazione ordinaria). L'imposta alla fonte segue invece il domicilio mese per mese.",
        ],
        table: "single",
        tryLabel: "Classifica i 26 cantoni per il tuo profilo",
        tryQuery: "",
      },
      {
        id: "family",
        heading: "In alcuni cantoni matrimonio e figli spostano montagne",
        body: [
          "I cantoni con splitting integrale o quoziente familiare (GE, VD, FR, VS) alleggeriscono drasticamente le famiglie monoreddito:",
          "Ginevra è il caso da manuale: a CHF 9'750 al mese, a un single viene trattenuto il 15.3% alla fonte, a un coniugato monoreddito con due figli il 2.1%.",
          "Il rovescio: i coniugi sono tassati insieme, quindi il secondo reddito parte dall'aliquota marginale della famiglia. La modalità doppio reddito del calcolatore modella una famiglia 50/50.",
        ],
        table: "family",
        tryLabel: "Prova il caso ginevrino",
        tryQuery: "?c=GE&m=1&k=2&q=1",
      },
      {
        id: "church",
        heading: "L'imposta di culto è una quota associativa",
        body: [
          "I membri pagano un supplemento parrocchiale sull'imposta cantonale: a CHF 100'000 circa CHF 480 all'anno a Zurigo, CHF 820 a Lucerna. Uscire dalla Chiesa la termina (nella maggior parte dei cantoni basta una lettera).",
          "GE, NE e TI non riscuotono imposta di culto obbligatoria dai privati; in VD e VS le Chiese sono finanziate dal bilancio generale, non c'è nulla da disattivare. Nel JU il prelievo fa sempre parte della tariffa alla fonte.",
        ],
      },
      {
        id: "withholding",
        heading: "Con permesso B/L decide il codice tariffa",
        body: [
          "L'imposta alla fonte è una lettura di tabella: A (single), B (coniugati, un reddito), C (coniugati, due redditi) o H (genitore solo), più il numero di figli e l'indicatore chiesa. Ogni cantone pubblica la propria tabella; questa app contiene i file ufficiali 2026.",
          "Nei cantoni a modello mensile, il mese della tredicesima è trattenuto al tasso del mese doppio: a Zurigo 16.0% invece di 8.7% a CHF 8'000. FR, GE, TI, VD e VS lo attenuano annualizzando il tasso.",
          "Oltre CHF 120'000 all'anno scatta la tassazione ordinaria ulteriore obbligatoria. Sotto, la richiesta volontaria può convenire appena ci sono deduzioni: pilastro 3a, pendolarismo, formazione. Termine: 31 marzo.",
        ],
        tryLabel: "Controlla la tua imposta alla fonte",
        tryQuery: "?q=1",
      },
      {
        id: "limits",
        heading: "Cosa questa guida tralascia",
        body: [
          "Tutte le cifre valgono per il capoluogo; il moltiplicatore del tuo comune sposta il conto in entrambe le direzioni. Le curve presumono deduzioni standard e ignorano l'imposta sulla sostanza.",
          "I riscatti nella cassa pensioni sono l'altra grande leva deducibile: potente, ma troppo personale per una cifra unica. Per un calcolo vincolante: il calcolatore AFC o un fiscalista.",
        ],
      },
    ],
  },
};
