"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function TestSupabase() {
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

      setMessage(`Connected! Found ${data.length} alumni record(s).`);
      console.log(data);
    }

    testConnection();
  }, []);

  return (
    <main className="min-h-screen flex items-center justify-center">
      <div className="rounded-2xl border p-10 shadow">
        <h1 className="text-2xl font-bold">Supabase Test</h1>
        <p className="mt-4">{message}</p>
      </div>
    </main>
  );
}