"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

type Alumni = {
  id: string;
  full_name: string;
  profile_photo: string | null;
  session: string | null;
  batch: string | null;
  profession: string | null;
  current_organisation: string | null;
  designation: string | null;
  city_country: string | null;
};

export default function AlumniDirectory() {
  const [alumni, setAlumni] = useState<Alumni[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadAlumni() {
      const { data, error } = await supabase
        .from("Alumni-profiles")
        .select(`
          id,
          full_name,
          profile_photo,
          session,
          batch,
          profession,
          current_organisation,
          designation,
          city_country
        `)
        .eq("status", "approved")
        .order("full_name", { ascending: true });

      if (error) {
        setError(error.message);
      } else {
        setAlumni(data || []);
      }

      setLoading(false);
    }

    loadAlumni();
  }, []);

  return (
    <main className="min-h-screen bg-slate-50">

      {/* Header */}
      <section className="bg-blue-950 px-6 py-16 text-center text-white">
        <p className="text-sm font-semibold uppercase tracking-widest text-blue-200">
          CUCAA Alumni Association
        </p>

        <h1 className="mt-3 text-4xl font-bold md:text-5xl">
          Alumni Directory
        </h1>

        <p className="mx-auto mt-4 max-w-2xl text-blue-100">
          Meet our alumni and explore the growing Chemistry alumni community.
        </p>
      </section>

      {/* Alumni Section */}
      <section className="mx-auto max-w-7xl px-6 py-12">

        {/* Loading */}
        {loading && (
          <div className="py-20 text-center">
            <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-blue-200 border-t-blue-950" />

            <p className="mt-4 text-slate-500">
              Loading alumni...
            </p>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-red-700">
            <p className="font-semibold">
              Unable to load alumni
            </p>

            <p className="mt-1 text-sm">
              {error}
            </p>
          </div>
        )}

        {/* Empty */}
        {!loading && !error && alumni.length === 0 && (
          <div className="rounded-2xl bg-white p-16 text-center shadow-sm">

            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 text-3xl">
              🎓
            </div>

            <h2 className="mt-5 text-xl font-bold text-slate-800">
              No approved alumni yet
            </h2>

            <p className="mt-2 text-slate-500">
              Approved alumni will appear here.
            </p>

          </div>
        )}

        {/* Alumni Cards */}
        {!loading && !error && alumni.length > 0 && (

          <>
            <div className="mb-8 flex items-end justify-between">

              <div>
                <h2 className="text-2xl font-bold text-blue-950">
                  Our Alumni
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  {alumni.length} approved{" "}
                  {alumni.length === 1 ? "alumnus" : "alumni"}
                </p>
              </div>

            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">

              {alumni.map((person) => (

                <article
                  key={person.id}
                  className="group overflow-hidden rounded-2xl bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl"
                >

                  {/* Profile Photo */}
                  <div className="flex justify-center bg-gradient-to-b from-blue-50 to-white py-8">

                    {person.profile_photo ? (
                      <img
                        src={person.profile_photo}
                        alt={person.full_name}
                        className="h-32 w-32 rounded-full border-4 border-white object-cover shadow-md"
                      />
                    ) : (
                      <div className="flex h-32 w-32 items-center justify-center rounded-full border-4 border-white bg-blue-100 text-5xl font-bold text-blue-700 shadow-md">
                        {person.full_name
                          .charAt(0)
                          .toUpperCase()}
                      </div>
                    )}

                  </div>

                  {/* Information */}
                  <div className="p-6">

                    <h2 className="text-xl font-bold text-blue-950">
                      {person.full_name}
                    </h2>

                    {person.designation || person.profession ? (
                      <p className="mt-1 text-sm font-medium text-slate-600">
                        {person.designation || person.profession}
                      </p>
                    ) : (
                      <p className="mt-1 text-sm text-slate-400">
                        Alumni
                      </p>
                    )}

                    {person.current_organisation && (
                      <p className="mt-2 text-sm font-semibold text-slate-700">
                        {person.current_organisation}
                      </p>
                    )}

                    {/* Academic / Location */}
                    <div className="mt-5 space-y-2 text-sm text-slate-500">

                      {person.batch && (
                        <div className="flex gap-2">
                          <span>🎓</span>
                          <span>
                            <strong className="text-slate-700">
                              Batch:
                            </strong>{" "}
                            {person.batch}
                          </span>
                        </div>
                      )}

                      {person.session && (
                        <div className="flex gap-2">
                          <span>📚</span>
                          <span>
                            <strong className="text-slate-700">
                              Session:
                            </strong>{" "}
                            {person.session}
                          </span>
                        </div>
                      )}

                      {person.city_country && (
                        <div className="flex gap-2">
                          <span>📍</span>
                          <span>
                            {person.city_country}
                          </span>
                        </div>
                      )}

                    </div>

                    {/* View Profile */}
                    <Link
                      href={`/alumni/${person.id}`}
                      className="mt-6 block rounded-xl bg-blue-950 px-4 py-3 text-center text-sm font-semibold text-white transition hover:bg-blue-900"
                    >
                      View Profile
                    </Link>

                  </div>

                </article>

              ))}

            </div>
          </>
        )}

      </section>

    </main>
  );
}