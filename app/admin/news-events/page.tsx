"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

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

const emptyForm = {
  title: "",
  type: "news" as "news" | "event",
  description: "",
  cover_image: "",
  event_date: "",
  venue: "",
  status: "draft" as "draft" | "published",
};

export default function AdminNewsEventsPage() {
  const router = useRouter();

  const [items, setItems] = useState<NewsEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);

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

  async function loadItems() {
    setLoading(true);
    setError("");

    const allowed = await checkAdmin();

    if (!allowed) return;

    const { data, error } = await supabase
      .from("news_events")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
      setError(error.message);
      setLoading(false);
      return;
    }

    setItems(data || []);
    setLoading(false);
  }

  useEffect(() => {
    loadItems();
  }, []);

  function updateField(
    field: keyof typeof emptyForm,
    value: string
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function openAddForm(type: "news" | "event") {
    setEditingId(null);

    setForm({
      ...emptyForm,
      type,
    });

    setShowForm(true);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  function openEditForm(item: NewsEvent) {
    setEditingId(item.id);

    setForm({
      title: item.title || "",
      type: item.type,
      description: item.description || "",
      cover_image: item.cover_image || "",
      event_date: item.event_date
        ? formatDateTimeLocal(item.event_date)
        : "",
      venue: item.venue || "",
      status: item.status,
    });

    setShowForm(true);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  function closeForm() {
    if (saving) return;

    setShowForm(false);
    setEditingId(null);
    setForm(emptyForm);
  }

  async function saveItem() {
    if (!form.title.trim()) {
      alert("Please enter a title.");
      return;
    }

    if (form.type === "event" && !form.event_date) {
      alert("Please select an event date.");
      return;
    }

    setSaving(true);

    const payload = {
      title: form.title.trim(),
      type: form.type,
      description: form.description.trim() || null,
      cover_image: form.cover_image.trim() || null,
      event_date:
        form.type === "event" && form.event_date
          ? new Date(form.event_date).toISOString()
          : null,
      venue:
        form.type === "event"
          ? form.venue.trim() || null
          : null,
      status: form.status,
      updated_at: new Date().toISOString(),
    };

    if (editingId) {
      const { data, error } = await supabase
        .from("news_events")
        .update(payload)
        .eq("id", editingId)
        .select("*")
        .single();

      if (error) {
        alert(`Update failed: ${error.message}`);
        setSaving(false);
        return;
      }

      setItems((current) =>
        current.map((item) =>
          item.id === editingId ? data : item
        )
      );

      alert("Updated successfully.");
    } else {
      const { data, error } = await supabase
        .from("news_events")
        .insert(payload)
        .select("*")
        .single();

      if (error) {
        alert(`Creation failed: ${error.message}`);
        setSaving(false);
        return;
      }

      setItems((current) => [data, ...current]);

      alert(
        form.status === "published"
          ? "Published successfully."
          : "Saved as draft."
      );
    }

    setSaving(false);
    closeForm();
  }

  async function toggleStatus(item: NewsEvent) {
    const newStatus =
      item.status === "published"
        ? "draft"
        : "published";

    const action =
      newStatus === "published"
        ? "publish"
        : "move this item to draft";

    const confirmed = window.confirm(
      `Are you sure you want to ${action}?`
    );

    if (!confirmed) return;

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
      alert(`Failed: ${error.message}`);
      return;
    }

    setItems((current) =>
      current.map((existing) =>
        existing.id === item.id ? data : existing
      )
    );
  }

  async function deleteItem(id: string) {
    const confirmed = window.confirm(
      "This will permanently delete this item. Continue?"
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

    setItems((current) =>
      current.filter((item) => item.id !== id)
    );

    alert("Deleted successfully.");
  }

  const total = items.length;

  const newsCount = items.filter(
    (item) => item.type === "news"
  ).length;

  const eventCount = items.filter(
    (item) => item.type === "event"
  ).length;

  const publishedCount = items.filter(
    (item) => item.status === "published"
  ).length;

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50">
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-center">
            <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-blue-900" />
            <p className="mt-4 text-sm font-medium text-slate-500">
              Loading News & Events...
            </p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50">

      {/* ================= HEADER ================= */}

      <header className="border-b border-white/10 bg-[#081b3a] text-white">
        <div className="mx-auto max-w-7xl px-5 sm:px-6">

          <div className="flex min-h-[78px] items-center justify-between gap-4">

            <div className="flex items-center gap-3">

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-sm font-black tracking-tight text-[#0b1f44] shadow-lg">
                CoU
              </div>

              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-blue-200">
                  CoUCAA
                </p>

                <p className="text-sm font-semibold text-white">
                  News & Events
                </p>
              </div>

            </div>

            <button
              onClick={() => router.push("/admin")}
              className="rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-sm font-semibold transition hover:bg-white/10"
            >
              ← Dashboard
            </button>

          </div>

        </div>
      </header>

      <div className="mx-auto max-w-7xl px-5 py-8 sm:px-6 lg:py-10">

        {/* ================= PAGE HEADER ================= */}

        <section className="mb-8">

          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">

            <div>

              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-[#0b4a8b]">
                <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                Content Management
              </div>

              <h1 className="text-3xl font-black tracking-tight text-[#081b3a] sm:text-4xl">
                News & Events
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
                Create, publish and manage announcements,
                news and upcoming events for the CoUCAA website.
              </p>

            </div>

            <div className="flex flex-wrap gap-3">

              <button
                onClick={() => openAddForm("news")}
                className="rounded-xl bg-[#081b3a] px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-[#0b2c5c]"
              >
                + Add News
              </button>

              <button
                onClick={() => openAddForm("event")}
                className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700"
              >
                + Add Event
              </button>

            </div>

          </div>

        </section>

        {/* ================= ERROR ================= */}

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

        {/* ================= STATS ================= */}

        <section className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

          <StatCard
            title="Total Content"
            value={total}
            description="News & events"
          />

          <StatCard
            title="News"
            value={newsCount}
            description="News articles"
          />

          <StatCard
            title="Events"
            value={eventCount}
            description="Events created"
          />

          <StatCard
            title="Published"
            value={publishedCount}
            description="Visible publicly"
          />

        </section>

        {/* ================= FORM ================= */}

        {showForm && (
          <section className="mb-8 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_10px_40px_rgba(15,23,42,0.05)]">

            <div className="border-b border-slate-100 bg-slate-50/70 px-6 py-5 sm:px-7">

              <div className="flex items-center justify-between gap-4">

                <div>
                  <h2 className="text-xl font-black text-[#081b3a]">
                    {editingId
                      ? "Edit Content"
                      : form.type === "news"
                        ? "Create News"
                        : "Create Event"}
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Add the information below and choose whether
                    to save it as draft or publish it.
                  </p>
                </div>

                <button
                  onClick={closeForm}
                  disabled={saving}
                  className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-bold text-slate-500 transition hover:bg-white hover:text-slate-800"
                >
                  ✕
                </button>

              </div>

            </div>

            <div className="p-6 sm:p-7">

              <div className="grid gap-6 md:grid-cols-2">

                {/* Title */}

                <div className="md:col-span-2">

                  <label className="mb-2 block text-sm font-bold text-slate-700">
                    Title
                    <span className="ml-1 text-red-500">*</span>
                  </label>

                  <input
                    type="text"
                    value={form.title}
                    onChange={(e) =>
                      updateField(
                        "title",
                        e.target.value
                      )
                    }
                    placeholder="Enter title..."
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                  />

                </div>

                {/* Type */}

                <div>

                  <label className="mb-2 block text-sm font-bold text-slate-700">
                    Content Type
                  </label>

                  <select
                    value={form.type}
                    onChange={(e) =>
                      updateField(
                        "type",
                        e.target.value
                      )
                    }
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                  >
                    <option value="news">
                      News
                    </option>

                    <option value="event">
                      Event
                    </option>
                  </select>

                </div>

                {/* Status */}

                <div>

                  <label className="mb-2 block text-sm font-bold text-slate-700">
                    Status
                  </label>

                  <select
                    value={form.status}
                    onChange={(e) =>
                      updateField(
                        "status",
                        e.target.value
                      )
                    }
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                  >
                    <option value="draft">
                      Draft
                    </option>

                    <option value="published">
                      Published
                    </option>
                  </select>

                </div>

                {/* Cover Image */}

                <div className="md:col-span-2">

                  <label className="mb-2 block text-sm font-bold text-slate-700">
                    Cover Image URL
                  </label>

                  <input
                    type="url"
                    value={form.cover_image}
                    onChange={(e) =>
                      updateField(
                        "cover_image",
                        e.target.value
                      )
                    }
                    placeholder="https://..."
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                  />

                  {form.cover_image && (
                    <div className="mt-4 overflow-hidden rounded-xl border border-slate-200 bg-slate-50">

                      <img
                        src={form.cover_image}
                        alt="Cover preview"
                        className="h-48 w-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display =
                            "none";
                        }}
                      />

                    </div>
                  )}

                </div>

                {/* Event Date */}

                {form.type === "event" && (
                  <>
                    <div>

                      <label className="mb-2 block text-sm font-bold text-slate-700">
                        Event Date & Time
                        <span className="ml-1 text-red-500">
                          *
                        </span>
                      </label>

                      <input
                        type="datetime-local"
                        value={form.event_date}
                        onChange={(e) =>
                          updateField(
                            "event_date",
                            e.target.value
                          )
                        }
                        className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                      />

                    </div>

                    <div>

                      <label className="mb-2 block text-sm font-bold text-slate-700">
                        Venue
                      </label>

                      <input
                        type="text"
                        value={form.venue}
                        onChange={(e) =>
                          updateField(
                            "venue",
                            e.target.value
                          )
                        }
                        placeholder="Event venue..."
                        className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                      />

                    </div>
                  </>
                )}

                {/* Description */}

                <div className="md:col-span-2">

                  <label className="mb-2 block text-sm font-bold text-slate-700">
                    Description
                  </label>

                  <textarea
                    rows={8}
                    value={form.description}
                    onChange={(e) =>
                      updateField(
                        "description",
                        e.target.value
                      )
                    }
                    placeholder={
                      form.type === "news"
                        ? "Write the news details..."
                        : "Write the event details..."
                    }
                    className="w-full resize-y rounded-xl border border-slate-300 px-4 py-3 text-sm leading-6 text-slate-900 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                  />

                </div>

              </div>

              {/* Actions */}

              <div className="mt-8 flex flex-wrap justify-end gap-3 border-t border-slate-100 pt-6">

                <button
                  onClick={closeForm}
                  disabled={saving}
                  className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
                >
                  Cancel
                </button>

                <button
                  onClick={saveItem}
                  disabled={saving}
                  className="rounded-xl bg-[#081b3a] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#0b2c5c] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {saving
                    ? "Saving..."
                    : editingId
                      ? "Save Changes"
                      : form.status === "published"
                        ? "Publish"
                        : "Save Draft"}
                </button>

              </div>

            </div>

          </section>
        )}

        {/* ================= CONTENT LIST ================= */}

        <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_10px_40px_rgba(15,23,42,0.05)]">

          <div className="border-b border-slate-100 px-5 py-6 sm:px-7">

            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">

              <div>

                <div className="flex items-center gap-2">

                  <h2 className="text-xl font-black tracking-tight text-[#081b3a]">
                    All Content
                  </h2>

                  <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-600">
                    {items.length}
                  </span>

                </div>

                <p className="mt-1 text-sm text-slate-500">
                  Manage all news and events.
                </p>

              </div>

              <button
                onClick={loadItems}
                className="w-fit rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                ↻ Refresh
              </button>

            </div>

          </div>

          {items.length === 0 ? (

            <div className="px-6 py-20 text-center">

              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-2xl">
                📰
              </div>

              <h3 className="mt-5 text-lg font-bold text-[#081b3a]">
                No news or events yet
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                Create your first news article or event
                using the buttons above.
              </p>

            </div>

          ) : (

            <div className="divide-y divide-slate-100">

              {items.map((item) => (

                <article
                  key={item.id}
                  className="p-5 transition hover:bg-slate-50/60 sm:p-6"
                >

                  <div className="flex flex-col gap-5 lg:flex-row lg:items-center">

                    {/* Image */}

                    <div className="h-32 w-full shrink-0 overflow-hidden rounded-2xl bg-slate-100 lg:w-52">

                      {item.cover_image ? (
                        <img
                          src={item.cover_image}
                          alt={item.title}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-3xl">
                          {item.type === "news"
                            ? "📰"
                            : "📅"}
                        </div>
                      )}

                    </div>

                    {/* Content */}

                    <div className="min-w-0 flex-1">

                      <div className="flex flex-wrap items-center gap-2">

                        <span
                          className={`rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-wider ${
                            item.type === "news"
                              ? "bg-blue-50 text-blue-700"
                              : "bg-purple-50 text-purple-700"
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

                      <h3 className="mt-3 text-lg font-black text-slate-900 sm:text-xl">
                        {item.title}
                      </h3>

                      {item.description && (
                        <p className="mt-2 line-clamp-2 max-w-3xl text-sm leading-6 text-slate-500">
                          {item.description}
                        </p>
                      )}

                      <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-xs font-medium text-slate-400">

                        {item.type === "event" &&
                          item.event_date && (
                            <span>
                              📅{" "}
                              {formatDateTime(
                                item.event_date
                              )}
                            </span>
                          )}

                        {item.type === "event" &&
                          item.venue && (
                            <span>
                              📍 {item.venue}
                            </span>
                          )}

                        <span>
                          Created{" "}
                          {formatDate(
                            item.created_at
                          )}
                        </span>

                      </div>

                    </div>

                    {/* Actions */}

                    <div className="flex flex-wrap gap-2 lg:w-[260px] lg:justify-end">

                      <button
                        onClick={() =>
                          openEditForm(item)
                        }
                        className="rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-bold text-slate-700 transition hover:bg-slate-50"
                      >
                        Edit
                      </button>

                      <button
                        onClick={() =>
                          toggleStatus(item)
                        }
                        className={`rounded-lg px-3.5 py-2.5 text-xs font-bold ${
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
                          deleteItem(item.id)
                        }
                        className="rounded-lg border border-red-100 bg-red-50 px-3.5 py-2.5 text-xs font-bold text-red-600 transition hover:bg-red-100"
                      >
                        Delete
                      </button>

                    </div>

                  </div>

                </article>

              ))}

            </div>

          )}

        </section>

        {/* ================= FOOTER ================= */}

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
}: {
  title: string;
  value: number;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

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
  );
}

/* =====================================================
   DATE HELPERS
===================================================== */

function formatDate(date: string) {
  return new Date(date).toLocaleDateString(
    "en-US",
    {
      year: "numeric",
      month: "short",
      day: "numeric",
    }
  );
}

function formatDateTime(date: string) {
  return new Date(date).toLocaleString(
    "en-US",
    {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }
  );
}

function formatDateTimeLocal(date: string) {
  const d = new Date(date);

  const year = d.getFullYear();
  const month = String(
    d.getMonth() + 1
  ).padStart(2, "0");
  const day = String(
    d.getDate()
  ).padStart(2, "0");

  const hours = String(
    d.getHours()
  ).padStart(2, "0");
  const minutes = String(
    d.getMinutes()
  ).padStart(2, "0");

  return `${year}-${month}-${day}T${hours}:${minutes}`;
}