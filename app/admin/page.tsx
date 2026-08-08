"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

type Alumni = {
  id: string;
  created_at: string;
  status: string;
  full_name: string;
  email: string;
  phone: string;
  profile_photo: string | null;
  session: string | null;
  batch: string | null;
  profession: string | null;
  current_organisation: string | null;
  designation: string | null;
  city_country: string | null;
};

export default function AdminPage() {
  const router = useRouter();

  const [alumni, setAlumni] = useState<Alumni[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadAlumni() {
    setLoading(true);
    setError("");

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/login");
      return;
    }

    const { data: roleData, error: roleError } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .single();

    if (roleError || roleData?.role !== "admin") {
      await supabase.auth.signOut();
      router.push("/login");
      return;
    }

    const { data, error: alumniError } = await supabase
      .from("Alumni-profiles")
      .select(
        `
        id,
        created_at,
        status,
        full_name,
        email,
        phone,
        profile_photo,
        session,
        batch,
        profession,
        current_organisation,
        designation,
        city_country
        `
      )
      .order("created_at", { ascending: false });

    if (alumniError) {
      setError(alumniError.message);
      setLoading(false);
      return;
    }

    setAlumni(data || []);
    setLoading(false);
  }

  useEffect(() => {
    loadAlumni();
  }, []);

  async function updateStatus(id: string, status: "approved" | "rejected") {
    const { error } = await supabase
      .from("Alumni-profiles")
      .update({ status })
      .eq("id", id);

    if (error) {
      alert(error.message);
      return;
    }

    setAlumni((current) =>
      current.map((person) =>
        person.id === id ? { ...person, status } : person
      )
    );
  }

  async function logout() {
    await supabase.auth.signOut();
    router.push("/login");
  }

  const total = alumni.length;
  const pending = alumni.filter((a) => a.status === "pending").length;
  const approved = alumni.filter((a) => a.status === "approved").length;
  const rejected = alumni.filter((a) => a.status === "rejected").length;

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-100">
        <p className="text-slate-600">Loading dashboard...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-100">

      {/* Header */}
      <header className="bg-blue-950 text-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">

          <div>
            <p className="text-sm font-semibold uppercase tracking-widest text-blue-200">
              CUCAA Alumni Association
            </p>

            <h1 className="mt-1 text-2xl font-bold">
              Admin Dashboard
            </h1>
          </div>

          <button
            onClick={logout}
            className="rounded-lg bg-white/10 px-4 py-2 text-sm font-semibold hover:bg-white/20"
          >
            Logout
          </button>

        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 py-8">

        {/* Error */}
        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
            {error}
          </div>
        )}

        {/* Statistics */}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">

          <StatCard
            title="Total Alumni"
            value={total}
          />

          <StatCard
            title="Pending"
            value={pending}
          />

          <StatCard
            title="Approved"
            value={approved}
          />

          <StatCard
            title="Rejected"
            value={rejected}
          />

        </div>

        {/* Applications */}
        <section className="mt-8 overflow-hidden rounded-2xl bg-white shadow-sm">

          <div className="border-b border-slate-200 px-6 py-5">
            <h2 className="text-xl font-bold text-blue-950">
              Alumni Applications
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Review and manage alumni registrations.
            </p>
          </div>

          {alumni.length === 0 ? (
            <div className="px-6 py-16 text-center text-slate-500">
              No alumni registrations found.
            </div>
          ) : (
            <div className="overflow-x-auto">

              <table className="w-full min-w-[900px]">

                <thead className="bg-slate-50">
                  <tr className="text-left text-sm text-slate-600">

                    <th className="px-6 py-4 font-semibold">
                      Alumni
                    </th>

                    <th className="px-6 py-4 font-semibold">
                      Academic
                    </th>

                    <th className="px-6 py-4 font-semibold">
                      Profession
                    </th>

                    <th className="px-6 py-4 font-semibold">
                      Status
                    </th>

                    <th className="px-6 py-4 font-semibold">
                      Action
                    </th>

                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">

                  {alumni.map((person) => (
                    <tr key={person.id} className="hover:bg-slate-50">

                      {/* Alumni */}
                      <td className="px-6 py-5">

                        <div className="flex items-center gap-4">

                          {person.profile_photo ? (
                            <img
                              src={person.profile_photo}
                              alt={person.full_name}
                              className="h-12 w-12 rounded-full object-cover"
                            />
                          ) : (
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 font-bold text-blue-700">
                              {person.full_name
                                .charAt(0)
                                .toUpperCase()}
                            </div>
                          )}

                          <div>
                            <p className="font-semibold text-slate-900">
                              {person.full_name}
                            </p>

                            <p className="text-sm text-slate-500">
                              {person.email}
                            </p>

                            <p className="text-xs text-slate-400">
                              {person.phone}
                            </p>
                          </div>

                        </div>

                      </td>

                      {/* Academic */}
                      <td className="px-6 py-5">

                        <p className="text-sm font-medium text-slate-800">
                          {person.batch || "—"}
                        </p>

                        <p className="text-sm text-slate-500">
                          {person.session || "—"}
                        </p>

                      </td>

                      {/* Profession */}
                      <td className="px-6 py-5">

                        <p className="text-sm font-medium text-slate-800">
                          {person.designation || person.profession || "—"}
                        </p>

                        <p className="text-sm text-slate-500">
                          {person.current_organisation || "—"}
                        </p>

                      </td>

                      {/* Status */}
                      <td className="px-6 py-5">
                        <StatusBadge status={person.status} />
                      </td>

                      {/* Action */}
                      <td className="px-6 py-5">

                        <div className="flex gap-2">

                          {person.status !== "approved" && (
                            <button
                              onClick={() =>
                                updateStatus(person.id, "approved")
                              }
                              className="rounded-lg bg-green-600 px-3 py-2 text-xs font-semibold text-white hover:bg-green-700"
                            >
                              Approve
                            </button>
                          )}

                          {person.status !== "rejected" && (
                            <button
                              onClick={() =>
                                updateStatus(person.id, "rejected")
                              }
                              className="rounded-lg bg-red-600 px-3 py-2 text-xs font-semibold text-white hover:bg-red-700"
                            >
                              Reject
                            </button>
                          )}

                        </div>

                      </td>

                    </tr>
                  ))}

                </tbody>

              </table>

            </div>
          )}

        </section>

      </div>
    </main>
  );
}

function StatCard({
  title,
  value,
}: {
  title: string;
  value: number;
}) {
  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm">

      <p className="text-sm font-medium text-slate-500">
        {title}
      </p>

      <p className="mt-2 text-4xl font-bold text-blue-950">
        {value}
      </p>

    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  if (status === "approved") {
    return (
      <span className="inline-flex rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
        Approved
      </span>
    );
  }

  if (status === "rejected") {
    return (
      <span className="inline-flex rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700">
        Rejected
      </span>
    );
  }

  return (
    <span className="inline-flex rounded-full bg-yellow-100 px-3 py-1 text-xs font-semibold text-yellow-700">
      Pending
    </span>
  );
}