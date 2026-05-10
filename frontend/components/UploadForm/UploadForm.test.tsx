// UploadForm.test.tsx
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { UploadForm } from "./UploadForm";

const pushMock = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: pushMock,
  }),
}));

describe("UploadForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    vi.stubGlobal("fetch", vi.fn());
    vi.stubGlobal("alert", vi.fn());

    sessionStorage.clear();
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  // 初期表示で未選択メッセージとボタンが表示されることを確認する
  it("should render initial upload form", () => {
    render(<UploadForm />);

    expect(
      screen.getByText("CSVファイルをドラッグ＆ドロップ"),
    ).toBeInTheDocument();

    expect(
      screen.getByText("ファイルはまだ選択されていません"),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("button", { name: "アップロードして分析" }),
    ).toBeDisabled();
  });

  // CSVファイルを選択するとファイル名が表示され、送信ボタンが有効になることを確認する
  it("should show selected file name and enable upload button", async () => {
    const user = userEvent.setup();
    render(<UploadForm />);

    const file = new File(["name,score\nAlice,90"], "sample.csv", {
      type: "text/csv",
    });

    const input = screen.getByLabelText("ファイルを選択");

    await user.upload(input, file);

    expect(screen.getByText("選択中: sample.csv")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "アップロードして分析" }),
    ).toBeEnabled();
  });

  // アップロード成功時にAPIへPOSTし、sessionStorageへ保存してレポート画面へ遷移することを確認する
  it("should upload file and navigate to report page when request succeeds", async () => {
    const user = userEvent.setup();

    const mockReport = {
      row_count: 2,
      column_count: 2,
    };

    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => mockReport,
    } as Response);

    render(<UploadForm />);

    const file = new File(["name,score\nAlice,90"], "sample.csv", {
      type: "text/csv",
    });

    await user.upload(screen.getByLabelText("ファイルを選択"), file);
    await user.click(
      screen.getByRole("button", { name: "アップロードして分析" }),
    );

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/reports/analyze`,
        expect.objectContaining({
          method: "POST",
          body: expect.any(FormData),
        }),
      );
    });

    expect(sessionStorage.getItem("report")).toBe(JSON.stringify(mockReport));
    expect(pushMock).toHaveBeenCalledWith("/report");
  });

  // APIが失敗した場合にエラーメッセージをalertで表示することを確認する
  it("should show alert when request fails", async () => {
    const user = userEvent.setup();

    vi.mocked(fetch).mockResolvedValueOnce({
      ok: false,
      json: async () => ({
        detail: "分析に失敗しました。",
      }),
    } as Response);

    render(<UploadForm />);

    const file = new File(["name,score\nAlice,90"], "sample.csv", {
      type: "text/csv",
    });

    await user.upload(screen.getByLabelText("ファイルを選択"), file);
    await user.click(
      screen.getByRole("button", { name: "アップロードして分析" }),
    );

    await waitFor(() => {
      expect(alert).toHaveBeenCalledWith("分析に失敗しました。");
    });

    expect(pushMock).not.toHaveBeenCalled();
  });

  // 通信エラーが発生した場合にalertを表示することを確認する
  it("should show alert when network error occurs", async () => {
    const user = userEvent.setup();

    vi.mocked(fetch).mockRejectedValueOnce(new Error("Network Error"));

    render(<UploadForm />);

    const file = new File(["name,score\nAlice,90"], "sample.csv", {
      type: "text/csv",
    });

    await user.upload(screen.getByLabelText("ファイルを選択"), file);
    await user.click(
      screen.getByRole("button", { name: "アップロードして分析" }),
    );

    await waitFor(() => {
      expect(alert).toHaveBeenCalledWith("通信エラーが発生しました。");
    });

    expect(pushMock).not.toHaveBeenCalled();
  });

  // CSVファイルをドロップすると選択中のファイル名が表示されることを確認する
  it("should accept csv file by drag and drop", async () => {
    render(<UploadForm />);

    const file = new File(["name,score\nAlice,90"], "dropped.csv", {
      type: "text/csv",
    });

    const dropArea = screen
      .getByText("CSVファイルをドラッグ＆ドロップ")
      .closest("div");

    expect(dropArea).not.toBeNull();

    fireEvent.drop(dropArea!, {
      dataTransfer: {
        files: [file],
      },
    });

    expect(await screen.findByText("選択中: dropped.csv")).toBeInTheDocument();
  });

  // CSV以外のファイルをドロップした場合にalertを表示することを確認する
  it("should show alert when dropped file is not csv", () => {
    render(<UploadForm />);

    const file = new File(["hello"], "sample.txt", {
      type: "text/plain",
    });

    const dropArea = screen
      .getByText("CSVファイルをドラッグ＆ドロップ")
      .closest("div");

    const event = new Event("drop", { bubbles: true }) as DragEvent;
    Object.defineProperty(event, "dataTransfer", {
      value: {
        files: [file],
      },
    });

    dropArea?.dispatchEvent(event);

    expect(alert).toHaveBeenCalledWith("CSVファイルをアップロードしてください");
  });

  // アップロード中にローディング文言が表示されることを確認する
  it("should show loading message while uploading", async () => {
    const user = userEvent.setup();

    vi.mocked(fetch).mockImplementation(
      () =>
        new Promise((resolve) => {
          setTimeout(() => {
            resolve({
              ok: true,
              json: async () => ({ result: "ok" }),
            } as Response);
          }, 100);
        }),
    );

    render(<UploadForm />);

    const file = new File(["name,score\nAlice,90"], "sample.csv", {
      type: "text/csv",
    });

    await user.upload(screen.getByLabelText("ファイルを選択"), file);
    await user.click(
      screen.getByRole("button", { name: "アップロードして分析" }),
    );

    expect(screen.getByText("分析中...")).toBeInTheDocument();
    expect(
      screen.getByText("CSVファイルを読み込んでいます..."),
    ).toBeInTheDocument();
  });
});
