// ============================================================
//  NAIJA'S NUMBERS — QUESTION BANK
// ============================================================
//  Every day the game shows ONE question from each of the five
//  categories, in a random order. Day 1 uses the 1st question in
//  each category, day 2 the 2nd, and so on. When a category runs
//  out it loops back to its start. 90 per category = 90 days.
//
//  Year questions are kept to about 3 in every 10, placed so that
//  every day has at least one and no day has more than two.
//
//  To add a question, copy one block and change the values:
//    cat     – category: "culture", "money", "transport", "places" or "market"
//    q       – the question players see (keep it short and simple)
//    answer  – the true number, written in full (no commas)
//    type    – write type: "year" if the answer is a year. Leave it out otherwise.
//    unit    – for number answers only: "tens", "hundreds", "thousands",
//              "millions", "billions" or "trillions". This is the hint:
//              it shows in brackets after the question, e.g. (thousands).
//    cur     – add cur: "₦" for naira answers, so the hint reads (₦ trillions).
//              Use "$" for dollar answers. Year answers show (year).
//    source  – where the number came from (shown after the round)
//    url     – link to that source. Players open it with the Source button.
//
//  Year answers are scored by years off: exact 350, 1 year 250,
//  2 years 150, 5 years 100, 10 years 75, 20 years 50, 40 years 20.
// ============================================================

