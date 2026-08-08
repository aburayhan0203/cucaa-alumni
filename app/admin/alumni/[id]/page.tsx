"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

type Alumni = {
  id: string;
  created_at: string;
  status: string;
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
  comments_suggestions: string | null;
};

type FormState = {
  full_name: string;
  email: string;
  phone: string;
  profile_photo: string;
  gender: string;
  date_of_birth: string;
  blood_group: string;
  student_id: string;
  session: string;
  batch: string;
  admission_year: string;
  graduation_year: string;
  profession: string;
  current_organisation: string;
  designation: string;
  city_country: string;
  previous_experience: string;
  facebook_url: string;
  linkedin_url: string;
  bio: string;
  research_interest: string;
  comments_suggestions: string;
};

const emptyForm: FormState = {
  full_name: "",
  email: "",
  phone: "",
  profile_photo: "",
  gender: "",
  date_of_birth: "",
  blood_group: "",
  student_id: "",
  session: "",
  batch: "",
  admission_year: "",
  graduation_year: "",
  profession: "",
  current_organisation: "",
  designation: "",
  city_country: "",
  previous_experience: "",
  facebook_url: "",
  linkedin_url: "",
  bio: "",
  research_interest: "",
  comments_suggestions: "",
};

export default function AdminAlumniDetails() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();

  const id = params.id as string;
  const editFromUrl = searchParams.get("edit") === "true";

  const [alumni, setAlumni] = useState<Alumni | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [authorizing, setAuthorizing] = useState(true);
  const [editing, setEditing] = useState(editFromUrl);

  async function checkAdmin() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/login");
      return false;
    }

    const { data: roleData } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .single();

    if (roleData?.role !== "admin") {
      await supabase.auth.signOut();
      router.push("/login");
      return false;
    }

    setAuthorizing(false);
    return true;
  }

  async function loadAlumni() {
    const allowed = await checkAdmin();

    if (!allowed) return;

    const { data, error } = await supabase
      .from("Alumni-profiles")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error(error);
      alert("Unable to load alumni profile.");
      router.push("/admin");
      return;
    }

    setAlumni(data);

    setForm({
      full_name: data.full_name || "",
      email: data.email || "",
      phone: data.phone || "",
      profile_photo: data.profile_photo || "",
      gender: data.gender || "",
      date_of_birth: data.date_of_birth || "",
      blood_group: data.blood_group || "",
      student_id: data.student_id || "",
      session: data.session || "",
      batch: data.batch || "",
      admission_year: data.admission_year?.toString() || "",
      graduation_year: data.graduation_year?.toString() || "",
      profession: data.profession || "",
      current_organisation: data.current_organisation || "",
      designation: data.designation || "",
      city_country: data.city_country || "",
      previous_experience: data.previous_experience || "",
      facebook_url: data.facebook_url || "",
      linkedin_url: data.linkedin_url || "",
      bio: data.bio || "",
      research_interest:
        data["research_interest (If Any)"] || "",
      comments_suggestions:
        data.comments_suggestions || "",
    });

    setLoading(false);
  }

  useEffect(() => {
    loadAlumni();
  }, [id]);

  function updateField(
    field: keyof FormState,
    value: string
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function saveChanges() {
    if (!alumni) return;

    setSaving(true);

    const updateData = {
      full_name: form.full_name.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      profile_photo: form.profile_photo.trim() || null,
      gender: form.gender.trim() || null,
      date_of_birth: form.date_of_birth || null,
      blood_group: form.blood_group.trim() || null,
      student_id: form.student_id.trim() || null,
      session: form.session.trim() || null,
      batch: form.batch.trim() || null,
      admission_year: form.admission_year
        ? Number(form.admission_year)
        : null,
      graduation_year: form.graduation_year
        ? Number(form.graduation_year)
        : null,
      profession: form.profession.trim() || null,
      current_organisation:
        form.current_organisation.trim() || null,
      designation: form.designation.trim() || null,
      city_country: form.city_country.trim() || null,
      previous_experience:
        form.previous_experience.trim() || null,
      facebook_url: form.facebook_url.trim() || null,
      linkedin_url: form.linkedin_url.trim() || null,
      bio: form.bio.trim() || null,
      "research_interest (If Any)":
        form.research_interest.trim() || null,
      comments_suggestions:
        form.comments_suggestions.trim() || null,
    };

    const { data, error } = await supabase
      .from("Alumni-profiles")
      .update(updateData)
      .eq("id", alumni.id)
      .select("*")
      .single();

    if (error) {
      alert(`Update failed: ${error.message}`);
      setSaving(false);
      return;
    }

    setAlumni(data);
    setEditing(false);
    setSaving(false);

    alert("Alumni profile updated successfully.");
  }

  async function updateStatus(
    status: "approved" | "rejected"
  ) {
    if (!alumni) return;

    const action =
      status === "approved" ? "approve" : "reject";

    const confirmed = window.confirm(
      `Are you sure you want to ${action} this alumni profile?`
    );

    if (!confirmed) return;

    const { data, error } = await supabase
      .from("Alumni-profiles")
      .update({ status })
      .eq("id", alumni.id)
      .select("*")
      .single();

    if (error) {
      alert(`Failed: ${error.message}`);
      return;
    }

    setAlumni(data);

    alert(
      status === "approved"
        ? "Alumni approved successfully."
        : "Alumni rejected successfully."
    );
  }

  async function deleteAlumni() {
    if (!alumni) return;

    const confirmed = window.confirm(
      "This will permanently delete this alumni record. Continue?"
    );

    if (!confirmed) return;

    const { error } = await supabase
      .from("Alumni-profiles")
      .delete()
      .eq("id", alumni.id);

    if (error) {
      alert(`Delete failed: ${error.message}`);
      return;
    }

    router.push("/admin");
  }

  function cancelEditing() {
    if (alumni) {
      setForm({
        full_name: alumni.full_name || "",
        email: alumni.email || "",
        phone: alumni.phone || "",
        profile_photo: alumni.profile_photo || "",
        gender: alumni.gender || "",
        date_of_birth: alumni.date_of_birth || "",
        blood_group: alumni.blood_group || "",
        student_id: alumni.student_id || "",
        session: alumni.session || "",
        batch: alumni.batch || "",
        admission_year:
          alumni.admission_year?.toString() || "",
        graduation_year:
          alumni.graduation_year?.toString() || "",
        profession: alumni.profession || "",
        current_organisation:
          alumni.current_organisation || "",
        designation: alumni.designation || "",
        city_country: alumni.city_country || "",
        previous_experience:
          alumni.previous_experience || "",
        facebook_url: alumni.facebook_url || "",
        linkedin_url: alumni.linkedin_url || "",
        bio: alumni.bio || "",
        research_interest:
          alumni["research_interest (If Any)"] || "",
        comments_suggestions:
          alumni.comments_suggestions || "",
      });
    }

    setEditing(false);
  }

  if (loading || authorizing) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f7f9fc]">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-[#081b3a]" />
          <p className="mt-4 text-sm font-medium text-slate-500">
            Loading alumni profile...
          </p>
        </div>
      </main>
    );
  }

  if (!alumni) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f7f9fc] px-5">
        <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">
          <h1 className="text-xl font-black text-[#081b3a]">
            Alumni profile not found
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            The requested alumni record could not be found.
          </p>

          <Link
            href="/admin"
            className="mt-6 inline-flex rounded-xl bg-[#081b3a] px-5 py-3 text-sm font-bold text-white"
          >
            Back to Dashboard
          </Link>
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

            <div className="flex items-center gap-3">

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-sm font-black text-[#081b3a] shadow-lg">
                CoU
              </div>

              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-blue-200">
                  CoUCAA
                </p>

                <p className="text-sm font-semibold">
                  Alumni Administration
                </p>
              </div>

            </div>

            <Link
              href="/admin"
              className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              <ArrowLeftIcon />
              <span className="hidden sm:inline">
                Dashboard
              </span>
            </Link>

          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-5 py-8 sm:px-6 lg:py-10">

        {/* ================= PAGE INTRO ================= */}

        <div className="mb-6">
          <Link
            href="/admin"
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-[#0b4a8b]"
          >
            <ArrowLeftIcon />
            Back to Alumni Applications
          </Link>

          <div className="mt-5 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">

            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-[#0b4a8b]">
                Alumni Profile
              </p>

              <h1 className="mt-1 text-3xl font-black tracking-tight text-[#081b3a]">
                Profile Details
              </h1>
            </div>

            <StatusBadge status={alumni.status} />

          </div>
        </div>

        {/* ================= PROFILE HERO ================= */}

        <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_10px_40px_rgba(15,23,42,0.06)]">

          <div className="relative overflow-hidden bg-[#081b3a] px-6 py-8 sm:px-8 lg:px-10">

            <div className="absolute -right-20 -top-24 h-64 w-64 rounded-full bg-blue-400/10 blur-2xl" />
            <div className="absolute -bottom-32 left-1/3 h-64 w-64 rounded-full bg-blue-300/10 blur-2xl" />

            <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center">

              {/* Photo */}

              {alumni.profile_photo ? (
                <img
                  src={alumni.profile_photo}
                  alt={alumni.full_name}
                  className="h-28 w-28 shrink-0 rounded-2xl border-4 border-white/10 object-cover shadow-xl"
                />
              ) : (
                <div className="flex h-28 w-28 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/10 text-4xl font-black text-white shadow-xl">
                  {alumni.full_name
                    .charAt(0)
                    .toUpperCase()}
                </div>
              )}

              {/* Name */}

              <div className="min-w-0 flex-1 text-white">

                <div className="flex flex-wrap items-center gap-3">

                  <h2 className="text-3xl font-black tracking-tight">
                    {alumni.full_name}
                  </h2>

                </div>

                <p className="mt-2 text-base font-medium text-blue-100">
                  {alumni.designation ||
                    alumni.profession ||
                    "Chemistry Alumni"}
                </p>

                {alumni.current_organisation && (
                  <p className="mt-1 text-sm text-blue-200">
                    {alumni.current_organisation}
                  </p>
                )}

                <div className="mt-4 flex flex-wrap gap-2">

                  {alumni.batch && (
                    <span className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs font-semibold text-blue-50">
                      Batch {alumni.batch}
                    </span>
                  )}

                  {alumni.session && (
                    <span className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs font-semibold text-blue-50">
                      Session {alumni.session}
                    </span>
                  )}

                  {alumni.city_country && (
                    <span className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs font-semibold text-blue-50">
                      {alumni.city_country}
                    </span>
                  )}

                </div>

              </div>

            </div>

          </div>

          {/* ================= ACTION BAR ================= */}

          <div className="flex flex-wrap gap-2.5 border-b border-slate-100 px-6 py-5 sm:px-8">

            {!editing && (
              <button
                onClick={() => setEditing(true)}
                className="inline-flex items-center gap-2 rounded-xl bg-[#081b3a] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-[#0b2c5c]"
              >
                <EditIcon />
                Edit Profile
              </button>
            )}

            {alumni.status !== "approved" && (
              <button
                onClick={() => updateStatus("approved")}
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-emerald-700"
              >
                <CheckIcon />
                Approve
              </button>
            )}

            {alumni.status !== "rejected" && (
              <button
                onClick={() => updateStatus("rejected")}
                className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-red-700"
              >
                <XIcon />
                Reject
              </button>
            )}

            <button
              onClick={deleteAlumni}
              className="inline-flex items-center gap-2 rounded-xl border border-red-200 bg-white px-4 py-2.5 text-sm font-bold text-red-600 transition hover:bg-red-50"
            >
              <TrashIcon />
              Delete
            </button>

          </div>

        </section>

        {/* ================= EDIT MODE ================= */}

        {editing ? (

          <section className="mt-6 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_10px_40px_rgba(15,23,42,0.05)]">

            <div className="border-b border-slate-100 bg-slate-50/70 px-6 py-6 sm:px-8">

              <p className="text-xs font-black uppercase tracking-[0.18em] text-[#0b4a8b]">
                Administrator
              </p>

              <h2 className="mt-1 text-xl font-black text-[#081b3a]">
                Edit Alumni Information
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Update the submitted information carefully and save
                the changes.
              </p>

            </div>

            <div className="p-6 sm:p-8">

              <FormSection title="Personal Information">

                <Input
                  label="Full Name"
                  value={form.full_name}
                  onChange={(v) =>
                    updateField("full_name", v)
                  }
                  required
                />

                <Input
                  label="Email"
                  type="email"
                  value={form.email}
                  onChange={(v) =>
                    updateField("email", v)
                  }
                  required
                />

                <Input
                  label="Phone"
                  value={form.phone}
                  onChange={(v) =>
                    updateField("phone", v)
                  }
                  required
                />

                <Input
                  label="Profile Photo URL"
                  value={form.profile_photo}
                  onChange={(v) =>
                    updateField("profile_photo", v)
                  }
                />

                <Input
                  label="Gender"
                  value={form.gender}
                  onChange={(v) =>
                    updateField("gender", v)
                  }
                />

                <Input
                  label="Date of Birth"
                  type="date"
                  value={form.date_of_birth}
                  onChange={(v) =>
                    updateField("date_of_birth", v)
                  }
                />

                <Input
                  label="Blood Group"
                  value={form.blood_group}
                  onChange={(v) =>
                    updateField("blood_group", v)
                  }
                />

                <Input
                  label="City / Country"
                  value={form.city_country}
                  onChange={(v) =>
                    updateField("city_country", v)
                  }
                />

              </FormSection>

              <FormSection title="Academic Information">

                <Input
                  label="Student ID"
                  value={form.student_id}
                  onChange={(v) =>
                    updateField("student_id", v)
                  }
                />

                <Input
                  label="Session"
                  value={form.session}
                  onChange={(v) =>
                    updateField("session", v)
                  }
                />

                <Input
                  label="Batch"
                  value={form.batch}
                  onChange={(v) =>
                    updateField("batch", v)
                  }
                />

                <Input
                  label="Admission Year"
                  type="number"
                  value={form.admission_year}
                  onChange={(v) =>
                    updateField("admission_year", v)
                  }
                />

                <Input
                  label="Graduation Year"
                  type="number"
                  value={form.graduation_year}
                  onChange={(v) =>
                    updateField("graduation_year", v)
                  }
                />

              </FormSection>

              <FormSection title="Professional Information">

                <Input
                  label="Profession"
                  value={form.profession}
                  onChange={(v) =>
                    updateField("profession", v)
                  }
                />

                <Input
                  label="Current Organisation"
                  value={form.current_organisation}
                  onChange={(v) =>
                    updateField(
                      "current_organisation",
                      v
                    )
                  }
                />

                <Input
                  label="Designation"
                  value={form.designation}
                  onChange={(v) =>
                    updateField("designation", v)
                  }
                />

                <Textarea
                  label="Previous Experience"
                  value={form.previous_experience}
                  onChange={(v) =>
                    updateField(
                      "previous_experience",
                      v
                    )
                  }
                />

              </FormSection>

              <FormSection title="About & Research">

                <Textarea
                  label="Bio"
                  value={form.bio}
                  onChange={(v) =>
                    updateField("bio", v)
                  }
                  large
                />

                <Textarea
                  label="Research Interest"
                  value={form.research_interest}
                  onChange={(v) =>
                    updateField(
                      "research_interest",
                      v
                    )
                  }
                  large
                />

                <Textarea
                  label="Comments / Suggestions"
                  value={form.comments_suggestions}
                  onChange={(v) =>
                    updateField(
                      "comments_suggestions",
                      v
                    )
                  }
                  large
                />

              </FormSection>

              <FormSection title="Social Links">

                <Input
                  label="Facebook URL"
                  value={form.facebook_url}
                  onChange={(v) =>
                    updateField("facebook_url", v)
                  }
                />

                <Input
                  label="LinkedIn URL"
                  value={form.linkedin_url}
                  onChange={(v) =>
                    updateField("linkedin_url", v)
                  }
                />

              </FormSection>

              {/* Save bar */}

              <div className="mt-8 flex flex-col-reverse gap-3 border-t border-slate-100 pt-6 sm:flex-row sm:justify-end">

                <button
                  onClick={cancelEditing}
                  disabled={saving}
                  className="rounded-xl border border-slate-200 bg-white px-6 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  onClick={saveChanges}
                  disabled={saving}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#081b3a] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#0b2c5c] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {saving ? (
                    <>
                      <SpinnerIcon />
                      Saving...
                    </>
                  ) : (
                    <>
                      <SaveIcon />
                      Save Changes
                    </>
                  )}
                </button>

              </div>

            </div>

          </section>

        ) : (

          /* ================= VIEW MODE ================= */

          <div className="mt-6 space-y-5">

            <InfoSection
              title="Personal Information"
              icon={<UserIcon />}
            >

              <Info
                label="Full Name"
                value={alumni.full_name}
              />

              <Info
                label="Email"
                value={alumni.email}
              />

              <Info
                label="Phone"
                value={alumni.phone}
              />

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

              <Info
                label="City / Country"
                value={alumni.city_country}
              />

            </InfoSection>

            <InfoSection
              title="Academic Information"
              icon={<AcademicIcon />}
            >

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
                  alumni.admission_year?.toString()
                }
              />

              <Info
                label="Graduation Year"
                value={
                  alumni.graduation_year?.toString()
                }
              />

            </InfoSection>

            <InfoSection
              title="Professional Information"
              icon={<BriefcaseIcon />}
            >

              <Info
                label="Profession"
                value={alumni.profession}
              />

              <Info
                label="Current Organisation"
                value={alumni.current_organisation}
              />

              <Info
                label="Designation"
                value={alumni.designation}
              />

              <div className="md:col-span-2">
                <Info
                  label="Previous Experience"
                  value={alumni.previous_experience}
                  multiline
                />
              </div>

            </InfoSection>

            <InfoSection
              title="About & Research"
              icon={<FlaskIcon />}
            >

              <div className="md:col-span-2">
                <Info
                  label="Bio"
                  value={alumni.bio}
                  multiline
                />
              </div>

              <div className="md:col-span-2">
                <Info
                  label="Research Interest"
                  value={
                    alumni[
                      "research_interest (If Any)"
                    ]
                  }
                  multiline
                />
              </div>

              <div className="md:col-span-2">
                <Info
                  label="Comments / Suggestions"
                  value={
                    alumni.comments_suggestions
                  }
                  multiline
                />
              </div>

            </InfoSection>

            <InfoSection
              title="Social Links"
              icon={<LinkIcon />}
            >

              <Info
                label="Facebook"
                value={alumni.facebook_url}
                link
              />

              <Info
                label="LinkedIn"
                value={alumni.linkedin_url}
                link
              />

            </InfoSection>

            <InfoSection
              title="Registration Information"
              icon={<ClipboardIcon />}
            >

              <Info
                label="Application Status"
                value={capitalize(alumni.status)}
              />

              <Info
                label="Submitted"
                value={formatDateTime(alumni.created_at)}
              />

            </InfoSection>

          </div>
        )}

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
   FORM SECTION
