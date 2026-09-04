"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowDownRight, ArrowLeft, ArrowUpRight, CheckCircle2, Sparkles, Watch } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { WatchDetail, WatchListing } from "@/data/watches";

type Holding = { watchId: number; purchasePrice: number; acquiredAt: string };
type Portfolio = { cash: number; holdings: Holding[] };

const STARTING_BALANCE = 50000;
const PORTFOLIO_KEY = "wristlist-portfolio-v1";
const money = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
const months = ["Apr", "May", "Jun", "Jul", "Aug", "Sep"];

export default function WatchDetailClient({ watch, detail }: { watch: WatchListing; detail: WatchDetail }) {
  const [portfolio, setPortfolio] = useState<Portfolio>({ cash: STARTING_BALANCE, holdings: [] });
  const [loaded, setLoaded] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      try {
        const stored = window.localStorage.getItem(PORTFOLIO_KEY);
        if (stored) {
          const parsed = JSON.parse(stored) as Portfolio;
          if (typeof parsed.cash === "number" && Array.isArray(parsed.holdings)) setPortfolio(parsed);
        }
      } catch {
        setPortfolio({ cash: STARTING_BALANCE, holdings: [] });
      }
      setLoaded(true);
    }, 0);
    return () => window.clearTimeout(timeout);
  }, []);

  useEffect(() => {
    if (loaded) window.localStorage.setItem(PORTFOLIO_KEY, JSON.stringify(portfolio));
  }, [loaded, portfolio]);

  useEffect(() => {
    if (!notice) return;
    const timeout = window.setTimeout(() => setNotice(null), 3500);
    return () => window.clearTimeout(timeout);
  }, [notice]);

  const holding = portfolio.holdings.find((item) => item.watchId === watch.id);
  const isOwned = Boolean(holding);
  const marketMove = watch.market - watch.price;
  const marketMovePercent = (marketMove / watch.price) * 100;
  const chart = useMemo(() => {
    const min = Math.min(...detail.history) * 0.98;
    const max = Math.max(...detail.history) * 1.02;
    const range = Math.max(max - min, 1);
    return detail.history.map((value, index) => ({ value, x: 24 + index * 110.4, y: 184 - ((value - min) / range) * 150 }));
  }, [detail.history]);

  function completeTransaction() {
    if (isOwned) {
      setPortfolio((current) => ({ cash: current.cash + watch.market, holdings: current.holdings.filter((item) => item.watchId !== watch.id) }));
      setNotice(`${watch.maker} ${watch.model} sold for ${money.format(watch.market)}.`);
    } else if (portfolio.cash >= watch.price) {
      setPortfolio((current) => ({ cash: current.cash - watch.price, holdings: [...current.holdings, { watchId: watch.id, purchasePrice: watch.price, acquiredAt: new Date().toISOString() }] }));
      setNotice(`${watch.maker} ${watch.model} added to your collection.`);
    }
    setConfirming(false);
  }

  const chartPoints = chart.map((point) => `${point.x},${point.y}`).join(" ");

  return (
    <main className="detail-shell">
      <header className="detail-topbar">
        <Link className="brand" href="/"><span className="brand-mark"><Watch /></span><span>WRISTLIST</span></Link>
        <div className="balance-pill"><span>PLAY MONEY</span><strong>{money.format(portfolio.cash)}</strong></div>
      </header>

      <div className="detail-page">
        <Link className="detail-back" href="/"><ArrowLeft /> Back to discover</Link>
        <section className="detail-hero">
          <div className="detail-image"><img src={watch.image} alt={`${watch.maker} ${watch.model} watch`} /></div>
          <div className="detail-copy">
            <p className="eyebrow"><Sparkles /> {watch.note.toUpperCase()}</p>
            <div className="detail-kicker"><span>{watch.maker}</span><span>Ref. {watch.reference}</span></div>
            <h1>{watch.model}</h1>
            <p className="detail-description">{detail.description}</p>
            <div className="detail-price-row">
              <div><span>{isOwned ? "Current value" : "Acquire for"}</span><strong>{money.format(isOwned ? watch.market : watch.price)}</strong></div>
              <div><span>Market value</span><strong>{money.format(watch.market)}</strong></div>
              <div><span>Market move</span><strong className={marketMove < 0 ? "negative" : "positive"}>{marketMove >= 0 ? "+" : ""}{marketMovePercent.toFixed(1)}%</strong></div>
            </div>
            <Button className={isOwned ? "detail-sell-button" : "detail-acquire-button"} disabled={!isOwned && portfolio.cash < watch.price} onClick={() => setConfirming(true)}>{isOwned ? "Sell at market" : portfolio.cash < watch.price ? "Not enough play money" : "Acquire watch"}</Button>
            <p className="simulation-note">No payment or physical purchase. Pricing and history are simulated for gameplay.</p>
          </div>
        </section>

        <section className="detail-lower">
          <div className="spec-panel">
            <p className="section-label">SPECIFICATIONS</p>
            <h2>At a glance.</h2>
            <div className="spec-grid">{detail.specs.map((spec) => <div key={spec.label}><span>{spec.label}</span><strong>{spec.value}</strong></div>)}</div>
          </div>
          <div className="chart-panel">
            <div className="chart-heading"><div><p className="section-label">SIMULATED MARKET</p><h2>Six-month history.</h2></div><div className={marketMove < 0 ? "chart-change negative" : "chart-change positive"}>{marketMove < 0 ? <ArrowDownRight /> : <ArrowUpRight />}{marketMove >= 0 ? "+" : ""}{money.format(marketMove)}</div></div>
            <svg className="price-chart" viewBox="0 0 600 220" role="img" aria-label={`Simulated six-month market history ending at ${money.format(watch.market)}`}>
              <line x1="24" y1="184" x2="576" y2="184" className="chart-axis" />
              <polyline points={chartPoints} className="chart-line" />
              {chart.map((point, index) => <g key={months[index]}><circle cx={point.x} cy={point.y} r="5" className="chart-dot" /><text x={point.x} y="210" textAnchor="middle">{months[index]}</text></g>)}
            </svg>
          </div>
        </section>
      </div>

      <Dialog open={confirming} onOpenChange={setConfirming}>
        <DialogContent className="acquire-dialog">
          <DialogHeader><p className="eyebrow"><Sparkles /> {isOwned ? "MARKET SALE" : "VIRTUAL ACQUISITION"}</p><DialogTitle>{isOwned ? `Sell your ${watch.model}?` : `Add ${watch.model} to your watch box?`}</DialogTitle><DialogDescription>{isOwned ? `${money.format(watch.market)} will return to your play-money balance.` : `This uses ${money.format(watch.price)} of play money. No actual purchase is made.`}</DialogDescription></DialogHeader>
          <div className="dialog-balance"><span>Balance after</span><strong>{money.format(isOwned ? portfolio.cash + watch.market : portfolio.cash - watch.price)}</strong></div>
          <DialogFooter><Button variant="outline" onClick={() => setConfirming(false)}>Cancel</Button><Button className={isOwned ? "sell-confirm-button" : "acquire-button"} onClick={completeTransaction}>{isOwned ? "Sell at market" : "Acquire watch"}</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {notice && <div className="portfolio-notice" role="status"><CheckCircle2 /><span>{notice}</span></div>}
    </main>
  );
}
