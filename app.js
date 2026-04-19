const state = {
  query: "",
  category: null,
  icons: [],
};

const el = {
  grid: document.getElementById("grid"),
  count: document.getElementById("count"),
  search: document.getElementById("search"),
  categories: document.getElementById("categories"),
  home: document.getElementById("nav-home"),
  toast: document.getElementById("toast"),
};

async function load() {
  const res = await fetch("icons.json");
  state.icons = await res.json();
  renderSidebar();
  render();
}

function renderSidebar() {
  const counts = {};
  for (const i of state.icons) counts[i.category] = (counts[i.category] || 0) + 1;
  const cats = Object.keys(counts).sort();
  el.categories.innerHTML = cats
    .map(
      (c) =>
        `<button class="cat-item" data-cat="${c}"><span>${c}</span><span class="count">${counts[c]}</span></button>`
    )
    .join("");
  el.categories.querySelectorAll(".cat-item").forEach((btn) => {
    btn.addEventListener("click", () => {
      const cat = btn.dataset.cat;
      state.category = state.category === cat ? null : cat;
      render();
    });
  });
}

function filtered() {
  const q = state.query.trim().toLowerCase();
  return state.icons.filter((i) => {
    if (state.category && i.category !== state.category) return false;
    if (!q) return true;
    return (
      i.name.toLowerCase().includes(q) ||
      i.category.toLowerCase().includes(q) ||
      i.tags.some((t) => t.toLowerCase().includes(q))
    );
  });
}

function render() {
  const list = filtered();

  el.count.innerHTML = `<strong>${list.length}</strong> ${list.length === 1 ? "icon" : "icons"}${
    state.category ? ` · ${state.category}` : ""
  }`;

  document
    .querySelectorAll(".cat-item")
    .forEach((b) => b.classList.toggle("active", b.dataset.cat === state.category));
  el.home.classList.toggle("active", state.category === null);

  if (list.length === 0) {
    el.grid.innerHTML = `<div class="empty">No icons match your search.</div>`;
    return;
  }

  el.grid.innerHTML = list.map(card).join("");
  el.grid.querySelectorAll("[data-copy]").forEach((btn) => {
    btn.addEventListener("click", () => copySvg(btn.dataset.copy));
  });
  el.grid.querySelectorAll("[data-download]").forEach((btn) => {
    btn.addEventListener("click", () => download(btn.dataset.download));
  });
}

function card(icon) {
  return `
    <div class="card">
      <div class="card-icon"><img src="icons/${icon.file}" alt="${icon.name}" loading="lazy"></div>
      <div class="card-meta">
        <span class="card-name">${icon.name}</span>
        <span class="badge">${icon.category}</span>
      </div>
      <div class="card-actions">
        <button class="action" data-copy="${icon.file}" title="Copy SVG" aria-label="Copy SVG">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
        </button>
        <button class="action" data-download="${icon.file}" title="Download" aria-label="Download">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
        </button>
        <a class="action" href="${icon.url}" target="_blank" rel="noopener" title="Source" aria-label="Source">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
        </a>
      </div>
    </div>
  `;
}

async function copySvg(file) {
  try {
    const res = await fetch(`icons/${file}`);
    const text = await res.text();
    await navigator.clipboard.writeText(text);
    toast("Copied SVG");
  } catch {
    toast("Copy failed");
  }
}

function download(file) {
  const a = document.createElement("a");
  a.href = `icons/${file}`;
  a.download = file;
  a.click();
}

let toastTimer;
function toast(msg) {
  el.toast.textContent = msg;
  el.toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.toast.classList.remove("show"), 1600);
}

el.search.addEventListener("input", (e) => {
  state.query = e.target.value;
  render();
});

el.home.addEventListener("click", () => {
  state.category = null;
  state.query = "";
  el.search.value = "";
  render();
});

load();