===================================================== */

function FormSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-9 last:mb-0">

      <div className="mb-5 flex items-center gap-3">

        <div className="h-6 w-1 rounded-full bg-[#0b4a8b]" />

        <h3 className="text-lg font-black text-[#081b3a]">
          {title}
        </h3>

      </div>

      <div className="grid gap-5 md:grid-cols-2">
        {children}
      </div>

    </div>
  );
}

/* =====================================================
   INFO SECTION
===================================================== */

function InfoSection({
  title,
  icon,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_8px_30px_rgba(15,23,42,0.04)] sm:p-7">

      <div className="mb-6 flex items-center gap-3 border-b border-slate-100 pb-5">

        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-[#0b4a8b]">
          {icon}
        </div>

        <div>
          <h2 className="text-lg font-black text-[#081b3a]">
            {title}
          </h2>

          <p className="mt-0.5 text-xs text-slate-400">
            Alumni profile information
          </p>
        </div>

      </div>

      <div className="grid gap-x-8 gap-y-7 md:grid-cols-2">
        {children}
      </div>

    </section>
  );
}

/* =====================================================
   INPUT
===================================================== */

function Input({
  label,
  value,
  onChange,
  type = "text",
  required = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  required?: boolean;
}) {
  return (
    <label className="block">

      <span className="mb-2 block text-sm font-bold text-slate-700">
        {label}

        {required && (
          <span className="ml-1 text-red-500">
            *
          </span>
        )}
      </span>

      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm font-medium text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#0b4a8b] focus:bg-white focus:ring-4 focus:ring-blue-50"
      />

    </label>
  );
}

