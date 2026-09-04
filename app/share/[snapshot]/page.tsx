import type { Metadata } from "next";
import Link from "next/link";
import { ArrowDownRight, ArrowUpRight, CalendarDays, Gem, Watch } from "lucide-react";
import { notFound } from "next/navigation";
import { WATCHES } from "@/data/watches";

export const metadata: Metadata = {
  title: "Shared Watch Collection | Wristlist",
  description: "A virtual watch collection shared from Wristlist.",
  robots: { index: false, follow: false },
};

type SnapshotItem = { id: number; paid: number; market: number };
type Snapshot = { version: number; date: string; items: SnapshotItem[] };

const money = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

function decodeSnapshot(token: string): Snapshot | null {
  if (!token || token.length > 4096) return null;
  try {
    const parsed = JSON.parse(Buffer.from(token.replaceAll("-", "+").replaceAll("_", "/"), "base64").toString("utf8")) as Snapshot;
    if (parsed.version !== 1 || !/^\d{4}-\d{2}-\d{2}$/.test(parsed.date) || !Array.isArray(parsed.items) || !parsed.items.length || parsed.items.length > WATCHES.length) return null;
    const ids = new Set<number>();
    for (const item of parsed.items) {
      if (!Number.isInteger(item.id) || ids.has(item.id) || !WATCHES.some((watch) => watch.id === item.id) || !Number.isFinite(item.paid) || !Number.isFinite(item.market) || item.paid < 0 || item.market < 0) return null;
      ids.add(item.id);
    }
    return parsed;
  } catch {
    return null;
  }
}

export default async function SharedCollectionPage({ params }: { params: Promise<{ snapshot: string }> }) {
  const { snapshot: token } = await params;
  const snapshot = decodeSnapshot(token);
  if (!snapshot) notFound();

  const items = snapshot.items.map((item) => ({ ...item, watch: WATCHES.find((watch) => watch.id === item.id)! }));
  const totalPaid = items.reduce((sum, item) => sum + item.paid, 0);
  const totalMarket = items.reduce((sum, item) => sum + item.market, 0);
  const totalGain = totalMarket - totalPaid;
  const returnPercent = totalPaid ? (totalGain / totalPaid) * 100 : 0;
  const sharedDate = new Date(`${snapshot.date}T12:00:00`).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });

  return (
    <main className="shared-shell">
      <header className="shared-topbar">
        <Link className="brand" href="/"><span className="brand-mark"><Watch /></span><span>WRISTLIST</span></Link>
        <Link className="shared-build-link" href="/">Build your own collection</Link>
      </header>

      <section className="shared-page">
        <div className="shared-intro">
          <p className="eyebrow"><Gem /> SHARED COLLECTION</p>
          <h1>A collector’s watch box.</h1>
          <p>This is a read-only snapshot of a virtual collection. No watches were purchased through Wristlist.</p>
        </div>

        <div className="shared-metrics">
          <div><span><Watch /> Watches</span><strong>{items.length}</strong></div>
          <div><span><Gem /> Snapshot value</span><strong>{money.format(totalMarket)}</strong></div>
          <div><span>{totalGain < 0 ? <ArrowDownRight /> : <ArrowUpRight />} Performance</span><strong className={totalGain < 0 ? "negative" : "positive"}>{totalGain >= 0 ? "+" : ""}{returnPercent.toFixed(1)}%</strong></div>
          <div><span><CalendarDays /> Shared</span><strong>{sharedDate}</strong></div>
        </div>

        <div className="shared-grid">
          {items.map((item) => {
            const gain = item.market - item.paid;
            return (
              <article className="shared-watch-card" key={item.id}>
                <div className={`shared-watch-image ${item.watch.imageStyle === "cutout" ? "cutout-image" : ""}`}><img src={item.watch.image} alt={`${item.watch.maker} ${item.watch.model} watch`} /></div>
                <div className="shared-watch-copy">
                  <div><span>{item.watch.maker}</span><small>{item.watch.reference}</small></div>
                  <h2>{item.watch.model}</h2>
                  <p>{item.watch.color}</p>
                  <div className="shared-watch-values"><span>Paid <strong>{money.format(item.paid)}</strong></span><span>Snapshot <strong>{money.format(item.market)}</strong></span><span className={gain < 0 ? "negative" : "positive"}>{gain >= 0 ? "+" : ""}{money.format(gain)}</span></div>
                </div>
              </article>
            );
          })}
        </div>

        <div className="shared-cta"><div><strong>Build the collection you want.</strong><span>Your wallet stays untouched.</span></div><Link href="/">Explore Wristlist</Link></div>
      </section>
    </main>
  );
}
