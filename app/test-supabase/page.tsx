"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function Page() {
  const [message, setMessage] = useState("Testing Supabase...");

  useEffect(() => {
    async function testConnection() {
      const { data, error } = await supabase
        .from("Alumni-profiles")
        .select("*")
        .limit(5);

      if (error) {
        setMessage("Error: " + error.message);
        return;
      }

      setMessage(`Connected! Found ${data?.length ?? 0} alumni record(s).`);
    }

    testConnection();
  }, []);

  return (
    <main className="flex min-h-screen items-center justify-center">
      <div className="rounded-2xl border bg-white p-10 shadow-lg">
        <h1 className="text-2xl font-bold text-blue-900">
          Supabase Connection Test
        </h1>

        <p className="mt-4 text-slate-600">
          {message}
        </p>
      </div>
    </main>
  );
}