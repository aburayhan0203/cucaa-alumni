"use client";

import { FormEvent, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function RegisterPage() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setLoading(true);
    setSuccess(false);
    setError("");

    const form = new FormData(e.currentTarget);

    const photo = form.get("profile_photo") as File;

    let photoUrl = "";

    // Upload profile photo
    if (photo && photo.size > 0) {
      // Maximum 2 MB
      if (photo.size > 2 * 1024 * 1024) {
        setError("Profile photo must be smaller than 2 MB.");
        setLoading(false);
        return;
      }

      // Only allow images
      if (!photo.type.startsWith("image/")) {
        setError("Please select a valid image file.");
        setLoading(false);
        return;
      }

      const fileExtension = photo.name.split(".").pop();
      const fileName = `${crypto.randomUUID()}.${fileExtension}`;

      const { error: uploadError } = await supabase.storage
        .from("profile-photos")
        .upload(fileName, photo, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) {
        setError("Photo upload failed: " + uploadError.message);
        setLoading(false);
        return;
      }

      const { data: publicUrlData } = supabase.storage
        .from("profile-photos")
        .getPublicUrl(fileName);

      photoUrl = publicUrlData.publicUrl;
    }

    const data = {
      status: "pending",

      full_name: form.get("full_name") as string,
      email: form.get("email") as string,
      phone: form.get("phone") as string,

      profile_photo: photoUrl || null,

      gender: (form.get("gender") as string) || null,
      date_of_birth: (form.get("date_of_birth") as string) || null,
      blood_group: (form.get("blood_group") as string) || null,
      student_id: (form.get("student_id") as string) || null,

      session: (form.get("session") as string) || null,
      batch: (form.get("batch") as string) || null,

      admission_year: form.get("admission_year")
        ? Number(form.get("admission_year"))
        : null,

      graduation_year: form.get("graduation_year")
        ? Number(form.get("graduation_year"))
        : null,

      profession: (form.get("profession") as string) || null,
      current_organisation:
        (form.get("current_organisation") as string) || null,
      designation: (form.get("designation") as string) || null,
      city_country: (form.get("city_country") as string) || null,

      previous_experience:
        (form.get("previous_experience") as string) || null,

      facebook_url: (form.get("facebook_url") as string) || null,
      linkedin_url: (form.get("linkedin_url") as string) || null,

      bio: (form.get("bio") as string) || null,

      "research_interest (If Any)":
        (form.get("research_interest") as string) || null,

      comments_suggestions:
        (form.get("comments_suggestions") as string) || null,
    };

    const { error: insertError } = await supabase
      .from("Alumni-profiles")
      .insert(data);

    setLoading(false);

    if (insertError) {
      setError(insertError.message);
      return;
    }

    setSuccess(true);
    e.currentTarget.reset();
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-5xl px-6 py-12">

        <div className="mb-10 text-center">
          <p className="font-semibold uppercase tracking-widest text-blue-700">
            CUCAA Alumni Network
          </p>

          <h1 className="mt-3 text-4xl font-bold text-blue-950">
            Alumni Registration
          </h1>

          <p className="mx-auto mt-4 max-w-2xl text-slate-600">
            Join the Comilla University Department of Chemistry Alumni
            Association and stay connected with your alumni community.
          </p>
        </div>

        {success && (
          <div className="mb-8 rounded-xl border border-green-200 bg-green-50 p-5 text-green-800">
            <p className="font-bold">
              Registration submitted successfully!
            </p>

            <p className="mt-1 text-sm">
              Your information has been submitted for admin review.
              It will appear in the public alumni directory after approval.
            </p>
          </div>
        )}

        {error && (
          <div className="mb-8 rounded-xl border border-red-200 bg-red-50 p-5 text-red-700">
            <p className="font-semibold">Submission failed</p>
            <p className="mt-1 text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">

          {/* Personal Information */}
          <section className="rounded-2xl bg-white p-6 shadow-sm md:p-8">
            <h2 className="text-2xl font-bold text-blue-950">
              Personal Information
            </h2>

            <div className="mt-6 grid gap-5 md:grid-cols-2">

              <Field
                label="Full Name"
                name="full_name"
                required
              />

              <Field
                label="Email Address"
                name="email"
                type="email"
                required
              />

              <Field
                label="Phone Number"
                name="phone"
                required
              />

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Profile Photo
                </label>

                <input
                  name="profile_photo"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm"
                />

                <p className="mt-2 text-xs text-slate-500">
                  JPG, PNG or WebP. Maximum size: 2 MB.
                </p>
              </div>

              <Select
                label="Gender"
                name="gender"
                options={["Male", "Female", "Other"]}
              />

              <Field
                label="Date of Birth"
                name="date_of_birth"
                type="date"
              />

              <Field
                label="Blood Group"
                name="blood_group"
                placeholder="e.g. B+"
              />

              <Field
                label="Student ID"
                name="student_id"
              />
            </div>
          </section>

          {/* Academic Information */}
          <section className="rounded-2xl bg-white p-6 shadow-sm md:p-8">
            <h2 className="text-2xl font-bold text-blue-950">
              Academic Information
            </h2>

            <div className="mt-6 grid gap-5 md:grid-cols-2">

              <Field
                label="Session"
                name="session"
                placeholder="e.g. 2020-21"
              />

              <Field
                label="Batch"
                name="batch"
                placeholder="e.g. 8th Batch"
              />

              <Field
                label="Admission Year"
                name="admission_year"
                type="number"
              />

              <Field
                label="Graduation Year"
                name="graduation_year"
                type="number"
              />
            </div>
          </section>

          {/* Professional Information */}
          <section className="rounded-2xl bg-white p-6 shadow-sm md:p-8">
            <h2 className="text-2xl font-bold text-blue-950">
              Professional Information
            </h2>

            <div className="mt-6 grid gap-5 md:grid-cols-2">

              <Field
                label="Profession"
                name="profession"
                placeholder="e.g. Researcher, Teacher, Entrepreneur"
              />

              <Field
                label="Current Organisation"
                name="current_organisation"
              />

              <Field
                label="Designation"
                name="designation"
              />

              <Field
                label="City / Country"
                name="city_country"
                placeholder="e.g. Dhaka, Bangladesh"
              />

              <div className="md:col-span-2">
                <TextArea
                  label="Previous Experience"
                  name="previous_experience"
                />
              </div>
            </div>
          </section>

          {/* Online Profiles */}
          <section className="rounded-2xl bg-white p-6 shadow-sm md:p-8">
            <h2 className="text-2xl font-bold text-blue-950">
              Online Profiles
            </h2>

            <div className="mt-6 grid gap-5 md:grid-cols-2">

              <Field
                label="Facebook Profile URL"
                name="facebook_url"
                placeholder="https://facebook.com/..."
              />

              <Field
                label="LinkedIn Profile URL"
                name="linkedin_url"
                placeholder="https://linkedin.com/in/..."
              />
            </div>
          </section>

          {/* About */}
          <section className="rounded-2xl bg-white p-6 shadow-sm md:p-8">
            <h2 className="text-2xl font-bold text-blue-950">
              About You
            </h2>

            <div className="mt-6 space-y-5">

              <TextArea
                label="Short Bio"
                name="bio"
                placeholder="Tell us briefly about yourself..."
              />

              <TextArea
                label="Research Interest (If Any)"
                name="research_interest"
              />

              <TextArea
                label="Comments, Suggestions or Complaints"
                name="comments_suggestions"
                placeholder="Share your feedback, suggestions or complaints..."
              />
            </div>
          </section>

          {/* Submit */}
          <div className="rounded-2xl bg-blue-950 p-8 text-center text-white">

            <h2 className="text-2xl font-bold">
              Submit Your Alumni Information
            </h2>

            <p className="mx-auto mt-3 max-w-xl text-blue-100">
              Your information will be reviewed by the Alumni Association
              administrator before appearing in the public directory.
            </p>

            <button
              type="submit"
              disabled={loading}
              className="mt-6 rounded-full bg-white px-10 py-3 font-semibold text-blue-950 hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Submitting..." : "Submit Registration"}
            </button>

          </div>

        </form>
      </div>
    </main>
  );
}

function Field({
  label,
  name,
  type = "text",
  placeholder,
  required = false,
}: {
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-slate-700">
        {label}
        {required && <span className="text-red-500"> *</span>}
      </label>

      <input
        name={name}
        type={type}
        placeholder={placeholder}
        required={required}
        className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
      />
    </div>
  );
}

function Select({
  label,
  name,
  options,
}: {
  label: string;
  name: string;
  options: string[];
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-slate-700">
        {label}
      </label>

      <select
        name={name}
        className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
      >
        <option value="">Select</option>

        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
}

function TextArea({
  label,
  name,
  placeholder,
}: {
  label: string;
  name: string;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-slate-700">
        {label}
      </label>

      <textarea
        name={name}
        rows={5}
        placeholder={placeholder}
        className="w-full resize-y rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
      />
    </div>
  );
}