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

const PACK_PRICES = { pair: "54,99 €", collection: "84,99 €" };
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
  const toggle = () => nav.classList.toggle("scrolled", window.scrollY > 40);
  window.addEventListener("scroll", toggle, { passive: true });
  toggle();
}

/* ---------- Mobile menu ---------- */
function initMobileMenu() {
  const burger = document.getElementById("navBurger");
  const menu = document.getElementById("mobileMenu");
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

  function setFinish(finish, imgSrc) {
    currentFinish = finish;
    frameImg.style.opacity = 0;
    setTimeout(() => {
      frameImg.src = imgSrc;
      frameImg.style.opacity = 1;
    }, 180);
    if (heroImg && finish !== "mix") heroImg.src = imgSrc;

    document.querySelectorAll(".swatch").forEach((s) =>
      s.classList.toggle("active", s.dataset.finish === finish)
    );
    document.querySelectorAll(".thumb").forEach((t) =>
      t.classList.toggle("active", t.dataset.finish === finish)
    );
  }

  document.querySelectorAll(".swatch, .thumb").forEach((el) => {
    el.addEventListener("click", () => setFinish(el.dataset.finish, el.dataset.img));
  });
}

/* ---------- Pack selector ---------- */
function initPackOptions() {
  const btnPrice = document.getElementById("btnPrice");
  const stickyPrice = document.getElementById("stickyPrice");

  document.querySelectorAll(".pack-option").forEach((opt) => {
    opt.addEventListener("click", () => {
      currentPack = opt.dataset.pack;
      document.querySelectorAll(".pack-option").forEach((o) => o.classList.remove("active"));
      opt.classList.add("active");
      if (btnPrice) btnPrice.textContent = PACK_PRICES[currentPack];
      if (stickyPrice) stickyPrice.textContent = "Desde " + PACK_PRICES[currentPack];
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

/* ---------- Sticky buy bar ---------- */
function initStickyBuy() {
  const bar = document.getElementById("stickyBuy");
  const hero = document.querySelector(".hero");
  if (!bar || !hero) return;
  const io = new IntersectionObserver(
    ([entry]) => bar.classList.toggle("show", !entry.isIntersecting),
    { threshold: 0 }
  );
  io.observe(hero);
}
