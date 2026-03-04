// 🔗 Backend Google Apps Script URL
const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbw5-X-81fl-qp98jK1eLLWcoGyQ0ZZQmZpIJ662FRkLOwpk0uGC5JmgioUwnNGrJG6FBw/exec";

// 🖼 ImgBB API Key
const IMGBB_API_KEY = "11e0467cc3073fc5382dd6ca0aac3ef5"; // ⚠ Replace this with your real API key

// ===============================
// 🚀 Submit Form Data
// ===============================
async function submitForm() {
  const name = document.getElementById("name").value.trim();
  const item = document.getElementById("item").value.trim();
  const type = document.getElementById("type").value;
  const description = document.getElementById("description").value.trim();
  const contact = document.getElementById("contact").value.trim();
  const imageFile = document.getElementById("imageFile").files[0];

  if (!name || !item || !type || !description || !contact || !imageFile) {
    alert("Please fill all fields and select an image!");
    return;
  }

  try {
    // 🔄 Show loading cursor
    document.body.style.cursor = "wait";

    // ===============================
    // 📤 Upload image to ImgBB
    // ===============================
    const formData = new FormData();
    formData.append("image", imageFile);

    const uploadResponse = await fetch(
      `https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`,
      {
        method: "POST",
        body: formData
      }
    );

    const uploadData = await uploadResponse.json();

    if (!uploadData.success) {
      throw new Error(uploadData.error?.message || "Image upload failed");
    }

    const imageURL = uploadData.data.url;

    // ===============================
    // 📩 Send sheet data to Apps Script
    // ===============================
    const data = {
      name,
      item,
      type,
      description,
      contact,
      imageURL
    };

    const sheetResponse = await fetch(WEB_APP_URL, {
      method: "POST",
      body: JSON.stringify(data)
    });

    const sheetResult = await sheetResponse.json();

    if (sheetResult.status !== "success") {
      throw new Error("Sheet save failed");
    }

    alert("Item submitted successfully!");

    // 👇 add new item visually immediately
    addCard(name, item, type, description, contact, imageURL, new Date().toLocaleString());

    // 🧹 clear form
    document.getElementById("lostForm").reset();

  } catch (error) {
    console.error("Submit Error:", error);
    alert("Error: " + error.message);
  } finally {
    // Reset cursor
    document.body.style.cursor = "default";
  }
}

// ===============================
// 📦 Load Items (from sheet)
// ===============================
async function loadItems() {
  try {
    const response = await fetch(WEB_APP_URL);
    const data = await response.json();

    const container = document.getElementById("itemsContainer");
    container.innerHTML = ""; // clear old items

    // Skip header row (index 0)
    for (let i = data.length - 1; i >= 1; i--) {
      const row = data[i];
      addCard(row[0], row[1], row[2], row[3], row[4], row[5], row[6]);
    }
  } catch (error) {
    console.error("Load Items Error:", error);
  }
}

// ===============================
// 🧱 Create Card Function
// ===============================
function addCard(name, item, type, description, contact, imageURL, date) {
  const container = document.getElementById("itemsContainer");
  const card = document.createElement("div");
  card.className = "card";

  card.innerHTML = `
    <img src="${imageURL}" alt="Item Image">
    <p><b>Name:</b> ${name}</p>
    <p><b>Item:</b> ${item}</p>
    <p><b>Type:</b> ${type}</p>
    <p><b>Description:</b> ${description}</p>
    <p><b>Contact:</b> ${contact}</p>
    <p><b>Date:</b> ${date}</p>
  `;

  container.appendChild(card);
}
function filterItems() {
  const input = document.getElementById("searchInput").value.toLowerCase();
  const cards = document.querySelectorAll(".card");

  cards.forEach(card => {
    const text = card.innerText.toLowerCase();

    if (text.includes(input)) {
      card.style.display = "block";
    } else {
      card.style.display = "none";
    }
  });
}

// ===============================
// 🔄 Auto Load Items on Page Open
// ===============================
window.onload = loadItems;