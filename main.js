if ($(window).width() < 825) {
    $("nav").hide();
}

let open = false;
$(".hamburger").click(function () {
    if (!open) {
        $(".hamburger").addClass("open");
        $("nav").show();
        open = true;
    } else {
        $(".hamburger").removeClass("open");
        $("nav").hide();
        open = false;
    }
});
window.addEventListener('resize', () => {
    let vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
    if (($(window).width() >= 825) && !($("nav").is(":visible"))) {
        $("nav").show();
    }
    if (($(window).width() < 825) && ($("nav").is(":visible"))) {
        if (open) {
            $("nav").show();                    
        }
        else {
            $("nav").hide();
        }
    }
});