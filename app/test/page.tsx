"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Fraunces, IBM_Plex_Sans, IBM_Plex_Mono } from "next/font/google";
import { supabase } from "@/lib/supabase";

/**
 * Type system: a warm "lab notebook" palette + a display serif (Fraunces)
 * paired with a technical grotesk (IBM Plex Sans) and a mono face for
 * data / labels (IBM Plex Mono) — atomic numbers, dates, batch codes.
 */
const fraunces = Fraunces({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-display",
});

const plexSans = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-body",
});

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono",
});

type Alumni = {
  id: string;
  full_name: string;
  profile_photo: string | null;
  profession: string | null;
  designation: string | null;
  current_organisation: string | null;
  batch: string | null;
  session: string | null;
  city_country: string | null;
};

type NewsEvent = {
  id: string;
  title?: string | null;
  description?: string | null;
  type?: string | null;
  status?: string | null;
  image_url?: string | null;
  image?: string | null;
  event_date?: string | null;
  date?: string | null;
  location?: string | null;
  created_at?: string | null;
};

/* ================= SIGNATURE: PERIODIC ELEMENT TILE ================= */
/* Reused for stats, badges, and initials — the throughline of the page. */

function ElementTile({
  number,
  symbol,
  label,
  tone = "ink",
  size = "md",
}: {
  number?: string;
  symbol: string;
  label?: string;
  tone?: "ink" | "plum" | "verdigris";
  size?: "sm" | "md" | "lg";
}) {
  const toneMap = {
    ink: "border-[#1B211D]/15 bg-[#1B211D] text-[#FAF7F0]",
    plum: "border-[#6E2F5E]/25 bg-[#6E2F5E]/[0.06] text-[#6E2F5E]",
    verdigris: "border-[#1F6F5C]/25 bg-[#1F6F5C]/[0.06] text-[#1F6F5C]",
  } as const;

  const sizeMap = {
    sm: { box: "h-11 w-11", num: "text-[8px]", sym: "text-sm" },
    md: { box: "h-16 w-16", num: "text-[9px]", sym: "text-xl" },
    lg: { box: "h-20 w-20", num: "text-[10px]", sym: "text-2xl" },
  } as const;

  const s = sizeMap[size];

  return (
    <div className="inline-flex flex-col items-center gap-2">
      <div
        className={`flex ${s.box} flex-col justify-between rounded-[6px] border p-1.5 ${toneMap[tone]}`}
      >
        {number && (
          <span
            className={`${s.num} font-[family-name:var(--font-mono)] leading-none opacity-70`}
          >
            {number}
          </span>
        )}
        <span
          className={`${s.sym} text-center font-[family-name:var(--font-mono)] font-medium leading-none`}
        >
          {symbol}
        </span>
      </div>
      {label && (
        <span className="text-[11px] font-medium uppercase tracking-[0.14em] text-[#5B6058]">
          {label}
        </span>
      )}
    </div>
  );
}

/* Faint benzene-ring / hex lattice used as ambient texture, never as noise. */
function HexField({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      width="100%"
      height="100%"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
    >
      <defs>
        <pattern
          id="hexlattice"
          width="64"
          height="74"
          patternUnits="userSpaceOnUse"
          patternTransform="scale(1)"
        >
          <polygon
            points="32,2 58,18 58,50 32,66 6,50 6,18"
            fill="none"
            stroke="#1B211D"
            strokeWidth="0.6"
          />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#hexlattice)" />
    </svg>
  );
}

