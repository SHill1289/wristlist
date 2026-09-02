import Link from "next/link";

const credits = [
  {
    watch: "Omega Speedmaster Professional",
    author: "Torsten Bolten; retouched by Georgfotoart",
    license: "Public domain",
    source: "https://commons.wikimedia.org/wiki/File:OMEGA-Speedmaster-Professional-Front_(cropped).jpg",
    licenseUrl: "https://commons.wikimedia.org/wiki/File:OMEGA-Speedmaster-Professional-Front_(cropped).jpg#Licensing",
  },
  {
    watch: "Rolex Submariner 14060M",
    author: "Source image supplied by project owner; edited for presentation",
    license: "Usage rights must be confirmed before commercial release",
    source: null,
    licenseUrl: null,
  },
  {
    watch: "Cartier Tank Automatic",
    author: "Source image supplied by project owner; edited for presentation",
    license: "Usage rights must be confirmed before commercial release",
    source: null,
    licenseUrl: null,
  },
  ...[
    "Seiko 5 Sports SRPD55",
    "Hamilton Khaki Field Mechanical",
    "Tissot PRX Powermatic 80",
    "Longines Spirit Zulu Time",
    "Tudor Black Bay 58",
    "Grand Seiko Snowflake SBGA211",
    "Omega Seamaster Diver 300M",
    "IWC Mark XX",
    "Rolex Explorer 124270",
    "Jaeger-LeCoultre Reverso Tribute",
    "Rolex GMT-Master II 126710BLRO",
    "Audemars Piguet Royal Oak 15510ST",
  ].map((watch) => ({
    watch,
    author: "Source image supplied by project owner",
    license: "Usage rights must be confirmed before commercial release",
    source: null,
    licenseUrl: null,
  })),
];

export default function CreditsPage() {
  return (
    <main className="credits-page">
      <Link className="credits-back" href="/">← Back to Wristlist</Link>
      <p className="eyebrow">IMAGE ATTRIBUTION</p>
      <h1>Photo credits.</h1>
      <p className="credits-intro">These photographs depict real watches and are used under the terms listed below. Brand names and trademarks belong to their respective owners. Wristlist is not affiliated with or endorsed by Omega, Rolex, or Cartier.</p>
      <div className="credits-list">
        {credits.map((credit) => (
          <article key={credit.watch}>
            <h2>{credit.watch}</h2>
            <p>{credit.author}</p>
            <div>
              {credit.source && <a href={credit.source} target="_blank" rel="noreferrer">Original file ↗</a>}
              {credit.licenseUrl ? <a href={credit.licenseUrl} target="_blank" rel="noreferrer">{credit.license} ↗</a> : <span>{credit.license}</span>}
            </div>
          </article>
        ))}
      </div>
    </main>
  );
}
