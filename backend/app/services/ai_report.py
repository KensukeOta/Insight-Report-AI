import json

from google import genai
from pydantic import BaseModel

from ..config import get_settings


class AIReport(BaseModel):
    summary: str
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
  "insights": ["重要な気づき1", "重要な気づき2"],
  "recommendations": ["改善提案1", "改善提案2"],
  "cautions": ["注意点1"]
}}

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

    return {
        "summary": (
            f"{dataset.get('filename')} は、"
            f"{dataset.get('row_count')} 行・{dataset.get('column_count')} 列のデータです。"
        ),
        "insights": insights,
        "recommendations": recommendations,
        "cautions": cautions,
    }
