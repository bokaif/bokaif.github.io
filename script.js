const letters = "abcdefghijklmnopqrstuvwxyz";

let interval = null;

// document.querySelector(".deciph").onmouseover = event => {  
//   let iteration = 0;
  
//   clearInterval(interval);
  
//   interval = setInterval(() => {
//     event.target.innerText = event.target.innerText
//       .split("")
//       .map((letter, index) => {
//         if(index < iteration) {
//           return event.target.dataset.value[index];
//         }
//         return letters[Math.floor(Math.random() * 26)]
//       })
//       .join("");
    
//     if(iteration >= event.target.dataset.value.length){ 
//       clearInterval(interval);
//     }
    
//     iteration += 1 / 3;
//   }, 30);
// }


const blob = document.getElementById("blob");

window.onpointermove = event => { 
  const { clientX, clientY } = event;
  
  blob.animate({
    left: `${clientX}px`,
    top: `${clientY}px`
  }, { duration: 500, fill: "forwards" });
}


// smooth scrolling START

const links = document.querySelectorAll('a[href^="#"]');
links.forEach((link) => {
    link.addEventListener('click', function (e) {
        e.preventDefault();
        const targetId = this.getAttribute('href').substring(1);
        const targetSection = document.getElementById(targetId);

        if (targetSection) {
            window.scrollTo({
                top: targetSection.offsetTop,
                behavior: 'smooth',
            });
        }
    });
});

// smooth scrolling END

