import { initTheme } from "./initTheme";
import { describe, it, expect, vi, beforeEach } from "vitest";

Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false, // по умолчанию "светлая" тема
    media: query,
    onchange: null,
    addListener: vi.fn(), // устарело, но нужно для совместимости
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

describe("initTheme", () => {
  beforeEach(() => {
    // 1. Очищаем localStorage перед каждым тестом
    vi.resetModules();
    vi.clearAllMocks();
    localStorage.clear();
    // 2. Сбрасываем классы на <html>
    document.documentElement.className = "";
    // 3. Удаляем стили
    document.documentElement.style.removeProperty("--app-accent");
    // 4. Очищаем все моки
    vi.restoreAllMocks();
  });

  it('должен добавить класс .dark, если в localStorage сохранено "dark"', () => {
    localStorage.setItem("theme", "dark");

    initTheme();

    expect(document.documentElement.classList.contains("dark")).toBe(true);
  });

  it('должен удалить класс .dark, если в localStorage сохранено "light"', () => {
    // Сначала добавим, чтобы проверить удаление
    document.documentElement.classList.add("dark");
    localStorage.setItem("theme", "light");

    initTheme();

    expect(document.documentElement.classList.contains("dark")).toBe(false);
  });

  it("должен использовать системную темную тему, если localStorage пуст", () => {
    // Мокаем matchMedia, чтобы он вернул true (системная тема темная)
    vi.stubGlobal(
      "matchMedia",
      vi.fn().mockImplementation((query) => ({
        matches: true,
        media: query,
      })),
    );

    initTheme();

    expect(document.documentElement.classList.contains("dark")).toBe(true);
  });

  it("должен установить CSS-переменную акцентного цвета", () => {
    const mockColor = "#ff0000";
    localStorage.setItem("accent-color", mockColor);

    initTheme();

    const accentValue =
      document.documentElement.style.getPropertyValue("--app-accent");
    expect(accentValue).toBe(mockColor);
  });
});
