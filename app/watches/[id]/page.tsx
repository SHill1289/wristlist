import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { WATCH_DETAILS, WATCHES } from "@/data/watches";
import WatchDetailClient from "./watch-detail-client";

type WatchPageProps = { params: Promise<{ id: string }> };

export function generateStaticParams() {
  return WATCHES.map((watch) => ({ id: String(watch.id) }));
}

export async function generateMetadata({ params }: WatchPageProps): Promise<Metadata> {
  const { id } = await params;
  const watch = WATCHES.find((item) => item.id === Number(id));
  return watch
    ? { title: `${watch.maker} ${watch.model} | Wristlist`, description: WATCH_DETAILS[watch.id]?.description }
    : { title: "Watch not found | Wristlist" };
}

export default async function WatchPage({ params }: WatchPageProps) {
  const { id } = await params;
  const watch = WATCHES.find((item) => item.id === Number(id));
  if (!watch || !WATCH_DETAILS[watch.id]) notFound();

  return <WatchDetailClient watch={watch} detail={WATCH_DETAILS[watch.id]} />;
}
