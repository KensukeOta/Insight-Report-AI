from fastapi.testclient import TestClient

from ..app.main import app

client = TestClient(app)


def create_csv_bytes() -> bytes:
    return b"""date,product,sales,ad_cost
2024-01-01,A,1000,100
2024-01-02,B,2000,200
2024-01-03,C,3000,300
"""


# 正常なCSVをアップロードすると分析結果を返すことを確認
def test_analyze_report_returns_analysis_result():
    response = client.post(
        "/api/v1/reports/analyze",
        files={
            "file": (
                "sales.csv",
                create_csv_bytes(),
                "text/csv",
            )
        },
    )

    assert response.status_code == 200

    data = response.json()

    assert "dataset" in data
    assert "statistics" in data
    assert "charts" in data
    assert "ai_report" in data

    assert data["dataset"]["filename"] == "sales.csv"
    assert data["dataset"]["row_count"] == 3
    assert data["dataset"]["column_count"] == 4


# CSV以外のファイルをアップロードすると400エラーになることを確認
def test_analyze_report_returns_400_when_file_is_not_csv():
    response = client.post(
        "/api/v1/reports/analyze",
        files={
            "file": (
                "sample.txt",
                b"hello",
                "text/plain",
            )
        },
    )

    assert response.status_code == 400

    data = response.json()

    assert data["detail"] == "CSVファイルをアップロードしてください。"


# 空ファイルをアップロードすると400エラーになることを確認
def test_analyze_report_returns_400_when_csv_is_empty():
    response = client.post(
        "/api/v1/reports/analyze",
        files={
            "file": (
                "empty.csv",
                b"",
                "text/csv",
            )
        },
    )

    assert response.status_code == 400

    data = response.json()

    assert data["detail"] == "CSVにデータが含まれていません。"


# CSV解析に失敗した場合に400エラーになることを確認
def test_analyze_report_returns_400_when_csv_is_invalid():
    response = client.post(
        "/api/v1/reports/analyze",
        files={
            "file": (
                "invalid.csv",
                b"\x80\x81\x82\x83",
                "text/csv",
            )
        },
    )

    assert response.status_code == 400

    data = response.json()

    assert (
        data["detail"]
        == "CSVの解析に失敗しました。文字コードや区切り文字を確認してください。"
    )


# 数値カラムが存在する場合に統計情報を返すことを確認
def test_analyze_report_returns_numeric_summary():
    response = client.post(
        "/api/v1/reports/analyze",
        files={
            "file": (
                "sales.csv",
                create_csv_bytes(),
                "text/csv",
            )
        },
    )

    assert response.status_code == 200

    data = response.json()

    numeric_summary = data["statistics"]["numeric_summary"]

    assert len(numeric_summary) >= 2

    sales_summary = next(item for item in numeric_summary if item["column"] == "sales")

    assert sales_summary["mean"] == 2000.0
    assert sales_summary["min"] == 1000.0
    assert sales_summary["max"] == 3000.0


# 相関分析結果が返されることを確認
def test_analyze_report_returns_correlations():
    response = client.post(
        "/api/v1/reports/analyze",
        files={
            "file": (
                "sales.csv",
                create_csv_bytes(),
                "text/csv",
            )
        },
    )

    assert response.status_code == 200

    data = response.json()

    correlations = data["statistics"]["correlations"]

    assert len(correlations) > 0

    correlation = correlations[0]

    assert "column_x" in correlation
    assert "column_y" in correlation
    assert "correlation" in correlation


# プレビュー用データが返されることを確認
def test_analyze_report_returns_preview_rows():
    response = client.post(
        "/api/v1/reports/analyze",
        files={
            "file": (
                "sales.csv",
                create_csv_bytes(),
                "text/csv",
            )
        },
    )

    assert response.status_code == 200

    data = response.json()

    preview = data["dataset"]["preview"]

    assert len(preview) == 3

    assert preview[0]["product"] == "A"
    assert preview[1]["sales"] == "2000"


# グラフ情報が返されることを確認
def test_analyze_report_returns_charts():
    response = client.post(
        "/api/v1/reports/analyze",
        files={
            "file": (
                "sales.csv",
                create_csv_bytes(),
                "text/csv",
            )
        },
    )

    assert response.status_code == 200

    data = response.json()

    charts = data["charts"]

    assert len(charts) > 0

    chart = charts[0]

    assert "id" in chart
    assert "title" in chart
    assert "type" in chart
    assert "image_base64" in chart


# AI要約が返されることを確認
def test_analyze_report_returns_ai_report():
    response = client.post(
        "/api/v1/reports/analyze",
        files={
            "file": (
                "sales.csv",
                create_csv_bytes(),
                "text/csv",
            )
        },
    )

    assert response.status_code == 200

    data = response.json()

    ai_report = data["ai_report"]

    assert "summary" in ai_report
    assert "highlights" in ai_report
    assert "insights" in ai_report
    assert "recommendations" in ai_report
    assert "cautions" in ai_report
