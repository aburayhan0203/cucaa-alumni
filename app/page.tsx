"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

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
  title: string;
  type: string;
  description: string | null;
  cover_image: string | null;
  event_date: string | null;
  venue: string | null;
  status: string;
  created_at: string;
  updated_at: string;
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
      } else if (error) {
        console.error("Alumni loading error:", error);
      }

      setLoading(false);
    }

    async function loadNewsEvents() {
      const { data, error } = await supabase
        .from("news_events")
        .select(
          "id, title, type, description, cover_image, event_date, venue, status, created_at, updated_at"
        )
        .eq("status", "published")
        .order("created_at", { ascending: false })
        .limit(6);

      if (!error && data) {
        console.log("News & Events:", data);
        setNewsEvents(data);
      } else if (error) {
        console.error("News & Events loading error:", error);
      }

      setNewsLoading(false);
    }

    loadAlumni();
    loadNewsEvents();
  }, []);

  const totalMembers = alumni.length;

  function formatDate(dateValue: string | null) {
    if (!dateValue) return "";

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
      return dateValue;
    }

    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }

  return (
    <main className="min-h-screen bg-white">
      {/* =========================================================
          NAVBAR
      ========================================================= */}

      <nav className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 lg:px-8">
          {/* Logo */}

          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-950 text-sm font-black text-white shadow-lg">
              CoU
            </div>

            <div className="leading-none">
              <div className="text-xl font-black tracking-tight text-slate-950">
                CoUCAA
              </div>

              <div className="mt-1 text-[9px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                Chemistry Alumni Association
              </div>
            </div>
          </Link>

          {/* Desktop Navigation */}

          <div className="hidden items-center gap-8 md:flex">
            <Link
              href="/"
              className="text-sm font-semibold text-slate-950 transition hover:text-blue-600"
            >
              Home
            </Link>

            <Link
              href="/alumni"
              className="text-sm font-semibold text-slate-600 transition hover:text-blue-600"
            >
              Alumni
            </Link>

            <a
              href="#about"
              className="text-sm font-semibold text-slate-600 transition hover:text-blue-600"
            >
              About
            </a>

            <a
              href="#messages"
              className="text-sm font-semibold text-slate-600 transition hover:text-blue-600"
            >
              Messages
            </a>

            {/* Admin Login */}

            <Link
              href="/login"
              className="rounded-full border border-slate-300 px-5 py-2.5 text-sm font-bold text-slate-800 transition hover:border-slate-950 hover:bg-slate-950 hover:text-white"
            >
              Admin Login
            </Link>

            <Link
              href="/register"
              className="rounded-full bg-slate-950 px-5 py-2.5 text-sm font-bold text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-blue-700"
            >
              Join CoUCAA
            </Link>
          </div>
        </div>
      </nav>

      {/* =========================================================
          HERO
      ========================================================= */}

      <section className="relative overflow-hidden bg-slate-950">
        <div className="absolute inset-0">
          <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-blue-600/20 blur-3xl" />

          <div className="absolute -bottom-40 -left-20 h-96 w-96 rounded-full bg-cyan-500/10 blur-3xl" />

          <div className="absolute inset-0 opacity-[0.06] [background-image:linear-gradient(rgba(255,255,255,.4)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.4)_1px,transparent_1px)] [background-size:50px_50px]" />
        </div>

        <div className="relative mx-auto max-w-7xl px-5 py-24 lg:px-8 lg:py-32">
          <div className="max-w-4xl">
            <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-blue-200 backdrop-blur">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              ESTD: 2026
            </div>

            <h1 className="max-w-4xl text-4xl font-black leading-[1.05] tracking-tight text-white sm:text-5xl lg:text-7xl">
              Comilla University
              <span className="block text-blue-400">
                Chemistry Alumni Association
              </span>
            </h1>

            <p className="mt-7 max-w-2xl text-lg leading-8 text-slate-300 sm:text-xl">
              Connecting generations of chemistry graduates to build a
              stronger academic, professional and lifelong community.
            </p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/register"
                className="rounded-full bg-white px-7 py-3.5 text-center text-sm font-extrabold text-slate-950 shadow-xl transition hover:-translate-y-1 hover:bg-blue-50"
              >
                Become a Member →
              </Link>

              <Link
                href="/alumni"
                className="rounded-full border border-white/20 bg-white/5 px-7 py-3.5 text-center text-sm font-extrabold text-white backdrop-blur transition hover:bg-white/10"
              >
                Explore Alumni
              </Link>
            </div>
          </div>

          {/* Hero Stats */}

          <div className="mt-16 grid max-w-3xl grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-5 backdrop-blur">
              <p className="text-3xl font-black text-white">
                {loading ? "—" : totalMembers}
              </p>

              <p className="mt-1 text-sm font-medium text-slate-400">
                Total Members
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-5 backdrop-blur">
              <p className="text-3xl font-black text-white">01</p>

              <p className="mt-1 text-sm font-medium text-slate-400">
                Academic Department
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-5 backdrop-blur">
              <p className="text-3xl font-black text-white">2026</p>

              <p className="mt-1 text-sm font-medium text-slate-400">
                Association Established
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          STATS
      ========================================================= */}

      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto grid max-w-7xl grid-cols-1 divide-y divide-slate-200 px-5 sm:grid-cols-3 sm:divide-x sm:divide-y-0 lg:px-8">
          <div className="px-4 py-8 text-center sm:text-left">
            <p className="text-4xl font-black tracking-tight text-slate-950">
              {loading ? "—" : totalMembers}
            </p>

            <p className="mt-2 text-sm font-semibold text-slate-500">
              Total Members
            </p>
          </div>

          <div className="px-4 py-8 text-center sm:pl-8 sm:text-left">
            <p className="text-lg font-black text-slate-950">
              Department of Chemistry
            </p>

            <p className="mt-2 text-sm font-semibold text-slate-500">
              Comilla University
            </p>
          </div>

          <div className="px-4 py-8 text-center sm:pl-8 sm:text-left">
            <p className="text-lg font-black text-slate-950">
              Comilla University
            </p>

            <p className="mt-2 text-sm font-semibold text-slate-500">
              Cumilla, Bangladesh
            </p>
          </div>
        </div>
      </section>

      {/* =========================================================
          ABOUT
      ========================================================= */}

      <section id="about" className="bg-slate-50 py-24">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <div className="grid gap-14 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.2em] text-blue-600">
                About CoUCAA
              </p>

              <h2 className="mt-4 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
                One department.
                <br />
                One community.
                <br />
                Many journeys.
              </h2>
            </div>

            <div>
              <p className="text-lg leading-8 text-slate-600">
                The Comilla University Chemistry Alumni Association (CoUCAA)
                is a platform designed to connect graduates, students,
                teachers and professionals of the Department of Chemistry,
                Comilla University.
              </p>

              <p className="mt-5 text-base leading-7 text-slate-600">
                From the laboratory to industry, academia, research and
                entrepreneurship, our alumni are contributing in diverse
                fields. CoUCAA aims to bring these experiences together and
                create meaningful opportunities for collaboration, mentorship,
                professional networking and lifelong connection.
              </p>

              <div className="mt-8 grid gap-4 sm:grid-cols-3">
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <p className="text-2xl">🤝</p>

                  <h3 className="mt-4 font-bold text-slate-950">Connect</h3>

                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    Stay connected with fellow chemistry alumni.
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <p className="text-2xl">🎓</p>

                  <h3 className="mt-4 font-bold text-slate-950">Mentor</h3>

                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    Share knowledge and guide the next generation.
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <p className="text-2xl">🚀</p>

                  <h3 className="mt-4 font-bold text-slate-950">Grow</h3>

                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    Build opportunities through collaboration.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          NEWS & EVENTS
      ========================================================= */}

      <section className="bg-white py-24">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.2em] text-blue-600">
                Stay Updated
              </p>

              <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
                News & Events
              </h2>

              <p className="mt-3 max-w-xl text-slate-500">
                Stay informed about upcoming events, activities and
                announcements from CoUCAA.
              </p>
            </div>
          </div>

          {/* Loading */}

          {newsLoading ? (
            <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="h-[430px] animate-pulse rounded-3xl bg-slate-100"
                />
              ))}
            </div>
          ) : newsEvents.length === 0 ? (
            /* Empty State */

            <div className="mt-10 rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-12 text-center">
              <div className="text-4xl">📰</div>

              <p className="mt-4 font-bold text-slate-700">
                No news or events published yet.
              </p>

              <p className="mt-2 text-sm text-slate-500">
                New announcements and events will appear here.
              </p>
            </div>
          ) : (
            /* News/Event Cards */

            <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {newsEvents.map((item) => (
                <article
                  key={item.id}
                  className="group overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl"
                >
                  {/* ================= COVER IMAGE ================= */}

                  <div className="relative h-56 overflow-hidden bg-slate-100">
                    {item.cover_image ? (
                      <img
                        src={item.cover_image}
                        alt={item.title}
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                        }}
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center bg-gradient-to-br from-slate-950 to-blue-900">
                        <div className="text-center text-white">
                          <div className="text-4xl">📰</div>

                          <p className="mt-2 text-sm font-bold">CoUCAA</p>
                        </div>
                      </div>
                    )}

                    {/* Type Badge */}

                    <div className="absolute left-4 top-4">
                      <span className="rounded-full bg-white px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-blue-700 shadow-sm">
                        {item.type}
                      </span>
                    </div>
                  </div>

                  {/* ================= CARD CONTENT ================= */}

                  <div className="p-6">
                    <h3 className="line-clamp-2 text-xl font-black text-slate-950">
                      {item.title}
                    </h3>

                    {item.description && (
                      <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-500">
                        {item.description}
                      </p>
                    )}

                    <div className="mt-5 space-y-2">
                      {/* Date */}

                      {item.event_date && (
                        <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
                          <span>📅</span>

                          <span>{formatDate(item.event_date)}</span>
                        </div>
                      )}

                      {/* Venue */}

                      {item.venue && (
                        <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
                          <span>📍</span>

                          <span className="truncate">{item.venue}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* =========================================================
          RECENT ALUMNI
      ========================================================= */}

      <section className="bg-slate-50 py-24">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.2em] text-blue-600">
                Our Community
              </p>

              <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
                Recently Joined Alumni
              </h2>

              <p className="mt-3 max-w-xl text-slate-500">
                Meet some of the alumni who are already part of the CoUCAA
                community.
              </p>
            </div>

            <Link
              href="/alumni"
              className="font-bold text-blue-600 transition hover:text-blue-800"
            >
              View all alumni →
            </Link>
          </div>

          {loading ? (
            <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {[1, 2, 3, 4].map((item) => (
                <div
                  key={item}
                  className="h-72 animate-pulse rounded-3xl bg-white"
                />
              ))}
            </div>
          ) : alumni.length === 0 ? (
            <div className="mt-10 rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center">
              <p className="font-bold text-slate-700">
                No approved alumni yet.
              </p>

              <p className="mt-2 text-sm text-slate-500">
                Be one of the first members of the CoUCAA community.
              </p>

              <Link
                href="/register"
                className="mt-6 inline-block rounded-full bg-slate-950 px-6 py-3 text-sm font-bold text-white"
              >
                Join CoUCAA
              </Link>
            </div>
          ) : (
            <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {alumni.slice(0, 4).map((person) => (
                <Link
                  href={`/alumni/${person.id}`}
                  key={person.id}
                  className="group overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl"
                >
                  {/* Alumni Photo */}

                  <div className="flex h-48 items-center justify-center overflow-hidden bg-slate-100">
                    {person.profile_photo ? (
                      <img
                        src={person.profile_photo}
                        alt={person.full_name}
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-slate-950 text-2xl font-black text-white">
                        {person.full_name?.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>

                  <div className="p-5">
                    <h3 className="truncate font-black text-slate-950">
                      {person.full_name}
                    </h3>

                    <p className="mt-1 truncate text-sm font-medium text-blue-600">
                      {person.designation ||
                        person.profession ||
                        "Chemistry Alumni"}
                    </p>

                    <p className="mt-2 truncate text-sm text-slate-500">
                      {person.current_organisation || "CoUCAA Member"}
                    </p>

                    <div className="mt-4 flex items-center justify-between text-xs font-semibold text-slate-400">
                      <span>
                        {person.batch || person.session || "Alumni"}
                      </span>

                      <span>View →</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* =========================================================
          MESSAGES
      ========================================================= */}

      <section id="messages" className="bg-slate-950 py-24">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <div className="max-w-2xl">
            <p className="text-sm font-black uppercase tracking-[0.2em] text-blue-400">
              Leadership Messages
            </p>

            <h2 className="mt-3 text-3xl font-black tracking-tight text-white sm:text-4xl">
              Voices from our community
            </h2>

            <p className="mt-4 leading-7 text-slate-400">
              Messages from the academic and alumni leadership of the
              Department of Chemistry.
            </p>
          </div>

          <div className="mt-12 grid gap-6 lg:grid-cols-3">
            {/* Department Head */}

            <div className="rounded-3xl border border-white/10 bg-white/[0.05] p-7">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 text-lg font-black text-white">
                  DH
                </div>

                <div>
                  <h3 className="font-bold text-white">Department Head</h3>

                  <p className="text-sm text-slate-400">
                    Department of Chemistry
                  </p>
                </div>
              </div>

              <p className="mt-7 leading-7 text-slate-300">
                “An alumni association creates a lasting bridge between the
                department and its graduates. I hope CoUCAA will become a
                platform for knowledge sharing, mentorship and meaningful
                collaboration.”
              </p>

              <p className="mt-6 text-xs font-bold uppercase tracking-widest text-blue-400">
                Demo Message
              </p>
            </div>

            {/* President */}

            <div className="rounded-3xl border border-white/10 bg-white/[0.05] p-7">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-600 text-lg font-black text-white">
                  PR
                </div>

                <div>
                  <h3 className="font-bold text-white">President</h3>

                  <p className="text-sm text-slate-400">CoUCAA</p>
                </div>
              </div>

              <p className="mt-7 leading-7 text-slate-300">
                “Our alumni are connected by more than a degree. CoUCAA is
                about building relationships, creating opportunities and
                giving back to the department that brought us together.”
              </p>

              <p className="mt-6 text-xs font-bold uppercase tracking-widest text-emerald-400">
                Demo Message
              </p>
            </div>

            {/* Secretary */}

            <div className="rounded-3xl border border-white/10 bg-white/[0.05] p-7">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-violet-600 text-lg font-black text-white">
                  SE
                </div>

                <div>
                  <h3 className="font-bold text-white">Secretary</h3>

                  <p className="text-sm text-slate-400">CoUCAA</p>
                </div>
              </div>

              <p className="mt-7 leading-7 text-slate-300">
                “We invite every chemistry graduate to join this growing
                network and help us create a stronger and more connected
                alumni community.”
              </p>

              <p className="mt-6 text-xs font-bold uppercase tracking-widest text-violet-400">
                Demo Message
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          WHY COUCAA
      ========================================================= */}

      <section className="bg-white py-24">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.2em] text-blue-600">
                Why CoUCAA
              </p>

              <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
                A network that grows with you.
              </h2>

              <p className="mt-5 max-w-xl leading-7 text-slate-600">
                Whether you are building a career, pursuing research,
                starting a business or supporting the next generation,
                CoUCAA gives you a place to connect and contribute.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-3xl bg-slate-50 p-6">
                <div className="text-2xl">🌐</div>

                <h3 className="mt-5 font-black">Professional Network</h3>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Discover and connect with alumni working across different
                  industries and professions.
                </p>
              </div>

              <div className="rounded-3xl bg-slate-50 p-6">
                <div className="text-2xl">🧪</div>

                <h3 className="mt-5 font-black">Research & Academia</h3>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Encourage research collaboration and academic exchange.
                </p>
              </div>

              <div className="rounded-3xl bg-slate-50 p-6">
                <div className="text-2xl">💡</div>

                <h3 className="mt-5 font-black">Mentorship</h3>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Help students and young graduates learn from real-world
                  experience.
                </p>
              </div>

              <div className="rounded-3xl bg-slate-50 p-6">
                <div className="text-2xl">❤️</div>

                <h3 className="mt-5 font-black">Give Back</h3>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Stay connected with the department and contribute to its
                  future.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          CTA
      ========================================================= */}

      <section className="px-5 pb-24 lg:px-8">
        <div className="mx-auto max-w-7xl overflow-hidden rounded-[2rem] bg-blue-600 px-7 py-16 text-center shadow-2xl sm:px-12">
          <p className="text-sm font-black uppercase tracking-[0.2em] text-blue-100">
            Your department. Your people. Your network.
          </p>

          <h2 className="mx-auto mt-4 max-w-3xl text-3xl font-black tracking-tight text-white sm:text-5xl">
            Be part of the CoUCAA story.
          </h2>

          <p className="mx-auto mt-5 max-w-2xl leading-7 text-blue-100">
            Join your fellow chemistry alumni and help build a stronger,
            more connected community.
          </p>

          <Link
            href="/register"
            className="mt-8 inline-block rounded-full bg-white px-8 py-4 text-sm font-black text-blue-700 shadow-xl transition hover:-translate-y-1"
          >
            Join the Alumni Network →
          </Link>
        </div>
      </section>

      {/* =========================================================
          FOOTER
      ========================================================= */}

      <footer className="border-t border-slate-200 bg-slate-50">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 px-5 py-10 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <div>
            <div className="text-xl font-black text-slate-950">CoUCAA</div>

            <p className="mt-1 text-sm text-slate-500">
              Comilla University Chemistry Alumni Association
            </p>
          </div>

          <div className="text-sm text-slate-500">
            Department of Chemistry, Comilla University
          </div>

          <div className="text-sm font-semibold text-slate-400">
            © 2026 CoUCAA. All rights reserved.
          </div>
        </div>
      </footer>
    </main>
  );
}