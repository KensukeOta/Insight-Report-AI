from io import BytesIO

import pandas as pd

from ..services.ai_report import generate_ai_report
from ..services.chart import create_histogram_charts, create_scatter_chart


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

    dataset = {
        "filename": filename,
        "row_count": int(len(df)),
        "column_count": int(len(df.columns)),
        "columns": columns,
    }

    charts = create_histogram_charts(df)

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
