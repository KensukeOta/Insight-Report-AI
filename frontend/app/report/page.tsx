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
    return <div className="p-8">データがありません</div>;
  }

  return (
    <div className="p-8">
      <ReportView data={data} />
    </div>
  );
}
