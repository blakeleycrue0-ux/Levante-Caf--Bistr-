/* =========================================================
   WICK — configuración de checkout
   Sustituye estas URLs por los enlaces reales de tu tienda
   Shopify (permalink de producto o de carrito) en cuanto
   los tengas. Formato típico:
   https://TU-TIENDA.myshopify.com/cart/VARIANT_ID:1
   ========================================================= */
const SHOPIFY_CHECKOUT = {
  pair: "https://REEMPLAZA-CON-TU-TIENDA.myshopify.com/cart/VARIANT_ID_PAIR:1",
  collection: "https://REEMPLAZA-CON-TU-TIENDA.myshopify.com/cart/VARIANT_ID_COLLECTION:1",
};

/* Código de descuento del popup — créalo también en Shopify
   (Descuentos → Crear descuento → 10%) o no funcionará al pagar. */
const PROMO_CODE = "WELCOME10";
const PROMO_DELAY_MS = 10000;

/* Reseñas verificadas: añade aquí las reales cuando lleguen.
   Formato: { name: "Sarah M.", stars: 5, text: "..." }
   Mientras esté vacío, la sección muestra el mensaje "Just landed". */
const REVIEWS = [];

const PACK_PRICES = { pair: "$62.99", collection: "$96.99" };
let currentPack = "pair";
let currentFinish = "walnut";

const FINISH_IMG = {
  walnut: "assets/img/wick-walnut-pair.jpg",
  ash: "assets/img/wick-ash-pair.jpg",
  mix: "assets/img/wick-collection-4.jpg",
};

document.addEventListener("DOMContentLoaded", () => {
  initCursor();
  initProgressBar();
  initNavScroll();
  initMobileMenu();
  initReveal();
  initTilt();
  initSwatchesAndThumbs();
  initPackOptions();
  initBuyButtons();
  initFaq();
  initParallax();
  initStickyBuy();
  initMagnetic();
  initTiltCards();
  initMouseParallax();
  initHeroLines();
  initPromoPopup();
  initReviews();
});

/* ---------- Custom cursor ---------- */
function initCursor() {
  const dot = document.getElementById("cursorDot");
  if (!dot || matchMedia("(pointer: coarse)").matches) return;
  window.addEventListener("mousemove", (e) => {
    dot.style.left = e.clientX + "px";
    dot.style.top = e.clientY + "px";
    dot.classList.add("show");
  });
  document.querySelectorAll("button, a").forEach((el) => {
    el.addEventListener("mouseenter", () => dot.classList.add("big"));
    el.addEventListener("mouseleave", () => dot.classList.remove("big"));
  });
}

/* ---------- Scroll progress bar ---------- */
function initProgressBar() {
  const bar = document.getElementById("progressBar");
  if (!bar) return;
  const update = () => {
    const h = document.documentElement;
    const scrolled = (h.scrollTop) / (h.scrollHeight - h.clientHeight) * 100;
    bar.style.width = scrolled + "%";
  };
  window.addEventListener("scroll", update, { passive: true });
  update();
}

/* ---------- Nav background on scroll ---------- */
function initNavScroll() {
  const nav = document.getElementById("nav");
  if (!nav) return;
  const toggle = () => nav.classList.toggle("scrolled", window.scrollY > 40);
  window.addEventListener("scroll", toggle, { passive: true });
  toggle();
}

/* ---------- Mobile menu ---------- */
function initMobileMenu() {
  const burger = document.getElementById("navBurger");
  const menu = document.getElementById("mobileMenu");
  if (!burger || !menu) return;
  burger.addEventListener("click", () => {
    menu.classList.toggle("open");
  });
  menu.querySelectorAll("a").forEach((a) =>
    a.addEventListener("click", () => menu.classList.remove("open"))
  );
}

/* ---------- Scroll reveal ---------- */
function initReveal() {
  const items = document.querySelectorAll(".reveal, .reveal-scale");
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry, i) => {
        if (entry.isIntersecting) {
          entry.target.style.setProperty("--i", i % 6);
          entry.target.classList.add("in");
          io.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15, rootMargin: "0px 0px -60px 0px" }
  );
  items.forEach((item) => io.observe(item));
}

