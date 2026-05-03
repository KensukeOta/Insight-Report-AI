import UploadForm from "@/components/UploadForm";

export default function UploadPage() {
  return (
    <main className="min-h-screen bg-slate-50 px-5 py-8 text-slate-950 sm:px-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8">
          <p className="text-sm font-semibold text-teal-700">Upload</p>
          <h1 className="mt-2 text-3xl font-bold tracking-normal">
            CSVをアップロード
          </h1>
          <p className="mt-3 max-w-2xl leading-7 text-slate-600">
            分析したいCSVファイルを選択してください。アップロード後、データ概要・統計情報・グラフ・AI要約を自動生成します。
          </p>
        </div>

        <UploadForm />
      </div>
    </main>
  );
}
