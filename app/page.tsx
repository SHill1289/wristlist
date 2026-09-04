"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { ArrowDownRight, ArrowUpRight, CheckCircle2, ChevronDown, Compass, Gem, Heart, Search, Sparkles, Trophy, WalletCards, Watch, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { WATCHES, type WatchListing } from "@/data/watches";
type Holding = { watchId: number; purchasePrice: number; acquiredAt: string };
type Portfolio = { cash: number; holdings: Holding[] };
type SortOption = "curated" | "price-low" | "price-high" | "market-high" | "performance";

const money = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
const STARTING_BALANCE = 50000;
const PORTFOLIO_KEY = "wristlist-portfolio-v1";
const SAVED_KEY = "wristlist-saved-v1";

export default function Home() {
  const [portfolio, setPortfolio] = useState<Portfolio>({ cash: STARTING_BALANCE, holdings: [] });
  const [saved, setSaved] = useState<number[]>([2]);
  const [activeTab, setActiveTab] = useState<"discover" | "collection">("discover");
  const [category, setCategory] = useState("All watches");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortOption>("curated");
  const [selected, setSelected] = useState<WatchListing | null>(null);
  const [selling, setSelling] = useState<WatchListing | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      try {
        const storedPortfolio = window.localStorage.getItem(PORTFOLIO_KEY);
        const storedSaved = window.localStorage.getItem(SAVED_KEY);

        if (storedPortfolio) {
          const parsed = JSON.parse(storedPortfolio) as Portfolio;
          if (typeof parsed.cash === "number" && Array.isArray(parsed.holdings)) setPortfolio(parsed);
        } else {
          const legacyOwned = JSON.parse(window.localStorage.getItem("wristlist-owned") ?? "[]") as number[];
          const legacyHoldings = legacyOwned.flatMap((id) => {
            const watch = WATCHES.find((item) => item.id === id);
            return watch ? [{ watchId: id, purchasePrice: watch.price, acquiredAt: new Date().toISOString() }] : [];
          });
          if (legacyHoldings.length) {
            setPortfolio({ cash: STARTING_BALANCE - legacyHoldings.reduce((sum, item) => sum + item.purchasePrice, 0), holdings: legacyHoldings });
          }
        }

        if (storedSaved) setSaved(JSON.parse(storedSaved));
      } catch {
        setPortfolio({ cash: STARTING_BALANCE, holdings: [] });
      }
      setLoaded(true);
    }, 0);
    return () => window.clearTimeout(timeout);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    window.localStorage.setItem(PORTFOLIO_KEY, JSON.stringify(portfolio));
    window.localStorage.setItem(SAVED_KEY, JSON.stringify(saved));
  }, [portfolio, saved, loaded]);

  useEffect(() => {
    if (!notice) return;
    const timeout = window.setTimeout(() => setNotice(null), 3500);
    return () => window.clearTimeout(timeout);
  }, [notice]);

  const owned = useMemo(() => new Set(portfolio.holdings.map((holding) => holding.watchId)), [portfolio.holdings]);
  const collectionCost = portfolio.holdings.reduce((sum, holding) => sum + holding.purchasePrice, 0);
  const collectionMarket = portfolio.holdings.reduce((sum, holding) => sum + (WATCHES.find((watch) => watch.id === holding.watchId)?.market ?? 0), 0);
  const portfolioValue = portfolio.cash + collectionMarket;
  const portfolioGain = portfolioValue - STARTING_BALANCE;
  const portfolioReturn = (portfolioGain / STARTING_BALANCE) * 100;
  const visibleWatches = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const base = activeTab === "collection" ? WATCHES.filter((watch) => owned.has(watch.id)) : WATCHES;
    const filtered = base.filter((watch) => {
      const matchesCategory = category === "All watches" || watch.category === category;
      const searchable = `${watch.maker} ${watch.model} ${watch.reference} ${watch.category} ${watch.color}`.toLowerCase();
      return matchesCategory && (!normalizedQuery || searchable.includes(normalizedQuery));
    });

    return [...filtered].sort((a, b) => {
      if (sort === "price-low") return a.price - b.price;
      if (sort === "price-high") return b.price - a.price;
      if (sort === "market-high") return b.market - a.market;
      if (sort === "performance") return (b.market - b.price) / b.price - (a.market - a.price) / a.price;
      return a.id - b.id;
    });
  }, [activeTab, category, owned, query, sort]);

  function acquire() {
    if (!selected || owned.has(selected.id) || selected.price > portfolio.cash) return;
    const acquiredWatch = selected;
    setPortfolio((current) => ({
      cash: current.cash - acquiredWatch.price,
      holdings: [...current.holdings, { watchId: acquiredWatch.id, purchasePrice: acquiredWatch.price, acquiredAt: new Date().toISOString() }],
    }));
    setSelected(null);
    setActiveTab("collection");
    setCategory("All watches");
    setNotice(`${acquiredWatch.maker} ${acquiredWatch.model} added to your collection.`);
  }

  function sell() {
    if (!selling || !owned.has(selling.id)) return;
    const soldWatch = selling;
    setPortfolio((current) => ({
      cash: current.cash + soldWatch.market,
      holdings: current.holdings.filter((holding) => holding.watchId !== soldWatch.id),
    }));
    setSelling(null);
    setNotice(`${soldWatch.maker} ${soldWatch.model} sold for ${money.format(soldWatch.market)}.`);
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
          <button className="icon-button" aria-label="Search watches" onClick={() => searchRef.current?.focus()}><Search /></button>
          <div className="balance-pill"><span>PLAY MONEY</span><strong>{money.format(portfolio.cash)}</strong></div>
          <button className="avatar" aria-label="Profile">A</button>
        </div>
      </header>

      <section className="dashboard">
        <div className="welcome-row">
          <div>
            <p className="eyebrow"><Sparkles /> TODAY’S DROP</p>
            <h1>{activeTab === "discover" ? "Find your next watch." : "Your watch box."}</h1>
            <p className="intro">{activeTab === "discover" ? "Build the collection you want. Your wallet stays untouched." : `${portfolio.holdings.length} ${portfolio.holdings.length === 1 ? "watch" : "watches"} acquired with zero buyer’s remorse.`}</p>
          </div>
          <aside className="streak-card">
            <span className="streak-icon"><Trophy /></span>
            <div><strong>4 day streak</strong><span>Explore tomorrow to keep it alive</span></div>
            <div className="streak-dots" aria-label="Four day activity streak"><i /><i /><i /><i /><i className="empty" /><i className="empty" /><i className="empty" /></div>
          </aside>
        </div>

        <div className="metrics" aria-label="Collection summary">
          <div><span><WalletCards /> Available</span><strong>{money.format(portfolio.cash)}</strong><small>Play money</small></div>
          <div><span><Gem /> Collection value</span><strong>{money.format(collectionMarket)}</strong><small>{portfolio.holdings.length} pieces · Cost {money.format(collectionCost)}</small></div>
          <div><span>{portfolioGain < 0 ? <ArrowDownRight /> : <ArrowUpRight />} Portfolio return</span><strong className={portfolioGain < 0 ? "negative" : "positive"}>{portfolioGain >= 0 ? "+" : ""}{portfolioReturn.toFixed(1)}%</strong><small>{portfolioGain >= 0 ? "+" : ""}{money.format(portfolioGain)} overall</small></div>
        </div>

        <div className="catalog-tools">
          <label className="catalog-search">
            <Search aria-hidden="true" />
            <input ref={searchRef} type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search brand, model, or reference" aria-label="Search watches" />
            {query && <button type="button" onClick={() => { setQuery(""); searchRef.current?.focus(); }} aria-label="Clear search"><X /></button>}
          </label>
          <div className="catalog-head">
            <div className="filters" aria-label="Watch category">
              {["All watches", "Sport", "Dive", "Dress"].map((filter) => <button key={filter} className={category === filter ? "selected" : ""} onClick={() => setCategory(filter)}>{filter}</button>)}
            </div>
            <label className="sort-select">
              <select value={sort} onChange={(event) => setSort(event.target.value as SortOption)} aria-label="Sort watches">
                <option value="curated">Curated for you</option>
                <option value="price-low">Price: low to high</option>
                <option value="price-high">Price: high to low</option>
                <option value="market-high">Highest market value</option>
                <option value="performance">Best market performance</option>
              </select>
              <ChevronDown aria-hidden="true" />
            </label>
          </div>
          <p className="catalog-count">Showing {visibleWatches.length} of {activeTab === "collection" ? portfolio.holdings.length : WATCHES.length} watches</p>
        </div>

        {visibleWatches.length > 0 ? (
          <div className="watch-grid">
            {visibleWatches.map((watch) => {
              const isOwned = owned.has(watch.id);
              const isSaved = saved.includes(watch.id);
              const holding = portfolio.holdings.find((item) => item.watchId === watch.id);
              const watchGain = holding ? watch.market - holding.purchasePrice : 0;
              return (
                <article className="watch-card" key={watch.id}>
                  <div className={`watch-image-wrap ${watch.imageStyle === "cutout" ? "cutout-image" : ""}`}>
                    <span className="card-tag">{watch.note}</span>
                    <button className={`save-button ${isSaved ? "saved" : ""}`} onClick={() => setSaved((current) => isSaved ? current.filter((id) => id !== watch.id) : [...current, watch.id])} aria-label={isSaved ? `Remove ${watch.model} from saved watches` : `Save ${watch.model}`}><Heart fill={isSaved ? "currentColor" : "none"} /></button>
                    <Link className="watch-image-link" href={`/watches/${watch.id}`} aria-label={`View ${watch.maker} ${watch.model} details`}><img src={watch.image} alt={`${watch.maker} ${watch.model} watch`} /></Link>
                  </div>
                  <div className="watch-info">
                    <div className="maker-row"><span>{watch.maker}</span><small>{watch.reference}</small></div>
                    <h2><Link href={`/watches/${watch.id}`}>{watch.model}</Link></h2><p>{watch.color}</p>
                    <div className="price-row">
                      <div><strong>{money.format(isOwned ? watch.market : watch.price)}</strong><small>{isOwned ? `Paid ${money.format(holding?.purchasePrice ?? watch.price)} · ${watchGain >= 0 ? "+" : ""}${money.format(watchGain)}` : `Market ${money.format(watch.market)}`}</small></div>
                      <Button className={isOwned ? "sell-button" : "acquire-button"} onClick={() => isOwned ? setSelling(watch) : setSelected(watch)} disabled={!isOwned && watch.price > portfolio.cash}>{isOwned ? "Sell" : "Acquire"}</Button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="empty-state"><span><Compass /></span><h2>{query || category !== "All watches" ? "No watches match." : "Your watch box is waiting."}</h2><p>{query || category !== "All watches" ? "Try another search or clear your filters." : "Explore today’s drop and virtually acquire your first piece."}</p>{query || category !== "All watches" ? <Button onClick={() => { setQuery(""); setCategory("All watches"); }}>Clear filters</Button> : <Button onClick={() => setActiveTab("discover")}>Browse watches</Button>}</div>
        )}
      </section>

      <footer className="site-footer">
        <span>Independent fantasy-collecting project. Not affiliated with the featured brands.</span>
        <a href="/credits">Photo credits</a>
      </footer>

      <nav className="mobile-nav" aria-label="Mobile navigation">
        <button className={activeTab === "discover" ? "active" : ""} onClick={() => setActiveTab("discover")}><Compass />Discover</button>
        <button className={activeTab === "collection" ? "active" : ""} onClick={() => setActiveTab("collection")}><Watch />Collection</button>
        <button><Trophy />Challenges</button>
      </nav>

      <Dialog open={Boolean(selected)} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="acquire-dialog">
          <DialogHeader><p className="eyebrow"><Sparkles /> VIRTUAL ACQUISITION</p><DialogTitle>Add {selected?.model} to your watch box?</DialogTitle><DialogDescription>This uses {selected ? money.format(selected.price) : "$0"} of play money. No payment, shipping, or actual purchase.</DialogDescription></DialogHeader>
          <div className="dialog-balance"><span>Balance after</span><strong>{money.format(portfolio.cash - (selected?.price ?? 0))}</strong></div>
          <DialogFooter><Button variant="outline" onClick={() => setSelected(null)}>Keep browsing</Button><Button className="acquire-button" onClick={acquire}>Acquire watch</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(selling)} onOpenChange={(open) => !open && setSelling(null)}>
        <DialogContent className="acquire-dialog">
          <DialogHeader><p className="eyebrow"><Sparkles /> MARKET SALE</p><DialogTitle>Sell your {selling?.model}?</DialogTitle><DialogDescription>The watch leaves your collection and its current market value returns to your play-money balance.</DialogDescription></DialogHeader>
          <div className="sale-summary">
            <div><span>Acquired for</span><strong>{money.format(portfolio.holdings.find((holding) => holding.watchId === selling?.id)?.purchasePrice ?? 0)}</strong></div>
            <div><span>Sell for</span><strong>{money.format(selling?.market ?? 0)}</strong></div>
            <div><span>Gain / loss</span><strong className={(selling?.market ?? 0) - (portfolio.holdings.find((holding) => holding.watchId === selling?.id)?.purchasePrice ?? 0) < 0 ? "negative" : "positive"}>{money.format((selling?.market ?? 0) - (portfolio.holdings.find((holding) => holding.watchId === selling?.id)?.purchasePrice ?? 0))}</strong></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setSelling(null)}>Keep watch</Button><Button className="sell-confirm-button" onClick={sell}>Sell at market</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {notice && <div className="portfolio-notice" role="status"><CheckCircle2 /><span>{notice}</span></div>}
    </main>
  );
}
