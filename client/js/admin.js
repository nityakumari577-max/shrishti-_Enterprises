// ==========================================
// ADMIN LOGIN
// ==========================================

const loginForm = document.getElementById("loginForm");

if (loginForm) {

    loginForm.addEventListener("submit", async (e) => {

        e.preventDefault();

        const username =
            document.getElementById("username").value;

        const password =
            document.getElementById("password").value;

        const message =
            document.getElementById("message");

        try {

            const response = await fetch(
                "https://shrishti-enterprises.onrender.com/api/equipment",
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
            localStorage.setItem(
                "adminToken",
                data.token
            );

            // Open dashboard
            window.location.href =
                "admin-dashboard.html";

        } catch (error) {

            console.error(error);

            message.innerText =
                "Unable to connect to server";

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

if (
    document.getElementById("productGrid") &&
    !token
) {

    window.location.href =
        "admin-login.html";

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

        const productGrid =
            document.getElementById("productGrid");

        const totalProducts =
            document.getElementById("totalProducts");

        if (!productGrid) {
            return;
        }

        totalProducts.innerText =
            equipment.length;

        productGrid.innerHTML = "";

        equipment.forEach(product => {

            const card =
                document.createElement("div");

            card.className =
                "product-card";

            card.innerHTML = `
                <img
                    src="${product.image}"
                    alt="${product.name}"
                >

                <div class="product-info">

                    <h3>${product.name}</h3>

                    <p>
                        <strong>Category:</strong>
                        ${product.category}
                    </p>

                    <p>
                        <strong>Price:</strong>
                        ${product.price}
                    </p>

                    <p>
                        ${product.description}
                    </p>

                    <div class="actions">

                        <button
                            class="edit-btn"
                            onclick="editEquipment('${product._id}')"
                        >
                            Edit
                        </button>

                        <button
                            class="delete-btn"
                            onclick="deleteEquipment('${product._id}')"
                        >
                            Delete
                        </button>

                    </div>

                </div>
            `;

            productGrid.appendChild(card);

        });

    } catch (error) {

        console.error(
            "Failed to load equipment:",
            error
        );

    }

}


// ==========================================
// ADD EQUIPMENT
// ==========================================

const addProductForm =
    document.getElementById("addProductForm");

if (addProductForm) {

    addProductForm.addEventListener(
        "submit",
        async function (e) {

            e.preventDefault();

            const name =
                document.getElementById("name").value;

            const category =
                document.getElementById("category").value;

            const description =
                document.getElementById("description").value;

            const price =
                document.getElementById("price").value;

            const imageInput =
                document.getElementById("image");

            const image =
                imageInput.files[0];

            if (!image) {

                document.getElementById("message")
                    .innerText =
                    "Please select an image.";

                return;

            }

            const formData =
                new FormData();

            formData.append(
                "name",
                name
            );

            formData.append(
                "category",
                category
            );

            formData.append(
                "description",
                description
            );

            formData.append(
                "price",
                price
            );

            formData.append(
                "image",
                image
            );

            try {

                const response = await fetch(
                    "https://shrishti-enterprises.onrender.com/api/equipment",
                    {
                        method: "POST",

                        headers: {
                            Authorization:
                                `Bearer ${token}`
                        },

                        body: formData
                    }
                );

                const data =
                    await response.json();

                if (!response.ok) {

                    document.getElementById(
                        "message"
                    ).innerText =
                        data.message ||
                        "Failed to add product";

                    return;

                }

                document.getElementById(
                    "message"
                ).innerText =
                    "Product added successfully!";

                addProductForm.reset();

                loadEquipment();

            } catch (error) {

                console.error(
                    "Add product error:",
                    error
                );

                document.getElementById(
                    "message"
                ).innerText =
                    "Failed to connect to server";

            }

        }
    );

}


// ==========================================
// DELETE EQUIPMENT
// ==========================================

async function deleteEquipment(id) {

    const confirmDelete =
        confirm(
            "Are you sure you want to delete this product?"
        );

    if (!confirmDelete) {
        return;
    }

    try {

        const response = await fetch(
            `https://shrishti-enterprises.onrender.com/api/equipment/${id}`,
            {
                method: "DELETE",

                headers: {
                    Authorization:
                        `Bearer ${token}`
                }
            }
        );

        const data =
            await response.json();

        if (!response.ok) {

            alert(
                data.message ||
                "Failed to delete product"
            );

            return;

        }

        alert(
            "Product deleted successfully"
        );

        loadEquipment();

    } catch (error) {

        console.error(
            "Delete error:",
            error
        );

        alert(
            "Failed to connect to server"
        );

    }

}


// ==========================================
// EDIT EQUIPMENT
// 
async function editEquipment(id) {

    try {

        const response = await fetch(
            `https://shrishti-enterprises.onrender.com/api/equipment/${id}`
        );

        const product = await response.json();

        if (!response.ok) {

            alert(
                product.message ||
                "Failed to fetch product"
            );

            return;
        }

        document.getElementById("editId").value =
            product._id;

        document.getElementById("editName").value =
            product.name;

        document.getElementById("editCategory").value =
            product.category;

        document.getElementById("editDescription").value =
            product.description;

        document.getElementById("editPrice").value =
            product.price;

        document.getElementById("editImage").value = "";

        document.getElementById("editSection").style.display =
            "block";

        document.getElementById("editSection").scrollIntoView({
            behavior: "smooth"
        });

    } catch (error) {

        console.error(
            "Edit product error:",
            error
        );

        alert(
            "Failed to connect to server"
        );

    }
}
const editProductForm =
    document.getElementById("editProductForm");

if (editProductForm) {

    editProductForm.addEventListener(
        "submit",
        async function (e) {

            e.preventDefault();

            const id =
                document.getElementById("editId").value;

            const name =
                document.getElementById("editName").value;

            const category =
                document.getElementById("editCategory").value;

            const description =
                document.getElementById("editDescription").value;

            const price =
                document.getElementById("editPrice").value;

            const imageInput =
                document.getElementById("editImage");

            const formData =
                new FormData();

            formData.append(
                "name",
                name
            );

            formData.append(
                "category",
                category
            );

            formData.append(
                "description",
                description
            );

            formData.append(
                "price",
                price
            );

            if (imageInput.files.length > 0) {

                formData.append(
                    "image",
                    imageInput.files[0]
                );

            }

            try {

                const response = await fetch(
                    `https://shrishti-enterprises.onrender.com/api/equipment/${id}`,
                    {
                        method: "PUT",

                        headers: {
                            Authorization:
                                `Bearer ${token}`
                        },

                        body: formData
                    }
                );

                const data =
                    await response.json();

                if (!response.ok) {

                    document.getElementById(
                        "editMessage"
                    ).innerText =
                        data.message ||
                        "Failed to update product";

                    return;
                }

                document.getElementById(
                    "editMessage"
                ).innerText =
                    "Product updated successfully!";

                editProductForm.reset();

                document.getElementById(
                    "editSection"
                ).style.display = "none";

                loadEquipment();

            } catch (error) {

                console.error(
                    "Update product error:",
                    error
                );

                document.getElementById(
                    "editMessage"
                ).innerText =
                    "Failed to connect to server";

            }

        }
    );

}
function cancelEdit() {

    const editSection =
        document.getElementById("editSection");

    const editForm =
        document.getElementById("editProductForm");

    editForm.reset();

    editSection.style.display =
        "none";

}

// ==========================================
// LOGOUT
// ==========================================

function logout() {

    localStorage.removeItem(
        "adminToken"
    );

    window.location.href =
        "admin-login.html";

}


// ==========================================
// LOAD PRODUCTS
// ==========================================

if (
    document.getElementById("productGrid") &&
    token
) {

    loadEquipment();

}