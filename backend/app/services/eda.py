from io import BytesIO

import pandas as pd

from ..services.ai_report import generate_ai_report
from ..services.chart import create_histogram_charts


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

    numeric_summary = []
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

    statistics = {
        "numeric_summary": numeric_summary,
        "correlations": [],
    }

    return {
        "dataset": dataset,
        "statistics": statistics,
        "charts": create_histogram_charts(df),
        "ai_report": generate_ai_report(dataset, statistics),
    }


def _safe_float(value) -> float | None:
    if pd.isna(value):
        return None

    return float(value)
