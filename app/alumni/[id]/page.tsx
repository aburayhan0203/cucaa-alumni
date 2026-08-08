"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

type Alumni = {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  profile_photo: string | null;
  gender: string | null;
  date_of_birth: string | null;
  blood_group: string | null;
  student_id: string | null;
  session: string | null;
  batch: string | null;
  admission_year: number | null;
  graduation_year: number | null;
  profession: string | null;
  current_organisation: string | null;
  designation: string | null;
  city_country: string | null;
  previous_experience: string | null;
  facebook_url: string | null;
  linkedin_url: string | null;
  bio: string | null;
  "research_interest (If Any)": string | null;
};

export default function AlumniProfilePage() {
  const params = useParams();
  const id = params.id as string;

  const [alumni, setAlumni] = useState<Alumni | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadProfile() {
      const { data, error } = await supabase
        .from("Alumni-profiles")
        .select("*")
        .eq("id", id)
        .eq("status", "approved")
        .single();

      if (error) {
        console.error(error);
        setError("Alumni profile not found.");
      } else {
        setAlumni(data);
      }

      setLoading(false);
    }

    if (id) {
      loadProfile();
    }
  }, [id]);

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50">
        <div className="flex min-h-screen items-center justify-center px-6">
          <div className="text-center">
            <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-blue-100 border-t-blue-950" />

            <p className="mt-4 text-sm font-medium text-slate-500">
              Loading alumni profile...
            </p>
          </div>
        </div>
      </main>
    );
  }

  if (error || !alumni) {
    return (
      <main className="min-h-screen bg-slate-50">
        <div className="mx-auto flex min-h-screen max-w-xl items-center justify-center px-6">
          <div className="w-full rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-2xl font-bold text-red-500">
              !
            </div>

            <h1 className="mt-6 text-2xl font-bold text-blue-950">
              Alumni Not Found
            </h1>

            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-500">
              This profile may not exist or may not have been approved yet.
            </p>

            <Link
              href="/alumni"
              className="mt-7 inline-flex items-center rounded-xl bg-blue-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-900"
            >
              ← Back to Alumni Directory
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const academicYear =
    alumni.graduation_year ||
    alumni.admission_year ||
    null;

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">

      {/* =====================================================
          TOP NAVIGATION
      ===================================================== */}

      <header className="sticky top-0 z-30 border-b border-white/10 bg-blue-950/95 text-white backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-6">

          <Link
            href="/"
            className="flex items-center gap-3"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-sm font-black text-blue-950 shadow-sm">
              CoU
            </div>

            <div className="hidden sm:block">
              <p className="text-sm font-bold tracking-wide">
                CoUCAA
              </p>

              <p className="text-[10px] font-medium uppercase tracking-widest text-blue-200">
                Chemistry Alumni Association
              </p>
            </div>
          </Link>

          <Link
            href="/alumni"
            className="inline-flex items-center rounded-lg border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold text-blue-50 transition hover:bg-white/10"
          >
            ← Alumni Directory
          </Link>

        </div>
      </header>


      {/* =====================================================
          PROFILE HERO
      ===================================================== */}

      <section className="relative overflow-hidden bg-blue-950 text-white">

        {/* Decorative background */}
        <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-blue-800/30 blur-3xl" />
        <div className="absolute -bottom-32 -left-20 h-80 w-80 rounded-full bg-indigo-500/10 blur-3xl" />

        <div className="relative mx-auto max-w-6xl px-6 py-12 sm:py-16">

          <div className="flex flex-col items-center gap-8 md:flex-row md:items-center">

            {/* Profile Photo */}

            <div className="shrink-0">

              {alumni.profile_photo ? (
                <img
                  src={alumni.profile_photo}
                  alt={alumni.full_name}
                  className="h-36 w-36 rounded-3xl border-4 border-white/15 object-cover shadow-2xl sm:h-44 sm:w-44"
                />
              ) : (
                <div className="flex h-36 w-36 items-center justify-center rounded-3xl border-4 border-white/10 bg-white/10 text-5xl font-black text-white shadow-2xl sm:h-44 sm:w-44">
                  {alumni.full_name
                    .charAt(0)
                    .toUpperCase()}
                </div>
              )}

            </div>


            {/* Basic Profile */}

            <div className="min-w-0 flex-1 text-center md:text-left">

              <div className="mb-3 inline-flex items-center rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-blue-100">
                Chemistry Alumni
              </div>

              <h1 className="text-3xl font-black tracking-tight sm:text-4xl md:text-5xl">
                {alumni.full_name}
              </h1>

              {(alumni.designation || alumni.profession) && (
                <p className="mt-3 text-lg font-medium text-blue-100 sm:text-xl">
                  {alumni.designation ||
                    alumni.profession}
                </p>
              )}

              {alumni.current_organisation && (
                <p className="mt-1 text-sm font-medium text-blue-200 sm:text-base">
                  {alumni.current_organisation}
                </p>
              )}

              <div className="mt-5 flex flex-wrap justify-center gap-2 md:justify-start">

                {alumni.batch && (
                  <Badge>
                    Batch {alumni.batch}
                  </Badge>
                )}

                {alumni.session && (
                  <Badge>
                    Session {alumni.session}
                  </Badge>
                )}

                {academicYear && (
                  <Badge>
                    Class of {academicYear}
                  </Badge>
                )}

                {alumni.city_country && (
                  <Badge>
                    📍 {alumni.city_country}
                  </Badge>
                )}

              </div>

            </div>

          </div>

        </div>
      </section>


      {/* =====================================================
          MAIN CONTENT
      ===================================================== */}

      <div className="mx-auto max-w-6xl px-5 py-8 sm:px-6 sm:py-10">

        <div className="grid gap-6 lg:grid-cols-3">

          {/* ================= LEFT / MAIN ================= */}

          <div className="space-y-6 lg:col-span-2">

            {/* ABOUT */}

            {alumni.bio && (
              <Section
                eyebrow="Profile"
                title="About"
              >
                <p className="whitespace-pre-line text-[15px] leading-7 text-slate-600">
                  {alumni.bio}
                </p>
              </Section>
            )}


            {/* ACADEMIC */}

            <Section
              eyebrow="Education"
              title="Academic Information"
            >

              <InfoGrid>

                <Info
                  label="Student ID"
                  value={alumni.student_id}
                />

                <Info
                  label="Session"
                  value={alumni.session}
                />

                <Info
                  label="Batch"
                  value={alumni.batch}
                />

                <Info
                  label="Admission Year"
                  value={
                    alumni.admission_year
                      ? alumni.admission_year.toString()
                      : null
                  }
                />

                <Info
                  label="Graduation Year"
                  value={
                    alumni.graduation_year
                      ? alumni.graduation_year.toString()
                      : null
                  }
                />

              </InfoGrid>

            </Section>


            {/* PROFESSIONAL */}

            <Section
              eyebrow="Career"
              title="Professional Information"
            >

              <InfoGrid>

                <Info
                  label="Profession"
                  value={alumni.profession}
                />

                <Info
                  label="Designation"
                  value={alumni.designation}
                />

                <Info
                  label="Organisation"
                  value={alumni.current_organisation}
                />

                <Info
                  label="Location"
                  value={alumni.city_country}
                />

              </InfoGrid>

              {alumni.previous_experience && (
                <div className="mt-7 rounded-2xl bg-slate-50 p-5">

                  <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
                    Previous Experience
                  </p>

                  <p className="mt-3 whitespace-pre-line text-sm leading-7 text-slate-600">
                    {alumni.previous_experience}
                  </p>

                </div>
              )}

            </Section>


            {/* RESEARCH */}

            {alumni["research_interest (If Any)"] && (
              <section className="overflow-hidden rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50 to-white p-6 shadow-sm sm:p-7">

                <div className="flex items-start gap-4">

                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-950 text-lg text-white">
                    ⚗
                  </div>

                  <div>

                    <p className="text-xs font-bold uppercase tracking-widest text-blue-500">
                      Academic & Research
                    </p>

                    <h2 className="mt-1 text-xl font-bold text-blue-950">
                      Research Interest
                    </h2>

                  </div>

                </div>

                <p className="mt-5 whitespace-pre-line text-[15px] leading-7 text-slate-600">
                  {alumni["research_interest (If Any)"]}
                </p>

              </section>
            )}


            {/* PERSONAL */}

            <Section
              eyebrow="Personal"
              title="Personal Information"
            >

              <InfoGrid>

                <Info
                  label="Gender"
                  value={alumni.gender}
                />

                <Info
                  label="Date of Birth"
                  value={formatDate(alumni.date_of_birth)}
                />

                <Info
                  label="Blood Group"
                  value={alumni.blood_group}
                />

              </InfoGrid>

            </Section>

          </div>


          {/* ================= RIGHT SIDEBAR ================= */}

          <aside className="space-y-6">

            {/* CONTACT */}

            <Section
              eyebrow="Get in touch"
              title="Contact Information"
            >

              <div className="space-y-4">

                {alumni.email && (
                  <ContactItem
                    icon="✉"
                    label="Email"
                    value={alumni.email}
                    href={`mailto:${alumni.email}`}
                  />
                )}

                {alumni.phone && (
                  <ContactItem
                    icon="☎"
                    label="Phone"
                    value={alumni.phone}
                    href={`tel:${alumni.phone}`}
                  />
                )}

                {alumni.city_country && (
                  <ContactItem
                    icon="⌖"
                    label="Location"
                    value={alumni.city_country}
                  />
                )}

              </div>

            </Section>


            {/* CONNECT */}

            {(alumni.facebook_url ||
              alumni.linkedin_url) && (
              <Section
                eyebrow="Social"
                title="Connect"
              >

                <div className="space-y-3">

                  {alumni.linkedin_url && (
                    <SocialLink
                      href={alumni.linkedin_url}
                      label="LinkedIn"
                      description="Professional profile"
                    />
                  )}

                  {alumni.facebook_url && (
                    <SocialLink
                      href={alumni.facebook_url}
                      label="Facebook"
                      description="Social profile"
                    />
                  )}

                </div>

              </Section>
            )}


            {/* QUICK SUMMARY */}

            <section className="rounded-2xl bg-blue-950 p-6 text-white shadow-sm">

              <p className="text-xs font-bold uppercase tracking-widest text-blue-300">
                CoUCAA
              </p>

              <h2 className="mt-2 text-xl font-bold">
                Chemistry Alumni
                Association
              </h2>

              <p className="mt-3 text-sm leading-6 text-blue-100">
                Connecting graduates of the
                Department of Chemistry,
                Comilla University.
              </p>

              <Link
                href="/alumni"
                className="mt-5 inline-flex w-full items-center justify-center rounded-xl bg-white px-4 py-3 text-sm font-bold text-blue-950 transition hover:bg-blue-50"
              >
                Explore Alumni Directory
              </Link>

            </section>

          </aside>

        </div>

      </div>


      {/* =====================================================
          FOOTER
      ===================================================== */}

      <footer className="border-t border-slate-200 bg-white">

        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-6 py-8 text-center sm:flex-row sm:items-center sm:justify-between sm:text-left">

          <div>
            <p className="text-sm font-bold text-blue-950">
              CoUCAA
            </p>

            <p className="mt-1 text-xs text-slate-500">
              Comilla University Chemistry Alumni Association
            </p>
          </div>

          <p className="text-xs text-slate-400">
            © {new Date().getFullYear()} CoUCAA. All rights reserved.
          </p>

        </div>

      </footer>

    </main>
  );
}


