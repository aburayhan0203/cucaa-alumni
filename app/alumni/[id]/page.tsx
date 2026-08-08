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
      <main className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-blue-200 border-t-blue-950" />

          <p className="mt-4 text-slate-500">
            Loading profile...
          </p>
        </div>
      </main>
    );
  }

  if (error || !alumni) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6">
        <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-sm">

          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-50 text-3xl">
            !
          </div>

          <h1 className="mt-5 text-2xl font-bold text-slate-800">
            Alumni Not Found
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            This profile may not exist or may not have been approved yet.
          </p>

          <Link
            href="/alumni"
            className="mt-6 inline-block rounded-xl bg-blue-950 px-5 py-3 font-semibold text-white hover:bg-blue-900"
          >
            ← Back to Alumni Directory
          </Link>

        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50">

      {/* ================= HEADER ================= */}
      <section className="bg-blue-950 px-6 py-12 text-white">

        <div className="mx-auto max-w-5xl">

          <Link
            href="/alumni"
            className="text-sm font-medium text-blue-200 transition hover:text-white"
          >
            ← Back to Alumni Directory
          </Link>

          <div className="mt-8 flex flex-col items-center gap-7 md:flex-row">

            {/* Profile Photo */}
            {alumni.profile_photo ? (
              <img
                src={alumni.profile_photo}
                alt={alumni.full_name}
                className="h-40 w-40 rounded-full border-4 border-white/20 object-cover shadow-xl"
              />
            ) : (
              <div className="flex h-40 w-40 items-center justify-center rounded-full border-4 border-white/20 bg-blue-800 text-5xl font-bold shadow-xl">
                {alumni.full_name.charAt(0).toUpperCase()}
              </div>
            )}

            {/* Basic Info */}
            <div className="text-center md:text-left">

              <h1 className="text-4xl font-bold md:text-5xl">
                {alumni.full_name}
              </h1>

              {(alumni.designation || alumni.profession) && (
                <p className="mt-3 text-xl text-blue-100">
                  {alumni.designation || alumni.profession}
                </p>
              )}

              {alumni.current_organisation && (
                <p className="mt-1 text-blue-200">
                  {alumni.current_organisation}
                </p>
              )}

              {alumni.city_country && (
                <p className="mt-3 text-sm text-blue-200">
                  📍 {alumni.city_country}
                </p>
              )}

            </div>

          </div>
        </div>
      </section>


      {/* ================= CONTENT ================= */}
      <div className="mx-auto max-w-5xl space-y-6 px-6 py-10">


        {/* ================= ABOUT ================= */}
        {alumni.bio && (
          <Section title="About">

            <p className="whitespace-pre-line leading-7 text-slate-600">
              {alumni.bio}
            </p>

          </Section>
        )}


        {/* ================= ACADEMIC ================= */}
        <Section title="Academic Information">

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


        {/* ================= PROFESSIONAL ================= */}
        <Section title="Professional Information">

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
              label="Current Organisation"
              value={alumni.current_organisation}
            />

            <Info
              label="Location"
              value={alumni.city_country}
            />

          </InfoGrid>


          {alumni.previous_experience && (
            <div className="mt-6">

              <h3 className="text-sm font-semibold text-slate-700">
                Previous Experience
              </h3>

              <p className="mt-2 whitespace-pre-line leading-7 text-slate-600">
                {alumni.previous_experience}
              </p>

            </div>
          )}

        </Section>


        {/* ================= PERSONAL ================= */}
        <Section title="Personal Information">

          <InfoGrid>

            <Info
              label="Gender"
              value={alumni.gender}
            />

            <Info
              label="Date of Birth"
              value={alumni.date_of_birth}
            />

            <Info
              label="Blood Group"
              value={alumni.blood_group}
            />

          </InfoGrid>

        </Section>


        {/* ================= CONTACT ================= */}
        <Section title="Contact Information">

          <InfoGrid>

            <Info
              label="Email"
              value={alumni.email}
            />

            <Info
              label="Phone"
              value={alumni.phone}
            />

          </InfoGrid>

        </Section>


        {/* ================= RESEARCH ================= */}
        {alumni["research_interest (If Any)"] && (
          <Section title="Research Interest">

            <p className="whitespace-pre-line leading-7 text-slate-600">
              {alumni["research_interest (If Any)"]}
            </p>

          </Section>
        )}


        {/* ================= SOCIAL LINKS ================= */}
        {(alumni.facebook_url || alumni.linkedin_url) && (
          <Section title="Connect">

            <div className="flex flex-wrap gap-3">

              {alumni.facebook_url && (
                <a
                  href={alumni.facebook_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700"
                >
                  Facebook
                </a>
              )}

              {alumni.linkedin_url && (
                <a
                  href={alumni.linkedin_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-xl bg-blue-800 px-5 py-3 font-semibold text-white transition hover:bg-blue-900"
                >
                  LinkedIn
                </a>
              )}

            </div>

          </Section>
        )}

      </div>


      {/* ================= FOOTER ================= */}
      <footer className="border-t border-slate-200 bg-white px-6 py-8 text-center">

        <p className="text-sm text-slate-500">
          © {new Date().getFullYear()} CUCAA Alumni Association
        </p>

      </footer>

    </main>
  );
}


/* =====================================================
   SECTION COMPONENT
===================================================== */

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl bg-white p-6 shadow-sm md:p-8">

      <h2 className="mb-6 text-2xl font-bold text-blue-950">
        {title}
      </h2>

      {children}

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
    <div className="grid gap-5 sm:grid-cols-2">
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
    <div className="rounded-xl bg-slate-50 p-4">

      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </p>

      <p className="mt-1 break-words font-medium text-slate-800">
        {value}
      </p>

    </div>
  );
}