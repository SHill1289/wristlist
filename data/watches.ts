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
