import { categories } from "./data.js";
import { createCarousel } from "./components/Carousel.js";

document.addEventListener("DOMContentLoaded", () => {
  const nomePerfil = localStorage.getItem("perfilAtivoNome");
  const imagemPerfil = localStorage.getItem("perfilAtivoImagem");

  if (nomePerfil && imagemPerfil) {
    const kidsLink = document.querySelector(".kids-link");
    const profileIcon = document.querySelector(".profile-icon");

    if (kidsLink) kidsLink.textContent = nomePerfil;
    if (profileIcon) profileIcon.src = imagemPerfil;
  }

  // inicializa lista de perfis (caso queira alternar direto do catálogo)
  const stored = localStorage.getItem("perfils_v1");
  let profiles = stored ? JSON.parse(stored) : null;
  const profileMenuBtn = document.querySelector(".profile-menu");
  const profileIcon = document.querySelector(".profile-icon");
  const kidsLinkEl = document.querySelector(".kids-link");
  if (profiles && profiles.length) {
    const idx = Number(localStorage.getItem("perfilAtivoIndex")) || 0;
    if (profileIcon) profileIcon.src = profiles[idx].img;
    if (kidsLinkEl) kidsLinkEl.textContent = profiles[idx].name;
  }

  function toggleProfileDropdownCatalog() {
    const existing = document.querySelector(".profiles-dropdown");
    if (existing) return existing.remove();
    const dd = document.createElement("div");
    dd.className = "profiles-dropdown";
    dd.style.position = "absolute";
    dd.style.right = "18px";
    dd.style.top = "60px";
    dd.style.background = "rgba(12,12,12,0.98)";
    dd.style.border = "1px solid rgba(255,255,255,0.06)";
    dd.style.padding = "10px";
    dd.style.borderRadius = "10px";
    dd.style.boxShadow = "0 8px 30px rgba(0,0,0,0.6)";
    dd.style.zIndex = 4500;
    dd.style.minWidth = "220px";
    dd.innerHTML = (
      profiles || [
        { name: "Convidado", img: profileIcon ? profileIcon.src : "" },
      ]
    )
      .map(
        (p, i) => `
      <div class="profiles-dropdown-item" data-idx="${i}" style="display:flex;gap:10px;align-items:center;padding:8px;border-radius:6px;cursor:pointer">
        <img src="${p.img}" style="width:40px;height:40px;border-radius:50%;object-fit:cover;border:2px solid rgba(255,255,255,0.06)" />
        <div style="flex:1">${p.name}</div>
      </div>
    `,
      )
      .join("");
    document.body.appendChild(dd);
    dd.querySelectorAll(".profiles-dropdown-item").forEach((el) => {
      el.addEventListener("click", () => {
        const i = Number(el.getAttribute("data-idx"));
        // aplica perfil e atualiza UI
        if (profiles && profiles[i]) {
          localStorage.setItem("perfilAtivoIndex", String(i));
          localStorage.setItem("perfilAtivoNome", profiles[i].name);
          localStorage.setItem("perfilAtivoImagem", profiles[i].img);
          if (profileIcon) profileIcon.src = profiles[i].img;
          if (kidsLinkEl) kidsLinkEl.textContent = profiles[i].name;
        }
        dd.remove();
      });
    });
    setTimeout(() => {
      document.addEventListener(
        "click",
        (e) => {
          if (!dd.contains(e.target) && e.target !== profileMenuBtn)
            dd.remove();
        },
        { once: true },
      );
    }, 10);
  }
  if (profileMenuBtn)
    profileMenuBtn.addEventListener("click", (e) => {
      e.preventDefault();
      toggleProfileDropdownCatalog();
    });

  const container = document.getElementById("main-content");

  if (container) {
    // create hero using the first category / first item
    if (
      categories &&
      categories.length > 0 &&
      categories[0].items &&
      categories[0].items.length > 0
    ) {
      const featured = categories[0].items[0];
      const hero = document.createElement("section");
      hero.className = "hero-section";
      hero.innerHTML = `
                <div class="hero-backdrop" style="background-image: url('${featured.img}')"></div>
                <div class="hero-content">
                    <div class="hero-text">
                        <h1 class="hero-title">VINGADORES DOUTOR DESTINO </h1>
                        <p class="hero-meta">Original Marvel • Filme • Ficção científica</p>
                        <p class="hero-desc">Doutor Destino chegou oficialmente ao MCU. Este vilão, um mestre da ciência de última geração e magia poderosa, vai desencadear uma crise em efeito cascata pelo multiverso inteiro</p>
                        <div class="hero-actions">
                            <button class="btn btn-play">▶ Reproduzir</button>
                            <button class="btn btn-info">Mais informações</button>
                        </div>
                    </div>
                </div>
            `;

      container.appendChild(hero);

      // show a small welcome toast if profile name exists
      if (nomePerfil) {
        const toast = document.createElement("div");
        toast.className = "welcome-toast";
        toast.innerHTML = `<span>🎁</span><span>Bem-vindo, ${nomePerfil}!</span>`;
        document.body.appendChild(toast);
        setTimeout(() => {
          toast.style.opacity = "0";
          toast.style.transition = "opacity 0.6s";
        }, 4000);
      }
    }

    categories.forEach((category) => {
      const carousel = createCarousel(category);
      container.appendChild(carousel);
    });
  }

  // Glassmorphism navbar ao rolar
  const navbar = document.getElementById("navbar");
  if (navbar) {
    window.addEventListener("scroll", () => {
      if (window.scrollY > 10) {
        navbar.classList.add("scrolled");
      } else {
        navbar.classList.remove("scrolled");
      }
    });
  }

  // notifications toggle on catalog page
  const notif = document.querySelector(".nav-notification");
  if (notif) {
    const card = notif.querySelector(".notification-card");
    const toggle = (open) => {
      const isOpen =
        typeof open === "boolean"
          ? open
          : notif.getAttribute("aria-expanded") === "true"
            ? false
            : true;
      notif.setAttribute("aria-expanded", isOpen ? "true" : "false");
      if (card) card.setAttribute("aria-hidden", isOpen ? "false" : "true");
    };
    notif.addEventListener("click", (e) => {
      e.stopPropagation();
      toggle();
    });
    document.addEventListener("click", (e) => {
      if (!notif.contains(e.target)) toggle(false);
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") toggle(false);
    });
  }

  // theme toggle on catalog page
  const themeToggle = document.querySelector(".theme-toggle");
  const applyTheme = (theme) => {
    if (theme === "light")
      document.documentElement.classList.add("theme-light");
    else document.documentElement.classList.remove("theme-light");
  };
  const savedTheme = localStorage.getItem("theme");
  if (savedTheme) applyTheme(savedTheme);
  if (themeToggle) {
    themeToggle.addEventListener("click", () => {
      const isLight = document.documentElement.classList.toggle("theme-light");
      localStorage.setItem("theme", isLight ? "light" : "dark");
      themeToggle.innerHTML = isLight
        ? '<i class="fas fa-sun"></i>'
        : '<i class="fas fa-moon"></i>';
    });
    themeToggle.innerHTML = document.documentElement.classList.contains(
      "theme-light",
    )
      ? '<i class="fas fa-sun"></i>'
      : '<i class="fas fa-moon"></i>';
  }
});