/* =====================================================
   SECTION
===================================================== */

function Section({
  eyebrow,
  title,
  children,
}: {
  eyebrow?: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-7">

      {eyebrow && (
        <p className="text-xs font-bold uppercase tracking-widest text-blue-500">
          {eyebrow}
        </p>
      )}

      <h2 className="mt-1 text-xl font-bold tracking-tight text-blue-950 sm:text-2xl">
        {title}
      </h2>

      <div className="mt-6">
        {children}
      </div>

    </section>
  );
}


/* =====================================================
   INFO GRID
===================================================== */

function InfoGrid({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="grid gap-x-8 gap-y-6 sm:grid-cols-2">
      {children}
    </div>
  );
}


/* =====================================================
   INFO ITEM
===================================================== */

function Info({
  label,
  value,
}: {
  label: string;
  value: string | null | undefined;
}) {
  if (!value) {
    return null;
  }

  return (
    <div className="border-b border-slate-100 pb-4 last:border-0">

      <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">
        {label}
      </p>

      <p className="mt-2 break-words text-sm font-semibold leading-6 text-slate-800">
        {value}
      </p>

    </div>
  );
}


/* =====================================================
   BADGE
===================================================== */

function Badge({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <span className="rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-xs font-medium text-blue-50 backdrop-blur">
      {children}
    </span>
  );
}


