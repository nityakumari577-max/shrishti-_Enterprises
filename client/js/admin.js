// ==========================================
// ADMIN LOGIN
// ==========================================

const loginForm = document.getElementById("loginForm");

if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const username = document.getElementById("username").value;
        const password = document.getElementById("password").value;
        const message = document.getElementById("message");

        try {
            const response = await fetch(
                "https://shrishti-enterprises.onrender.com/api/admin/login",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        username,
                        password
                    })
                }
            );

            const data = await response.json();

            if (!response.ok) {
                message.innerText = data.message;
                return;
            }

            // Save JWT
            localStorage.setItem("adminToken", data.token);
            localStorage.setItem("adminUsername", username);

            // Open dashboard
            window.location.href = "admin-dashboard.html";
        } catch (error) {
            console.error(error);
            message.innerText = "Unable to connect to server";
        }
    });
}


// ==========================================
// ADMIN DASHBOARD
// ==========================================

const token = localStorage.getItem("adminToken");


// ==========================================
// PROTECT DASHBOARD
// ==========================================

if (document.getElementById("productGrid") && !token) {
    window.location.href = "admin-login.html";
}


// ==========================================
// TOGGLE ALL PRODUCTS VISIBILITY
// ==========================================

function toggleAllProducts(e) {
    if (e) e.preventDefault();

    const wrapper = document.getElementById("allProductsWrapper") || document.querySelector(".products-section");
    const link = document.getElementById("toggleProductsLink");

    if (!wrapper) return;

    if (wrapper.style.display === "none" || wrapper.style.display === "") {
        wrapper.style.display = "block";
        if (link) link.innerText = "Hide all products";
    } else {
        wrapper.style.display = "none";
        if (link) link.innerText = "See all products";
    }
}


// ==========================================
// GET ALL EQUIPMENT
// ==========================================

async function loadEquipment() {
    try {
        const response = await fetch(
            "https://shrishti-enterprises.onrender.com/api/equipment"
        );

        const equipment = await response.json();

        const productGrid = document.getElementById("productGrid");
        const totalProducts = document.getElementById("totalProducts");

        if (!productGrid) {
            return;
        }

        if (totalProducts) {
            totalProducts.innerText = equipment.length;
        }
        
        productGrid.innerHTML = "";

        equipment.forEach(product => {
            const card = document.createElement("div");
            card.className = "product-card";

            card.innerHTML = `
                <img src="${product.image}" alt="${product.name}">
                <div class="product-info">
                    <h3>${product.name}</h3>
                    <p><strong>Category:</strong> ${product.category}</p>
                    <p><strong>Price:</strong> ${product.price}</p>
                    <p>${product.description}</p>
                    <div class="actions">
                        <button class="edit-btn" onclick="editEquipment('${product._id}')">Edit</button>
                        <button class="delete-btn" onclick="deleteEquipment('${product._id}')">Delete</button>
                    </div>
                </div>
            `;

            productGrid.appendChild(card);
        });
    } catch (error) {
        console.error("Failed to load equipment:", error);
    }
}


// ==========================================
// ADD EQUIPMENT
// ==========================================

const addProductForm = document.getElementById("addProductForm");

