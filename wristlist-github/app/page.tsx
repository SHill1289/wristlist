"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowUpRight, Check, ChevronDown, Compass, Gem, Heart, Search, Sparkles, Trophy, WalletCards, Watch } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

type WatchListing = { id: number; maker: string; model: string; reference: string; category: string; price: number; market: number; image: string; color: string; note: string };

const WATCHES: WatchListing[] = [
  { id: 1, maker: "Aster & Vale", model: "Apex 38", reference: "AV-3801-B", category: "Sport", price: 12800, market: 13450, image: "/watches/apex-blue.png", color: "Blue dial · Steel", note: "Trending this week" },
  { id: 2, maker: "Northstar", model: "Pelagic 300", reference: "NS-P300-01", category: "Dive", price: 8600, market: 8250, image: "/watches/pelagic-black.png", color: "Black dial · Steel", note: "Collector favorite" },
  { id: 3, maker: "Maison Céleste", model: "Carré Privé", reference: "MC-CP24-G", category: "Dress", price: 16400, market: 17200, image: "/watches/carre-gold.png", color: "Ivory dial · Gold", note: "Only 7% own this" },
];

const money = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

export default function Home() {
  const [owned, setOwned] = useState<number[]>([]);
  const [saved, setSaved] = useState<number[]>([2]);
  const [activeTab, setActiveTab] = useState<"discover" | "collection">("discover");
  const [category, setCategory] = useState("All watches");
  const [selected, setSelected] = useState<WatchListing | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const stored = window.localStorage.getItem("wristlist-owned");
    if (stored) setOwned(JSON.parse(stored));
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) window.localStorage.setItem("wristlist-owned", JSON.stringify(owned));
  }, [owned, loaded]);

  const spent = WATCHES.filter((watch) => owned.includes(watch.id)).reduce((sum, watch) => sum + watch.price, 0);
  const balance = 50000 - spent;
  const visibleWatches = useMemo(() => {
    const base = activeTab === "collection" ? WATCHES.filter((watch) => owned.includes(watch.id)) : WATCHES;
    return category === "All watches" ? base : base.filter((watch) => watch.category === category);
  }, [activeTab, category, owned]);

  function acquire() {
    if (!selected || owned.includes(selected.id) || selected.price > balance) return;
    setOwned((current) => [...current, selected.id]);
    setSelected(null);
    setActiveTab("collection");
  }

  return (
    <main className="app-shell">
      <header className="topbar">
        <a className="brand" href="#" aria-label="Wristlist home"><span className="brand-mark"><Watch /></span><span>WRISTLIST</span></a>
        <nav className="desktop-nav" aria-label="Primary navigation">
          <button className={activeTab === "discover" ? "active" : ""} onClick={() => setActiveTab("discover")}>Discover</button>
          <button className={activeTab === "collection" ? "active" : ""} onClick={() => setActiveTab("collection")}>My collection</button>
          <button>Challenges</button>
        </nav>
        <div className="header-actions">
          <button className="icon-button" aria-label="Search"><Search /></button>
          <div className="balance-pill"><span>PLAY MONEY</span><strong>{money.format(balance)}</strong></div>
          <button className="avatar" aria-label="Profile">A</button>
        </div>
      </header>

      <section className="dashboard">
        <div className="welcome-row">
          <div>
            <p className="eyebrow"><Sparkles /> TODAY’S DROP</p>
            <h1>{activeTab === "discover" ? "Find your next watch." : "Your watch box."}</h1>
            <p className="intro">{activeTab === "discover" ? "Build the collection you want. Your wallet stays untouched." : `${owned.length} ${owned.length === 1 ? "watch" : "watches"} acquired with zero buyer’s remorse.`}</p>
          </div>
          <aside className="streak-card">
            <span className="streak-icon"><Trophy /></span>
            <div><strong>4 day streak</strong><span>Explore tomorrow to keep it alive</span></div>
            <div className="streak-dots" aria-label="Four day activity streak"><i /><i /><i /><i /><i className="empty" /><i className="empty" /><i className="empty" /></div>
          </aside>
        </div>

        <div className="metrics" aria-label="Collection summary">
          <div><span><WalletCards /> Available</span><strong>{money.format(balance)}</strong><small>Virtual budget</small></div>
          <div><span><Gem /> Collection</span><strong>{money.format(spent)}</strong><small>{owned.length} pieces</small></div>
          <div><span><ArrowUpRight /> Market move</span><strong className="positive">+3.2%</strong><small>Last 30 days</small></div>
        </div>

        <div className="catalog-head">
          <div className="filters" aria-label="Watch category">
            {["All watches", "Sport", "Dive", "Dress"].map((filter) => <button key={filter} className={category === filter ? "selected" : ""} onClick={() => setCategory(filter)}>{filter}</button>)}
          </div>
          <button className="sort-button">Curated for you <ChevronDown /></button>
        </div>

        {visibleWatches.length > 0 ? (
          <div className="watch-grid">
            {visibleWatches.map((watch) => {
              const isOwned = owned.includes(watch.id);
              const isSaved = saved.includes(watch.id);
              return (
                <article className="watch-card" key={watch.id}>
                  <div className="watch-image-wrap">
                    <span className="card-tag">{watch.note}</span>
                    <button className={`save-button ${isSaved ? "saved" : ""}`} onClick={() => setSaved((current) => isSaved ? current.filter((id) => id !== watch.id) : [...current, watch.id])} aria-label={isSaved ? `Remove ${watch.model} from saved watches` : `Save ${watch.model}`}><Heart fill={isSaved ? "currentColor" : "none"} /></button>
                    <img src={watch.image} alt={`${watch.maker} ${watch.model} watch`} />
                  </div>
                  <div className="watch-info">
                    <div className="maker-row"><span>{watch.maker}</span><small>{watch.reference}</small></div>
                    <h2>{watch.model}</h2><p>{watch.color}</p>
                    <div className="price-row">
                      <div><strong>{money.format(watch.price)}</strong><small>Market {money.format(watch.market)}</small></div>
                      <Button className={isOwned ? "owned-button" : "acquire-button"} onClick={() => !isOwned && setSelected(watch)} disabled={!isOwned && watch.price > balance}>{isOwned ? <><Check /> Acquired</> : "Acquire"}</Button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="empty-state"><span><Compass /></span><h2>Your watch box is waiting.</h2><p>Explore today’s drop and virtually acquire your first piece.</p><Button onClick={() => setActiveTab("discover")}>Browse watches</Button></div>
        )}
      </section>

      <nav className="mobile-nav" aria-label="Mobile navigation">
        <button className={activeTab === "discover" ? "active" : ""} onClick={() => setActiveTab("discover")}><Compass />Discover</button>
        <button className={activeTab === "collection" ? "active" : ""} onClick={() => setActiveTab("collection")}><Watch />Collection</button>
        <button><Trophy />Challenges</button>
      </nav>

      <Dialog open={Boolean(selected)} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="acquire-dialog">
          <DialogHeader><p className="eyebrow"><Sparkles /> VIRTUAL ACQUISITION</p><DialogTitle>Add {selected?.model} to your watch box?</DialogTitle><DialogDescription>This uses {selected ? money.format(selected.price) : "$0"} of play money. No payment, shipping, or actual purchase.</DialogDescription></DialogHeader>
          <div className="dialog-balance"><span>Balance after</span><strong>{money.format(balance - (selected?.price ?? 0))}</strong></div>
          <DialogFooter><Button variant="outline" onClick={() => setSelected(null)}>Keep browsing</Button><Button className="acquire-button" onClick={acquire}>Acquire watch</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}
