import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <section className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-5 py-6 sm:px-8 lg:px-10">
        <header className="flex items-center justify-between border-b border-slate-200 pb-5">
          <Link href="/" className="text-base font-bold tracking-tight">
            Insight Report AI
          </Link>
          <Link
            href="/upload"
            className="rounded-lg bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            CSVを分析
          </Link>
        </header>

        <div className="grid flex-1 items-center gap-10 py-10 lg:grid-cols-[1fr_0.95fr]">
          <div className="max-w-2xl">
            <p className="mb-4 inline-flex rounded-lg border border-teal-200 bg-teal-50 px-3 py-1 text-sm font-semibold text-teal-800">
              CSVから、すぐに読める分析レポートへ
            </p>
            <h1 className="text-4xl font-bold leading-tight tracking-normal text-slate-950 sm:text-5xl">
              Insight Report AI
            </h1>
            <p className="mt-5 text-lg leading-8 text-slate-600">
              CSVをアップロードするだけで、データ概要、統計情報、グラフ、AI要約をまとめて確認できます。
              非エンジニアでも判断材料をすばやく得られる、実務向けの分析レポート生成アプリです。
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/upload"
                className="rounded-lg bg-slate-950 px-5 py-3 text-center text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                CSVをアップロード
              </Link>
              <a
                href="#features"
                className="rounded-lg border border-slate-300 bg-white px-5 py-3 text-center text-sm font-semibold text-slate-800 transition hover:border-slate-400 hover:bg-slate-100"
              >
                できることを見る
              </a>
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <div className="mb-4 flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <p className="text-sm font-semibold text-slate-950">
                  Sample report
                </p>
                <p className="text-xs text-slate-500">sales_data.csv</p>
              </div>
              <span className="rounded-lg bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                Ready
              </span>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {[
                ["行数", "1,248"],
                ["列数", "12"],
                ["欠損列", "3"],
              ].map(([label, value]) => (
                <div key={label} className="rounded-lg bg-slate-50 p-3">
                  <p className="text-xs text-slate-500">{label}</p>
                  <p className="mt-1 text-2xl font-bold text-slate-950">
                    {value}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-5 rounded-lg border border-slate-200 p-4">
              <div className="mb-4 flex items-end justify-between gap-2">
                <div>
                  <p className="text-sm font-bold text-slate-950">
                    月別売上の推移
                  </p>
                  <p className="text-xs text-slate-500">
                    数値列から自動でグラフを生成
                  </p>
                </div>
                <p className="text-sm font-semibold text-teal-700">+18.4%</p>
              </div>
              <div className="flex h-36 items-end gap-2">
                {[38, 54, 46, 70, 62, 88, 78, 96].map((height, index) => (
                  <div
                    key={index}
                    className="flex-1 rounded-t bg-teal-600"
                    style={{ height: `${height}%` }}
                  />
                ))}
              </div>
            </div>

            <div className="mt-5 rounded-lg bg-amber-50 p-4">
              <p className="text-sm font-bold text-amber-900">AI要約</p>
              <p className="mt-2 text-sm leading-6 text-amber-950">
                売上は後半に伸びています。欠損値がある列は、分析前に入力ルールの確認をおすすめします。
              </p>
            </div>
          </div>
        </div>

        <section
          id="features"
          className="grid gap-4 border-t border-slate-200 py-8 md:grid-cols-3"
        >
          {[
            ["アップロード", "CSVを選ぶだけで分析APIへ送信します。"],
            ["可視化", "集計結果とグラフをひとつの画面に整理します。"],
            ["AI要約", "気づき、改善提案、注意点を文章で確認できます。"],
          ].map(([title, body]) => (
            <div
              key={title}
              className="rounded-lg border border-slate-200 bg-white p-5"
            >
              <h2 className="font-bold text-slate-950">{title}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">{body}</p>
            </div>
          ))}
        </section>
      </section>
    </main>
  );
}
