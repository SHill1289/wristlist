export type WatchListing = {
  id: number;
  maker: string;
  model: string;
  reference: string;
  category: "Sport" | "Dive" | "Dress";
  price: number;
  market: number;
  image: string;
  color: string;
  note: string;
  imageStyle?: "studio" | "cutout";
};

export const WATCHES: WatchListing[] = [
  { id: 1, maker: "Omega", model: "Speedmaster Professional", reference: "3570.50", category: "Sport", price: 4900, market: 5050, image: "/watches/omega-speedmaster-studio.png", color: "Black dial · Steel", note: "Moonwatch icon", imageStyle: "studio" },
  { id: 2, maker: "Rolex", model: "Submariner", reference: "14060M", category: "Dive", price: 11250, market: 11400, image: "/watches/rolex-submariner-studio.png", color: "No-date · Steel", note: "Collector favorite", imageStyle: "studio" },
  { id: 3, maker: "Cartier", model: "Tank Automatic", reference: "XL", category: "Dress", price: 4200, market: 3900, image: "/watches/cartier-tank-studio.png", color: "Silver dial · Leather", note: "Design classic", imageStyle: "studio" },
  { id: 4, maker: "Seiko", model: "5 Sports", reference: "SRPD55", category: "Dive", price: 275, market: 260, image: "/watches/seiko-5-sports-studio.png", color: "Black dial · Steel", note: "Everyday automatic", imageStyle: "studio" },
  { id: 5, maker: "Hamilton", model: "Khaki Field Mechanical", reference: "H69439931", category: "Sport", price: 525, market: 545, image: "/watches/hamilton-khaki-field-studio.png", color: "Black dial · NATO", note: "Field-tested favorite", imageStyle: "studio" },
  { id: 6, maker: "Tissot", model: "PRX Powermatic 80", reference: "T137.407", category: "Sport", price: 725, market: 690, image: "/watches/tissot-prx-studio.png", color: "Blue dial · Steel", note: "Integrated classic", imageStyle: "studio" },
  { id: 7, maker: "Longines", model: "Spirit Zulu Time", reference: "L3.812.4", category: "Sport", price: 2800, market: 2950, image: "/watches/longines-zulu-time-studio.png", color: "Green bezel · Steel", note: "Traveler's GMT", imageStyle: "studio" },
  { id: 8, maker: "Tudor", model: "Black Bay 58", reference: "79030N", category: "Dive", price: 3600, market: 3750, image: "/watches/tudor-black-bay-58-studio.png", color: "Black dial · Steel", note: "Modern vintage", imageStyle: "studio" },
  { id: 9, maker: "Grand Seiko", model: "Snowflake", reference: "SBGA211", category: "Dress", price: 4700, market: 4450, image: "/watches/grand-seiko-snowflake-studio.png", color: "Textured dial · Titanium", note: "Spring Drive icon", imageStyle: "studio" },
  { id: 10, maker: "Omega", model: "Seamaster Diver 300M", reference: "210.30.42", category: "Dive", price: 5000, market: 5150, image: "/watches/omega-seamaster-studio.png", color: "Black dial · Steel", note: "Professional diver", imageStyle: "studio" },
  { id: 11, maker: "IWC", model: "Mark XX", reference: "IW328201", category: "Sport", price: 5400, market: 5250, image: "/watches/iwc-mark-xx-studio.png", color: "Blue dial · Steel", note: "Pilot essential", imageStyle: "studio" },
  { id: 12, maker: "Rolex", model: "Explorer", reference: "124270", category: "Sport", price: 8000, market: 8250, image: "/watches/rolex-explorer-studio.png", color: "Black dial · Steel", note: "Go-anywhere icon", imageStyle: "studio" },
  { id: 13, maker: "Jaeger-LeCoultre", model: "Reverso Tribute", reference: "Q3988482", category: "Dress", price: 9500, market: 9800, image: "/watches/jlc-reverso-studio.png", color: "Silver dial · Leather", note: "Art Deco original", imageStyle: "studio" },
  { id: 14, maker: "Rolex", model: "GMT-Master II Pepsi", reference: "126710BLRO", category: "Sport", price: 20000, market: 21250, image: "/watches/rolex-gmt-pepsi-studio.png", color: "Red-blue bezel · Steel", note: "Global favorite", imageStyle: "studio" },
  { id: 15, maker: "Audemars Piguet", model: "Royal Oak", reference: "15510ST", category: "Sport", price: 45000, market: 47200, image: "/watches/ap-royal-oak-studio.png", color: "Blue dial · Steel", note: "Grail territory", imageStyle: "studio" },
];

export type WatchDetail = {
  description: string;
  specs: { label: string; value: string }[];
  history: number[];
};

