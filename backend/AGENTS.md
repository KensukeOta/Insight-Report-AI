# AGENTS.md - backend

このディレクトリは Insight Report AI のバックエンドです。

FastAPIでCSV分析APIを提供し、pandasによるEDA、matplotlibによるグラフ生成、Gemini APIまたはルールベースによる要約生成を行います。

---

## 技術スタック

- Python
- FastAPI
- pandas
- matplotlib
- google-genai
- pydantic-settings
- uv
- FastAPI Cloud

---

## 基本方針

- uvを使って依存関係を管理する
- APIレスポンスはフロントエンドの `ReportData` 型と整合させる
- 外部APIエラーでサービス全体を止めない
- Gemini APIに失敗した場合はルールベース要約にフォールバックする
- CSV解析失敗時はわかりやすいエラーメッセージを返す
- 秘密情報は環境変数で扱う

---

## 主な責務

```txt
app/main.py
```

FastAPIアプリ本体。CORS、ルーター登録を行う。

```txt
app/config.py
```

環境変数を管理する。

```txt
app/api/v1/endpoints/reports.py
```

CSVアップロードAPIを定義する。

```txt
app/services/eda.py
```

CSVの読み込み、データ概要、欠損値、基本統計量を生成する。

```txt
app/services/chart.py
```

matplotlibでグラフを生成し、base64画像として返す。

```txt
app/services/ai_report.py
```

Gemini APIによるAI要約、またはルールベース要約を生成する。

---

## 環境変数

```env
GEMINI_API_KEY=
GEMINI_MODEL=gemini-2.5-flash-lite
FRONTEND_ORIGIN=http://localhost:3000
```

本番環境ではFastAPI Cloud側に設定する。

---

## API方針

MVPでは以下を中心にする。

```txt
GET  /api/v1/health
POST /api/v1/reports/analyze
```

`POST /api/v1/reports/analyze` は以下を返す。

- dataset
- statistics
- charts
- ai_report

この構造を変更する場合、frontend側の `ReportData` 型も必ず更新する。

---

## エラーハンドリング方針

- CSV以外のファイルは400
- 空CSVは400
- CSV解析失敗は400
- 予期しないサーバーエラーは500
- Gemini API失敗時は500にせず、ルールベース要約にフォールバックする

---

## コーディングルール

- できるだけ関数単位で責務を分ける
- FastAPIのエンドポイント内に分析ロジックを直接書きすぎない
- pandas処理は `services/eda.py` に寄せる
- グラフ生成は `services/chart.py` に寄せる
- AI要約は `services/ai_report.py` に寄せる
- 型ヒントをできるだけ付ける
- APIレスポンスに `NaN` や `inf` を含めない

---

## 実行コマンド

```bash
uv sync
uv run fastapi dev app/main.py
```

---

## チェックコマンド

```bash
uv run ruff check .
uv run pytest
```

プロジェクトに未導入の場合は、`pyproject.toml` を確認して既存のコマンドに従う。

---

## デプロイ

FastAPI Cloudへデプロイする。

GitHub Actionsでは以下の環境変数を使う。

```env
FASTAPI_CLOUD_TOKEN=
FASTAPI_CLOUD_APP_ID=
```

---

## 注意事項

- `.env` をコミットしない
- Gemini APIキーをコードに書かない
- CORS設定を変更する場合はfrontendの本番URLを確認する
- APIレスポンス構造の変更はfrontendとセットで行う
- 就活ポートフォリオなので、安定性・説明しやすさを重視する