/* =====================================================
   TEXTAREA
===================================================== */

function Textarea({
  label,
  value,
  onChange,
  large = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  large?: boolean;
}) {
  return (
    <label
      className={
        large
          ? "block md:col-span-2"
          : "block"
      }
    >

      <span className="mb-2 block text-sm font-bold text-slate-700">
        {label}
      </span>

      <textarea
        rows={large ? 6 : 4}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full resize-y rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm font-medium text-slate-900 outline-none transition focus:border-[#0b4a8b] focus:bg-white focus:ring-4 focus:ring-blue-50"
      />

    </label>
  );
}

/* =====================================================
   INFO
===================================================== */

function Info({
  label,
  value,
  multiline = false,
  link = false,
}: {
  label: string;
  value: string | null | undefined;
  multiline?: boolean;
  link?: boolean;
}) {
  const displayValue = value?.trim() || "Not provided";

  return (
    <div className={multiline ? "md:col-span-2" : ""}>

      <p className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">
        {label}
      </p>

      {link && value ? (
        <a
          href={value}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 block break-all text-sm font-semibold text-[#0b4a8b] hover:underline"
        >
          {value}
        </a>
      ) : (
        <p
          className={`mt-2 whitespace-pre-wrap break-words text-sm leading-6 ${
            value
              ? "font-medium text-slate-800"
              : "italic text-slate-400"
          }`}
        >
          {displayValue}
        </p>
      )}

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
      <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3.5 py-2 text-xs font-black text-emerald-700">
        <span className="h-2 w-2 rounded-full bg-emerald-500" />
        Approved
      </span>
    );
  }

  if (status === "rejected") {
    return (
      <span className="inline-flex items-center gap-2 rounded-full bg-red-50 px-3.5 py-2 text-xs font-black text-red-700">
        <span className="h-2 w-2 rounded-full bg-red-500" />
        Rejected
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-2 rounded-full bg-amber-50 px-3.5 py-2 text-xs font-black text-amber-700">
      <span className="h-2 w-2 rounded-full bg-amber-500" />
      Pending
    </span>
  );
}

/* =====================================================
   DATE HELPERS
===================================================== */

function formatDate(date: string | null) {
  if (!date) return "Not provided";

  return new Date(date).toLocaleDateString(
    "en-US",
    {
      year: "numeric",
      month: "long",
      day: "numeric",
    }
  );
}

function formatDateTime(date: string) {
  return new Date(date).toLocaleString(
    "en-US",
    {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }
  );
}

function capitalize(value: string) {
  if (!value) return value;

  return (
    value.charAt(0).toUpperCase() +
    value.slice(1)
  );
}

/* =====================================================
   ICONS
===================================================== */

function ArrowLeftIcon() {
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
      <path d="M19 12H5" />
      <path d="m12 19-7-7 7-7" />
    </svg>
  );
}

function EditIcon() {
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
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L8 18l-4 1 1-4Z" />
    </svg>
  );
}

