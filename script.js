document.addEventListener("DOMContentLoaded", () => {
  const options = {
    animate: true,
    patternWidth: 150,
    patternHeight: 150,
    grainOpacity: 0.15,
    grainDensity: 2.49,
    grainWidth: 1,
    grainHeight: 1,
  };
  grained("#background", options);

  gsap.set("#background", {
    scale: 0,
    borderRadius: "50%",
    xPercent: -50,
    yPercent: -50,
    top: "50%",
    left: "50%",
    position: "absolute",
  });
  gsap.set("#m_group", { opacity: 0, yPercent: 50 });

  gsap
    .timeline()
    .to("#background", {
      scale: 1,
      borderRadius: "50px",
      duration: 1,
      ease: "power2.out",
    })
    .to(
      "#m_group",
      {
        yPercent: 0,
        opacity: 1,
        duration: 0.5,
        ease: "power2.out",
      },
      "-=0.5"
    );

  gsap.set("#footer", { opacity: 0 });
  gsap.to("#footer", {
    opacity: 1,
    duration: 0.5,
    ease: "power2.out",
    delay: 1,
  });

  const links = document.querySelectorAll('a[href^="#"]');
  links.forEach((link) => {
    link.addEventListener("click", function (e) {
      e.preventDefault();
      const targetId = this.getAttribute("href").substring(1);
      const targetSection = document.getElementById(targetId);

      if (targetSection) {
        window.scrollTo({
          top: targetSection.offsetTop,
          behavior: "smooth",
        });
      }
    });
  });

  const birthDate = new Date("2004-02-26");
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  const ageElement = document.getElementById("age");
  ageElement.innerHTML = age;

  function calculatePreciseAge() {
    const now = new Date();
    const diff = now - birthDate;
    const preciseAge = diff / (365.25 * 24 * 60 * 60 * 1000);
    return preciseAge.toFixed(10);
  }

  const tooltip = document.createElement("div");
  tooltip.classList.add("tooltip");
  document.body.appendChild(tooltip);

  ageElement.style.position = "relative";
  ageElement.style.cursor = "help";

  ageElement.addEventListener("mouseenter", (e) => {
    tooltip.style.opacity = "1";
    updateTooltipPosition(e);
  });

  ageElement.addEventListener("mouseleave", () => {
    tooltip.style.opacity = "0";
  });

  ageElement.addEventListener("mousemove", updateTooltipPosition);

  function updateTooltipPosition(e) {
    const rect = ageElement.getBoundingClientRect();
    tooltip.style.left = `${rect.left + window.scrollX - 60}px`;
    tooltip.style.top = `${rect.top + window.scrollY - 40}px`;
    tooltip.textContent = calculatePreciseAge();
  }

  setInterval(() => {
    if (tooltip.style.opacity === "1") {
      tooltip.textContent = calculatePreciseAge();
    }
  }, 1000);

  const funFacts = [
    "founding engineer @yobo ai",
    "cs @brac university",
    "software developer",
    "graphic designer",
  ];

  const cycleElement = document.querySelector('.cycle');
  let currentIndex = 1;

  function updateCycleText() {
    cycleElement.style.opacity = '0';
    setTimeout(() => {
      cycleElement.textContent = funFacts[currentIndex];
      cycleElement.style.opacity = '1';
      currentIndex = (currentIndex + 1) % funFacts.length;
    }, 400);
  }

  cycleElement.textContent = funFacts[0];
  cycleElement.style.opacity = '1';
  
  setInterval(updateCycleText, 2500);

  const randomPhotosContainer = document.getElementById("random-photos");
  const totalPhotos = 5;
  const safeMargin = 40;
  const activePhotos = new Set();

  function createPhotoElement() {
    const photo = document.createElement("img");
    photo.classList.add("random-photo");
    const photoNumber = Math.floor(Math.random() * totalPhotos) + 1;
    photo.src = `images/${photoNumber}.png`;
    return photo;
  }

  function isOverlapping(x, y, width, height) {
    for (const photo of activePhotos) {
      const rect = photo.getBoundingClientRect();
      if (
        x < rect.right + 20 &&
        x + width + 20 > rect.left &&
        y < rect.bottom + 20 &&
        y + height + 20 > rect.top
      ) {
        return true;
      }
    }
    return false;
  }

  function spawnRandomPhoto() {
    const photo = createPhotoElement();
    
    const mainDiv = document.getElementById('main');
    const mainRect = mainDiv.getBoundingClientRect();
    
    const areas = [
      {
        x: safeMargin,
        y: safeMargin,
        width: window.innerWidth - (safeMargin * 2),
        height: mainRect.top - (safeMargin * 2)
      },
      {
        x: safeMargin,
        y: mainRect.bottom + safeMargin,
        width: window.innerWidth - (safeMargin * 2),
        height: window.innerHeight - mainRect.bottom - (safeMargin * 2)
      },
      {
        x: safeMargin,
        y: mainRect.top,
        width: mainRect.left - (safeMargin * 2),
        height: mainRect.height
      },
      {
        x: mainRect.right + safeMargin,
        y: mainRect.top,
        width: window.innerWidth - mainRect.right - (safeMargin * 2),
        height: mainRect.height
      }
    ];

    const validAreas = areas.filter(area => area.width > 150 && area.height > 150);
    
    let xPos, yPos;
    let attempts = 0;
    const maxAttempts = 50;

    if (validAreas.length === 0) {
      do {
        xPos = safeMargin + Math.random() * (window.innerWidth - 150 - safeMargin * 2);
        yPos = safeMargin + Math.random() * (window.innerHeight - 150 - safeMargin * 2);
        attempts++;
      } while (isOverlapping(xPos, yPos, 150, 150) && attempts < maxAttempts);
    } else {
      const area = validAreas[Math.floor(Math.random() * validAreas.length)];
      do {
        xPos = area.x + Math.random() * (area.width - 150);
        yPos = area.y + Math.random() * (area.height - 150);
        attempts++;
      } while (isOverlapping(xPos, yPos, 150, 150) && attempts < maxAttempts);
    }

    if (attempts >= maxAttempts) {
      return;
    }
    
    const rotation = Math.random() * 30 - 15;
    photo.style.transform = `rotate(${rotation}deg)`;
    photo.style.left = `${xPos}px`;
    photo.style.top = `${yPos}px`;
    
    randomPhotosContainer.appendChild(photo);
    activePhotos.add(photo);
    
    requestAnimationFrame(() => {
      photo.classList.add("visible");
    });

    setTimeout(() => {
      photo.classList.add("fading");
      setTimeout(() => {
        photo.remove();
        activePhotos.delete(photo);
      }, 300);
    }, 3000);
  }

  const mysteryButton = document.getElementById("mystery-button");
  mysteryButton.addEventListener("click", () => {
    spawnRandomPhoto();
  });
});

function copyEmail(event) {
  event.preventDefault();
  const email = "chiki.monk3y@gmail.com";
  navigator.clipboard.writeText(email);
  
  const emailIcon = document.querySelector('.email-icon');
  const checkIcon = document.querySelector('.check-icon');
  
  // Hide email icon and show check icon
  emailIcon.style.display = 'none';
  checkIcon.style.display = 'inline-block';
  
  // Reset back to email icon after 1.5 seconds
  setTimeout(() => {
    emailIcon.style.display = 'inline-block';
    checkIcon.style.display = 'none';
  }, 1500);
}
