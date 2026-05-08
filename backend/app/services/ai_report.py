import json

from google import genai
from pydantic import BaseModel

from ..config import get_settings


class AIReport(BaseModel):
    summary: str
    highlights: list[str]
    insights: list[str]
    recommendations: list[str]
    cautions: list[str]


def generate_ai_report(dataset: dict, statistics: dict) -> dict:
    settings = get_settings()

    if not settings.gemini_api_key:
        return generate_rule_based_report(dataset, statistics)

    try:
        return generate_gemini_report(
            api_key=settings.gemini_api_key,
            model=settings.gemini_model,
            dataset=dataset,
            statistics=statistics,
        )
    except Exception as e:
        print("Gemini error:", e)
        return generate_rule_based_report(dataset, statistics)


def generate_gemini_report(
    api_key: str,
    model: str,
    dataset: dict,
    statistics: dict,
) -> dict:
    client = genai.Client(api_key=api_key)

    prompt = f"""
あなたは非エンジニア向けにデータ分析レポートを書くアシスタントです。
以下のCSV分析結果をもとに、日本語でわかりやすく要約してください。

必ず以下のJSON形式のみで返してください。
Markdownや説明文は不要です。

{{
  "summary": "全体の要約",
  "highlights": ["重要ポイント1", "重要ポイント2", "重要ポイント3"],
  "insights": ["重要な気づき1", "重要な気づき2"],
  "recommendations": ["改善提案1", "改善提案2"],
  "cautions": ["注意点1"]
}}

ルール:
- highlights は3件以内
- highlights は短く簡潔に書く
- insights は分析から得られる具体的な気づきを書く
- recommendations は改善アクションを書く
- cautions は分析上の注意点を書く
- 相関係数、カテゴリ別集計、時系列推移に特徴がある場合は優先的に含める
- 非エンジニアでも理解できる表現にする
- 同じ内容を繰り返さない

dataset:
{json.dumps(dataset, ensure_ascii=False)}

statistics:
{json.dumps(statistics, ensure_ascii=False)}
"""

    response = client.models.generate_content(
        model=model,
        contents=prompt,
    )

    text = response.text or ""
    cleaned = text.strip().removeprefix("```json").removesuffix("```").strip()

    parsed = json.loads(cleaned)
    report = AIReport.model_validate(parsed)

    return report.model_dump()


def generate_rule_based_report(dataset: dict, statistics: dict) -> dict:
    numeric_summary = statistics.get("numeric_summary", [])
    columns = dataset.get("columns", [])
    correlations = statistics.get("correlations", [])
    category_summaries = statistics.get("category_summaries", [])

    missing_columns = [col for col in columns if col.get("missing_count", 0) > 0]

    insights = []
    recommendations = []
    cautions = [
        "この結果は自動生成された分析であり、最終判断には元データの確認が必要です。"
    ]

    if numeric_summary:
        for item in numeric_summary[:3]:
            insights.append(
                f"{item['column']} の平均値は {item['mean']}、中央値は {item['median']} です。"
            )
    else:
        insights.append("数値カラムがないため、基本統計量は生成されませんでした。")

    if missing_columns:
        for col in missing_columns[:3]:
            insights.append(
                f"{col['name']} に {col['missing_count']} 件の欠損値があります。"
            )
        recommendations.append(
            "欠損値があるカラムについて、入力漏れや集計対象外データがないか確認してください。"
        )
    else:
        insights.append("欠損値は検出されませんでした。")

    if len(numeric_summary) >= 2:
        recommendations.append(
            "数値項目同士の関係を確認することで、売上や成果に影響する要因を把握しやすくなります。"
        )

    highlights = [
        f"{dataset.get('row_count')} 行・{dataset.get('column_count')} 列のデータを分析しました。"
    ]

    if correlations:
        top_corr = correlations[0]
        if top_corr.get("correlation") is not None:
            highlights.append(
                f"{top_corr['column_x']} と {top_corr['column_y']} の相関係数は "
                f"{top_corr['correlation']:.3f} です。"
            )

    if category_summaries:
        first_summary = category_summaries[0]
        if first_summary.get("items"):
            top_item = first_summary["items"][0]
            highlights.append(
                f"{first_summary['category_column']} 別では、"
                f"{top_item['label']} の {first_summary['numeric_column']} が最も大きいです。"
            )

    return {
        "summary": (
            f"{dataset.get('filename')} は、"
            f"{dataset.get('row_count')} 行・{dataset.get('column_count')} 列のデータです。"
        ),
        "highlights": highlights[:3],
        "insights": insights,
        "recommendations": recommendations,
        "cautions": cautions,
    }