function CheckIcon() {
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
      <path d="m5 12 4 4L19 6" />
    </svg>
  );
}

function XIcon() {
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
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  );
}

function TrashIcon() {
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
      <path d="M3 6h18" />
      <path d="M8 6V4h8v2" />
      <path d="M19 6l-1 15H6L5 6" />
      <path d="M10 11v6" />
      <path d="M14 11v6" />
    </svg>
  );
}

function SaveIcon() {
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
      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2Z" />
      <path d="M17 21v-8H7v8" />
      <path d="M7 3v5h8" />
    </svg>
  );
}

function SpinnerIcon() {
  return (
    <svg
      className="animate-spin"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <circle
        cx="12"
        cy="12"
        r="9"
        className="opacity-25"
      />
      <path
        d="M21 12a9 9 0 0 0-9-9"
        strokeLinecap="round"
      />
    </svg>
  );
}

function UserIcon() {
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
    >
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21a8 8 0 0 1 16 0" />
    </svg>
  );
}

function AcademicIcon() {
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
    >
      <path d="m3 10 9-5 9 5-9 5-9-5Z" />
      <path d="M7 12.5V17c3 2 7 2 10 0v-4.5" />
      <path d="M21 10v6" />
    </svg>
  );
}

function BriefcaseIcon() {
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
    >
      <rect x="3" y="7" width="18" height="13" rx="2" />
      <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      <path d="M3 12h18" />
    </svg>
  );
}

function FlaskIcon() {
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
    >
      <path d="M9 3h6" />
      <path d="M10 3v6l-5 8.5A2 2 0 0 0 6.7 21h10.6a2 2 0 0 0 1.7-3.5L14 9V3" />
      <path d="M8 15h8" />
    </svg>
  );
}

function LinkIcon() {
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
    >
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
  );
}

function ClipboardIcon() {
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
    >
      <rect x="5" y="4" width="14" height="17" rx="2" />
      <path d="M9 4V2h6v2" />
      <path d="M9 10h6" />
      <path d="M9 14h6" />
    </svg>
  );
}