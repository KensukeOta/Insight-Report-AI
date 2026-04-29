"use client";

type Props = {
  data: any;
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
        {data.dataset.columns.map((col: any) => (
          <li key={col.name}>
            {col.name} ({col.dtype}) - 欠損: {col.missing_count}
          </li>
        ))}
      </ul>

      <h2 className="text-xl font-bold">統計情報</h2>
      <ul>
        {data.statistics.numeric_summary.map((col: any) => (
          <li key={col.column}>
            {col.column} 平均: {col.mean}
          </li>
        ))}
      </ul>

      <h2 className="text-xl font-bold">AI要約</h2>
      <p>{data.ai_report.summary}</p>
    </div>
  );
}