/* =====================================================
   CONTACT ITEM
===================================================== */

function ContactItem({
  icon,
  label,
  value,
  href,
}: {
  icon: string;
  label: string;
  value: string;
  href?: string;
}) {
  const content = (
    <div className="flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50 p-4 transition hover:border-blue-100 hover:bg-blue-50">

      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-950 text-sm text-white">
        {icon}
      </div>

      <div className="min-w-0">

        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
          {label}
        </p>

        <p className="mt-1 break-all text-sm font-semibold text-slate-800">
          {value}
        </p>

      </div>

    </div>
  );

  if (href) {
    return (
      <a href={href}>
        {content}
      </a>
    );
  }

  return content;
}


/* =====================================================
   SOCIAL LINK
===================================================== */

function SocialLink({
  href,
  label,
  description,
}: {
  href: string;
  label: string;
  description: string;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4 transition hover:border-blue-200 hover:bg-blue-50"
    >

      <div className="flex items-center gap-3">

        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-950 text-sm font-bold text-white">
          {label === "LinkedIn" ? "in" : "f"}
        </div>

        <div>

          <p className="text-sm font-bold text-slate-800">
            {label}
          </p>

          <p className="mt-0.5 text-xs text-slate-400">
            {description}
          </p>

        </div>

      </div>

      <span className="text-slate-400">
        ↗
      </span>

    </a>
  );
}


/* =====================================================
   DATE FORMAT
===================================================== */

function formatDate(date: string | null) {
  if (!date) {
    return null;
  }

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return date;
  }

  return parsedDate.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}