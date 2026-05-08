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

    preview: Record<string, string>[];
  };
  statistics: {
    numeric_summary: {
      column: string;
      mean: number;
    }[];

    correlations: {
      column_x: string;
      column_y: string;
      correlation: number | null;
    }[];

    category_summaries: {
      category_column: string;
      numeric_column: string;
      aggregation: "sum";
      items: {
        label: string;
        value: number | null;
      }[];
    }[];
  };
  charts: {
    id: string;
    title: string;
    type: "histogram" | "scatter" | "bar" | "line";
    image_base64: string;
  }[];
  ai_report: {
    summary: string;
    highlights: string[];
    insights: string[];
    recommendations: string[];
    cautions: string[];
  };
};

type Props = {
  data: ReportData;
};

export default function ReportView({ data }: Props) {
  const aiSections: { title: string; items: string[] }[] = [
    { title: "気づき", items: data.ai_report.insights },
    { title: "改善提案", items: data.ai_report.recommendations },
    { title: "注意点", items: data.ai_report.cautions },
  ];

  const chartGroups = {
    histogram: data.charts.filter(
      (chart) => chart.type === "histogram"
    ),
    line: data.charts.filter(
      (chart) => chart.type === "line"
    ),
    scatter: data.charts.filter(
      (chart) => chart.type === "scatter"
    ),
    bar: data.charts.filter(
      (chart) => chart.type === "bar"
    ),
  };

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm font-semibold text-teal-700">Analysis report</p>
        <h1 className="mt-2 text-3xl font-bold tracking-normal">
          分析レポート
        </h1>
        <p className="mt-3 text-slate-600">
          CSVから抽出した概要、統計、可視化、AI要約をまとめて表示しています。
        </p>
      </div>

      <section className="grid gap-4 md:grid-cols-3">
        {[
          ["行数", data.dataset.row_count.toLocaleString()],
          ["列数", data.dataset.column_count.toLocaleString()],
          ["グラフ", data.charts.length.toLocaleString()],
        ].map(([label, value]) => (
          <div
            key={label}
            className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
          >
            <p className="text-sm font-medium text-slate-500">{label}</p>
            <p className="mt-2 text-3xl font-bold text-slate-950">{value}</p>
          </div>
        ))}
      </section>

      <section className="rounded-lg border border-teal-200 bg-teal-50 p-5 shadow-sm">
        <div className="flex items-center gap-2">
          <span className="text-xl">📌</span>
          <h2 className="text-xl font-bold text-teal-950">
            重要ポイント
          </h2>
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {data.ai_report.highlights.map((highlight) => (
            <div
              key={highlight}
              className="rounded-lg bg-white p-4 shadow-sm"
            >
              <p className="text-sm leading-6 text-slate-700">
                {highlight}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold">カラム情報</h2>
            <p className="mt-1 text-sm text-slate-500">
              型と欠損数を確認できます。
            </p>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500">
                <th className="py-3 pr-4 font-semibold">カラム名</th>
                <th className="py-3 pr-4 font-semibold">型</th>
                <th className="py-3 pr-4 font-semibold">欠損数</th>
              </tr>
            </thead>
            <tbody>
              {data.dataset.columns.map((col) => (
                <tr key={col.name} className="border-b border-slate-100">
                  <td className="py-3 pr-4 font-semibold text-slate-900">
                    {col.name}
                  </td>
                  <td className="py-3 pr-4 text-slate-600">{col.dtype}</td>
                  <td className="py-3 pr-4 text-slate-600">
                    {col.missing_count.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4">
          <h2 className="text-xl font-bold">CSVプレビュー</h2>
          <p className="mt-1 text-sm text-slate-500">
            先頭5行を表示しています。
          </p>
        </div>

        {data.dataset.preview.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500">
                  {Object.keys(data.dataset.preview[0]).map((key) => (
                    <th key={key} className="py-3 pr-4 font-semibold">
                      {key}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {data.dataset.preview.map((row, index) => (
                  <tr
                    key={index}
                    className="border-b border-slate-100"
                  >
                    {Object.values(row).map((value, valueIndex) => (
                      <td
                        key={valueIndex}
                        className="py-3 pr-4 text-slate-700"
                      >
                        {value}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-slate-500">
            プレビューできるデータがありません。
          </p>
        )}
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-xl font-bold">統計情報</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {data.statistics.numeric_summary.map((col) => (
            <div
              key={col.column}
              className="rounded-lg border border-slate-200 bg-slate-50 p-4"
            >
              <p className="text-sm font-semibold text-slate-900">
                {col.column}
              </p>
              <p className="mt-2 text-2xl font-bold text-teal-700">
                {col.mean.toLocaleString()}
              </p>
              <p className="mt-1 text-xs text-slate-500">平均値</p>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-xl font-bold">相関係数</h2>
        <p className="mt-1 text-sm text-slate-500">
          数値カラム同士の関係性を確認できます。1に近いほど正の相関、-1に近いほど負の相関が強いことを示します。
        </p>

        {data.statistics.correlations.length > 0 ? (
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {data.statistics.correlations.map((corr) => (
              <div
                key={`${corr.column_x}-${corr.column_y}`}
                className="rounded-lg border border-slate-200 bg-slate-50 p-4"
              >
                <p className="text-sm font-semibold text-slate-900">
                  {corr.column_x} × {corr.column_y}
                </p>
                <p className="mt-2 text-2xl font-bold text-teal-700">
                  {corr.correlation !== null
                    ? corr.correlation.toFixed(3)
                    : "N/A"}
                </p>
                <p className="mt-1 text-xs text-slate-500">相関係数</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-4 text-sm text-slate-500">
            相関係数を算出できる数値カラムの組み合わせがありません。
          </p>
        )}
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-xl font-bold">カテゴリ別集計</h2>
        <p className="mt-1 text-sm text-slate-500">
          カテゴリごとの数値合計を確認できます。
        </p>

        {data.statistics.category_summaries.length > 0 ? (
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {data.statistics.category_summaries.slice(0, 4).map((summary) => (
              <div
                key={`${summary.category_column}-${summary.numeric_column}`}
                className="rounded-lg border border-slate-200 bg-slate-50 p-4"
              >
                <p className="text-sm font-semibold text-slate-900">
                  {summary.category_column} 別 {summary.numeric_column} 合計
                </p>

                <ul className="mt-3 space-y-2 text-sm text-slate-700">
                  {summary.items.map((item) => (
                    <li
                      key={item.label}
                      className="flex items-center justify-between gap-4"
                    >
                      <span>{item.label}</span>
                      <span className="font-semibold text-teal-700">
                        {item.value !== null
                          ? item.value.toLocaleString()
                          : "N/A"}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-4 text-sm text-slate-500">
            カテゴリ別集計に適した列がありません。
          </p>
        )}
      </section>

      <section className="space-y-8">
        <div>
          <h2 className="text-2xl font-bold">グラフ分析</h2>
          <p className="mt-2 text-sm text-slate-500">
            分布・時系列・相関・カテゴリ別に可視化しています。
          </p>
        </div>

        {[
          {
            title: "📊 分布分析",
            description: "数値データの分布を確認できます。",
            charts: chartGroups.histogram,
          },
          {
            title: "📈 時系列分析",
            description: "時系列データの推移を確認できます。",
            charts: chartGroups.line,
          },
          {
            title: "🔗 相関分析",
            description: "数値データ同士の関係を確認できます。",
            charts: chartGroups.scatter,
          },
          {
            title: "🏷 カテゴリ分析",
            description: "カテゴリごとの集計結果を確認できます。",
            charts: chartGroups.bar,
          },
        ]
          .filter((group) => group.charts.length > 0)
          .map((group) => (
            <div
              key={group.title}
              className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="mb-4">
                <h3 className="text-xl font-bold">
                  {group.title}
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  {group.description}
                </p>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                {group.charts.map((chart) => (
                  <div
                    key={chart.id}
                    className="rounded-lg border border-slate-200 bg-slate-50 p-4"
                  >
                    <h4 className="mb-3 font-bold text-slate-950">
                      {chart.title}
                    </h4>

                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={`data:image/png;base64,${chart.image_base64}`}
                      alt={chart.title}
                      className="w-full rounded-lg border border-slate-100"
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
      </section>

      <section className="rounded-lg border border-amber-200 bg-amber-50 p-5 shadow-sm">
        <h2 className="text-xl font-bold text-amber-950">AI要約</h2>

        <div className="mt-4 rounded-lg bg-white p-4">
          <h3 className="font-bold text-slate-950">概要</h3>
          <p className="mt-2 leading-7 text-slate-700">
            {data.ai_report.summary}
          </p>
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-3">
          {aiSections.map((section) => (
            <div key={section.title} className="rounded-lg bg-white p-4">
              <h3 className="font-bold text-slate-950">{section.title}</h3>
              <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-700">
                {section.items.map((item) => (
                  <li key={item} className="border-l-2 border-teal-500 pl-3">
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
