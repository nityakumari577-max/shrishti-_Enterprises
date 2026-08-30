const params = new URLSearchParams(window.location.search);
const category = params.get("category");

if (category) {
    document.getElementById("categoryTitle").innerText = category;
}