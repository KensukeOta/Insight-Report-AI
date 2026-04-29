"use client";

import { useEffect, useState } from "react";
import ReportView from "@/components/ReportView";

export default function ReportPage() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    const stored = sessionStorage.getItem("report");

    if (stored) {
      setData(JSON.parse(stored));
    }
  }, []);

  if (!data) {
    return <div className="p-8">データがありません</div>;
  }

  return (
    <div className="p-8">
      <ReportView data={data} />
    </div>
  );
}