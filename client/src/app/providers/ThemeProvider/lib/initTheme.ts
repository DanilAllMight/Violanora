export const initTheme = () => {
  const savedTheme = localStorage.getItem("theme");
  const systemDark =
    typeof window !== "undefined"
      ? window.matchMedia("(prefers-color-scheme: dark)").matches
      : false;

  if (savedTheme === "dark" || (!savedTheme && systemDark)) {
    document.documentElement.classList.add("dark");
  } else {
    document.documentElement.classList.remove("dark");
  }

  const savedAccent = localStorage.getItem("accent-color");
  if (savedAccent) {
    document.documentElement.style.setProperty("--app-accent", savedAccent);
  }
};