/* ---------- 3D tilt on hero product image ---------- */
function initTilt() {
  const stage = document.getElementById("tiltStage");
  const img = document.getElementById("tiltImg");
  if (!stage || !img || matchMedia("(pointer: coarse)").matches) return;

  let raf = null;
  stage.addEventListener("mousemove", (e) => {
    const rect = stage.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(() => {
      img.style.transform = `rotateY(${x * 22}deg) rotateX(${-y * 22}deg) translateZ(30px)`;
    });
  });
  stage.addEventListener("mouseleave", () => {
    img.style.transform = "rotateY(0deg) rotateX(0deg) translateZ(0)";
  });

  // gentle idle float
  let t = 0;
  setInterval(() => {
    if (stage.matches(":hover")) return;
    t += 0.02;
    img.style.transform = `rotateY(${Math.sin(t) * 4}deg) rotateX(${Math.cos(t) * 2}deg) translateY(${Math.sin(t) * 6}px)`;
  }, 40);
}

/* ---------- Finish swatches + gallery thumbs ---------- */
function initSwatchesAndThumbs() {
  const frameImg = document.getElementById("productImg");
  const heroImg = document.getElementById("tiltImg");
  if (!frameImg && !heroImg) return;

  window.setFinish = function (finish, imgSrc) {
    currentFinish = finish;
    if (frameImg) {
      frameImg.style.opacity = 0;
      setTimeout(() => {
        frameImg.src = imgSrc;
        frameImg.style.opacity = 1;
      }, 180);
    }
    if (heroImg && finish !== "mix") heroImg.src = imgSrc;

    document.querySelectorAll(".swatch").forEach((s) =>
      s.classList.toggle("active", s.dataset.finish === finish)
    );
    document.querySelectorAll(".thumb").forEach((t) =>
      t.classList.toggle("active", t.dataset.finish === finish)
    );
  };

  document.querySelectorAll(".swatch, .thumb").forEach((el) => {
    el.addEventListener("click", () => {
      // finish is locked while The Collection is selected (it ships in both)
      if (el.classList.contains("swatch") && currentPack === "collection") return;
      window.setFinish(el.dataset.finish, el.dataset.img);
    });
  });
}

/* ---------- Pack selector ---------- */
function initPackOptions() {
  const btnPrice = document.getElementById("btnPrice");
  const stickyPrice = document.getElementById("stickyPrice");
  const finishBlock = document.getElementById("finishBlock");
  const finishNote = document.getElementById("finishNote");
  const packOptions = document.querySelectorAll(".pack-option");
  if (!packOptions.length) return;

  packOptions.forEach((opt) => {
    opt.addEventListener("click", () => {
      currentPack = opt.dataset.pack;
      packOptions.forEach((o) => o.classList.remove("active"));
      opt.classList.add("active");
      if (btnPrice) btnPrice.textContent = PACK_PRICES[currentPack];
      if (stickyPrice) stickyPrice.textContent = "From " + PACK_PRICES[currentPack];

      if (currentPack === "collection") {
        // The Collection always ships 2 ash + 2 walnut: no finish choice
        if (finishBlock) finishBlock.classList.add("locked");
        if (finishNote) finishNote.textContent = "— includes both (2 ash + 2 walnut)";
        if (window.setFinish) window.setFinish("mix", FINISH_IMG.mix);
      } else {
        if (finishBlock) finishBlock.classList.remove("locked");
        if (finishNote) finishNote.textContent = "";
        const back = currentFinish === "mix" ? "walnut" : currentFinish;
        if (window.setFinish) window.setFinish(back, FINISH_IMG[back]);
      }
    });
  });
}

/* ---------- Buy buttons -> Shopify checkout ---------- */
function initBuyButtons() {
  document.querySelectorAll("[data-buy]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const pack = btn.hasAttribute("data-pack-dynamic") ? currentPack : btn.dataset.pack || "pair";
      const url = SHOPIFY_CHECKOUT[pack] || SHOPIFY_CHECKOUT.pair;
      window.location.href = url;
    });
  });
}

/* ---------- FAQ accordion ---------- */
function initFaq() {
  document.querySelectorAll(".faq-item").forEach((item) => {
    item.querySelector(".faq-q").addEventListener("click", () => {
      const isOpen = item.classList.contains("open");
      document.querySelectorAll(".faq-item").forEach((i) => i.classList.remove("open"));
      if (!isOpen) item.classList.add("open");
    });
  });
}

/* ---------- Parallax lifestyle image ---------- */
function initParallax() {
  const wrap = document.getElementById("parallaxImg");
  if (!wrap) return;
  const img = wrap.querySelector("img");
  if (!img) return;
  window.addEventListener(
    "scroll",
    () => {
      const rect = wrap.getBoundingClientRect();
      let progress = (window.innerHeight - rect.top) / (window.innerHeight + rect.height);
      progress = Math.min(1, Math.max(0, progress));
      const offset = (progress - 0.5) * 36;
      img.style.transform = `translateY(${offset}px) scale(1.02)`;
    },
    { passive: true }
  );
}

