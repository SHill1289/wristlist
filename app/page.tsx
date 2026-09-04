"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { ArrowDownRight, ArrowUpRight, Check, CheckCircle2, ChevronDown, CircleCheck, Compass, Copy, Gem, Gift, Heart, Search, Share2, SlidersHorizontal, Sparkles, Target, Trophy, WalletCards, Watch, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { WATCHES, type WatchListing } from "@/data/watches";
type Holding = { watchId: number; purchasePrice: number; acquiredAt: string };
type Portfolio = { cash: number; holdings: Holding[] };
type SortOption = "curated" | "price-low" | "price-high" | "market-high" | "performance";
type AppTab = "discover" | "saved" | "collection" | "challenges";
type StreakState = { lastVisit: string; current: number; longest: number; rewardedDates: string[] };
type BudgetPreference = "any" | "under-1000" | "1000-5000" | "5000-15000" | "15000-plus";
type Preferences = { styles: WatchListing["category"][]; budget: BudgetPreference; brands: string[]; completed: boolean };

const money = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
const STARTING_BALANCE = 50000;
const PORTFOLIO_KEY = "wristlist-portfolio-v1";
const SAVED_KEY = "wristlist-saved-v1";
const CLAIMED_KEY = "wristlist-claimed-challenges-v1";
const STREAK_KEY = "wristlist-streak-v1";
const PREFERENCES_KEY = "wristlist-preferences-v1";
const STREAK_REWARD = 2500;
const CHALLENGE_REWARDS: Record<string, number> = { "first-three": 2000, "well-rounded": 3000, "dive-team": 2500, "brand-explorer": 4000, "heavy-hitter": 5000 };
const DEFAULT_PREFERENCES: Preferences = { styles: ["Sport", "Dive", "Dress"], budget: "any", brands: [], completed: false };
const WATCH_BRANDS = [...new Set(WATCHES.map((watch) => watch.maker))];

