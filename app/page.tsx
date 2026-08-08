"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

type Alumni = {
  id: string;
  full_name: string;
  profile_photo: string | null;
  designation: string | null;
  profession: string | null;
  current_organisation: string | null;
  batch: string | null;
};

export default function HomePage() {
  const [alumni, setAlumni] = useState<Alumni[]>([]);
  const [totalAlumni, setTotalAlumni] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadHomeData() {
      const { data } = await supabase
        .from("Alumni-profiles")
        .select(
          `
          id,
          full_name,
          profile_photo,
          designation,
          profession,
          current_organisation,
          batch
          `
        )
        .eq("status", "approved")
        .order("created_at", { ascending: false })
        .limit(6);

      setAlumni(data || []);

      const { count } = await supabase
        .from("Alumni-profiles")
        .select("*", { count: "exact", head: true })
        .eq("status", "approved");

      setTotalAlumni(count || 0);
      setLoading(false);
    }

    loadHomeData();
  }, []);

  return (
    <main className="min-h-screen bg-white">

      {/* ================= NAVBAR ================= */}

      <nav className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">

          <Link href="/" className="flex items-center gap-3">

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-950 text-lg font-bold text-white">
              CU
            </div>

            <div>
              <p className="font-bold text-blue-950">
                CUCAA
              </p>

              <p className="text-xs text-slate-500">
                Alumni Association
              </p>
            </div>

          </Link>

          <div className="hidden items-center gap-7 md:flex">

            <Link
              href="/"
              className="text-sm font-semibold text-blue-950"
            >
              Home
            </Link>

            <Link
              href="/alumni"
              className="text-sm font-medium text-slate-600 hover:text-blue-950"
            >
              Alumni
            </Link>

            <Link
              href="/login"
              className="text-sm font-medium text-slate-600 hover:text-blue-950"
            >
              Admin
            </Link>

          </div>

          <Link
            href="/alumni"
            className="rounded-xl bg-blue-950 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-900"
          >
            Find Alumni
          </Link>

        </div>
      </nav>


      {/* ================= HERO ================= */}

      <section className="relative overflow-hidden bg-blue-950 px-6 py-24 text-white md:py-32">

        <div className="mx-auto max-w-7xl">

          <div className="max-w-3xl">

            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-200">
              Comilla University Chemistry Alumni Association
            </p>

            <h1 className="mt-6 text-5xl font-bold leading-tight md:text-7xl">
              Connecting Our
              <span className="block text-blue-300">
                Alumni Community
              </span>
            </h1>

            <p className="mt-6 max-w-2xl text-lg leading-8 text-blue-100">
              A platform for Chemistry graduates of Comilla University
              to reconnect, build professional relationships, share
              experiences, and grow together.
            </p>

            <div className="mt-9 flex flex-col gap-4 sm:flex-row">

              <Link
                href="/alumni"
                className="rounded-xl bg-white px-6 py-3.5 text-center font-semibold text-blue-950 transition hover:bg-blue-50"
              >
                Explore Alumni
              </Link>

              <Link
                href="/register"
                className="rounded-xl border border-blue-300 px-6 py-3.5 text-center font-semibold text-white transition hover:bg-white/10"
              >
                Join Alumni Network
              </Link>

            </div>

          </div>

        </div>

      </section>


      {/* ================= STATS ================= */}

      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto grid max-w-5xl gap-8 px-6 py-12 sm:grid-cols-3">

          <Stat
            value={totalAlumni.toString()}
            label="Approved Alumni"
          />

          <Stat
            value="1"
            label="University Community"
          />

          <Stat
            value="∞"
            label="Opportunities to Connect"
          />

        </div>
      </section>


      {/* ================= ABOUT ================= */}

      <section className="px-6 py-20">

        <div className="mx-auto grid max-w-7xl gap-12 md:grid-cols-2 md:items-center">

          <div>

            <p className="text-sm font-semibold uppercase tracking-widest text-blue-700">
              About CUCAA
            </p>

            <h2 className="mt-3 text-4xl font-bold leading-tight text-blue-950">
              One community, many journeys.
            </h2>

            <p className="mt-6 leading-8 text-slate-600">
              The Comilla University Chemistry Alumni Association
              connects graduates of the Department of Chemistry and
              creates a platform where alumni can stay connected with
              each other and with the university.
            </p>

            <p className="mt-4 leading-8 text-slate-600">
              Whether you are working in academia, industry, research,
              government, entrepreneurship, or another field, this
              community helps us learn from one another and create
              meaningful professional connections.
            </p>

            <Link
              href="/alumni"
              className="mt-7 inline-block font-semibold text-blue-700 hover:text-blue-900"
            >
              Meet our alumni →
            </Link>

          </div>


          <div className="rounded-3xl bg-blue-950 p-10 text-white shadow-xl">

            <div className="grid gap-8 sm:grid-cols-2">

              <Feature
                title="Connect"
                description="Reconnect with classmates and fellow alumni."
              />

              <Feature
                title="Network"
                description="Build meaningful academic and professional relationships."
              />

              <Feature
                title="Share"
                description="Share experiences, knowledge, and opportunities."
              />

              <Feature
                title="Grow"
                description="Support each other and grow together."
              />

            </div>

          </div>

        </div>

      </section>


      {/* ================= RECENT ALUMNI ================= */}

      <section className="bg-slate-50 px-6 py-20">

        <div className="mx-auto max-w-7xl">

          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">

            <div>

              <p className="text-sm font-semibold uppercase tracking-widest text-blue-700">
                Our Community
              </p>

              <h2 className="mt-2 text-3xl font-bold text-blue-950">
                Recently Joined Alumni
              </h2>

            </div>

            <Link
              href="/alumni"
              className="font-semibold text-blue-700 hover:text-blue-900"
            >
              View all alumni →
            </Link>

          </div>


          {loading ? (

            <div className="py-16 text-center text-slate-500">
              Loading alumni...
            </div>

          ) : alumni.length === 0 ? (

            <div className="mt-8 rounded-2xl bg-white p-12 text-center shadow-sm">

              <p className="text-slate-500">
                No approved alumni available yet.
              </p>

            </div>

          ) : (

            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">

              {alumni.map((person) => (

                <Link
                  key={person.id}
                  href={`/alumni/${person.id}`}
                  className="group overflow-hidden rounded-2xl bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                >

                  <div className="flex items-center gap-5 p-6">

                    {person.profile_photo ? (
                      <img
                        src={person.profile_photo}
                        alt={person.full_name}
                        className="h-20 w-20 rounded-full object-cover"
                      />
                    ) : (
                      <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-blue-100 text-2xl font-bold text-blue-700">
                        {person.full_name
                          .charAt(0)
                          .toUpperCase()}
                      </div>
                    )}

                    <div className="min-w-0">

                      <h3 className="truncate text-lg font-bold text-blue-950 group-hover:text-blue-700">
                        {person.full_name}
                      </h3>

                      <p className="mt-1 truncate text-sm text-slate-500">
                        {person.designation ||
                          person.profession ||
                          "Alumni"}
                      </p>

                      {person.current_organisation && (
                        <p className="mt-1 truncate text-sm font-medium text-slate-700">
                          {person.current_organisation}
                        </p>
                      )}

                      {person.batch && (
                        <p className="mt-2 text-xs text-slate-400">
                          Batch {person.batch}
                        </p>
                      )}

                    </div>

                  </div>

                </Link>

              ))}

            </div>

          )}

        </div>

      </section>


      {/* ================= CTA ================= */}

      <section className="px-6 py-20">

        <div className="mx-auto max-w-5xl rounded-3xl bg-blue-950 px-8 py-14 text-center text-white md:px-16">

          <h2 className="text-3xl font-bold md:text-4xl">
            Are you a Chemistry graduate?
          </h2>

          <p className="mx-auto mt-4 max-w-2xl leading-7 text-blue-100">
            Join the CUCAA alumni network and reconnect with your
            university community.
          </p>

          <Link
            href="/register"
            className="mt-8 inline-block rounded-xl bg-white px-7 py-3.5 font-semibold text-blue-950 hover:bg-blue-50"
          >
            Register as Alumni
          </Link>

        </div>

      </section>


      {/* ================= FOOTER ================= */}

      <footer className="bg-slate-950 px-6 py-12 text-white">

        <div className="mx-auto grid max-w-7xl gap-10 md:grid-cols-3">

          <div>

            <h3 className="text-xl font-bold">
              CUCAA
            </h3>

            <p className="mt-3 max-w-sm text-sm leading-6 text-slate-400">
              Comilla University Chemistry Alumni Association —
              connecting graduates and building a stronger alumni
              community.
            </p>

          </div>


          <div>

            <h4 className="font-semibold">
              Quick Links
            </h4>

            <div className="mt-4 flex flex-col gap-3 text-sm text-slate-400">

              <Link
                href="/"
                className="hover:text-white"
              >
                Home
              </Link>

              <Link
                href="/alumni"
                className="hover:text-white"
              >
                Alumni Directory
              </Link>

              <Link
                href="/register"
                className="hover:text-white"
              >
                Register
              </Link>

              <Link
                href="/login"
                className="hover:text-white"
              >
                Admin Login
              </Link>

            </div>

          </div>


          <div>

            <h4 className="font-semibold">
              CUCAA Alumni Association
            </h4>

            <p className="mt-4 text-sm leading-6 text-slate-400">
              Comilla University
              <br />
              Department of Chemistry
              <br />
              Cumilla, Bangladesh
            </p>

          </div>

        </div>


        <div className="mx-auto mt-10 max-w-7xl border-t border-slate-800 pt-6 text-center text-sm text-slate-500">

          © {new Date().getFullYear()} CUCAA Alumni Association.
          All rights reserved.

        </div>

      </footer>

    </main>
  );
}


/* ================= STAT ================= */

function Stat({
  value,
  label,
}: {
  value: string;
  label: string;
}) {
  return (
    <div className="text-center">

      <p className="text-4xl font-bold text-blue-950">
        {value}
      </p>

      <p className="mt-2 text-sm font-medium text-slate-500">
        {label}
      </p>

    </div>
  );
}


/* ================= FEATURE ================= */

function Feature({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div>

      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-white/10 font-bold">
        ✓
      </div>

      <h3 className="font-bold">
        {title}
      </h3>

      <p className="mt-2 text-sm leading-6 text-blue-100">
        {description}
      </p>

    </div>
  );
}