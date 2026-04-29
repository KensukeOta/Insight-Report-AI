import UploadForm from "@/components/UploadForm";

export default function UploadPage() {
  return (
    <div className="p-8">
      <h1 className="text-xl font-bold mb-4">
        CSVをアップロード
      </h1>

      <UploadForm />
    </div>
  );
}