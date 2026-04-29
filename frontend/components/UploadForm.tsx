"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function UploadForm() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleUpload = async () => {
    if (!file) return;

    setLoading(true);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch(
        "http://localhost:8000/api/v1/reports/analyze",
        {
          method: "POST",
          body: formData,
        }
      );

      if (!res.ok) {
        const err = await res.json();
        alert(err.detail);
        setLoading(false);
        return;
      }

      const data = await res.json();

      // sessionStorageに保存（MVP用）
      sessionStorage.setItem("report", JSON.stringify(data));

      router.push("/report");
    } catch (e) {
      alert("通信エラーが発生しました");
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <input
        type="file"
        accept=".csv"
        onChange={(e) => setFile(e.target.files?.[0] ?? null)}
      />

      <button
        onClick={handleUpload}
        disabled={!file || loading}
        className="bg-black text-white px-4 py-2 rounded"
      >
        {loading ? "アップロード中..." : "アップロード"}
      </button>
    </div>
  );
}