if (addProductForm) {
    addProductForm.addEventListener("submit", async function (e) {
        e.preventDefault();

        const name = document.getElementById("name").value;
        const category = document.getElementById("category").value;
        const description = document.getElementById("description").value;
        const price = document.getElementById("price").value;
        const imageInput = document.getElementById("image");
        const image = imageInput.files[0];

        if (!image) {
            document.getElementById("message").innerText = "Please select an image.";
            return;
        }

        const formData = new FormData();
        formData.append("name", name);
        formData.append("category", category);
        formData.append("description", description);
        formData.append("price", price);
        formData.append("image", image);

        try {
            const response = await fetch(
                "https://shrishti-enterprises.onrender.com/api/equipment",
                {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${token}`
                    },
                    body: formData
                }
            );

            const data = await response.json();

            if (!response.ok) {
                document.getElementById("message").innerText =
                    data.message || "Failed to add product";
                return;
            }

            document.getElementById("message").innerText =
                "Product added successfully!";

            addProductForm.reset();
            loadEquipment();
        } catch (error) {
            console.error("Add product error:", error);
            document.getElementById("message").innerText =
                "Failed to connect to server";
        }
    });
}


// ==========================================
// DELETE EQUIPMENT
// ==========================================

async function deleteEquipment(id) {
    const confirmDelete = confirm("Are you sure you want to delete this product?");

    if (!confirmDelete) {
        return;
    }

    try {
        const response = await fetch(
            `https://shrishti-enterprises.onrender.com/api/equipment/${id}`,
            {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

        const data = await response.json();

        if (!response.ok) {
            alert(data.message || "Failed to delete product");
            return;
        }

        alert("Product deleted successfully");
        loadEquipment();
    } catch (error) {
        console.error("Delete error:", error);
        alert("Failed to connect to server");
    }
}


// ==========================================
// EDIT EQUIPMENT
// ==========================================

async function editEquipment(id) {
    try {
        const response = await fetch(
            `https://shrishti-enterprises.onrender.com/api/equipment/${id}`
        );

        const product = await response.json();

        if (!response.ok) {
            alert(product.message || "Failed to fetch product");
            return;
        }

        // Hide Add section, Products wrapper, and Toggle link
        const addSection = document.getElementById("addSection") || document.getElementById("addProductForm")?.closest("section");
        const productsWrapper = document.getElementById("allProductsWrapper") || document.querySelector(".products-section");
        const toggleLink = document.getElementById("toggleProductsLink");

        if (addSection) addSection.style.display = "none";
        if (productsWrapper) productsWrapper.style.display = "none";
        if (toggleLink) toggleLink.style.display = "none";

        // Populate form fields
        document.getElementById("editId").value = product._id;
        document.getElementById("editName").value = product.name;
        document.getElementById("editCategory").value = product.category;
        document.getElementById("editDescription").value = product.description;
        document.getElementById("editPrice").value = product.price;
        document.getElementById("editImage").value = "";

        // Display edit section
        const editSection = document.getElementById("editSection");
        if (editSection) {
            editSection.style.display = "block";
            editSection.scrollIntoView({ behavior: "smooth" });
        }

    } catch (error) {
        console.error("Edit product error:", error);
        alert("Failed to connect to server");
    }
}

const editProductForm = document.getElementById("editProductForm");

if (editProductForm) {
    editProductForm.addEventListener("submit", async function (e) {
        e.preventDefault();

        const id = document.getElementById("editId").value;
        const name = document.getElementById("editName").value;
        const category = document.getElementById("editCategory").value;
        const description = document.getElementById("editDescription").value;
        const price = document.getElementById("editPrice").value;
        const imageInput = document.getElementById("editImage");

        const formData = new FormData();
        formData.append("name", name);
        formData.append("category", category);
        formData.append("description", description);
        formData.append("price", price);

        if (imageInput.files.length > 0) {
            formData.append("image", imageInput.files[0]);
        }

        try {
            const response = await fetch(
                `https://shrishti-enterprises.onrender.com/api/equipment/${id}`,
                {
                    method: "PUT",
                    headers: {
                        Authorization: `Bearer ${token}`
                    },
                    body: formData
                }
            );

            const data = await response.json();

            if (!response.ok) {
                document.getElementById("editMessage").innerText =
                    data.message || "Failed to update product";
                return;
            }

            document.getElementById("editMessage").innerText =
                "Product updated successfully!";

            cancelEdit();
            loadEquipment();

        } catch (error) {
            console.error("Update product error:", error);
            document.getElementById("editMessage").innerText =
                "Failed to connect to server";
        }
    });
}

function cancelEdit() {
    const editSection = document.getElementById("editSection");
    const editForm = document.getElementById("editProductForm");

    if (editForm) editForm.reset();
    if (editSection) editSection.style.display = "none";

    // Restore Add section and Toggle link
    const addSection = document.getElementById("addSection") || document.getElementById("addProductForm")?.closest("section");
    const toggleLink = document.getElementById("toggleProductsLink");

    if (addSection) addSection.style.display = "block";
    if (toggleLink) toggleLink.style.display = "inline-block";
}


// ==========================================
// LOGOUT
// ==========================================

function logout() {
    localStorage.removeItem("adminToken");
    window.location.href = "admin-login.html";
}


// ==========================================
// LOAD PRODUCTS INITIALIZATION
// ==========================================

if (document.getElementById("productGrid") && token) {
    loadEquipment();
}