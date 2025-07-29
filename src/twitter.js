function start() {
    const divs = document.querySelectorAll(
        ".css-175oi2r.r-1awozwy.r-18u37iz.r-1cmwbt1.r-1wtj0ep"
    );

    const posts = document.querySelectorAll(
        "div.css-175oi2r.r-eqz5dr.r-16y2uox.r-1wbh5a2"
    );

    posts.forEach((post) => {
        const spans = post.querySelectorAll("span");
        if (spans) {
            spans.forEach((span) => {
                if (span.innerText == "Thadeu Alves") {
                    post.style.display = "none";
                } else {
                    //console.log(false);
                }
            });
        }
    });

    divs.forEach((div) => {
        const span = div.querySelectorAll("span")[0];
        if (span) {
            span.innerText = "Thadeu Alves";
        }
    });
}

function loop() {
    setTimeout(() => {
        start();
        loop();
    }, 200);
}

loop();
