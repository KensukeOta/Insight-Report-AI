```
backend/
├── README.md
├── pyproject.toml
├── uv.lock
├── .env.example
├── .gitignore
├── app
│   ├── __init__.py
│   ├── main.py  FastAPIアプリ本体。CORSやルーター登録を書く場所。
│   ├── config.py 環境変数管理。OpenAI APIキーやCORS設定など。
│   ├── api
│   │   ├── __init__.py
│   │   └── v1
│   │       ├── __init__.py
│   │       ├── router.py  v1 APIをまとめるルーター。
│   │       └── endpoints
│   │           ├── __init__.py
│   │           ├── health.py  GET /api/v1/health
│   │           └── reports.py POST /api/v1/reports/analyze
│   ├── schemas
│   │   ├── __init__.py
│   │   └── report.py  レスポンス用のPydanticスキーマ。
│   ├── services
│   │   ├── __init__.py
│   │   ├── csv_loader.py  CSV読み込み・文字コード判定・CSV形式チェック。
│   │   ├── eda.py  行数・列数・欠損値・基本統計量・相関分析。
│   │   ├── chart.py  matplotlibでグラフ生成。MVPではbase64画像で返す。
│   │   └── ai_report.py  LLMに渡すプロンプト生成・AI要約生成。
│   └── core
│       ├── __init__.py
│       └── errors.py  共通エラー定義。CSV不正など。
└── tests
    ├── __init__.py
    ├── test_health.py
    └── test_reports.py
```