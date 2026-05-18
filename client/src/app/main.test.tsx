import { vi, describe, it, expect, beforeEach } from "vitest";

vi.mock("@/app/providers/ThemeProvider/lib/initTheme", () => ({
  initTheme: vi.fn(),
}));

vi.mock("react-dom/client", () => ({
  createRoot: vi.fn(() => ({
    render: vi.fn(),
  })),
}));

describe("main.tsx", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();

    document.body.innerHTML = '<div id="root"></div>';
  });

  it("должен инициализировать тему при запуске", async () => {
    const { initTheme } =
      await import("@/app/providers/ThemeProvider/lib/initTheme");

    await import("./main");

    expect(initTheme).toHaveBeenCalledTimes(1);
  });

  it("должен вызывать createRoot с элементом #root", async () => {
    const { createRoot } = await import("react-dom/client");

    await import("./main");

    const rootElement = document.getElementById("root");
    expect(createRoot).toHaveBeenCalledWith(rootElement);
  });
});
