import { vi, describe, it, expect, beforeEach } from "vitest";

// 1. Мокаем зависимости ДО импорта main.tsx
vi.mock("@/app/providers/ThemeProvider/lib/initTheme", () => ({
  initTheme: vi.fn(),
}));

// Мокаем react-dom, чтобы не рендерить всё дерево впустую
vi.mock("react-dom/client", () => ({
  createRoot: vi.fn(() => ({
    render: vi.fn(),
  })),
}));

describe("main.tsx", () => {
  beforeEach(() => {
    // Очищаем моки перед каждым тестом
    vi.resetModules();
    vi.clearAllMocks();

    // Создаем фиктивный контейнер root, который ищет документ
    document.body.innerHTML = '<div id="root"></div>';
  });

  it("должен инициализировать тему при запуске", async () => {
    const { initTheme } =
      await import("@/app/providers/ThemeProvider/lib/initTheme");

    // Импортируем main, что триггерит его выполнение
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