/* ---------- Magnetic buttons ---------- */
function initMagnetic() {
  if (matchMedia("(pointer: coarse)").matches) return;
  document.querySelectorAll(".magnetic").forEach((btn) => {
    btn.addEventListener("mousemove", (e) => {
      const rect = btn.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      btn.style.transform = `translate(${x * 0.22}px, ${y * 0.3}px)`;
    });
    btn.addEventListener("mouseleave", () => {
      btn.style.transform = "";
    });
  });
}

/* ---------- 3D tilt on feature cards ---------- */
function initTiltCards() {
  if (matchMedia("(pointer: coarse)").matches) return;
  document.querySelectorAll("[data-tilt-card]").forEach((card) => {
    card.addEventListener("mousemove", (e) => {
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      card.style.transform = `perspective(700px) rotateY(${x * 9}deg) rotateX(${-y * 9}deg) translateY(-6px)`;
    });
    card.addEventListener("mouseleave", () => {
      card.style.transform = "";
    });
  });
}

/* ---------- Mouse parallax on hero blobs ---------- */
function initMouseParallax() {
  if (matchMedia("(pointer: coarse)").matches) return;
  const els = document.querySelectorAll("[data-mouse-parallax]");
  if (!els.length) return;
  window.addEventListener("mousemove", (e) => {
    const nx = e.clientX / window.innerWidth - 0.5;
    const ny = e.clientY / window.innerHeight - 0.5;
    els.forEach((el) => {
      const depth = parseFloat(el.dataset.mouseParallax) || 20;
      el.style.transform = `translate(${nx * depth}px, ${ny * depth}px)`;
    });
  });
}

/* ---------- Hero title line-rise animation ---------- */
function initHeroLines() {
  document.querySelectorAll(".hero-title .line").forEach((line, i) => {
    setTimeout(() => line.classList.add("up"), 250 + i * 160);
  });
}

/* ---------- Sticky buy bar ---------- */
function initStickyBuy() {
  const bar = document.getElementById("stickyBuy");
  const sentinel = document.querySelector(".hero") || document.querySelector(".product-page-top");
  if (!bar || !sentinel) return;
  const io = new IntersectionObserver(
    ([entry]) => bar.classList.toggle("show", !entry.isIntersecting),
    { threshold: 0 }
  );
  io.observe(sentinel);
}

/* ---------- Discount popup (10s after landing) ---------- */
function initPromoPopup() {
  const overlay = document.getElementById("promoOverlay");
  if (!overlay) return;
  const closeBtn = document.getElementById("promoClose");
  const codeBtn = document.getElementById("promoCode");

  // shown once per browser session, across both pages
  if (sessionStorage.getItem("wickPromoSeen")) return;

  setTimeout(() => {
    overlay.classList.add("show");
    sessionStorage.setItem("wickPromoSeen", "1");
  }, PROMO_DELAY_MS);

  const close = () => overlay.classList.remove("show");
  closeBtn.addEventListener("click", close);
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) close();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") close();
  });

  if (codeBtn) {
    codeBtn.textContent = PROMO_CODE;
    codeBtn.addEventListener("click", () => {
      navigator.clipboard && navigator.clipboard.writeText(PROMO_CODE);
      codeBtn.classList.add("copied");
      codeBtn.textContent = "Copied!";
      setTimeout(() => {
        codeBtn.classList.remove("copied");
        codeBtn.textContent = PROMO_CODE;
      }, 1400);
    });
  }
}

/* ---------- Reviews (real ones only — see REVIEWS above) ---------- */
function initReviews() {
  const grid = document.getElementById("reviewsGrid");
  const empty = document.getElementById("reviewsEmpty");
  if (!grid) return;

  if (!REVIEWS.length) {
    if (empty) empty.style.display = "";
    return;
  }
  if (empty) empty.style.display = "none";
  REVIEWS.forEach((r) => {
    const card = document.createElement("div");
    card.className = "review-card reveal-scale in";
    card.innerHTML = `
      <div class="review-stars">${"★".repeat(r.stars)}${"☆".repeat(5 - r.stars)}</div>
      <p class="review-text">${r.text}</p>
      <span class="review-name">${r.name}</span>`;
    grid.appendChild(card);
  });
}