export const WATCH_DETAILS: Record<number, WatchDetail> = {
  1: { description: "The classic hand-wound Moonwatch pairs enduring tool-watch design with one of chronograph history's most recognizable silhouettes.", specs: [{ label: "Case", value: "42 mm steel" }, { label: "Movement", value: "Calibre 1861, manual" }, { label: "Reserve", value: "48 hours" }, { label: "Water resistance", value: "50 metres" }], history: [4725, 4800, 4875, 4925, 4975, 5050] },
  2: { description: "A no-date Submariner with a clean, balanced dial and the robust proportions that made Rolex's dive watch a benchmark.", specs: [{ label: "Case", value: "40 mm steel" }, { label: "Movement", value: "Calibre 3130, automatic" }, { label: "Reserve", value: "48 hours" }, { label: "Water resistance", value: "300 metres" }], history: [10850, 10975, 11200, 11150, 11300, 11400] },
  3: { description: "Cartier's rectangular icon brings architectural proportions, Roman numerals, and dress-watch restraint to an automatic everyday watch.", specs: [{ label: "Case", value: "Steel, rectangular" }, { label: "Movement", value: "Automatic" }, { label: "Strap", value: "Black leather" }, { label: "Water resistance", value: "30 metres" }], history: [4150, 4100, 4050, 4000, 3950, 3900] },
  4: { description: "An approachable automatic sports watch with bold lume, day-date practicality, and the easygoing character of Seiko's 5 Sports line.", specs: [{ label: "Case", value: "42.5 mm steel" }, { label: "Movement", value: "4R36, automatic" }, { label: "Reserve", value: "41 hours" }, { label: "Water resistance", value: "100 metres" }], history: [270, 268, 265, 263, 262, 260] },
  5: { description: "A compact, hand-wound field watch that channels military utility through a highly legible dial and durable textile strap.", specs: [{ label: "Case", value: "38 mm steel" }, { label: "Movement", value: "H-50, manual" }, { label: "Reserve", value: "80 hours" }, { label: "Water resistance", value: "50 metres" }], history: [505, 510, 520, 518, 535, 545] },
  6: { description: "The PRX combines a slim 1970s-inspired case, integrated bracelet, and textured dial with a long-running automatic movement.", specs: [{ label: "Case", value: "40 mm steel" }, { label: "Movement", value: "Powermatic 80" }, { label: "Reserve", value: "80 hours" }, { label: "Water resistance", value: "100 metres" }], history: [720, 710, 705, 700, 695, 690] },
  7: { description: "A modern travel watch with independent local-hour adjustment, a bidirectional GMT bezel, and vintage-inspired gilt details.", specs: [{ label: "Case", value: "42 mm steel" }, { label: "Movement", value: "L844, automatic GMT" }, { label: "Reserve", value: "72 hours" }, { label: "Water resistance", value: "100 metres" }], history: [2725, 2750, 2810, 2850, 2900, 2950] },
  8: { description: "Tudor distills the vintage dive-watch formula into wearable 39 mm proportions with a modern in-house automatic movement.", specs: [{ label: "Case", value: "39 mm steel" }, { label: "Movement", value: "MT5402, automatic" }, { label: "Reserve", value: "70 hours" }, { label: "Water resistance", value: "200 metres" }], history: [3450, 3500, 3525, 3600, 3680, 3750] },
  9: { description: "The Snowflake showcases Grand Seiko's textured dial, lightweight titanium construction, and signature smooth-sweeping Spring Drive movement.", specs: [{ label: "Case", value: "41 mm titanium" }, { label: "Movement", value: "9R65 Spring Drive" }, { label: "Reserve", value: "72 hours" }, { label: "Water resistance", value: "100 metres" }], history: [4650, 4600, 4550, 4500, 4475, 4450] },
  10: { description: "Omega's modern professional diver combines a wave-pattern dial, ceramic bezel, and chronometer-rated co-axial movement.", specs: [{ label: "Case", value: "42 mm steel" }, { label: "Movement", value: "Calibre 8800, automatic" }, { label: "Reserve", value: "55 hours" }, { label: "Water resistance", value: "300 metres" }], history: [4875, 4950, 5000, 5025, 5100, 5150] },
  11: { description: "A refined pilot's watch with exceptional legibility, understated proportions, and an extended five-day automatic power reserve.", specs: [{ label: "Case", value: "40 mm steel" }, { label: "Movement", value: "Calibre 32111, automatic" }, { label: "Reserve", value: "120 hours" }, { label: "Water resistance", value: "100 metres" }], history: [5450, 5425, 5375, 5325, 5280, 5250] },
  12: { description: "The Explorer's restrained 3-6-9 dial and compact proportions make it one of Rolex's most versatile modern sports watches.", specs: [{ label: "Case", value: "36 mm steel" }, { label: "Movement", value: "Calibre 3230, automatic" }, { label: "Reserve", value: "70 hours" }, { label: "Water resistance", value: "100 metres" }], history: [7800, 7900, 7950, 8050, 8150, 8250] },
  13: { description: "The Reverso's swiveling rectangular case is an Art Deco landmark, balancing elegant geometry with its polo-inspired origins.", specs: [{ label: "Case", value: "Steel, reversible" }, { label: "Movement", value: "Manual-winding" }, { label: "Strap", value: "Brown leather" }, { label: "Water resistance", value: "30 metres" }], history: [9200, 9300, 9375, 9500, 9650, 9800] },
  14: { description: "Rolex's travel icon pairs an independently adjustable GMT hand with the unmistakable red-and-blue ceramic bezel.", specs: [{ label: "Case", value: "40 mm steel" }, { label: "Movement", value: "Calibre 3285, automatic" }, { label: "Reserve", value: "70 hours" }, { label: "Water resistance", value: "100 metres" }], history: [19500, 19800, 20250, 20500, 20800, 21250] },
  15: { description: "The Royal Oak's octagonal bezel, tapisserie dial, and integrated bracelet define one of modern luxury watchmaking's most influential designs.", specs: [{ label: "Case", value: "41 mm steel" }, { label: "Movement", value: "Calibre 4302, automatic" }, { label: "Reserve", value: "70 hours" }, { label: "Water resistance", value: "50 metres" }], history: [43800, 44200, 44900, 45500, 46300, 47200] },
};
