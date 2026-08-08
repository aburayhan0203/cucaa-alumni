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

  async function updateStatus(
    id: string,
    status: "approved" | "rejected"
  ) {
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

  async function deleteAlumni(id: string) {
    const confirmed = window.confirm(
      "Are you sure you want to permanently delete this alumni record?"
    );

    if (!confirmed) return;

    const { error } = await supabase
      .from("Alumni-profiles")
      .delete()
      .eq("id", id);

    if (error) {
      alert(error.message);
      return;
    }

    setAlumni((current) =>
      current.filter((person) => person.id !== id)
    );
  }

  async function logout() {
    await supabase.auth.signOut();
    router.push("/login");
  }

  const total = alumni.length;
  const pending = alumni.filter(
    (a) => a.status === "pending"
  ).length;
  const approved = alumni.filter(
    (a) => a.status === "approved"
  ).length;
  const rejected = alumni.filter(
    (a) => a.status === "rejected"
  ).length;

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f7f9fc]">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-[#0b1f44]" />
          <p className="mt-4 text-sm font-medium text-slate-500">
            Loading admin dashboard...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f7f9fc] text-slate-900">

      {/* ================= HEADER ================= */}
      <header className="border-b border-white/10 bg-[#081b3a] text-white">

        <div className="mx-auto max-w-7xl px-5 sm:px-6">

          <div className="flex min-h-[78px] items-center justify-between gap-4">

            {/* Brand */}
            <div className="flex items-center gap-3">

              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-sm font-black tracking-tight text-[#0b1f44] shadow-lg">
                CoU
              </div>

              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-blue-200">
                  CoUCAA
                </p>

                <p className="text-sm font-semibold text-white">
                  Admin Portal
                </p>
              </div>

            </div>

            {/* Logout */}
            <button
              onClick={logout}
              className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              <LogoutIcon />
              <span className="hidden sm:inline">
                Logout
              </span>
            </button>

          </div>

        </div>
      </header>

      <div className="mx-auto max-w-7xl px-5 py-8 sm:px-6 lg:py-10">

        {/* ================= WELCOME ================= */}
        <section className="mb-8">

          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">

            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-[#0b4a8b]">
                <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                Administrator Access
              </div>

              <h1 className="text-3xl font-black tracking-tight text-[#081b3a] sm:text-4xl">
                Welcome back, Admin
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
                Manage alumni registrations, review applications,
                and keep the CUCAA alumni directory up to date.
              </p>
            </div>

            <div className="hidden rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm md:block">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Department
              </p>
              <p className="mt-1 font-bold text-[#081b3a]">
                Chemistry, Comilla University
              </p>
            </div>

          </div>

        </section>

        {/* ================= ERROR ================= */}
        {error && (
          <div className="mb-6 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <ErrorIcon />
            <div>
              <p className="font-bold">
                Something went wrong
              </p>
              <p className="mt-1">
                {error}
              </p>
            </div>
          </div>
        )}

        {/* ================= STATS ================= */}
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

          <StatCard
            title="Total Alumni"
            value={total}
            description="All registrations"
            icon={<UsersIcon />}
            iconClass="bg-blue-50 text-blue-700"
          />

          <StatCard
            title="Pending"
            value={pending}
            description="Awaiting review"
            icon={<ClockIcon />}
            iconClass="bg-amber-50 text-amber-700"
          />

          <StatCard
            title="Approved"
            value={approved}
            description="Active members"
            icon={<CheckIcon />}
            iconClass="bg-emerald-50 text-emerald-700"
          />

          <StatCard
            title="Rejected"
            value={rejected}
            description="Not approved"
            icon={<XIcon />}
            iconClass="bg-red-50 text-red-700"
          />

        </section>

        {/* ================= APPLICATIONS ================= */}
        <section className="mt-8 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_10px_40px_rgba(15,23,42,0.05)]">

          {/* Section Header */}
          <div className="border-b border-slate-100 px-5 py-6 sm:px-7">

            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">

              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-black tracking-tight text-[#081b3a]">
                    Alumni Applications
                  </h2>

                  <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-600">
                    {total}
                  </span>
                </div>

                <p className="mt-1 text-sm text-slate-500">
                  Review and manage alumni registrations.
                </p>
              </div>

              <button
                onClick={loadAlumni}
                className="inline-flex w-fit items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
              >
                <RefreshIcon />
                Refresh
              </button>

            </div>

          </div>

          {/* Empty */}
          {alumni.length === 0 ? (

            <div className="px-6 py-20 text-center">

              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                <UsersIcon />
              </div>

              <h3 className="mt-5 text-lg font-bold text-[#081b3a]">
                No alumni registrations yet
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                New alumni applications will appear here when
                someone submits the registration form.
              </p>

            </div>

          ) : (

            <>
              {/* Desktop Table */}
              <div className="hidden overflow-x-auto lg:block">

                <table className="w-full">

                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/70 text-left">

                      <th className="px-7 py-4 text-[11px] font-black uppercase tracking-wider text-slate-400">
                        Alumni
                      </th>

                      <th className="px-5 py-4 text-[11px] font-black uppercase tracking-wider text-slate-400">
                        Academic
                      </th>

                      <th className="px-5 py-4 text-[11px] font-black uppercase tracking-wider text-slate-400">
                        Professional
                      </th>

                      <th className="px-5 py-4 text-[11px] font-black uppercase tracking-wider text-slate-400">
                        Status
                      </th>

                      <th className="px-7 py-4 text-right text-[11px] font-black uppercase tracking-wider text-slate-400">
                        Actions
                      </th>

                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">

                    {alumni.map((person) => (

                      <tr
                        key={person.id}
                        className="group transition hover:bg-slate-50/70"
                      >

                        {/* Alumni */}
                        <td className="px-7 py-5">

                          <div className="flex items-center gap-3.5">

                            <Avatar
                              name={person.full_name}
                              photo={person.profile_photo}
                            />

                            <div className="min-w-0">

                              <p className="truncate font-bold text-slate-900">
                                {person.full_name}
                              </p>

                              <p className="mt-0.5 max-w-[230px] truncate text-xs text-slate-500">
                                {person.email}
                              </p>

                              <p className="mt-0.5 text-[11px] text-slate-400">
                                {person.phone || "No phone"}
                              </p>

                            </div>

                          </div>

                        </td>

                        {/* Academic */}
                        <td className="px-5 py-5">

                          <p className="text-sm font-bold text-slate-800">
                            {person.batch || "—"}
                          </p>

                          <p className="mt-1 text-xs text-slate-500">
                            {person.session
                              ? `Session ${person.session}`
                              : "Session not provided"}
                          </p>

                        </td>

                        {/* Professional */}
                        <td className="px-5 py-5">

                          <p className="max-w-[190px] truncate text-sm font-semibold text-slate-800">
                            {person.designation ||
                              person.profession ||
                              "Not provided"}
                          </p>

                          <p className="mt-1 max-w-[190px] truncate text-xs text-slate-500">
                            {person.current_organisation ||
                              "Organisation not provided"}
                          </p>

                        </td>

                        {/* Status */}
                        <td className="px-5 py-5">
                          <StatusBadge status={person.status} />
                        </td>

                        {/* Actions */}
                        <td className="px-7 py-5">

                          <div className="flex justify-end gap-2">

                            <button
                              onClick={() =>
                                router.push(
                                  `/admin/alumni/${person.id}`
                                )
                              }
                              className="inline-flex items-center gap-1.5 rounded-lg bg-[#081b3a] px-3 py-2 text-xs font-bold text-white transition hover:bg-[#0b2c5c]"
                            >
                              <EyeIcon />
                              View
                            </button>

                            <button
                              onClick={() =>
                                router.push(
                                  `/admin/alumni/${person.id}?edit=true`
                                )
                              }
                              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 transition hover:bg-slate-50"
                            >
                              Edit
                            </button>

                            {person.status !== "approved" && (
                              <button
                                onClick={() =>
                                  updateStatus(
                                    person.id,
                                    "approved"
                                  )
                                }
                                className="rounded-lg bg-emerald-600 px-3 py-2 text-xs font-bold text-white transition hover:bg-emerald-700"
                              >
                                Approve
                              </button>
                            )}

                            {person.status !== "rejected" && (
                              <button
                                onClick={() =>
                                  updateStatus(
                                    person.id,
                                    "rejected"
                                  )
                                }
                                className="rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-xs font-bold text-red-600 transition hover:bg-red-100"
                              >
                                Reject
                              </button>
                            )}

                            <button
                              onClick={() =>
                                deleteAlumni(person.id)
                              }
                              className="rounded-lg border border-slate-200 bg-white p-2 text-slate-400 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                              title="Delete"
                            >
                              <TrashIcon />
                            </button>

                          </div>

                        </td>

                      </tr>

                    ))}

                  </tbody>

                </table>

              </div>

              {/* Mobile / Tablet Cards */}
              <div className="divide-y divide-slate-100 lg:hidden">

                {alumni.map((person) => (

                  <div
                    key={person.id}
                    className="p-5 sm:p-6"
                  >

                    <div className="flex items-start justify-between gap-4">

                      <div className="flex min-w-0 items-center gap-3">

                        <Avatar
                          name={person.full_name}
                          photo={person.profile_photo}
                        />

                        <div className="min-w-0">

                          <p className="truncate font-bold text-slate-900">
                            {person.full_name}
                          </p>

                          <p className="truncate text-xs text-slate-500">
                            {person.email}
                          </p>

                        </div>

                      </div>

                      <StatusBadge status={person.status} />

                    </div>

                    <div className="mt-5 grid grid-cols-2 gap-3">

                      <MiniInfo
                        label="Batch"
                        value={person.batch || "—"}
                      />

                      <MiniInfo
                        label="Session"
                        value={person.session || "—"}
                      />

                      <MiniInfo
                        label="Designation"
                        value={
                          person.designation ||
                          person.profession ||
                          "—"
                        }
                      />

                      <MiniInfo
                        label="Organisation"
                        value={
                          person.current_organisation ||
                          "—"
                        }
                      />

                    </div>

                    <div className="mt-5 flex flex-wrap gap-2">

                      <button
                        onClick={() =>
                          router.push(
                            `/admin/alumni/${person.id}`
                          )
                        }
                        className="inline-flex items-center gap-1.5 rounded-lg bg-[#081b3a] px-4 py-2.5 text-xs font-bold text-white"
                      >
                        <EyeIcon />
                        View Details
                      </button>

                      <button
                        onClick={() =>
                          router.push(
                            `/admin/alumni/${person.id}?edit=true`
                          )
                        }
                        className="rounded-lg border border-slate-200 px-4 py-2.5 text-xs font-bold text-slate-700"
                      >
                        Edit
                      </button>

                      {person.status !== "approved" && (
                        <button
                          onClick={() =>
                            updateStatus(
                              person.id,
                              "approved"
                            )
                          }
                          className="rounded-lg bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white"
                        >
                          Approve
                        </button>
                      )}

                      {person.status !== "rejected" && (
                        <button
                          onClick={() =>
                            updateStatus(
                              person.id,
                              "rejected"
                            )
                          }
                          className="rounded-lg bg-red-50 px-4 py-2.5 text-xs font-bold text-red-600"
                        >
                          Reject
                        </button>
                      )}

                    </div>

                  </div>

                ))}

              </div>
            </>

          )}

        </section>

        {/* Footer */}
        <footer className="py-8 text-center">

          <p className="text-xs text-slate-400">
            CoUCAA Admin Portal
          </p>

          <p className="mt-1 text-xs text-slate-400">
            Department of Chemistry, Comilla University
          </p>

        </footer>

      </div>
    </main>
  );
}

/* =====================================================
   STAT CARD
===================================================== */

function StatCard({
  title,
  value,
  description,
  icon,
  iconClass,
}: {
  title: string;
  value: number;
  description: string;
  icon: React.ReactNode;
  iconClass: string;
}) {
  return (
    <div className="group rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_8px_30px_rgba(15,23,42,0.04)] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_14px_40px_rgba(15,23,42,0.08)]">

      <div className="flex items-start justify-between">

        <div>

          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
            {title}
          </p>

          <p className="mt-2 text-3xl font-black tracking-tight text-[#081b3a]">
            {value}
          </p>

          <p className="mt-1 text-xs font-medium text-slate-400">
            {description}
          </p>

        </div>

        <div
          className={`flex h-11 w-11 items-center justify-center rounded-2xl ${iconClass}`}
        >
          {icon}
        </div>

      </div>

    </div>
  );
}

/* =====================================================
   AVATAR
===================================================== */

function Avatar({
  name,
  photo,
}: {
  name: string;
  photo: string | null;
}) {
  if (photo) {
    return (
      <img
        src={photo}
        alt={name}
        className="h-11 w-11 shrink-0 rounded-xl object-cover ring-2 ring-slate-100"
      />
    );
  }

  return (
    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#e9f1fb] text-sm font-black text-[#0b4a8b] ring-2 ring-white">
      {name.charAt(0).toUpperCase()}
    </div>
  );
}

/* =====================================================
   STATUS
===================================================== */

function StatusBadge({
  status,
}: {
  status: string;
}) {
  if (status === "approved") {
    return (
      <span className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full bg-emerald-50 px-3 py-1.5 text-[11px] font-black text-emerald-700">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
        Approved
      </span>
    );
  }

  if (status === "rejected") {
    return (
      <span className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full bg-red-50 px-3 py-1.5 text-[11px] font-black text-red-700">
        <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
        Rejected
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full bg-amber-50 px-3 py-1.5 text-[11px] font-black text-amber-700">
      <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
      Pending
    </span>
  );
}

/* =====================================================
   MINI INFO
===================================================== */

function MiniInfo({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl bg-slate-50 p-3">
      <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">
        {label}
      </p>
      <p className="mt-1 truncate text-xs font-bold text-slate-700">
        {value}
      </p>
    </div>
  );
}

/* =====================================================
   ICONS
===================================================== */

function UsersIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m5 12 4 4L19 6" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  );
}

function EyeIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 6h18" />
      <path d="M8 6V4h8v2" />
      <path d="M19 6l-1 15H6L5 6" />
      <path d="M10 11v6" />
      <path d="M14 11v6" />
    </svg>
  );
}

function RefreshIcon() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20 11a8.1 8.1 0 0 0-15.5-2M4 5v4h4" />
      <path d="M4 13a8.1 8.1 0 0 0 15.5 2M20 19v-4h-4" />
    </svg>
  );
}

function LogoutIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M10 17l5-5-5-5" />
      <path d="M15 12H3" />
      <path d="M21 19V5a2 2 0 0 0-2-2h-6" />
    </svg>
  );
}

function ErrorIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="mt-0.5 shrink-0"
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M12 8v4" />
      <path d="M12 16h.01" />
    </svg>
  );
}