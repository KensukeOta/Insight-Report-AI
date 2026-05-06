import base64
from io import BytesIO

import matplotlib

matplotlib.use("Agg")

import matplotlib.pyplot as plt
import pandas as pd


def create_histogram_charts(df: pd.DataFrame) -> list[dict]:
    charts = []

    numeric_df = df.select_dtypes(include="number")

    for column in numeric_df.columns:
        fig, ax = plt.subplots()

        ax.hist(numeric_df[column].dropna(), bins=10)
        ax.set_title(f"{column} distribution")
        ax.set_xlabel(column)
        ax.set_ylabel("Frequency")

        buffer = BytesIO()
        fig.savefig(buffer, format="png", bbox_inches="tight")
        plt.close(fig)

        image_base64 = base64.b64encode(buffer.getvalue()).decode("utf-8")

        charts.append(
            {
                "id": f"hist_{column}",
                "title": f"{column} の分布",
                "type": "histogram",
                "image_base64": image_base64,
            }
        )

    return charts


def create_scatter_chart(
    df: pd.DataFrame,
    x_column: str,
    y_column: str,
) -> dict:
    fig, ax = plt.subplots()

    ax.scatter(df[x_column], df[y_column])

    ax.set_title(f"{x_column} vs {y_column}")
    ax.set_xlabel(x_column)
    ax.set_ylabel(y_column)

    buffer = BytesIO()

    fig.savefig(buffer, format="png", bbox_inches="tight")

    plt.close(fig)

    image_base64 = base64.b64encode(buffer.getvalue()).decode("utf-8")

    return {
        "id": f"scatter_{x_column}_{y_column}",
        "title": f"{x_column} × {y_column}",
        "type": "scatter",
        "image_base64": image_base64,
    }
