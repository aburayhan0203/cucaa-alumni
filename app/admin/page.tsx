"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

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

type NewsEvent = {
  id: string;
  title: string;
  type: "news" | "event";
  description: string | null;
  cover_image: string | null;
  event_date: string | null;
  venue: string | null;
  status: "draft" | "published";
  created_at: string;
  updated_at: string;
};

const emptyNewsForm = {
  title: "",
  type: "news" as "news" | "event",
  description: "",
  cover_image: "",
  event_date: "",
  venue: "",
  status: "draft" as "draft" | "published",
};

export default function AdminPage() {
  const router = useRouter();

  const [alumni, setAlumni] = useState<Alumni[]>([]);
  const [newsEvents, setNewsEvents] = useState<NewsEvent[]>([]);

  const [loading, setLoading] = useState(true);
  const [newsLoading, setNewsLoading] = useState(true);
  const [error, setError] = useState("");

  const [showNewsForm, setShowNewsForm] = useState(false);
  const [editingNews, setEditingNews] = useState<NewsEvent | null>(null);
  const [savingNews, setSavingNews] = useState(false);

  const [newsForm, setNewsForm] = useState(emptyNewsForm);

  const [newsFilter, setNewsFilter] = useState<
    "all" | "news" | "event"
  >("all");

  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  /* =====================================================
     ADMIN AUTH
  ===================================================== */

  async function checkAdmin() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/login");
      return false;
    }

    const { data: roleData, error: roleError } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .single();

    if (roleError || roleData?.role !== "admin") {
      await supabase.auth.signOut();
      router.push("/login");
      return false;
    }

    return true;
  }

  /* =====================================================
     LOAD ALUMNI
  ===================================================== */

  async function loadAlumniWithoutAuthCheck() {
    setLoading(true);
    setError("");

    const { data, error: alumniError } = await supabase
      .from("Alumni-profiles")
      .select(`
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
      `)
      .order("created_at", { ascending: false });

    if (alumniError) {
      setError(alumniError.message);
      setLoading(false);
      return;
    }

    setAlumni(data || []);
    setLoading(false);
  }

  /* =====================================================
     LOAD NEWS & EVENTS
  ===================================================== */

  async function loadNewsEvents() {
    setNewsLoading(true);

    const { data, error } = await supabase
      .from("news_events")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
      setNewsLoading(false);
      return;
    }

    setNewsEvents(data || []);
    setNewsLoading(false);
  }

  useEffect(() => {
    async function initialize() {
      const allowed = await checkAdmin();

      if (!allowed) {
        setLoading(false);
        setNewsLoading(false);
        return;
      }

      await Promise.all([
        loadAlumniWithoutAuthCheck(),
        loadNewsEvents(),
      ]);
    }

    initialize();
  }, []);

  /* =====================================================
     ALUMNI ACTIONS
  ===================================================== */

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
        person.id === id
          ? { ...person, status }
          : person
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

  /* =====================================================
     NEWS FORM
  ===================================================== */

  function openAddNews() {
    setEditingNews(null);
    setNewsForm(emptyNewsForm);
    setSelectedImage(null);
    setShowNewsForm(true);
  }

  function openEditNews(item: NewsEvent) {
    setEditingNews(item);

    setNewsForm({
      title: item.title || "",
      type: item.type,
      description: item.description || "",
      cover_image: item.cover_image || "",
      event_date: item.event_date
        ? item.event_date.slice(0, 16)
        : "",
      venue: item.venue || "",
      status: item.status,
    });

    setSelectedImage(null);
    setShowNewsForm(true);
  }

  function updateNewsField(
    field: keyof typeof newsForm,
    value: string
  ) {
    setNewsForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  /* =====================================================
     IMAGE SELECT
  ===================================================== */

  function handleImageChange(
    e: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = e.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please select an image file.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("Image size must be less than 5 MB.");
      return;
    }

    setSelectedImage(file);
  }

  /* =====================================================
     UPLOAD IMAGE TO SUPABASE STORAGE
  ===================================================== */

  async function uploadNewsImage(): Promise<string | null> {
    if (!selectedImage) {
      return newsForm.cover_image || null;
    }

    setUploadingImage(true);

    try {
      const fileExt =
        selectedImage.name.split(".").pop()?.toLowerCase() || "jpg";

      const fileName = `${Date.now()}-${Math.random()
        .toString(36)
        .substring(2, 10)}.${fileExt}`;

      const filePath = `news/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("news-events")
        .upload(filePath, selectedImage, {
          cacheControl: "3600",
          upsert: false,
          contentType: selectedImage.type,
        });

      if (uploadError) {
        console.error(uploadError);
        alert(`Image upload failed: ${uploadError.message}`);
        return null;
      }

      const { data } = supabase.storage
        .from("news-events")
        .getPublicUrl(filePath);

      return data.publicUrl;
    } catch (error) {
      console.error(error);
      alert("Something went wrong while uploading the image.");
      return null;
    } finally {
      setUploadingImage(false);
    }
  }

  /* =====================================================
     SAVE NEWS / EVENT
  ===================================================== */

  async function saveNewsEvent() {
    if (!newsForm.title.trim()) {
      alert("Please enter a title.");
      return;
    }

    if (
      newsForm.type === "event" &&
      !newsForm.event_date
    ) {
      alert("Please select an event date.");
      return;
    }

    setSavingNews(true);

    /* Upload image first */
    const imageUrl = await uploadNewsImage();

    if (selectedImage && !imageUrl) {
      setSavingNews(false);
      return;
    }

    const payload = {
      title: newsForm.title.trim(),
      type: newsForm.type,
      description:
        newsForm.description.trim() || null,
      cover_image: imageUrl,
      event_date:
        newsForm.type === "event"
          ? newsForm.event_date || null
          : null,
      venue:
        newsForm.type === "event"
          ? newsForm.venue.trim() || null
          : null,
      status: newsForm.status,
      updated_at: new Date().toISOString(),
    };

    /* UPDATE */

    if (editingNews) {
      const { data, error } = await supabase
        .from("news_events")
        .update(payload)
        .eq("id", editingNews.id)
        .select("*")
        .single();

      if (error) {
        alert(`Update failed: ${error.message}`);
        setSavingNews(false);
        return;
      }

      setNewsEvents((current) =>
        current.map((item) =>
          item.id === editingNews.id
            ? data
            : item
        )
      );

      alert("News/Event updated successfully.");
    }

    /* CREATE */

    else {
      const { data, error } = await supabase
        .from("news_events")
        .insert(payload)
        .select("*")
        .single();

      if (error) {
        alert(`Creation failed: ${error.message}`);
        setSavingNews(false);
        return;
      }

      setNewsEvents((current) => [
        data,
        ...current,
      ]);

      alert("News/Event created successfully.");
    }

    setShowNewsForm(false);
    setEditingNews(null);
    setNewsForm(emptyNewsForm);
    setSelectedImage(null);
    setSavingNews(false);
  }

  /* =====================================================
     DELETE NEWS / EVENT
  ===================================================== */

  async function deleteNewsEvent(id: string) {
    const confirmed = window.confirm(
      "Are you sure you want to permanently delete this item?"
    );

    if (!confirmed) return;

    const { error } = await supabase
      .from("news_events")
      .delete()
      .eq("id", id);

    if (error) {
      alert(`Delete failed: ${error.message}`);
      return;
    }

    setNewsEvents((current) =>
      current.filter((item) => item.id !== id)
    );
  }

  /* =====================================================
     PUBLISH / DRAFT
  ===================================================== */

  async function toggleNewsStatus(item: NewsEvent) {
    const newStatus =
      item.status === "published"
        ? "draft"
        : "published";

    const { data, error } = await supabase
      .from("news_events")
      .update({
        status: newStatus,
        updated_at: new Date().toISOString(),
      })
      .eq("id", item.id)
      .select("*")
      .single();

    if (error) {
      alert(error.message);
      return;
    }

    setNewsEvents((current) =>
      current.map((news) =>
        news.id === item.id
          ? data
          : news
      )
    );
  }

  /* =====================================================
     LOGOUT
  ===================================================== */

  async function logout() {
    await supabase.auth.signOut();
    router.push("/login");
  }

  /* =====================================================
     STATS
  ===================================================== */

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

  const publishedNews = newsEvents.filter(
    (item) => item.status === "published"
  ).length;

  const filteredNewsEvents =
    newsFilter === "all"
      ? newsEvents
      : newsEvents.filter(
          (item) => item.type === newsFilter
        );

  /* =====================================================
     LOADING
  ===================================================== */

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50">
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-center">
            <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-blue-900" />

            <p className="mt-4 text-sm font-medium text-slate-500">
              Loading admin dashboard...
            </p>
          </div>
        </div>
      </main>
    );
  }

  /* =====================================================
     UI
  ===================================================== */

  return (
    <main className="min-h-screen bg-slate-50">

      {/* HEADER */}

      <header className="border-b border-white/10 bg-[#081b3a] text-white">
        <div className="mx-auto max-w-7xl px-5 sm:px-6">
          <div className="flex min-h-[78px] items-center justify-between gap-4">

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

        {/* WELCOME */}

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
                Manage alumni registrations, publish news,
                create events, and keep the CoUCAA platform
                up to date.
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

        {/* ERROR */}

        {error && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <p className="font-bold">
              Something went wrong
            </p>

            <p className="mt-1">
              {error}
            </p>
          </div>
        )}

        {/* STATS */}

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">

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

          <StatCard
            title="Published"
            value={publishedNews}
            description="News & events"
            icon={<NewsIcon />}
            iconClass="bg-violet-50 text-violet-700"
          />

        </section>

        {/* NEWS & EVENTS */}

        <section className="mt-8 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_10px_40px_rgba(15,23,42,0.05)]">

          <div className="border-b border-slate-100 px-5 py-6 sm:px-7">

            <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">

              <div>

                <div className="flex items-center gap-2">

                  <h2 className="text-xl font-black tracking-tight text-[#081b3a]">
                    News & Events
                  </h2>

                  <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-600">
                    {newsEvents.length}
                  </span>

                </div>

                <p className="mt-1 text-sm text-slate-500">
                  Publish news and events that will appear
                  across the CoUCAA website.
                </p>

              </div>

              <button
                onClick={openAddNews}
                className="inline-flex w-fit items-center gap-2 rounded-xl bg-[#081b3a] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#0b2c5c]"
              >
                <PlusIcon />
                Add News / Event
              </button>

            </div>

            {/* FILTER */}

            <div className="mt-5 flex flex-wrap gap-2">

              {[
                ["all", "All"],
                ["news", "News"],
                ["event", "Events"],
              ].map(([value, label]) => (

                <button
                  key={value}
                  onClick={() =>
                    setNewsFilter(
                      value as "all" | "news" | "event"
                    )
                  }
                  className={`rounded-full px-4 py-2 text-xs font-bold transition ${
                    newsFilter === value
                      ? "bg-[#081b3a] text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {label}
                </button>

              ))}

            </div>

          </div>

          {/* FORM */}

          {showNewsForm && (
            <div className="border-b border-slate-200 bg-slate-50/70 px-5 py-7 sm:px-7">

              <div className="mx-auto max-w-4xl">

                <div className="mb-6 flex items-start justify-between gap-4">

                  <div>

                    <h3 className="text-lg font-black text-[#081b3a]">
                      {editingNews
                        ? "Edit News / Event"
                        : "Create News / Event"}
                    </h3>

                    <p className="mt-1 text-sm text-slate-500">
                      Add information below and choose whether
                      to publish it now or save it as draft.
                    </p>

                  </div>

                  <button
                    onClick={() => {
                      setShowNewsForm(false);
                      setEditingNews(null);
                      setSelectedImage(null);
                    }}
                    className="rounded-lg p-2 text-slate-400 hover:bg-white hover:text-slate-700"
                  >
                    <CloseIcon />
                  </button>

                </div>

                <div className="grid gap-5 md:grid-cols-2">

                  {/* TITLE */}

                  <div className="md:col-span-2">

                    <label className="mb-2 block text-sm font-bold text-slate-700">
                      Title
                    </label>

                    <input
                      value={newsForm.title}
                      onChange={(e) =>
                        updateNewsField(
                          "title",
                          e.target.value
                        )
                      }
                      placeholder="Enter news or event title"
                      className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                    />

                  </div>

                  {/* TYPE */}

                  <div>

                    <label className="mb-2 block text-sm font-bold text-slate-700">
                      Content Type
                    </label>

                    <select
                      value={newsForm.type}
                      onChange={(e) =>
                        updateNewsField(
                          "type",
                          e.target.value
                        )
                      }
                      className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                    >
                      <option value="news">
                        News
                      </option>

                      <option value="event">
                        Event
                      </option>
                    </select>

                  </div>

                  {/* STATUS */}

                  <div>

                    <label className="mb-2 block text-sm font-bold text-slate-700">
                      Publication Status
                    </label>

                    <select
                      value={newsForm.status}
                      onChange={(e) =>
                        updateNewsField(
                          "status",
                          e.target.value
                        )
                      }
                      className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                    >
                      <option value="draft">
                        Draft
                      </option>

                      <option value="published">
                        Published
                      </option>
                    </select>

                  </div>

                  {/* DESCRIPTION */}

                  <div className="md:col-span-2">

                    <label className="mb-2 block text-sm font-bold text-slate-700">
                      Description
                    </label>

                    <textarea
                      rows={6}
                      value={newsForm.description}
                      onChange={(e) =>
                        updateNewsField(
                          "description",
                          e.target.value
                        )
                      }
                      placeholder="Write the news or event details..."
                      className="w-full resize-y rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                    />

                  </div>

                  {/* IMAGE UPLOAD */}

                  <div className="md:col-span-2">

                    <label className="mb-2 block text-sm font-bold text-slate-700">
                      Cover Image
                    </label>

                    <div className="rounded-2xl border-2 border-dashed border-slate-300 bg-white p-5">

                      <input
                        id="news-cover-image"
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="block w-full text-sm text-slate-600 file:mr-4 file:rounded-lg file:border-0 file:bg-[#081b3a] file:px-4 file:py-2.5 file:text-sm file:font-bold file:text-white hover:file:bg-[#0b2c5c]"
                      />

                      <p className="mt-2 text-xs text-slate-400">
                        JPG, PNG, WEBP or other image. Maximum 5 MB.
                      </p>

                      {selectedImage && (
                        <div className="mt-4 flex items-center gap-3 rounded-xl bg-blue-50 p-3">

                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-700">
                            <NewsIcon />
                          </div>

                          <div className="min-w-0">
                            <p className="truncate text-sm font-bold text-slate-700">
                              {selectedImage.name}
                            </p>

                            <p className="text-xs text-slate-500">
                              {(selectedImage.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                          </div>

                          <button
                            type="button"
                            onClick={() => setSelectedImage(null)}
                            className="ml-auto rounded-lg p-2 text-slate-400 hover:bg-white hover:text-red-600"
                          >
                            <CloseIcon />
                          </button>

                        </div>
                      )}

                      {!selectedImage && newsForm.cover_image && (
                        <div className="mt-4">

                          <p className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-400">
                            Current Image
                          </p>

                          <img
                            src={newsForm.cover_image}
                            alt="Current cover"
                            className="h-32 w-52 rounded-xl object-cover"
                          />

                        </div>
                      )}

                    </div>

                  </div>

                  {/* EVENT FIELDS */}

                  {newsForm.type === "event" && (
                    <>
                      <div>

                        <label className="mb-2 block text-sm font-bold text-slate-700">
                          Event Date
                        </label>

                        <input
                          type="datetime-local"
                          value={newsForm.event_date}
                          onChange={(e) =>
                            updateNewsField(
                              "event_date",
                              e.target.value
                            )
                          }
                          className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                        />

                      </div>

                      <div>

                        <label className="mb-2 block text-sm font-bold text-slate-700">
                          Venue
                        </label>

                        <input
                          value={newsForm.venue}
                          onChange={(e) =>
                            updateNewsField(
                              "venue",
                              e.target.value
                            )
                          }
                          placeholder="Event venue"
                          className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                        />

                      </div>
                    </>
                  )}

                </div>

                {/* FORM BUTTONS */}

                <div className="mt-6 flex flex-wrap justify-end gap-3 border-t border-slate-200 pt-5">

                  <button
                    onClick={() => {
                      setShowNewsForm(false);
                      setEditingNews(null);
                      setSelectedImage(null);
                    }}
                    disabled={savingNews || uploadingImage}
                    className="rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                  >
                    Cancel
                  </button>

                  <button
                    onClick={saveNewsEvent}
                    disabled={savingNews || uploadingImage}
                    className="rounded-xl bg-[#081b3a] px-6 py-2.5 text-sm font-bold text-white hover:bg-[#0b2c5c] disabled:opacity-50"
                  >
                    {uploadingImage
                      ? "Uploading image..."
                      : savingNews
                      ? "Saving..."
                      : editingNews
                      ? "Save Changes"
                      : "Create"}
                  </button>

                </div>

              </div>

            </div>
          )}

          {/* NEWS LIST */}

          {newsLoading ? (
            <div className="px-6 py-16 text-center">

              <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-blue-900" />

              <p className="mt-3 text-sm text-slate-500">
                Loading news and events...
              </p>

            </div>
          ) : filteredNewsEvents.length === 0 ? (

            <div className="px-6 py-16 text-center">

              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                <NewsIcon />
              </div>

              <h3 className="mt-4 font-bold text-[#081b3a]">
                No news or events yet
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Create your first news article or event.
              </p>

            </div>

          ) : (

            <div className="divide-y divide-slate-100">

              {filteredNewsEvents.map((item) => (

                <div
                  key={item.id}
                  className="p-5 transition hover:bg-slate-50/60 sm:p-6"
                >

                  <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

                    <div className="flex min-w-0 gap-4">

                      {item.cover_image ? (
                        <img
                          src={item.cover_image}
                          alt={item.title}
                          className="h-20 w-28 shrink-0 rounded-xl object-cover"
                        />
                      ) : (
                        <div className="flex h-20 w-28 shrink-0 items-center justify-center rounded-xl bg-[#081b3a] text-white">
                          <NewsIcon />
                        </div>
                      )}

                      <div className="min-w-0">

                        <div className="flex flex-wrap items-center gap-2">

                          <span
                            className={`rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-wider ${
                              item.type === "event"
                                ? "bg-violet-50 text-violet-700"
                                : "bg-blue-50 text-blue-700"
                            }`}
                          >
                            {item.type}
                          </span>

                          <span
                            className={`rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-wider ${
                              item.status === "published"
                                ? "bg-emerald-50 text-emerald-700"
                                : "bg-amber-50 text-amber-700"
                            }`}
                          >
                            {item.status}
                          </span>

                        </div>

                        <h3 className="mt-2 truncate text-base font-black text-slate-900 sm:text-lg">
                          {item.title}
                        </h3>

                        {item.description && (
                          <p className="mt-1 line-clamp-2 max-w-2xl text-sm leading-6 text-slate-500">
                            {item.description}
                          </p>
                        )}

                        {item.type === "event" && (
                          <div className="mt-2 flex flex-wrap gap-4 text-xs font-medium text-slate-400">

                            {item.event_date && (
                              <span>
                                📅{" "}
                                {formatEventDate(
                                  item.event_date
                                )}
                              </span>
                            )}

                            {item.venue && (
                              <span>
                                📍 {item.venue}
                              </span>
                            )}

                          </div>
                        )}

                      </div>

                    </div>

                    <div className="flex shrink-0 flex-wrap gap-2">

                      <button
                        onClick={() =>
                          toggleNewsStatus(item)
                        }
                        className={`rounded-lg px-3 py-2 text-xs font-bold ${
                          item.status === "published"
                            ? "border border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100"
                            : "bg-emerald-600 text-white hover:bg-emerald-700"
                        }`}
                      >
                        {item.status === "published"
                          ? "Unpublish"
                          : "Publish"}
                      </button>

                      <button
                        onClick={() =>
                          openEditNews(item)
                        }
                        className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50"
                      >
                        Edit
                      </button>

                      <button
                        onClick={() =>
                          deleteNewsEvent(item.id)
                        }
                        className="rounded-lg border border-red-100 bg-red-50 p-2 text-red-600 hover:bg-red-100"
                        title="Delete"
                      >
                        <TrashIcon />
                      </button>

                    </div>

                  </div>

                </div>

              ))}

            </div>

          )}

        </section>

        {/* ALUMNI APPLICATIONS */}

        <section className="mt-8 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_10px_40px_rgba(15,23,42,0.05)]">

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
                onClick={loadAlumniWithoutAuthCheck}
                className="inline-flex w-fit items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
              >
                <RefreshIcon />
                Refresh
              </button>

            </div>

          </div>

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

              {/* DESKTOP */}

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

                        <td className="px-5 py-5">
                          <StatusBadge
                            status={person.status}
                          />
                        </td>

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

              {/* MOBILE */}

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

                      <StatusBadge
                        status={person.status}
                      />

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

                      <button
                        onClick={() =>
                          deleteAlumni(person.id)
                        }
                        className="rounded-lg border border-slate-200 bg-white p-2.5 text-slate-400 hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                        title="Delete"
                      >
                        <TrashIcon />
                      </button>

                    </div>

                  </div>

                ))}

              </div>

            </>

          )}

        </section>

        {/* FOOTER */}

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
    <div className="flex items-start justify-between rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">

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
        className="h-11 w-11 shrink-0 rounded-xl object-cover"
      />
    );
  }

  return (
    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#081b3a] text-sm font-black text-white">
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
      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-emerald-700">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
        Approved
      </span>
    );
  }

  if (status === "rejected") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-red-700">
        <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
        Rejected
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-amber-700">
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

      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
        {label}
      </p>

      <p className="mt-1 truncate text-xs font-bold text-slate-700">
        {value}
      </p>

    </div>
  );
}

/* =====================================================
   DATE
===================================================== */

function formatEventDate(date: string) {
  return new Date(date).toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
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
      strokeWidth="2.5"
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
      width="15"
      height="15"
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

function RefreshIcon() {
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
      <path d="M20 11a8.1 8.1 0 0 0-15.5-2" />
      <path d="M4 5v4h4" />
      <path d="M4 13a8.1 8.1 0 0 0 15.5 2" />
      <path d="M20 19v-4h-4" />
    </svg>
  );
}

function LogoutIcon() {
  return (
    <svg
      width="17"
      height="17"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <path d="m16 17 5-5-5-5" />
      <path d="M21 12H9" />
    </svg>
  );
}

function NewsIcon() {
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
      <path d="M4 4h16v16H4z" />
      <path d="M8 8h8" />
      <path d="M8 12h8" />
      <path d="M8 16h5" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg
      width="17"
      height="17"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
    >
      <path d="M12 5v14" />
      <path d="M5 12h14" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    >
      <path d="M6 6l12 12" />
      <path d="M18 6 6 18" />
    </svg>
  );
}