const QUESTIONS = [

  // ---------------- CULTURE, MUSIC & SPORT ----------------
  {
    cat: "culture",
    q: "In what year did Nigeria win Olympic gold in men's football?",
    answer: 1996, type: "year",
    source: "Football at the 1996 Summer Olympics, Wikipedia",
    url: "https://en.wikipedia.org/wiki/Football_at_the_1996_Summer_Olympics",
  },
  {
    cat: "culture",
    q: "In what year was Chinua Achebe's book Things Fall Apart first published?",
    answer: 1958, type: "year",
    source: "Things Fall Apart, Wikipedia",
    url: "https://en.wikipedia.org/wiki/Things_Fall_Apart",
  },
  {
    cat: "culture",
    q: "In what year did Wole Soyinka win the Nobel Prize in Literature?",
    answer: 1986, type: "year",
    source: "Nobel Prize in Literature 1986, nobelprize.org",
    url: "https://www.nobelprize.org/prizes/literature/1986/summary/",
  },
  {
    cat: "culture",
    q: "How many seats does the Moshood Abiola National Stadium in Abuja have?",
    answer: 60491, unit: "thousands",
    source: "Moshood Abiola National Stadium, Wikipedia",
    url: "https://en.wikipedia.org/wiki/Moshood_Abiola_National_Stadium",
  },
  {
    cat: "culture",
    q: "How many goals did Rashidi Yekini score for the Super Eagles?",
    answer: 37, unit: "tens",
    source: "Rashidi Yekini, Wikipedia (37 goals in 62 games)",
    url: "https://en.wikipedia.org/wiki/Rashidi_Yekini",
  },
  {
    cat: "culture",
    q: "How many seats does the Teslim Balogun Stadium in Lagos have?",
    answer: 24325, unit: "thousands",
    source: "Teslim Balogun Stadium, Wikipedia",
    url: "https://en.wikipedia.org/wiki/Teslim_Balogun_Stadium",
  },
  {
    cat: "culture",
    q: "How much prize money did the winner of Big Brother Naija Season 9 (2024) get?",
    answer: 100000000, cur: "₦", unit: "millions",
    source: "BBNaija season 9 winner to walk away with N100m, News Agency of Nigeria",
    url: "https://nannews.ng/?p=263863",
  },
  {
    cat: "culture",
    q: "How many seats does the Godswill Akpabio International Stadium in Uyo have?",
    answer: 30000, unit: "thousands",
    source: "Godswill Akpabio International Stadium, StadiumDB",
    url: "https://stadiumdb.com/stadiums/nga/akwa_ibom_stadium",
  },
  {
    cat: "culture",
    q: "How many Olympic medals had Nigeria won in total by the end of the 2024 Paris Olympics?",
    answer: 27, unit: "tens",
    source: "Timeline: all Team Nigeria's 27 Olympics medals, TheCable (no medals were won at Paris 2024)",
    url: "https://www.thecable.ng/timeline-maiyegun-in-64-ajunwa-in-96-all-team-nigerias-27-olympics-medals",
  },
  {
    cat: "culture",
    q: "How many seats are in the main hall of the National Theatre in Lagos?",
    answer: 5000, unit: "thousands",
    source: "National Theatre, Nigeria, Wikipedia",
    url: "https://en.wikipedia.org/wiki/National_Theatre,_Nigeria",
  },

  // ---------------- MONEY ----------------
  {
    cat: "money",
    q: "What is Nigeria's national minimum wage per month, set in 2024?",
    answer: 70000, cur: "₦", unit: "thousands",
    source: "President Tinubu signs ₦70,000 new minimum wage into law, July 2024 (Nairametrics)",
    url: "https://nairametrics.com/2024/07/29/president-tinubu-signs-n70000-new-minimum-wage-into-law/",
  },
  {
    cat: "money",
    q: "How big was Nigeria's economy (GDP) in 2024, after it was recalculated in 2025?",
    answer: 372820000000000, cur: "₦", unit: "trillions",
    source: "National Bureau of Statistics GDP rebasing, 2025 (Leadership)",
    url: "https://leadership.ng/mixed-reactions-as-economy-hits-n372-822trn-after-rebasing/",
  },
  {
    cat: "money",
    q: "How many naira was Nigeria's 2025 federal budget?",
    answer: 54990000000000, cur: "₦", unit: "trillions",
    source: "Tinubu signs ₦54.99trn 2025 budget into law, Feb 2025 (News Agency of Nigeria)",
    url: "https://nannews.ng/2025/02/28/tinubu-signs-n54-99trn-2025-budget-into-law",
  },
  {
    cat: "money",
    q: "In what year did the naira replace the Nigerian pound?",
    answer: 1973, type: "year",
    source: "Nigerian naira, Wikipedia",
    url: "https://en.wikipedia.org/wiki/Nigerian_naira",
  },
  {
    cat: "money",
    q: "In what year did the redesigned ₦200, ₦500 and ₦1,000 notes come out?",
    answer: 2022, type: "year",
    source: "Nigerian naira, Wikipedia",
    url: "https://en.wikipedia.org/wiki/Nigerian_naira",
  },
  {
    cat: "money",
    q: "In what year did the Central Bank of Nigeria start work?",
    answer: 1959, type: "year",
    source: "Central Bank of Nigeria, Wikipedia",
    url: "https://en.wikipedia.org/wiki/Central_Bank_of_Nigeria",
  },
  {
    cat: "money",
    q: "How many naira was Lagos State's 2025 budget?",
    answer: 3366000000000, cur: "₦", unit: "trillions",
    source: "Sanwo-Olu signs ₦3.366 trillion Lagos 2025 budget into law, Jan 2025 (BusinessDay)",
    url: "https://businessday.ng/news/article/sanwo-olu-signs-n3-366-trillion-lagos-2025-budget-into-law",
  },
  {
    cat: "money",
    q: "How much did Nigeria owe in total (public debt) at the end of 2024?",
    answer: 144670000000000, cur: "₦", unit: "trillions",
    source: "Debt Management Office: total public debt as at 31 December 2024",
    url: "https://www.dmo.gov.ng/debt-profile/total-public-debts/5215-total-public-debt-as-at-december-31-2024/file",
  },
  {
    cat: "money",
    q: "What was Nigeria's national minimum wage per month, set in 2019?",
    answer: 30000, cur: "₦", unit: "thousands",
    source: "Buhari signs ₦30,000 minimum wage bill into law, April 2019 (Channels TV)",
    url: "https://www.channelstv.com/2019/04/18/breaking-buhari-signs-n30000-minimum-wage-bill-into-law/",
  },
  {
    cat: "money",
    q: "In 2024, the CBN set a new minimum capital for banks with international licences. How much was it?",
    answer: 500000000000, cur: "₦", unit: "billions",
    source: "CBN issues banks' recapitalisation guidelines, March 2024 (ICIR)",
    url: "https://www.icirnigeria.org/cbn-issues-banks-recapitalisation-guidelines-raises-minimum-capital-base-to-n500bn/",
  },

  // ---------------- TRANSPORT & TRAFFIC ----------------
  {
    cat: "transport",
    q: "How long is the Third Mainland Bridge, in metres?",
    answer: 11800, unit: "thousands",
    source: "Third Mainland Bridge, Wikipedia",
    url: "https://en.wikipedia.org/wiki/Third_Mainland_Bridge",
  },
  {
    cat: "transport",
    q: "How long is the Lagos–Calabar Coastal Highway planned to be, in kilometres?",
    answer: 700, unit: "hundreds",
    source: "FG begins 700km Lagos–Calabar coastal highway project, Nairametrics",
    url: "https://nairametrics.com/2024/03/08/fg-begins-700-km-lagos-calabar-coastal-highway-project/",
  },
  {
    cat: "transport",
    q: "How long is the Lagos–Ibadan railway, in kilometres?",
    answer: 156, unit: "hundreds",
    source: "Lagos–Kano Standard Gauge Railway, Wikipedia",
    url: "https://en.wikipedia.org/wiki/Lagos%E2%80%93Kano_Standard_Gauge_Railway",
  },
  {
    cat: "transport",
    q: "How long is the Lekki–Ikoyi Link Bridge, in metres?",
    answer: 1360, unit: "thousands",
    source: "Lekki-Ikoyi Link Bridge, Wikipedia",
    url: "https://en.wikipedia.org/wiki/Lekki-Ikoyi_Link_Bridge",
  },
  {
    cat: "transport",
    q: "How long is the first phase of the Lagos Red Line train, in kilometres?",
    answer: 27, unit: "tens",
    source: "Red Line (Lagos Transit), Wikipedia",
    url: "https://en.wikipedia.org/wiki/Red_Line_(Lagos_Transit)",
  },
  {
    cat: "transport",
    q: "How many 20-foot containers can Lekki Deep Sea Port handle in a year in its first phase?",
    answer: 1200000, unit: "millions",
    source: "Nigeria acquires first deep seaport in Lagos, Safety4Sea",
    url: "https://safety4sea.com/nigeria-acquires-first-deep-seaport-in-lagos",
  },
  {
    cat: "transport",
    q: "In what year did Nigeria switch from driving on the left to driving on the right?",
    answer: 1972, type: "year",
    source: "Left- and right-hand traffic, Wikipedia",
    url: "https://en.wikipedia.org/wiki/Left-_and_right-hand_traffic",
  },
  {
    cat: "transport",
    q: "In what year did the Third Mainland Bridge open?",
    answer: 1990, type: "year",
    source: "Third Mainland Bridge, Wikipedia",
    url: "https://en.wikipedia.org/wiki/Third_Mainland_Bridge",
  },
  {
    cat: "transport",
    q: "In what year did Lagos launch its BRT bus service?",
    answer: 2008, type: "year",
    source: "Lagos Bus Rapid Transit System, Wikipedia",
    url: "https://en.wikipedia.org/wiki/Lagos_Bus_Rapid_Transit_System",
  },
  {
    cat: "transport",
    q: "How long is the Abuja–Kaduna railway, in kilometres?",
    answer: 186, unit: "hundreds",
    source: "Abuja–Kaduna rail line, Railway Technology",
    url: "https://www.railway-technology.com/projects/abuja-kaduna-rail-line/",
  },

  // ---------------- PLACES & LANDMARKS ----------------
  {
    cat: "places",
    q: "In what year did Abuja officially become Nigeria's capital?",
    answer: 1991, type: "year",
    source: "Abuja, Wikipedia",
    url: "https://en.wikipedia.org/wiki/Abuja",
  },
  {
    cat: "places",
    q: "In what year was Lagos State created?",
    answer: 1967, type: "year",
    source: "Lagos State, Wikipedia",
    url: "https://en.wikipedia.org/wiki/Lagos_State",
  },
  {
    cat: "places",
    q: "How many local government areas (LGAs) does Nigeria have?",
    answer: 774, unit: "hundreds",
    source: "Local government areas of Nigeria, Wikipedia",
    url: "https://en.wikipedia.org/wiki/Local_government_areas_of_Nigeria",
  },
  {
    cat: "places",
    q: "How high is Zuma Rock above sea level, in metres?",
    answer: 725, unit: "hundreds",
    source: "Zuma Rock, Wikipedia",
    url: "https://en.wikipedia.org/wiki/Zuma_Rock",
  },
  {
    cat: "places",
    q: "How many people were counted in Nigeria's 2006 census?",
    answer: 140431790, unit: "millions",
    source: "Demographics of Nigeria, Wikipedia (2006 census)",
    url: "https://en.wikipedia.org/wiki/Demographics_of_Nigeria",
  },
  {
    cat: "places",
    q: "How long is Nigeria's coastline, in kilometres?",
    answer: 853, unit: "hundreds",
    source: "Geography of Nigeria, Wikipedia",
    url: "https://en.wikipedia.org/wiki/Geography_of_Nigeria",
  },
  {
    cat: "places",
    q: "How high is Olumo Rock in Abeokuta above sea level, in metres?",
    answer: 137, unit: "hundreds",
    source: "Olumo Rock, Wikipedia",
    url: "https://en.wikipedia.org/wiki/Olumo_Rock",
  },
  {
    cat: "places",
    q: "How big is Nigeria, in square kilometres?",
    answer: 923768, unit: "thousands",
    source: "Geography of Nigeria, Wikipedia",
    url: "https://en.wikipedia.org/wiki/Geography_of_Nigeria",
  },
  {
    cat: "places",
    q: "How high is Chappal Waddi, Nigeria's highest mountain, in metres?",
    answer: 2419, unit: "thousands",
    source: "Geography of Nigeria, Wikipedia",
    url: "https://en.wikipedia.org/wiki/Geography_of_Nigeria",
  },
  {
    cat: "places",
    q: "In what year did Nigeria become a republic?",
    answer: 1963, type: "year",
    source: "First Nigerian Republic, Wikipedia",
    url: "https://en.wikipedia.org/wiki/First_Nigerian_Republic",
  },

  // ---------------- MARKET DATA ----------------
  {
    cat: "market",
    q: "How many barrels of oil can the Dangote Refinery process each day?",
    answer: 650000, unit: "thousands",
    source: "Dangote Refinery, Wikipedia",
    url: "https://en.wikipedia.org/wiki/Dangote_Refinery",
  },
  {
    cat: "market",
    q: "How many tonnes of urea fertiliser can the Dangote Fertiliser plant make in a year?",
    answer: 3000000, unit: "millions",
    source: "Dangote: Tackling Nigeria's fertiliser conundrum, The Guardian Nigeria",
    url: "https://guardian.ng/news/dangote-tackling-nigerias-fertiliser-conundrum/",
  },
  {
    cat: "market",
    q: "In what year was Coca-Cola first bottled in Nigeria?",
    answer: 1953, type: "year",
    source: "Nigerian Bottling Company, Wikipedia",
    url: "https://en.wikipedia.org/wiki/Nigerian_Bottling_Company",
  },
  {
    cat: "market",
    q: "In what year did Indomie noodles first go on sale in Nigeria?",
    answer: 1988, type: "year",
    source: "Indomie Instant Noodles: Feeding Families Since 1988, BrandCom",
    url: "https://brandcom.ng/2016/12/06/indomie-instant-noodles-feeding-families-since-1988/",
  },
  {
    cat: "market",
    q: "In what year did MTN launch in Nigeria?",
    answer: 2001, type: "year",
    source: "MTN Nigeria, Wikipedia",
    url: "https://en.wikipedia.org/wiki/MTN_Nigeria",
  },
  {
    cat: "market",
    q: "How many active mobile phone lines did Nigeria have at the end of 2024?",
    answer: 164900000, unit: "millions",
    source: "Nigeria ended 2024 with 165m active telephone lines, The Guardian Nigeria (NCC data)",
    url: "https://guardian.ng/technology/nigeria-ended-2024-with-165m-active-telephone-lines/",
  },
  {
    cat: "market",
    q: "How many barrels of oil does Nigeria have in reserve, as of January 2025?",
    answer: 37280000000, unit: "billions",
    source: "NUPRC: Nigeria's oil reserves reach 37.28 billion barrels, Nairametrics, April 2025",
    url: "https://nairametrics.com/2025/04/12/nigerias-oil-reserves-reach-37-28-billion-barrels-gas-reserves-hit-210-54-tcf-nuprc",
  },
  {
    cat: "market",
    q: "How much money did Flutterwave raise from investors in its 2022 funding round?",
    answer: 250000000, cur: "$", unit: "millions",
    source: "Flutterwave closes USD $250m in Series D funding, PR Newswire, Feb 2022",
    url: "https://www.prnewswire.com/news-releases/flutterwave-closes-usd-250m-in-series-d-funding-valuation-rises-to-over-usd-3bn-301483531.html",
  },
  {
    cat: "market",
    q: "How many MTN Nigeria voice subscribers were there at the end of 2024?",
    answer: 84607831, unit: "millions",
    source: "MTN Nigeria's 2024 telco reign in 5 numbers, TechCabal (NCC data)",
    url: "https://techcabal.com/2025/11/13/mtn-nigerias-2024-telco-reign-in-5-numbers/",
  },
  {
    cat: "market",
    q: "How many cubic feet of gas does Nigeria have in reserve, as of January 2025?",
    answer: 210540000000000, unit: "trillions",
    source: "NUPRC: Nigeria's gas reserves hit 210.54 TCF, Nairametrics, April 2025",
    url: "https://nairametrics.com/2025/04/12/nigerias-oil-reserves-reach-37-28-billion-barrels-gas-reserves-hit-210-54-tcf-nuprc",
  },
];
