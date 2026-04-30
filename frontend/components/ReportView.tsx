"use client";

export type ReportData = {
  dataset: {
    row_count: number;
    column_count: number;
    columns: {
      name: string;
      dtype: string;
      missing_count: number;
    }[];
  };
  statistics: {
    numeric_summary: {
      column: string;
      mean: number;
    }[];
  };
  charts: {
    id: string;
    title: string;
    image_base64: string;
  }[];
  ai_report: {
    summary: string;
    insights: string[];
    recommendations: string[];
    cautions: string[];
  };
};

type Props = {
  data: ReportData;
};

export default function ReportView({ data }: Props) {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">データ概要</h2>

      <div>
        <p>行数: {data.dataset.row_count}</p>
        <p>列数: {data.dataset.column_count}</p>
      </div>

      <h2 className="text-xl font-bold">カラム情報</h2>
      <ul>
        {data.dataset.columns.map((col) => (
          <li key={col.name}>
            {col.name} ({col.dtype}) - 欠損: {col.missing_count}
          </li>
        ))}
      </ul>

      <h2 className="text-xl font-bold">統計情報</h2>
      <ul>
        {data.statistics.numeric_summary.map((col) => (
          <li key={col.column}>
            {col.column} 平均: {col.mean}
          </li>
        ))}
      </ul>

      <h2 className="text-xl font-bold">グラフ</h2>

      <div className="grid gap-6 md:grid-cols-2">
        {data.charts.map((chart) => (
          <div key={chart.id} className="rounded border p-4">
            <h3 className="mb-2 font-bold">{chart.title}</h3>

            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`data:image/png;base64,${chart.image_base64}`}
              alt={chart.title}
              className="w-full"
            />
          </div>
        ))}
      </div>

      <h2 className="text-xl font-bold">AI要約</h2>

      <div className="space-y-4 rounded border p-4">
        <div>
          <h3 className="font-bold">概要</h3>
          <p>{data.ai_report.summary}</p>
        </div>

        <div>
          <h3 className="font-bold">気づき</h3>
          <ul className="list-disc pl-5">
            {data.ai_report.insights.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="font-bold">改善提案</h3>
          <ul className="list-disc pl-5">
            {data.ai_report.recommendations.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="font-bold">注意点</h3>
          <ul className="list-disc pl-5">
            {data.ai_report.cautions.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
