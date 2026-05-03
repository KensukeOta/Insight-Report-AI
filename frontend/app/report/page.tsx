"use client";

import { useState } from "react";
import ReportView, { type ReportData } from "@/components/ReportView";

function getInitialReportData(): ReportData | null {
  if (typeof window === "undefined") {
    return null;
  }

  const stored = sessionStorage.getItem("report");

  if (!stored) {
    return null;
  }

  try {
    return JSON.parse(stored) as ReportData;
  } catch {
    return null;
  }
}

export default function ReportPage() {
  const [data] = useState<ReportData | null>(() => getInitialReportData());

  if (!data) {
    return (
      <main className="min-h-screen bg-slate-50 px-5 py-8 text-slate-950 sm:px-8">
        <div className="mx-auto max-w-4xl rounded-lg border border-slate-200 bg-white p-8 text-center shadow-sm">
          <p className="text-lg font-bold">データがありません</p>
          <p className="mt-2 text-sm text-slate-600">
            CSVをアップロードしてからレポートを確認してください。
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 px-5 py-8 text-slate-950 sm:px-8">
      <div className="mx-auto max-w-6xl">
        <ReportView data={data} />
      </div>
    </main>
  );
}