/* Minimal line icons — no emoji, drawn to match the mono/serif register. */
const Icon = {
  Flask: (props: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.5" {...props}>
      <path d="M9 3h6M10 3v6.2L4.8 18a1.8 1.8 0 0 0 1.5 2.8h11.4a1.8 1.8 0 0 0 1.5-2.8L14 9.2V3" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M7.5 15h9" strokeLinecap="round" />
    </svg>
  ),
  Atom: (props: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.5" {...props}>
      <circle cx="12" cy="12" r="1.6" />
      <ellipse cx="12" cy="12" rx="9" ry="3.6" />
      <ellipse cx="12" cy="12" rx="9" ry="3.6" transform="rotate(60 12 12)" />
      <ellipse cx="12" cy="12" rx="9" ry="3.6" transform="rotate(120 12 12)" />
    </svg>
  ),
  Beaker: (props: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.5" {...props}>
      <path d="M6 3h12M8 3v5.5L3.6 17a1.6 1.6 0 0 0 1.4 2.4h14a1.6 1.6 0 0 0 1.4-2.4L16 8.5V3" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M6 14h12" strokeLinecap="round" />
    </svg>
  ),
  Drop: (props: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.5" {...props}>
      <path d="M12 3c3.5 4.4 6 7.9 6 11a6 6 0 1 1-12 0c0-3.1 2.5-6.6 6-11Z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  Arrow: (props: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.5" {...props}>
      <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
};

export default function Home() {
  const [alumni, setAlumni] = useState<Alumni[]>([]);
  const [newsEvents, setNewsEvents] = useState<NewsEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [newsLoading, setNewsLoading] = useState(true);

  useEffect(() => {
    async function loadAlumni() {
      const { data, error } = await supabase
        .from("Alumni-profiles")
        .select(
          "id, full_name, profile_photo, profession, designation, current_organisation, batch, session, city_country"
        )
        .eq("status", "approved")
        .order("created_at", { ascending: false });

      if (!error && data) {
        setAlumni(data);
      }

      setLoading(false);
    }

    async function loadNewsEvents() {
      const { data, error } = await supabase
        .from("news_events")
        .select("*")
        .eq("status", "published")
        .order("created_at", { ascending: false })
        .limit(6);

      if (!error && data) {
        setNewsEvents(data);
      } else {
        console.error("News & Events loading error:", error);
      }

      setNewsLoading(false);
    }

    loadAlumni();
    loadNewsEvents();
  }, []);

  const totalMembers = alumni.length;

  function formatDate(dateValue?: string | null) {
    if (!dateValue) return "";
    const date = new Date(dateValue);
    if (Number.isNaN(date.getTime())) return dateValue;
    return date
      .toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
      .toUpperCase();
  }

  function getEventImage(item: NewsEvent) {
    return item.image_url || item.image || null;
  }

  function getEventDate(item: NewsEvent) {
    return item.event_date || item.date || item.created_at || null;
  }

  return (
    <main
      className={`${fraunces.variable} ${plexSans.variable} ${plexMono.variable} min-h-screen bg-[#FAF7F0] font-[family-name:var(--font-body)] text-[#1B211D]`}
    >
      {/* ================= NAVBAR ================= */}
      <nav className="sticky top-0 z-20 border-b border-[#1B211D]/10 bg-[#FAF7F0]/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4 lg:px-8">
          <Link href="/" className="flex items-center gap-3">
            <ElementTile number="2026" symbol="CoU" tone="ink" size="sm" />
            <div className="leading-none">
              <div className="font-[family-name:var(--font-display)] text-lg font-medium tracking-tight">
                CoUCAA
              </div>
              <div className="mt-1 font-[family-name:var(--font-mono)] text-[9px] uppercase tracking-[0.16em] text-[#5B6058]">
                Chemistry Alumni Association
              </div>
            </div>
          </Link>

          <div className="hidden items-center gap-8 md:flex">
            <Link href="/" className="text-sm font-medium text-[#1B211D] transition hover:text-[#6E2F5E]">
              Home
            </Link>
            <Link href="/alumni" className="text-sm font-medium text-[#5B6058] transition hover:text-[#6E2F5E]">
              Alumni
            </Link>
            <a href="#about" className="text-sm font-medium text-[#5B6058] transition hover:text-[#6E2F5E]">
              About
            </a>
            <a href="#messages" className="text-sm font-medium text-[#5B6058] transition hover:text-[#6E2F5E]">
              Messages
            </a>
            <Link
              href="/login"
              className="rounded-[6px] border border-[#1B211D]/20 px-4 py-2 text-sm font-medium text-[#1B211D] transition hover:border-[#1B211D] hover:bg-[#1B211D] hover:text-[#FAF7F0]"
            >
              Admin login
            </Link>
            <Link
              href="/register"
              className="rounded-[6px] bg-[#6E2F5E] px-4 py-2 text-sm font-medium text-[#FAF7F0] transition hover:bg-[#59264C]"
            >
              Join CoUCAA
            </Link>
          </div>
        </div>
      </nav>

      {/* ================= HERO ================= */}
      <section className="relative overflow-hidden">
        <HexField className="pointer-events-none absolute inset-0 opacity-[0.05]" />
        <div className="relative mx-auto max-w-6xl px-5 py-24 lg:px-8 lg:py-32">
          <div className="max-w-3xl">
            <div className="mb-6 inline-flex items-center gap-2 font-[family-name:var(--font-mono)] text-xs uppercase tracking-[0.2em] text-[#1F6F5C]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#1F6F5C]" />
              Est. 2026 &middot; Department of Chemistry
            </div>

            <h1 className="font-[family-name:var(--font-display)] text-4xl font-medium leading-[1.1] tracking-tight sm:text-5xl lg:text-6xl">
              Comilla University{" "}
              <span className="italic text-[#6E2F5E]">Chemistry</span>{" "}
              Alumni Association
            </h1>

            <p className="mt-7 max-w-xl text-lg leading-8 text-[#5B6058]">
              A standing record of everyone who has passed through the department —
              connecting graduates, researchers and educators across careers and
              continents.
            </p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/register"
                className="inline-flex items-center justify-center gap-2 rounded-[6px] bg-[#1B211D] px-6 py-3.5 text-sm font-medium text-[#FAF7F0] transition hover:bg-[#6E2F5E]"
              >
                Become a member <Icon.Arrow className="h-4 w-4" />
              </Link>
              <Link
                href="/alumni"
                className="inline-flex items-center justify-center rounded-[6px] border border-[#1B211D]/20 px-6 py-3.5 text-sm font-medium text-[#1B211D] transition hover:border-[#1B211D]"
              >
                Explore alumni
              </Link>
            </div>
          </div>

          <div className="mt-16 flex flex-wrap gap-10 border-t border-[#1B211D]/10 pt-10">
            <ElementTile number="01" symbol={loading ? "—" : String(totalMembers)} label="Total members" tone="plum" />
            <ElementTile number="02" symbol="01" label="Department" tone="verdigris" />
            <ElementTile number="03" symbol="2026" label="Founded" tone="ink" />
          </div>
        </div>
      </section>

      {/* ================= CREDENTIALS STRIP ================= */}
      <section className="border-y border-[#1B211D]/10">
        <div className="mx-auto grid max-w-6xl grid-cols-1 divide-y divide-[#1B211D]/10 px-5 sm:grid-cols-3 sm:divide-x sm:divide-y-0 lg:px-8">
          <div className="px-1 py-6 sm:px-6">
            <p className="font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.14em] text-[#1F6F5C]">Department</p>
            <p className="mt-1 font-[family-name:var(--font-display)] text-lg">Department of Chemistry</p>
          </div>
          <div className="px-1 py-6 sm:px-6">
            <p className="font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.14em] text-[#1F6F5C]">Institution</p>
            <p className="mt-1 font-[family-name:var(--font-display)] text-lg">Comilla University</p>
          </div>
          <div className="px-1 py-6 sm:px-6">
            <p className="font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.14em] text-[#1F6F5C]">Location</p>
            <p className="mt-1 font-[family-name:var(--font-display)] text-lg">Cumilla, Bangladesh</p>
          </div>
        </div>
      </section>

      {/* ================= ABOUT ================= */}
      <section id="about" className="py-24">
        <div className="mx-auto max-w-6xl px-5 lg:px-8">
          <div className="grid gap-14 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
            <div>
              <p className="font-[family-name:var(--font-mono)] text-xs uppercase tracking-[0.2em] text-[#6E2F5E]">
                About CoUCAA
              </p>
              <h2 className="mt-4 font-[family-name:var(--font-display)] text-3xl font-medium leading-tight tracking-tight sm:text-4xl">
                One department.
                <br />
                One community.
                <br />
                <span className="italic text-[#6E2F5E]">Many journeys.</span>
              </h2>
            </div>

            <div>
              <p className="text-lg leading-8 text-[#3A3F3B]">
                The Comilla University Chemistry Alumni Association (CoUCAA)
                is a platform designed to connect graduates, students,
                teachers and professionals of the Department of Chemistry,
                Comilla University.
              </p>
              <p className="mt-5 leading-7 text-[#5B6058]">
                From the laboratory to industry, academia, research and
                entrepreneurship, our alumni contribute across diverse
                fields. CoUCAA brings these experiences together and
                creates opportunities for collaboration, mentorship and
                lifelong connection.
              </p>

              <div className="mt-10 grid gap-8 border-t border-[#1B211D]/10 pt-8 sm:grid-cols-3">
                <div>
                  <Icon.Atom className="h-6 w-6 text-[#6E2F5E]" />
                  <h3 className="mt-4 font-[family-name:var(--font-display)] text-base font-medium">Connect</h3>
                  <p className="mt-2 text-sm leading-6 text-[#5B6058]">
                    Stay connected with fellow chemistry alumni.
                  </p>
                </div>
                <div>
                  <Icon.Beaker className="h-6 w-6 text-[#1F6F5C]" />
                  <h3 className="mt-4 font-[family-name:var(--font-display)] text-base font-medium">Mentor</h3>
                  <p className="mt-2 text-sm leading-6 text-[#5B6058]">
                    Share knowledge and guide the next generation.
                  </p>
                </div>
                <div>
                  <Icon.Flask className="h-6 w-6 text-[#1B211D]" />
                  <h3 className="mt-4 font-[family-name:var(--font-display)] text-base font-medium">Grow</h3>
                  <p className="mt-2 text-sm leading-6 text-[#5B6058]">
                    Build opportunities through collaboration.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= NEWS & EVENTS ================= */}
      <section className="border-t border-[#1B211D]/10 bg-[#F3EFE4] py-24">
        <div className="mx-auto max-w-6xl px-5 lg:px-8">
          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div>
              <p className="font-[family-name:var(--font-mono)] text-xs uppercase tracking-[0.2em] text-[#6E2F5E]">
                Stay updated
              </p>
              <h2 className="mt-3 font-[family-name:var(--font-display)] text-3xl font-medium tracking-tight sm:text-4xl">
                News &amp; events
              </h2>
              <p className="mt-3 max-w-xl text-[#5B6058]">
                Announcements, reunions and activities from the CoUCAA
                community.
              </p>
            </div>
          </div>

          {newsLoading ? (
            <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((item) => (
                <div key={item} className="h-[360px] animate-pulse rounded-[10px] bg-[#1B211D]/[0.06]" />
              ))}
            </div>
          ) : newsEvents.length === 0 ? (
            <div className="mt-10 rounded-[10px] border border-dashed border-[#1B211D]/25 bg-[#FAF7F0] p-12 text-center">
              <Icon.Drop className="mx-auto h-8 w-8 text-[#6E2F5E]" />
              <p className="mt-4 font-medium text-[#1B211D]">No news or events published yet.</p>
              <p className="mt-2 text-sm text-[#5B6058]">New announcements will appear here.</p>
            </div>
          ) : (
            <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {newsEvents.slice(0, 6).map((item) => {
                const image = getEventImage(item);
                const eventDate = getEventDate(item);

                return (
                  <article
                    key={item.id}
                    className="group overflow-hidden rounded-[10px] border border-[#1B211D]/10 bg-[#FAF7F0] transition duration-300 hover:-translate-y-1 hover:border-[#1B211D]/25"
                  >
                    <div className="relative h-52 overflow-hidden bg-[#1B211D]/[0.04]">
                      {image ? (
                        <img
                          src={image}
                          alt={item.title || "CoUCAA news and event"}
                          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="relative flex h-full items-center justify-center bg-[#1B211D]">
                          <HexField className="absolute inset-0 opacity-[0.12]" />
                          <ElementTile symbol="CoU" tone="ink" size="sm" />
                        </div>
                      )}

                      {item.type && (
                        <div className="absolute left-4 top-4">
                          <span className="rounded-[4px] border border-[#1B211D]/10 bg-[#FAF7F0] px-2.5 py-1 font-[family-name:var(--font-mono)] text-[10px] uppercase tracking-wider text-[#6E2F5E]">
                            {item.type}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="p-6">
                      <h3 className="line-clamp-2 font-[family-name:var(--font-display)] text-lg font-medium">
                        {item.title || "Untitled"}
                      </h3>

                      {item.description && (
                        <p className="mt-2 line-clamp-3 text-sm leading-6 text-[#5B6058]">
                          {item.description}
                        </p>
                      )}

                      <div className="mt-5 space-y-1.5 border-t border-[#1B211D]/10 pt-4 font-[family-name:var(--font-mono)] text-xs text-[#5B6058]">
                        {eventDate && <div>{formatDate(eventDate)}</div>}
                        {item.location && <div className="truncate">{item.location}</div>}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* ================= RECENT ALUMNI ================= */}
      <section className="py-24">
        <div className="mx-auto max-w-6xl px-5 lg:px-8">
          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div>
              <p className="font-[family-name:var(--font-mono)] text-xs uppercase tracking-[0.2em] text-[#1F6F5C]">
                Our community
              </p>
              <h2 className="mt-3 font-[family-name:var(--font-display)] text-3xl font-medium tracking-tight sm:text-4xl">
                Recently joined alumni
              </h2>
              <p className="mt-3 max-w-xl text-[#5B6058]">
                Meet some of the alumni already part of the CoUCAA community.
              </p>
            </div>
            <Link href="/alumni" className="inline-flex items-center gap-1.5 text-sm font-medium text-[#6E2F5E] transition hover:text-[#59264C]">
              View all alumni <Icon.Arrow className="h-4 w-4" />
            </Link>
          </div>

          {loading ? (
            <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {[1, 2, 3, 4].map((item) => (
                <div key={item} className="h-72 animate-pulse rounded-[10px] bg-[#1B211D]/[0.05]" />
              ))}
            </div>
          ) : alumni.length === 0 ? (
            <div className="mt-10 rounded-[10px] border border-dashed border-[#1B211D]/25 p-12 text-center">
              <p className="font-medium text-[#1B211D]">No approved alumni yet.</p>
              <p className="mt-2 text-sm text-[#5B6058]">Be one of the first members of the CoUCAA community.</p>
              <Link href="/register" className="mt-6 inline-block rounded-[6px] bg-[#1B211D] px-6 py-3 text-sm font-medium text-[#FAF7F0]">
                Join CoUCAA
              </Link>
            </div>
          ) : (
            <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {alumni.slice(0, 4).map((person) => (
                <Link
                  href={`/alumni/${person.id}`}
                  key={person.id}
                  className="group overflow-hidden rounded-[10px] border border-[#1B211D]/10 bg-[#FAF7F0] transition duration-300 hover:-translate-y-1 hover:border-[#1B211D]/25"
                >
                  <div className="flex h-44 items-center justify-center overflow-hidden bg-[#1B211D]/[0.04]">
                    {person.profile_photo ? (
                      <img
                        src={person.profile_photo}
                        alt={person.full_name}
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <ElementTile symbol={person.full_name?.charAt(0).toUpperCase() || "?"} tone="plum" size="lg" />
                    )}
                  </div>

                  <div className="p-5">
                    <h3 className="truncate font-[family-name:var(--font-display)] font-medium">{person.full_name}</h3>
                    <p className="mt-1 truncate text-sm font-medium text-[#6E2F5E]">
                      {person.designation || person.profession || "Chemistry alumni"}
                    </p>
                    <p className="mt-1 truncate text-sm text-[#5B6058]">
                      {person.current_organisation || "CoUCAA member"}
                    </p>

                    <div className="mt-4 flex items-center justify-between border-t border-[#1B211D]/10 pt-3 font-[family-name:var(--font-mono)] text-[11px] text-[#5B6058]">
                      <span>{person.batch || person.session || "Alumni"}</span>
                      <span className="text-[#6E2F5E]">View →</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ================= MESSAGES ================= */}
      <section id="messages" className="border-t border-[#1B211D]/10 bg-[#1B211D] py-24 text-[#FAF7F0]">
        <div className="mx-auto max-w-6xl px-5 lg:px-8">
          <div className="max-w-2xl">
            <p className="font-[family-name:var(--font-mono)] text-xs uppercase tracking-[0.2em] text-[#8FD9C4]">
              Leadership messages
            </p>
            <h2 className="mt-3 font-[family-name:var(--font-display)] text-3xl font-medium tracking-tight sm:text-4xl">
              Voices from our community
            </h2>
            <p className="mt-4 leading-7 text-[#C8C4B7]">
              Messages from the academic and alumni leadership of the
              Department of Chemistry.
            </p>
          </div>

          <div className="mt-12 grid gap-8 lg:grid-cols-3">
            {[
              { initials: "DH", name: "Department head", role: "Department of Chemistry", tone: "plum" as const, quote: "An alumni association creates a lasting bridge between the department and its graduates. I hope CoUCAA becomes a platform for knowledge sharing, mentorship and meaningful collaboration." },
              { initials: "PR", name: "President", role: "CoUCAA", tone: "verdigris" as const, quote: "Our alumni are connected by more than a degree. CoUCAA is about building relationships, creating opportunities and giving back to the department that brought us together." },
              { initials: "SE", name: "Secretary", role: "CoUCAA", tone: "ink" as const, quote: "We invite every chemistry graduate to join this growing network and help us create a stronger, more connected alumni community." },
            ].map((m) => (
              <div key={m.initials} className="border-l border-[#FAF7F0]/15 pl-6">
                <div className="flex items-center gap-3">
                  <ElementTile symbol={m.initials} tone={m.tone === "ink" ? "plum" : m.tone} size="sm" />
                  <div>
                    <h3 className="font-medium">{m.name}</h3>
                    <p className="text-sm text-[#9C988C]">{m.role}</p>
                  </div>
                </div>
                <p className="mt-6 font-[family-name:var(--font-display)] text-lg italic leading-7 text-[#EDEAE0]">
                  &ldquo;{m.quote}&rdquo;
                </p>
                <p className="mt-5 font-[family-name:var(--font-mono)] text-[10px] uppercase tracking-widest text-[#8FD9C4]">
                  Demo message
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= WHY COUCAA ================= */}
      <section className="py-24">
        <div className="mx-auto max-w-6xl px-5 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-start">
            <div>
              <p className="font-[family-name:var(--font-mono)] text-xs uppercase tracking-[0.2em] text-[#6E2F5E]">
                Why CoUCAA
              </p>
              <h2 className="mt-3 font-[family-name:var(--font-display)] text-3xl font-medium tracking-tight sm:text-4xl">
                A network that grows with you.
              </h2>
              <p className="mt-5 max-w-xl leading-7 text-[#5B6058]">
                Whether you are building a career, pursuing research,
                starting a business or supporting the next generation,
                CoUCAA gives you a place to connect and contribute.
              </p>
            </div>

            <div className="grid gap-px overflow-hidden rounded-[10px] border border-[#1B211D]/10 bg-[#1B211D]/10 sm:grid-cols-2">
              {[
                { icon: Icon.Atom, title: "Professional network", body: "Discover and connect with alumni working across different industries and professions." },
                { icon: Icon.Flask, title: "Research & academia", body: "Encourage research collaboration and academic exchange." },
                { icon: Icon.Beaker, title: "Mentorship", body: "Help students and young graduates learn from real-world experience." },
                { icon: Icon.Drop, title: "Give back", body: "Stay connected with the department and contribute to its future." },
              ].map((f) => (
                <div key={f.title} className="bg-[#FAF7F0] p-6">
                  <f.icon className="h-6 w-6 text-[#6E2F5E]" />
                  <h3 className="mt-5 font-[family-name:var(--font-display)] font-medium">{f.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-[#5B6058]">{f.body}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ================= CTA ================= */}
      <section className="px-5 pb-24 lg:px-8">
        <div className="relative mx-auto max-w-6xl overflow-hidden rounded-[14px] border border-[#1B211D]/12 bg-[#F3EFE4] px-7 py-16 text-center sm:px-12">
          <HexField className="pointer-events-none absolute inset-0 opacity-[0.06]" />
          <div className="relative">
            <p className="font-[family-name:var(--font-mono)] text-xs uppercase tracking-[0.2em] text-[#1F6F5C]">
              Your department. Your people. Your network.
            </p>
            <h2 className="mx-auto mt-4 max-w-2xl font-[family-name:var(--font-display)] text-3xl font-medium tracking-tight sm:text-5xl">
              Be part of the <span className="italic text-[#6E2F5E]">CoUCAA</span> story.
            </h2>
            <p className="mx-auto mt-5 max-w-xl leading-7 text-[#5B6058]">
              Join your fellow chemistry alumni and help build a stronger,
              more connected community.
            </p>
            <Link
              href="/register"
              className="mt-8 inline-flex items-center gap-2 rounded-[6px] bg-[#1B211D] px-7 py-3.5 text-sm font-medium text-[#FAF7F0] transition hover:bg-[#6E2F5E]"
            >
              Join the alumni network <Icon.Arrow className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ================= FOOTER ================= */}
      <footer className="border-t border-[#1B211D]/10">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 px-5 py-10 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <div className="flex items-center gap-3">
            <ElementTile number="2026" symbol="CoU" tone="ink" size="sm" />
            <div>
              <div className="font-[family-name:var(--font-display)] font-medium">CoUCAA</div>
              <p className="text-sm text-[#5B6058]">Comilla University Chemistry Alumni Association</p>
            </div>
          </div>
          <div className="text-sm text-[#5B6058]">Department of Chemistry, Comilla University</div>
          <div className="font-[family-name:var(--font-mono)] text-xs text-[#9C988C]">
            © 2026 CoUCAA. All rights reserved.
          </div>
        </div>
      </footer>
    </main>
  );
}