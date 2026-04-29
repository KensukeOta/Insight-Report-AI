"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const loadingMessages = [
  "CSVファイルを読み込んでいます...",
  "データの概要を集計しています...",
  "グラフを生成しています...",
  "AIがレポートを作成しています...",
];

export default function UploadForm() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [messageIndex, setMessageIndex] = useState(0);
  const router = useRouter();

  const handleUpload = async () => {
    if (!file) return;

    setLoading(true);
    setMessageIndex(0);

    const intervalId = window.setInterval(() => {
      setMessageIndex((current) =>
        current < loadingMessages.length - 1 ? current + 1 : current,
      );
    }, 900);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("http://localhost:8000/api/v1/reports/analyze", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json();
        alert(err.detail ?? "アップロードに失敗しました。");
        return;
      }

      const data = await res.json();
      sessionStorage.setItem("report", JSON.stringify(data));

      router.push("/report");
    } catch {
      alert("通信エラーが発生しました。");
    } finally {
      window.clearInterval(intervalId);
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-dashed border-gray-300 p-8">
        <input
          type="file"
          accept=".csv"
          disabled={loading}
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        />

        {file && <p className="mt-3 text-sm text-gray-600">{file.name}</p>}
      </div>

      <button
        onClick={handleUpload}
        disabled={!file || loading}
        className="rounded bg-black px-4 py-2 text-white disabled:cursor-not-allowed disabled:bg-gray-400"
      >
        {loading ? "分析中..." : "アップロードして分析"}
      </button>

      {loading && (
        <div className="rounded border p-4">
          <div className="mb-3 h-2 overflow-hidden rounded bg-gray-200">
            <div className="h-full w-2/3 animate-pulse rounded bg-black" />
          </div>

          <p className="text-sm text-gray-700">
            {loadingMessages[messageIndex]}
          </p>
        </div>
      )}
    </div>
  );
}
