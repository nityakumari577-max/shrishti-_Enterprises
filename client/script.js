const params = new URLSearchParams(window.location.search);
const category = params.get("category");

if (category) {
    document.getElementById("categoryTitle").innerText = category;
} 
const currentPage =
        window.location.pathname.split("/").pop() || "index.html";

    const navLinks =
        document.querySelectorAll("nav ul li a");

    navLinks.forEach(link => {

        const href = link.getAttribute("href");

        // Home
        if (
            href === "#Home" &&
            (currentPage === "" || currentPage === "index.html")
        ) {
            link.classList.add("active");
        }

        // Other pages
        else if (
            href &&
            !href.startsWith("#") &&
            href === currentPage
        ) {
            link.classList.add("active");
        }

    });
