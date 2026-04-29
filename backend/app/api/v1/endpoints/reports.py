from fastapi import APIRouter, File, HTTPException, UploadFile

from ....services.eda import analyze_csv

router = APIRouter()


@router.post("/analyze")
async def analyze_report(file: UploadFile = File(...)):
    if not file.filename:
        raise HTTPException(status_code=400, detail="ファイル名が不正です。")

    if not file.filename.endswith(".csv"):
        raise HTTPException(
            status_code=400,
            detail="CSVファイルをアップロードしてください。",
        )

    try:
        content = await file.read()
        return analyze_csv(filename=file.filename, content=content)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e)) from e
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail="CSVの解析に失敗しました。",
        ) from e
