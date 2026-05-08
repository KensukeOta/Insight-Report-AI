from io import BytesIO

import pandas as pd

from ..services.ai_report import generate_ai_report
from ..services.chart import (
    create_histogram_charts,
    create_scatter_chart,
    create_bar_chart,
    create_line_chart,
)


def analyze_csv(filename: str, content: bytes) -> dict:
    if not content:
        raise ValueError("CSVにデータが含まれていません。")

    try:
        df = pd.read_csv(BytesIO(content))
    except Exception as e:
        raise ValueError(
            "CSVの解析に失敗しました。文字コードや区切り文字を確認してください。"
        ) from e

    if df.empty:
        raise ValueError("CSVにデータが含まれていません。")

    columns = [
        {
            "name": column,
            "dtype": str(df[column].dtype),
            "missing_count": int(df[column].isna().sum()),
            "missing_rate": float(df[column].isna().mean()),
        }
        for column in df.columns
    ]

    numeric_df = df.select_dtypes(include="number")
    category_df = df.select_dtypes(include=["object", "category", "string"])

    correlations = []
    numeric_summary = []

    if len(numeric_df.columns) >= 2:
        corr_matrix = numeric_df.corr()

        for i, col1 in enumerate(corr_matrix.columns):
            for col2 in corr_matrix.columns[i + 1 :]:
                corr_value = corr_matrix.loc[col1, col2]

                correlations.append(
                    {
                        "column_x": col1,
                        "column_y": col2,
                        "correlation": _safe_float(corr_value),
                    }
                )

        correlations.sort(
            key=lambda x: abs(x["correlation"] or 0),
            reverse=True,
        )
    for column in numeric_df.columns:
        numeric_summary.append(
            {
                "column": column,
                "mean": _safe_float(numeric_df[column].mean()),
                "median": _safe_float(numeric_df[column].median()),
                "min": _safe_float(numeric_df[column].min()),
                "max": _safe_float(numeric_df[column].max()),
                "std": _safe_float(numeric_df[column].std()),
            }
        )

    category_summaries = []

    if not category_df.empty and not numeric_df.empty:
        for category_column in category_df.columns:
            unique_count = df[category_column].nunique(dropna=True)

            # 種類が多すぎるカテゴリはグラフにしない
            if unique_count < 2 or unique_count > 10:
                continue

            for numeric_column in numeric_df.columns:
                grouped = (
                    df.groupby(category_column, dropna=False)[numeric_column]
                    .sum()
                    .sort_values(ascending=False)
                    .head(10)
                )

                category_summaries.append(
                    {
                        "category_column": category_column,
                        "numeric_column": numeric_column,
                        "aggregation": "sum",
                        "items": [
                            {
                                "label": str(label),
                                "value": _safe_float(value),
                            }
                            for label, value in grouped.items()
                        ],
                    }
                )

    dataset = {
        "filename": filename,
        "row_count": int(len(df)),
        "column_count": int(len(df.columns)),
        "columns": columns,
        "preview": (df.head(5).fillna("").astype(str).to_dict(orient="records")),
    }

    charts = create_histogram_charts(df)

    for summary in category_summaries[:3]:
        labels = [item["label"] for item in summary["items"]]
        values = [item["value"] or 0 for item in summary["items"]]

        is_date_like = "date" in summary["category_column"].lower()

        if is_date_like:
            charts.append(
                create_line_chart(
                    labels=labels,
                    values=values,
                    title=(
                        f"{summary['category_column']} 別 "
                        f"{summary['numeric_column']} 推移"
                    ),
                    x_label=summary["category_column"],
                    y_label=summary["numeric_column"],
                    chart_id=(
                        f"line_{summary['category_column']}_{summary['numeric_column']}"
                    ),
                )
            )
        else:
            charts.append(
                create_bar_chart(
                    labels=labels,
                    values=values,
                    title=(
                        f"{summary['category_column']} 別 "
                        f"{summary['numeric_column']} 合計"
                    ),
                    x_label=summary["category_column"],
                    y_label=summary["numeric_column"],
                    chart_id=(
                        f"bar_{summary['category_column']}_"
                        f"{summary['numeric_column']}_sum"
                    ),
                )
            )

    if correlations:
        strongest = correlations[0]

        charts.append(
            create_scatter_chart(
                df=df,
                x_column=strongest["column_x"],
                y_column=strongest["column_y"],
            )
        )

    statistics = {
        "numeric_summary": numeric_summary,
        "correlations": correlations,
        "category_summaries": category_summaries,
    }

    return {
        "dataset": dataset,
        "statistics": statistics,
        "charts": charts,
        "ai_report": generate_ai_report(dataset, statistics),
    }


def _safe_float(value) -> float | None:
    if pd.isna(value):
        return None

    return float(value)
