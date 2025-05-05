document.addEventListener("DOMContentLoaded", () => {
  // Initialize grain background
  const options = {
    animate: true,
    patternWidth: 150,
    patternHeight: 150,
    grainOpacity: 0.35,
    grainDensity: 2.49,
    grainWidth: 1,
    grainHeight: 1,
  };
  grained("#background", options);

  // GSAP initial setup
  gsap.set("#background", {
    scale: 0,
    borderRadius: "50%",
    xPercent: -50,
    yPercent: -50,
    top: "50%",
    left: "50%",
    position: "absolute",
  });
  gsap.set("#bokaif_img", { opacity: 0, yPercent: 50 });

  // GSAP timeline
  gsap
    .timeline()
    .to("#background", {
      scale: 1,
      borderRadius: "50px",
      duration: 1,
      ease: "power2.out",
    })
    .to(
      "#bokaif_img",
      {
        yPercent: 0,
        opacity: 1,
        duration: 0.5,
        ease: "power2.out",
      },
      "-=0.5"
    );

  // Removed all word spawning logic

  // Smooth scrolling
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
});