function localDateKey(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function daysBetween(previous: string, current: string) {
  const [previousYear, previousMonth, previousDay] = previous.split("-").map(Number);
  const [currentYear, currentMonth, currentDay] = current.split("-").map(Number);
  return Math.round((Date.UTC(currentYear, currentMonth - 1, currentDay) - Date.UTC(previousYear, previousMonth - 1, previousDay)) / 86400000);
}

function hashValue(value: string) {
  return [...value].reduce((total, character) => (total * 31 + character.charCodeAt(0)) >>> 0, 7);
}

function matchesBudget(watch: WatchListing, budget: BudgetPreference) {
  if (budget === "under-1000") return watch.price < 1000;
  if (budget === "1000-5000") return watch.price >= 1000 && watch.price < 5000;
  if (budget === "5000-15000") return watch.price >= 5000 && watch.price < 15000;
  if (budget === "15000-plus") return watch.price >= 15000;
  return true;
}

function dailySelection(dateKey: string, preferences: Preferences) {
  return [...WATCHES]
    .map((watch) => {
      const hash = hashValue(`${dateKey}-${watch.id}`);
      const dailyVariation = (Math.imul(hash ^ (hash >>> 16), 2246822519) >>> 0) % 61;
      const brandScore = preferences.brands.includes(watch.maker) ? 80 : 0;
      const styleScore = preferences.styles.includes(watch.category) ? 45 : 0;
      const budgetScore = matchesBudget(watch, preferences.budget) ? 35 : 0;
      return { watch, score: dailyVariation + brandScore + styleScore + budgetScore };
    })
    .sort((a, b) => b.score - a.score || a.watch.id - b.watch.id)
    .slice(0, 6)
    .map(({ watch }) => watch);
}

export default function Home() {
  const [portfolio, setPortfolio] = useState<Portfolio>({ cash: STARTING_BALANCE, holdings: [] });
  const [saved, setSaved] = useState<number[]>([2]);
  const [claimedChallenges, setClaimedChallenges] = useState<string[]>([]);
  const [streak, setStreak] = useState<StreakState>({ lastVisit: "", current: 0, longest: 0, rewardedDates: [] });
  const [preferences, setPreferences] = useState<Preferences>(DEFAULT_PREFERENCES);
  const [draftPreferences, setDraftPreferences] = useState<Preferences>(DEFAULT_PREFERENCES);
  const [preferencesOpen, setPreferencesOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [shareUrl, setShareUrl] = useState("");
  const [shareCopied, setShareCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<AppTab>("discover");
  const [showAll, setShowAll] = useState(false);
  const [todayKey, setTodayKey] = useState("");
  const [dropCountdown, setDropCountdown] = useState("");
  const [category, setCategory] = useState("All watches");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortOption>("curated");
  const [selected, setSelected] = useState<WatchListing | null>(null);
  const [selling, setSelling] = useState<WatchListing | null>(null);
  const [acquiredReveal, setAcquiredReveal] = useState<WatchListing | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      try {
        const storedPortfolio = window.localStorage.getItem(PORTFOLIO_KEY);
        const storedSaved = window.localStorage.getItem(SAVED_KEY);
        const storedClaims = window.localStorage.getItem(CLAIMED_KEY);
        const storedStreak = window.localStorage.getItem(STREAK_KEY);
        const storedPreferences = window.localStorage.getItem(PREFERENCES_KEY);
        const today = localDateKey();
        let nextPortfolio: Portfolio = { cash: STARTING_BALANCE, holdings: [] };

        if (storedPortfolio) {
          const parsed = JSON.parse(storedPortfolio) as Portfolio;
          if (typeof parsed.cash === "number" && Array.isArray(parsed.holdings)) nextPortfolio = parsed;
        } else {
          const legacyOwned = JSON.parse(window.localStorage.getItem("wristlist-owned") ?? "[]") as number[];
          const legacyHoldings = legacyOwned.flatMap((id) => {
            const watch = WATCHES.find((item) => item.id === id);
            return watch ? [{ watchId: id, purchasePrice: watch.price, acquiredAt: new Date().toISOString() }] : [];
          });
          if (legacyHoldings.length) {
            nextPortfolio = { cash: STARTING_BALANCE - legacyHoldings.reduce((sum, item) => sum + item.purchasePrice, 0), holdings: legacyHoldings };
          }
        }

        if (storedSaved) setSaved(JSON.parse(storedSaved));
        if (storedClaims) setClaimedChallenges(JSON.parse(storedClaims));
        if (storedPreferences) {
          const parsedPreferences = JSON.parse(storedPreferences) as Preferences;
          const nextPreferences = { ...DEFAULT_PREFERENCES, ...parsedPreferences, completed: true };
          setPreferences(nextPreferences);
          setDraftPreferences(nextPreferences);
        } else {
          setPreferencesOpen(true);
        }
        const previousStreak: StreakState = storedStreak ? JSON.parse(storedStreak) : { lastVisit: "", current: 0, longest: 0, rewardedDates: [] };
        const difference = previousStreak.lastVisit ? daysBetween(previousStreak.lastVisit, today) : null;
        const currentStreak = difference === 0 ? previousStreak.current : difference === 1 ? previousStreak.current + 1 : 1;
        const isNewVisit = difference !== 0;
        const earnsReward = isNewVisit && currentStreak % 7 === 0 && !previousStreak.rewardedDates.includes(today);
        const nextStreak = { lastVisit: today, current: currentStreak, longest: Math.max(previousStreak.longest, currentStreak), rewardedDates: earnsReward ? [...previousStreak.rewardedDates, today] : previousStreak.rewardedDates };
        if (earnsReward) {
          nextPortfolio = { ...nextPortfolio, cash: nextPortfolio.cash + STREAK_REWARD };
          setNotice(`Seven-day streak complete. ${money.format(STREAK_REWARD)} added to your play money.`);
        }
        setPortfolio(nextPortfolio);
        setStreak(nextStreak);
        setTodayKey(today);
      } catch {
        setPortfolio({ cash: STARTING_BALANCE, holdings: [] });
        setStreak({ lastVisit: localDateKey(), current: 1, longest: 1, rewardedDates: [] });
        setTodayKey(localDateKey());
        setPreferencesOpen(true);
      }
      setLoaded(true);
    }, 0);
    return () => window.clearTimeout(timeout);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    window.localStorage.setItem(PORTFOLIO_KEY, JSON.stringify(portfolio));
    window.localStorage.setItem(SAVED_KEY, JSON.stringify(saved));
    window.localStorage.setItem(CLAIMED_KEY, JSON.stringify(claimedChallenges));
    window.localStorage.setItem(STREAK_KEY, JSON.stringify(streak));
    if (preferences.completed) window.localStorage.setItem(PREFERENCES_KEY, JSON.stringify(preferences));
  }, [portfolio, saved, claimedChallenges, streak, preferences, loaded]);

  useEffect(() => {
    function updateCountdown() {
      const now = new Date();
      const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
      const minutes = Math.max(0, Math.floor((tomorrow.getTime() - now.getTime()) / 60000));
      setTodayKey(localDateKey(now));
      setDropCountdown(`${Math.floor(minutes / 60)}h ${minutes % 60}m`);
    }
    const initial = window.setTimeout(updateCountdown, 0);
    const interval = window.setInterval(updateCountdown, 60000);
    return () => {
      window.clearTimeout(initial);
      window.clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    if (!notice) return;
    const timeout = window.setTimeout(() => setNotice(null), 3500);
    return () => window.clearTimeout(timeout);
  }, [notice]);

  useEffect(() => {
    if (!acquiredReveal) return;
    const timeout = window.setTimeout(() => setAcquiredReveal(null), 4400);
    return () => window.clearTimeout(timeout);
  }, [acquiredReveal]);

  const owned = useMemo(() => new Set(portfolio.holdings.map((holding) => holding.watchId)), [portfolio.holdings]);
  const collectionCost = portfolio.holdings.reduce((sum, holding) => sum + holding.purchasePrice, 0);
  const collectionMarket = portfolio.holdings.reduce((sum, holding) => sum + (WATCHES.find((watch) => watch.id === holding.watchId)?.market ?? 0), 0);
  const portfolioValue = portfolio.cash + collectionMarket;
  const claimedRewards = claimedChallenges.reduce((sum, id) => sum + (CHALLENGE_REWARDS[id] ?? 0), 0);
  const streakRewards = streak.rewardedDates.length * STREAK_REWARD;
  const portfolioGain = portfolioValue - STARTING_BALANCE - claimedRewards - streakRewards;
  const portfolioReturn = (portfolioGain / STARTING_BALANCE) * 100;
  const ownedWatches = useMemo(() => WATCHES.filter((watch) => owned.has(watch.id)), [owned]);
  const challenges = useMemo(() => {
    const ownedCategories = new Set(ownedWatches.map((watch) => watch.category)).size;
    const diveCount = ownedWatches.filter((watch) => watch.category === "Dive").length;
    const brandCount = new Set(ownedWatches.map((watch) => watch.maker)).size;
    return [
      { id: "first-three", title: "First Three", description: "Build the foundation of your watch box.", progress: portfolio.holdings.length, target: 3, unit: "watches", reward: 2000 },
      { id: "well-rounded", title: "Well Rounded", description: "Own at least one Sport, Dive, and Dress watch.", progress: ownedCategories, target: 3, unit: "categories", reward: 3000 },
      { id: "dive-team", title: "Dive Team", description: "Assemble a three-watch dive collection.", progress: diveCount, target: 3, unit: "dive watches", reward: 2500 },
      { id: "brand-explorer", title: "Brand Explorer", description: "Collect watches from five different makers.", progress: brandCount, target: 5, unit: "brands", reward: 4000 },
      { id: "heavy-hitter", title: "Heavy Hitter", description: "Reach $25,000 in total collection value.", progress: collectionMarket, target: 25000, unit: "value", reward: 5000 },
    ];
  }, [collectionMarket, ownedWatches, portfolio.holdings.length]);
  const dailyWatches = useMemo(() => dailySelection(todayKey || "wristlist", preferences), [preferences, todayKey]);
  const streakCycleDay = streak.current > 0 ? ((streak.current - 1) % 7) + 1 : 0;
  const daysToReward = streakCycleDay === 7 ? 7 : 7 - streakCycleDay;
  const visibleWatches = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const base = activeTab === "collection"
      ? WATCHES.filter((watch) => owned.has(watch.id))
      : activeTab === "saved"
        ? WATCHES.filter((watch) => saved.includes(watch.id))
        : showAll
          ? WATCHES
          : dailyWatches;
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
  }, [activeTab, category, dailyWatches, owned, query, saved, showAll, sort]);

  function acquire() {
    if (!selected || owned.has(selected.id) || selected.price > portfolio.cash) return;
    const acquiredWatch = selected;
    setPortfolio((current) => ({
      cash: current.cash - acquiredWatch.price,
      holdings: [...current.holdings, { watchId: acquiredWatch.id, purchasePrice: acquiredWatch.price, acquiredAt: new Date().toISOString() }],
    }));
    setSelected(null);
    setAcquiredReveal(acquiredWatch);
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

  function claimChallenge(id: string, reward: number) {
    const challenge = challenges.find((item) => item.id === id);
    if (!challenge || challenge.progress < challenge.target || claimedChallenges.includes(id)) return;
    setPortfolio((current) => ({ ...current, cash: current.cash + reward }));
    setClaimedChallenges((current) => [...current, id]);
    setNotice(`${challenge.title} complete. ${money.format(reward)} added to your play money.`);
  }

  function savePreferences() {
    if (!draftPreferences.styles.length) return;
    const nextPreferences = { ...draftPreferences, completed: true };
    setPreferences(nextPreferences);
    setDraftPreferences(nextPreferences);
    setPreferencesOpen(false);
    setShowAll(false);
    setActiveTab("discover");
    setNotice("Your daily drop has been personalized.");
  }

  function createShareLink() {
    if (!portfolio.holdings.length) return;
    const snapshot = {
      version: 1,
      date: localDateKey(),
      items: portfolio.holdings.map((holding) => ({
        id: holding.watchId,
        paid: holding.purchasePrice,
        market: WATCHES.find((watch) => watch.id === holding.watchId)?.market ?? holding.purchasePrice,
      })),
    };
    const token = window.btoa(JSON.stringify(snapshot)).replaceAll("+", "-").replaceAll("/", "_").replaceAll("=", "");
    setShareUrl(`${window.location.origin}/share/${token}`);
    setShareCopied(false);
    setShareOpen(true);
  }

  async function copyShareLink() {
    if (!shareUrl) return;
    await window.navigator.clipboard.writeText(shareUrl);
    setShareCopied(true);
  }

  async function openNativeShare() {
    if (!shareUrl || !window.navigator.share) return;
    await window.navigator.share({ title: "My Wristlist collection", text: "Take a look at this virtual watch collection.", url: shareUrl });
  }

  return (
    <main className="app-shell">
      <header className="topbar">
        <a className="brand" href="#" aria-label="Wristlist home"><span className="brand-mark"><Watch /></span><span>WRISTLIST</span></a>
        <nav className="desktop-nav" aria-label="Primary navigation">
          <button className={activeTab === "discover" ? "active" : ""} onClick={() => setActiveTab("discover")}>Discover</button>
          <button className={activeTab === "saved" ? "active" : ""} onClick={() => setActiveTab("saved")}>Saved <span className="nav-count">{saved.length}</span></button>
          <button className={activeTab === "collection" ? "active" : ""} onClick={() => setActiveTab("collection")}>My collection</button>
          <button className={activeTab === "challenges" ? "active" : ""} onClick={() => setActiveTab("challenges")}>Challenges</button>
        </nav>
        <div className="header-actions">
          <button className="icon-button" aria-label="Search watches" onClick={() => {
            setActiveTab("discover");
            setShowAll(true);
            window.setTimeout(() => searchRef.current?.focus(), 0);
          }}><Search /></button>
          <div className="balance-pill"><span>PLAY MONEY</span><strong>{money.format(portfolio.cash)}</strong></div>
          <button className="avatar" aria-label="Open watch preferences" onClick={() => { setDraftPreferences(preferences); setPreferencesOpen(true); }}>A</button>
        </div>
      </header>

      <section className="dashboard">
        <div className="welcome-row">
          <div>
            <p className="eyebrow"><Sparkles /> {activeTab === "challenges" ? "COLLECTOR CHALLENGES" : activeTab === "saved" ? "YOUR SHORTLIST" : activeTab === "collection" ? "YOUR COLLECTION" : "TODAY’S DROP"}</p>
            <h1>{activeTab === "discover" ? "Find your next watch." : activeTab === "saved" ? "Worth another look." : activeTab === "collection" ? "Your watch box." : "Put your collection to work."}</h1>
            <p className="intro">{activeTab === "discover" ? "Build the collection you want. Your wallet stays untouched." : activeTab === "saved" ? `${saved.length} ${saved.length === 1 ? "watch" : "watches"} saved for later consideration.` : activeTab === "collection" ? `${portfolio.holdings.length} ${portfolio.holdings.length === 1 ? "watch" : "watches"} acquired with zero buyer’s remorse.` : "Complete collection goals and earn more play money for your next acquisition."}</p>
            {activeTab === "collection" && portfolio.holdings.length > 0 && <button type="button" className="collection-share-button" onClick={createShareLink}><Share2 /> Share collection</button>}
          </div>
          <aside className="streak-card">
            <span className="streak-icon"><Trophy /></span>
            <div><strong>{streak.current} day streak</strong><span>{streakCycleDay === 7 ? "Reward earned. New cycle starts tomorrow" : `${daysToReward} ${daysToReward === 1 ? "day" : "days"} until ${money.format(STREAK_REWARD)}`}</span></div>
            <div className="streak-dots" aria-label={`${streakCycleDay} of 7 days completed`}>{Array.from({ length: 7 }, (_, index) => <i key={index} className={index >= streakCycleDay ? "empty" : ""} />)}</div>
          </aside>
        </div>

        <div className="metrics" aria-label="Collection summary">
          <div><span><WalletCards /> Available</span><strong>{money.format(portfolio.cash)}</strong><small>Play money</small></div>
          <div><span><Gem /> Collection value</span><strong>{money.format(collectionMarket)}</strong><small>{portfolio.holdings.length} pieces · Cost {money.format(collectionCost)}</small></div>
          <div><span>{portfolioGain < 0 ? <ArrowDownRight /> : <ArrowUpRight />} Portfolio return</span><strong className={portfolioGain < 0 ? "negative" : "positive"}>{portfolioGain >= 0 ? "+" : ""}{portfolioReturn.toFixed(1)}%</strong><small>{portfolioGain >= 0 ? "+" : ""}{money.format(portfolioGain)} overall</small></div>
        </div>

        {activeTab === "challenges" ? (
          <section className="challenges-section" aria-label="Collection challenges">
            <div className="challenge-summary">
              <div><span className="challenge-summary-icon"><Target /></span><div><strong>{challenges.filter((challenge) => claimedChallenges.includes(challenge.id)).length} of {challenges.length} claimed</strong><span>One-time virtual rewards</span></div></div>
              <p>Complete a requirement, then claim the reward. Selling a watch later will not remove rewards already earned.</p>
            </div>
            <div className="challenge-grid">
              {challenges.map((challenge) => {
                const complete = challenge.progress >= challenge.target;
                const claimed = claimedChallenges.includes(challenge.id);
                const progress = Math.min(100, (challenge.progress / challenge.target) * 100);
                const progressLabel = challenge.unit === "value" ? `${money.format(Math.min(challenge.progress, challenge.target))} of ${money.format(challenge.target)}` : `${Math.min(challenge.progress, challenge.target)} of ${challenge.target} ${challenge.unit}`;
                return (
                  <article className={`challenge-card ${claimed ? "claimed" : complete ? "complete" : ""}`} key={challenge.id}>
                    <div className="challenge-card-head"><span>{claimed ? <CircleCheck /> : <Trophy />}</span><div><p>{claimed ? "COMPLETED" : complete ? "READY TO CLAIM" : "IN PROGRESS"}</p><strong>{money.format(challenge.reward)}</strong></div></div>
                    <h2>{challenge.title}</h2>
                    <p>{challenge.description}</p>
                    <div className="challenge-progress"><div><span>{progressLabel}</span><span>{Math.round(progress)}%</span></div><div className="progress-track"><i style={{ width: `${progress}%` }} /></div></div>
                    <Button disabled={!complete || claimed} onClick={() => claimChallenge(challenge.id, challenge.reward)} className={claimed ? "challenge-claimed-button" : "challenge-claim-button"}>{claimed ? <><CircleCheck /> Reward claimed</> : complete ? <><Gift /> Claim {money.format(challenge.reward)}</> : "Keep collecting"}</Button>
                  </article>
                );
              })}
            </div>
            <p className="challenge-disclaimer">Challenges, rewards, balances, and transactions are entirely virtual.</p>
          </section>
        ) : (
          <>
        <div className="catalog-tools">
          {activeTab === "discover" && (
            <div className="drop-status">
              <div className="drop-copy">
                <span><Sparkles /> {showAll ? "FULL CATALOG" : "TODAY’S SIX-WATCH DROP"}</span>
                <small>{showAll ? `${WATCHES.length} watches available` : `New selection in ${dropCountdown || "--"}`}</small>
              </div>
              <div className="drop-actions">
                <button type="button" onClick={() => {
                  setShowAll((current) => !current);
                  setQuery("");
                  setCategory("All watches");
                }}>{showAll ? "View today’s drop" : "Browse all watches"}</button>
                <button type="button" onClick={() => { setDraftPreferences(preferences); setPreferencesOpen(true); }}>Tune my drop</button>
              </div>
            </div>
          )}
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
          <p className="catalog-count">Showing {visibleWatches.length} of {activeTab === "collection" ? portfolio.holdings.length : activeTab === "saved" ? saved.length : showAll ? WATCHES.length : 6} watches</p>
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
          <div className="empty-state"><span>{activeTab === "saved" ? <Heart /> : <Compass />}</span><h2>{query || category !== "All watches" ? "No watches match." : activeTab === "saved" ? "Nothing saved yet." : "Your watch box is waiting."}</h2><p>{query || category !== "All watches" ? "Try another search or clear your filters." : activeTab === "saved" ? "Tap the heart on any watch you want to revisit." : "Explore today’s drop and virtually acquire your first piece."}</p>{query || category !== "All watches" ? <Button onClick={() => { setQuery(""); setCategory("All watches"); }}>Clear filters</Button> : <Button onClick={() => setActiveTab("discover")}>Browse watches</Button>}</div>
        )}
          </>
        )}
      </section>

      <footer className="site-footer">
        <span>Independent fantasy-collecting project. Not affiliated with the featured brands.</span>
        <a href="/credits">Photo credits</a>
      </footer>

      <nav className="mobile-nav" aria-label="Mobile navigation">
        <button className={activeTab === "discover" ? "active" : ""} onClick={() => setActiveTab("discover")}><Compass />Discover</button>
        <button className={activeTab === "saved" ? "active" : ""} onClick={() => setActiveTab("saved")}><Heart />Saved</button>
        <button className={activeTab === "collection" ? "active" : ""} onClick={() => setActiveTab("collection")}><Watch />Collection</button>
        <button className={activeTab === "challenges" ? "active" : ""} onClick={() => setActiveTab("challenges")}><Trophy />Challenges</button>
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

      {acquiredReveal && (
        <div className="acquisition-reveal" role="dialog" aria-modal="true" aria-label={`${acquiredReveal.maker} ${acquiredReveal.model} acquired`}>
          <div className="acquisition-particles" aria-hidden="true">
            {Array.from({ length: 24 }, (_, index) => <i key={index} style={{ left: `${4 + ((index * 37) % 92)}%`, animationDelay: `${(index % 8) * .09}s`, animationDuration: `${1.8 + (index % 5) * .18}s` }} />)}
          </div>
          <button type="button" className="reveal-close" onClick={() => setAcquiredReveal(null)} aria-label="Close acquisition reveal"><X /></button>
          <div className="reveal-card">
            <div className={`reveal-watch-image ${acquiredReveal.imageStyle === "cutout" ? "cutout-image" : ""}`}>
              <span className="reveal-halo" aria-hidden="true" />
              <img src={acquiredReveal.image} alt={`${acquiredReveal.maker} ${acquiredReveal.model} watch`} />
            </div>
            <div className="reveal-copy">
              <span className="reveal-check"><Check /></span>
              <p><Sparkles /> ACQUISITION COMPLETE</p>
              <h2>{acquiredReveal.model}</h2>
              <span>{acquiredReveal.maker} · {acquiredReveal.reference}</span>
              <strong>{money.format(acquiredReveal.price)}</strong>
              <button type="button" onClick={() => setAcquiredReveal(null)}>View in my collection</button>
            </div>
          </div>
        </div>
      )}

      <Dialog open={preferencesOpen} onOpenChange={(open) => {
        if (!open && !preferences.completed) return;
        setPreferencesOpen(open);
        if (open) setDraftPreferences(preferences);
      }}>
        <DialogContent className="preferences-dialog">
          <DialogHeader>
            <p className="eyebrow"><SlidersHorizontal /> PERSONALIZE YOUR DROP</p>
            <DialogTitle>What belongs in your watch box?</DialogTitle>
            <DialogDescription>Choose what catches your eye. You can change these preferences anytime from the profile button.</DialogDescription>
          </DialogHeader>

          <div className="preference-group">
            <div className="preference-heading"><strong>Styles</strong><span>Select at least one</span></div>
            <div className="preference-options">
              {(["Sport", "Dive", "Dress"] as WatchListing["category"][]).map((style) => {
                const selectedStyle = draftPreferences.styles.includes(style);
                return <button type="button" key={style} className={selectedStyle ? "selected" : ""} onClick={() => setDraftPreferences((current) => ({ ...current, styles: selectedStyle ? current.styles.filter((item) => item !== style) : [...current.styles, style] }))}>{style}</button>;
              })}
            </div>
          </div>

          <div className="preference-group">
            <div className="preference-heading"><strong>Price range</strong><span>Pick one</span></div>
            <div className="preference-options">
              {([
                ["any", "Surprise me"],
                ["under-1000", "Under $1,000"],
                ["1000-5000", "$1,000–$5,000"],
                ["5000-15000", "$5,000–$15,000"],
                ["15000-plus", "$15,000+"]
              ] as [BudgetPreference, string][]).map(([value, label]) => <button type="button" key={value} className={draftPreferences.budget === value ? "selected" : ""} onClick={() => setDraftPreferences((current) => ({ ...current, budget: value }))}>{label}</button>)}
            </div>
          </div>

          <div className="preference-group">
            <div className="preference-heading"><strong>Favorite brands</strong><span>Choose up to three</span></div>
            <div className="preference-options brand-options">
              {WATCH_BRANDS.map((brand) => {
                const selectedBrand = draftPreferences.brands.includes(brand);
                const atLimit = draftPreferences.brands.length >= 3 && !selectedBrand;
                return <button type="button" key={brand} disabled={atLimit} className={selectedBrand ? "selected" : ""} onClick={() => setDraftPreferences((current) => ({ ...current, brands: selectedBrand ? current.brands.filter((item) => item !== brand) : [...current.brands, brand] }))}>{brand}</button>;
              })}
            </div>
          </div>

          <DialogFooter className="preferences-footer">
            {preferences.completed && <Button variant="outline" onClick={() => setDraftPreferences({ ...DEFAULT_PREFERENCES, completed: true })}>Reset choices</Button>}
            <Button className="save-preferences-button" disabled={!draftPreferences.styles.length} onClick={savePreferences}>{preferences.completed ? "Update my drop" : "Build my first drop"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={shareOpen} onOpenChange={setShareOpen}>
        <DialogContent className="share-dialog">
          <DialogHeader>
            <p className="eyebrow"><Share2 /> COLLECTION SNAPSHOT</p>
            <DialogTitle>Your watch box is ready to share.</DialogTitle>
            <DialogDescription>This read-only link captures the watches and values in your collection right now. Your play-money balance, saved watches, streak, and preferences stay private.</DialogDescription>
          </DialogHeader>
          <label className="share-link-field">
            <span>Public snapshot link</span>
            <input readOnly value={shareUrl} onFocus={(event) => event.currentTarget.select()} aria-label="Public collection snapshot link" />
          </label>
          <DialogFooter>
            {typeof navigator !== "undefined" && typeof navigator.share === "function" && <Button variant="outline" onClick={openNativeShare}><Share2 /> Share</Button>}
            <Button className="copy-link-button" onClick={copyShareLink}>{shareCopied ? <><Check /> Copied</> : <><Copy /> Copy link</>}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {notice && <div className="portfolio-notice" role="status"><CheckCircle2 /><span>{notice}</span></div>}
    </main>
  );
}
