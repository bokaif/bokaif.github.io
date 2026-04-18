document.addEventListener("DOMContentLoaded", () => {
  grained("#window", {
    animate: true,
    patternWidth: 150,
    patternHeight: 150,
    grainOpacity: 0.15,
    grainDensity: 2.49,
    grainWidth: 1,
    grainHeight: 1,
  });

  gsap.set("#window", {
    scale: 0,
    borderRadius: "50%",
    xPercent: -50,
    yPercent: -50,
  });
  gsap.set("#m_group", { opacity: 0, yPercent: 50 });
  gsap.set("#main-scroll", { opacity: 0 });

  gsap
    .timeline()
    .to("#window", {
      scale: 1,
      borderRadius: "48px",
      duration: 1,
      ease: "power2.out",
    })
    .to(
      "#main-scroll",
      { opacity: 1, duration: 0.3 },
      "-=0.3"
    )
    .to(
      "#m_group",
      { yPercent: 0, opacity: 1, duration: 0.5, ease: "power2.out" },
      "-=0.2"
    );

  const scrollRoot = document.getElementById("main-scroll");
  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const id = link.getAttribute("href").slice(1);
      const target = document.getElementById(id);
      if (!target || !scrollRoot) return;
      scrollRoot.scrollTo({
        top: target.offsetTop - 20,
        behavior: "smooth",
      });
    });
  });

  const sectionNavLinks = Array.from(
    document.querySelectorAll('#floating-nav a[href^="#"]')
  );
  const sectionNavItems = sectionNavLinks
    .map((link) => {
      const id = link.getAttribute("href")?.slice(1);
      const section = id ? document.getElementById(id) : null;
      if (!id || !section) return null;
      return { link, section };
    })
    .filter(Boolean);
  const sectionVisibility = new Map(
    sectionNavItems.map((item) => [item.section.id, 0])
  );

  function setActiveSectionNav(activeId) {
    sectionNavItems.forEach((item) => {
      item.link.classList.toggle("active", item.section.id === activeId);
    });
  }

  function updateActiveSectionNav() {
    if (!scrollRoot || sectionNavItems.length === 0) return;

    const visibleEntries = sectionNavItems
      .map((item) => ({
        id: item.section.id,
        ratio: sectionVisibility.get(item.section.id) ?? 0,
      }))
      .filter((item) => item.ratio > 0);

    if (visibleEntries.length > 0) {
      visibleEntries.sort((a, b) => b.ratio - a.ratio);
      setActiveSectionNav(visibleEntries[0].id);
      return;
    }

    const navTrigger = scrollRoot.scrollTop + scrollRoot.clientHeight * 0.45;
    let activeId = sectionNavItems[0].section.id;

    for (const item of sectionNavItems) {
      if (navTrigger >= item.section.offsetTop) {
        activeId = item.section.id;
      }
    }

    setActiveSectionNav(activeId);
  }

  const track = document.getElementById("scrollbar-track");
  const thumb = document.getElementById("scrollbar-thumb");
  const scrollbar = document.querySelector(".custom-scrollbar");
  let hideTimeout = null;
  let isDragging = false;
  let dragStartY = 0;
  let dragStartScroll = 0;

  function getThumbMetrics() {
    if (!scrollRoot || !track) return null;
    const { scrollHeight, clientHeight } = scrollRoot;
    const trackH = track.clientHeight;
    if (scrollHeight <= 0 || trackH <= 0) return null;
    const ratio = clientHeight / scrollHeight;
    const thumbH = Math.max(28, Math.min(trackH - 4, trackH * ratio));
    const maxTop = Math.max(0, trackH - thumbH);
    const maxScroll = Math.max(0, scrollHeight - clientHeight);
    return { trackH, thumbH, maxTop, maxScroll };
  }

  function updateThumb() {
    if (!scrollRoot || !thumb || !track) return;
    const { scrollHeight, clientHeight, scrollTop } = scrollRoot;
    if (scrollHeight <= clientHeight) {
      track.classList.remove("show");
      thumb.style.height = "0";
      return;
    }
    const metrics = getThumbMetrics();
    if (!metrics) return;
    const { thumbH, maxTop, maxScroll } = metrics;
    const fraction = maxScroll > 0 ? Math.min(1, Math.max(0, scrollTop / maxScroll)) : 0;
    thumb.style.height = `${thumbH}px`;
    thumb.style.top = `${fraction * maxTop}px`;
  }

  function flashScrollbar() {
    if (!track) return;
    track.classList.add("show");
    clearTimeout(hideTimeout);
    hideTimeout = setTimeout(() => {
      if (!isDragging) track.classList.remove("show");
    }, 1200);
  }

  function jumpAndDrag(clientY, e) {
    if (!scrollbar || !scrollRoot || !track) return;
    const rect = scrollbar.getBoundingClientRect();
    if (rect.height <= 0) return;
    const metrics = getThumbMetrics();
    if (!metrics) return;

    const clickRatio = Math.min(1, Math.max(0, (clientY - rect.top) / rect.height));
    scrollRoot.scrollTop = clickRatio * metrics.maxScroll;
    updateThumb();

    isDragging = true;
    dragStartY = clientY;
    dragStartScroll = scrollRoot.scrollTop;
    track.classList.add("dragging");
    scrollRoot.style.scrollBehavior = "auto";
    document.body.style.userSelect = "none";
    if (e) e.preventDefault();
    flashScrollbar();
  }

  if (scrollRoot && track) {
    scrollRoot.addEventListener("scroll", () => {
      updateThumb();
      updateActiveSectionNav();
      flashScrollbar();
    }, { passive: true });
  }

  if (scrollbar) {
    scrollbar.addEventListener("mousedown", (e) => {
      if (e.button !== 0) return;
      jumpAndDrag(e.clientY, e);
    });
  }

  window.addEventListener("mousemove", (e) => {
    if (!isDragging) return;
    const metrics = getThumbMetrics();
    if (!metrics || metrics.maxTop <= 0) return;
    const dy = e.clientY - dragStartY;
    scrollRoot.scrollTop = Math.max(0, Math.min(
      scrollRoot.scrollHeight - scrollRoot.clientHeight,
      dragStartScroll + (dy / metrics.maxTop) * metrics.maxScroll
    ));
  });

  window.addEventListener("mouseup", () => {
    if (!isDragging) return;
    isDragging = false;
    if (track) track.classList.remove("dragging");
    if (scrollRoot) scrollRoot.style.scrollBehavior = "";
    document.body.style.userSelect = "";
    flashScrollbar();
  });

  const runUpdate = () => requestAnimationFrame(() => {
    updateThumb();
    updateActiveSectionNav();
  });
  runUpdate();
  window.addEventListener("resize", runUpdate);
  if (scrollRoot) {
    const ro = new ResizeObserver(runUpdate);
    ro.observe(scrollRoot);
  }

  const cardObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          cardObserver.unobserve(entry.target);
        }
      });
    },
    { root: scrollRoot, threshold: 0.18, rootMargin: "0px 0px -100px 0px" }
  );
  document.querySelectorAll(".section-card").forEach((card) => cardObserver.observe(card));

  function toggleTimelineTech(button) {
    const techGroup = button.closest(".timeline-tech");
    if (!techGroup) return;

    const isExpanded = techGroup.classList.toggle("is-expanded");
    button.setAttribute("aria-expanded", String(isExpanded));
    button.textContent = isExpanded ? "less" : (button.dataset.collapsedLabel || "+0");
  }

  document.addEventListener("click", (event) => {
    const button = event.target.closest(".timeline-tech-toggle");
    if (!button) return;
    event.preventDefault();
    toggleTimelineTech(button);
  });

  if (scrollRoot && sectionNavItems.length > 0) {
    const navObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          sectionVisibility.set(entry.target.id, entry.isIntersecting ? entry.intersectionRatio : 0);
        });
        updateActiveSectionNav();
      },
      {
        root: scrollRoot,
        threshold: [0, 0.2, 0.35, 0.5, 0.65, 0.8, 1],
        rootMargin: "-12% 0px -42% 0px",
      }
    );

    sectionNavItems.forEach((item) => navObserver.observe(item.section));
  }

  const birthDate = new Date("2004-02-26");
  const ageElement = document.getElementById("age");
  const today = new Date();
  let years = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) years--;
  if (ageElement) ageElement.textContent = String(years);

  const tooltip = document.createElement("div");
  tooltip.className = "tooltip";
  document.body.appendChild(tooltip);
  if (ageElement) {
    ageElement.style.cursor = "help";
    ageElement.addEventListener("mouseenter", () => {
      tooltip.style.opacity = "1";
      tooltip.textContent = getPreciseAge(birthDate);
      moveTooltip(ageElement, tooltip);
    });
    ageElement.addEventListener("mouseleave", () => {
      tooltip.style.opacity = "0";
    });
    ageElement.addEventListener("mousemove", () => {
      tooltip.textContent = getPreciseAge(birthDate);
      moveTooltip(ageElement, tooltip);
    });
  }

  const cycleElement = document.querySelector(".cycle");
  const funFacts = [
    "Software Engineer @Yobo AI",
    "CS @BRAC University",
    "Stanford Section Leader",
    "Kibo Robot Challenge Champion",
  ];
  let cycleIndex = 1;
  if (cycleElement) {
    cycleElement.textContent = funFacts[0];
    setInterval(() => {
      cycleElement.style.opacity = "0";
      setTimeout(() => {
        cycleElement.textContent = funFacts[cycleIndex];
        cycleElement.style.opacity = "1";
        cycleIndex = (cycleIndex + 1) % funFacts.length;
      }, 250);
    }, 2400);
  }

  const randomPhotosLayer = document.getElementById("random-photos");
  const activePhotos = new Set();

  function spawnRandomPhoto() {
    if (!randomPhotosLayer) return;
    const layerRect = randomPhotosLayer.getBoundingClientRect();
    const photo = document.createElement("img");
    const photoNumber = Math.floor(Math.random() * 5) + 1;
    photo.src = `/images/${photoNumber}.png`;
    photo.className = "random-photo";

    const size = 140;
    const x = Math.random() * Math.max(10, layerRect.width - size - 20) + 10;
    const y = Math.random() * Math.max(10, layerRect.height - size - 120) + 10;
    const rotation = Math.random() * 20 - 10;
    photo.style.left = `${x}px`;
    photo.style.top = `${y}px`;
    photo.style.setProperty("--rotation", `${rotation}deg`);

    randomPhotosLayer.appendChild(photo);
    activePhotos.add(photo);
    requestAnimationFrame(() => photo.classList.add("visible"));
    setTimeout(() => {
      photo.classList.add("fading");
      setTimeout(() => {
        photo.remove();
        activePhotos.delete(photo);
      }, 300);
    }, 2400);
  }

  const gallery = document.querySelector(".gallery-summon");
  const labPhoto = document.getElementById("lab-photo-button");
  [gallery, labPhoto].forEach((button) => {
    if (!button) return;
    button.addEventListener("click", spawnRandomPhoto);
  });

  const moods = [
    "soft goblin coding",
    "design brain online",
    "high functioning overthinker",
    "shipping mode activated",
    "debugging existence",
  ];
  const moodButton = document.getElementById("mood-button");
  const moodOutput = document.getElementById("mood-output");
  if (moodButton && moodOutput) {
    moodButton.addEventListener("click", () => {
      moodOutput.textContent = moods[Math.floor(Math.random() * moods.length)];
    });
  }

  const contactEmailButton = document.getElementById("contact-email-button");
  if (contactEmailButton) {
    contactEmailButton.addEventListener("click", (event) => {
      copyEmail(event);
      contactEmailButton.textContent = "email copied!";
      setTimeout(() => {
        contactEmailButton.textContent = "copy email";
      }, 1200);
    });
  }

  const footerEmailLink = document.getElementById("footer-email-link");
  if (footerEmailLink) {
    footerEmailLink.addEventListener("click", (event) => {
      copyEmail(event);
    });
  }

  const topbarEmailLink = document.getElementById("topbar-email-link");
  if (topbarEmailLink) {
    topbarEmailLink.addEventListener("click", (event) => {
      copyEmail(event);
    });
  }

  const topbar = document.getElementById("topbar");
  const heroSection = document.getElementById("hero");
  if (topbar && heroSection && scrollRoot) {
    scrollRoot.addEventListener("scroll", () => {
      const heroBottom = heroSection.offsetTop + heroSection.offsetHeight;
      topbar.classList.toggle("visible", scrollRoot.scrollTop > heroBottom * 0.65);
    }, { passive: true });
  }

  // --- Shared avatar dreamy crossfade cycle ---
  const avatarImages = ["/images/1.png", "/images/2.png", "/images/3.png", "/images/4.png", "/images/5.png"];
  const avatarCache = new Map();

  function loadAvatarImage(src) {
    const existing = avatarCache.get(src);
    if (existing) return existing;

    const image = new Image();
    image.decoding = "async";
    image.loading = "eager";
    image.src = src;

    const ready = new Promise((resolve, reject) => {
      const finish = () => {
        if (typeof image.decode === "function") {
          image.decode().catch(() => {}).finally(resolve);
          return;
        }
        resolve();
      };

      if (image.complete) {
        finish();
        return;
      }

      image.addEventListener("load", finish, { once: true });
      image.addEventListener("error", reject, { once: true });
    });

    avatarCache.set(src, ready);
    return ready;
  }

  avatarImages.forEach((src) => {
    loadAvatarImage(src).catch(() => {
      avatarCache.delete(src);
    });
  });

  function startAvatarCycle(backSelector, frontSelector) {
    const avatarBack = document.querySelector(backSelector);
    const avatarFront = document.querySelector(frontSelector);
    if (!avatarBack || !avatarFront) return;

    let avatarIndex = 0;
    let isAnimating = false;

    async function dreamSwap() {
      if (isAnimating) return;
      isAnimating = true;
      const nextIndex = (avatarIndex + 1) % avatarImages.length;
      const nextImage = avatarImages[nextIndex];

      try {
        await loadAvatarImage(nextImage);
      } catch {
        isAnimating = false;
        return;
      }

      avatarFront.src = nextImage;

      gsap.killTweensOf([avatarBack, avatarFront]);
      gsap.set(avatarFront, {
        opacity: 0,
        filter: "blur(14px) grayscale(0.3) contrast(1.05)",
        willChange: "opacity, filter"
      });
      gsap.set(avatarBack, { willChange: "opacity, filter" });

      gsap.timeline({
        onComplete: () => {
          avatarBack.src = nextImage;
          gsap.set(avatarFront, {
            opacity: 0,
            clearProps: "filter,willChange"
          });
          gsap.set(avatarBack, { clearProps: "willChange" });
          avatarIndex = nextIndex;
          isAnimating = false;
        }
      })
        .to(avatarFront, {
          opacity: 1,
          filter: "blur(0px) grayscale(0.3) contrast(1.05)",
          duration: 0.8,
          ease: "power2.inOut"
        });
    }

    setInterval(dreamSwap, 3500);
  }

  startAvatarCycle(".avatar-back", ".avatar-front");
  startAvatarCycle(".topbar-avatar-back", ".topbar-avatar-front");
});

function getPreciseAge(birthDate) {
  const diff = Date.now() - birthDate.getTime();
  return (diff / (365.25 * 24 * 60 * 60 * 1000)).toFixed(10);
}

function moveTooltip(anchor, tooltip) {
  const rect = anchor.getBoundingClientRect();
  tooltip.style.left = `${rect.left - 52}px`;
  tooltip.style.top = `${rect.top - 34}px`;
}

function copyEmail(event) {
  if (event) event.preventDefault();
  navigator.clipboard.writeText("badruddoza.kaif@gmail.com");

  const link = event && event.currentTarget;
  if (!link) return;
  const emailIcon = link.querySelector(".email-icon");
  const checkIcon = link.querySelector(".check-icon");
  if (!emailIcon || !checkIcon) return;

  emailIcon.style.display = "none";
  checkIcon.style.display = "inline-block";
  setTimeout(() => {
    emailIcon.style.display = "inline-block";
    checkIcon.style.display = "none";
  }, 1200);
}
