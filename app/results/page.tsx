"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function ResultsPage() {
  const [data, setData] = useState<string>("Loading...");

  useEffect(() => {
    // Get URL params
    const urlParams = new URLSearchParams(window.location.search);
    const archetype = urlParams.get('archetype') || 'none';
    const role = urlParams.get('role') || 'none';

    // Get sessionStorage
    const storedArchetype = sessionStorage.getItem("quizArchetype") || 'none';
    const storedRole = sessionStorage.getItem("quizRole") || 'none';

    setData(`URL: archetype=${archetype}, role=${role} | Session: archetype=${storedArchetype}, role=${storedRole}`);
  }, []);

  return (
    <div className="min-h-screen bg-[#4ADE80] flex flex-col items-center justify-center gap-6 p-8">
      <h1 className="text-3xl font-bold text-[#0D3D1F]">Results Page Test</h1>
      <div className="bg-white p-6 rounded-xl max-w-lg text-center">
        <p className="text-[#0D3D1F] break-all">{data}</p>
      </div>
      <Link href="/quiz" className="px-6 py-3 bg-[#0D3D1F] text-white rounded-full">
        Back to Quiz
      </Link>
    </div>
  );
}
