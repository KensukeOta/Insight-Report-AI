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
  const [dragActive, setDragActive] = useState(false);

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
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/reports/analyze`,
        {
          method: "POST",
          body: formData,
        },
      );

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

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = () => {
    setDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);

    const droppedFile = e.dataTransfer.files?.[0];
    if (!droppedFile) return;

    if (!droppedFile.name.endsWith(".csv")) {
      alert("CSVファイルをアップロードしてください");
      return;
    }

    setFile(droppedFile);
  };

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`flex min-h-72 flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 text-center transition
          ${
            dragActive
              ? "border-teal-500 bg-teal-50"
              : "border-slate-300 bg-slate-50"
          }
        `}
      >
        <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-lg bg-teal-100 text-lg font-bold text-teal-700">
          CSV
        </div>
        <p className="mb-2 text-lg font-bold text-slate-950">
          CSVファイルをドラッグ＆ドロップ
        </p>
        <p className="mb-5 text-sm text-slate-500">またはクリックして選択</p>

        <label className="cursor-pointer rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-800 transition hover:border-slate-400 hover:bg-slate-100">
          ファイルを選択
          <input
            type="file"
            accept=".csv"
            disabled={loading}
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            className="hidden"
          />
        </label>

        {file ? (
          <p className="mt-4 rounded-lg bg-white px-3 py-2 text-sm font-medium text-slate-700">
            選択中: {file.name}
          </p>
        ) : (
          <p className="mt-4 text-sm text-slate-500">
            ファイルはまだ選択されていません
          </p>
        )}
      </div>

      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-slate-500">
          対応形式: <code className="font-mono">.csv</code> /
          分析結果はこのブラウザの一時保存領域に保持します。
        </p>
        <button
          onClick={handleUpload}
          disabled={!file || loading}
          className="rounded-lg bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          {loading ? "分析中..." : "アップロードして分析"}
        </button>
      </div>

      {loading && (
        <div className="mt-5 rounded-lg border border-slate-200 bg-slate-50 p-4">
          <div className="mb-3 h-2 overflow-hidden rounded bg-slate-200">
            <div className="h-full w-2/3 animate-pulse rounded bg-teal-600" />
          </div>

          <p className="text-sm font-medium text-slate-700">
            {loadingMessages[messageIndex]}
          </p>
        </div>
      )}
    </div>
  );
}
