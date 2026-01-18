const api = "https://api-class-o1lo.onrender.com/api/damvt";
const user = localStorage.getItem("user");
if (!user) {
  alert("Vui lòng đăng nhập để tiếp tục");
  window.location.href = "./auth/login.html";
}
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

async function login(email, password) {
  try {
    const { data } = await axios.post(`${api}/auth/login`, { email, password });
    localStorage.setItem("user", JSON.stringify(data.data));
    alert("Đăng nhập thành công");
  } catch (error) {
    console.log(error);
    alert(error.response.data.message || error.message);
  }
}

async function register(email, password) {
  try {
    await axios.post(`${api}/auth/register`, { email, password });
    alert("Đăng ký thành công");
  } catch (error) {
    console.log(error);
    alert(error.response.data.message || error.message);
  }
}
const logoutBtn = document.getElementById("logout-btn");

if (logoutBtn) {
  logoutBtn.addEventListener("click", () => {
    localStorage.removeItem("user");
    window.location.href = "../auth/login.html";
  });
}
//*index
// hiện ra màn hình
let transactions = [];
let editingId = null;

let filteredTransactions = [];

async function loadTransactions() {
  try {
    const res = await axios.get(`${api}/transactions`);
    transactions = res.data.data;
    render();
  } catch (error) {
    console.log(error);
    alert("Không lấy được danh sách");
  }
}

loadTransactions();
function render() {
  const list = document.getElementById("list");

  list.innerHTML = transactions
    .map(
      (t) => `
      <tr>
        <td>${t.name}</td>
        <td>${t.amount}</td>
        <td>${t.type}</td>
        <td>${t.category}</td>
        <td>${t.date}</td>
        <td>
          <button onclick="editTransaction('${t._id}')">Sửa</button>
        </td>
        <td>
          <button onclick="deleteTransaction('${t._id}')">X</button>
        </td>
         
      </tr>
    `,
    )
    .join("");
  renderSummary();
}

//end hiện ra màn hình
//start thêm
const transactionForm = document.getElementById("transactionForm");

transactionForm.addEventListener("submit", async function (e) {
  e.preventDefault();

  const error = document.getElementById("error");
  const formData = new FormData(transactionForm);

  const payload = {
    name: formData.get("name").trim(),
    amount: +formData.get("amount"),
    type: formData.get("type"),
    category: formData.get("category"),
    date: formData.get("date"),
  };

  if (!payload.name) {
    alert("Vui lòng nhập đầy đủ tên");
    return;
  }
  if (payload.amount <= 0) {
    alert("Vui lòng nhập giá");
    return;
  }
  if (!payload.date) {
    alert("Vui lòng nhập đầy đủ ngày");
    return;
  }

  error.innerText = "";

  try {
    await axios.post(`${api}/transactions`, payload);
    alert("Thêm giao dịch thành công");
    this.reset();
  } catch (err) {
    console.log(err);
    alert("Thêm giao dịch thất bại");
  }
  loadTransactions();
});
//end thêm
//start sửa
function editTransaction(id) {
  const transaction = transactions.find((t) => t._id === id);
  if (!transaction) return;

  editingId = id;

  const form = document.getElementById("editForm");
  form.name.value = transaction.name;
  form.amount.value = transaction.amount;
  form.type.value = transaction.type;
  form.category.value = transaction.category;
  form.date.value = transaction.date;

  document.getElementById("editModal").classList.add("show");
}
const editForm = document.getElementById("editForm");
editForm.addEventListener("submit", async function (e) {
  e.preventDefault();

  const error = document.getElementById("editError");
  const formData = new FormData(editForm);

  const payload = {
    name: formData.get("name").trim(),
    amount: +formData.get("amount"),
    type: formData.get("type"),
    category: formData.get("category"),
    date: formData.get("date"),
  };

  if (!payload.name || payload.amount <= 0 || !payload.date) {
    error.innerText = "Vui lòng nhập đầy đủ và hợp lệ";
    return;
  }

  try {
    await axios.put(`${api}/transactions/${editingId}`, payload);
    alert("Cập nhật thành công");
    closeEditModal();
    loadTransactions();
  } catch (err) {
    alert("Cập nhật thất bại");
  }
});
function closeEditModal() {
  document.getElementById("editModal").classList.remove("show");
  document.getElementById("editForm").reset();
  editingId = null;
}
//end
function renderSummary() {
  let totalThu = 0;
  let totalChi = 0;

  transactions.forEach((t) => {
    if (t.type === "thu") {
      totalThu += Number(t.amount);
    } else if (t.type === "chi") {
      totalChi += Number(t.amount);
    }
  });

  document.getElementById("totalThu").innerText = totalThu.toLocaleString();

  document.getElementById("totalChi").innerText = totalChi.toLocaleString();

  document.getElementById("balance").innerText = (
    totalThu - totalChi
  ).toLocaleString();
}
function searchByName() {
  const keyword = document
    .getElementById("searchKeyword")
    .value.trim()
    .toLowerCase();

  if (!keyword) {
    render();
    return;
  }

  const filtered = transactions.filter((t) =>
    t.name.toLowerCase().includes(keyword),
  );

  renderFiltered(filtered);
}
function renderFiltered(data) {
  const list = document.getElementById("list");

  list.innerHTML = data
    .map(
      (t) => `
      <tr>
        <td>${t.name}</td>
        <td>${t.amount}</td>
        <td>${t.type}</td>
        <td>${t.category}</td>
        <td>${t.date}</td>
        <td>
          <button onclick="editTransaction('${t._id}')">Sửa</button>
        </td>
        <td>
          <button onclick="deleteTransaction('${t._id}')">X</button>
        </td>
      </tr>
    `,
    )
    .join("");
}
function resetSearch() {
  document.getElementById("searchKeyword").value = "";
  render();
}
function filterTransactions() {
  const category = document.getElementById("filterCategory").value;

  if (!category) {
    render();
    return;
  }

  const filtered = transactions.filter((t) => t.category === category);

  renderFiltered(filtered);
}
function resetFilter() {
  document.getElementById("filterCategory").value = "";
  render();
}

// delete
async function deleteTransaction(id) {
  const confirmDelete = confirm("Bạn có chắc muốn xóa không?");
  if (!confirmDelete) return;

  try {
    await axios.delete(`${api}/transactions/${id}`);
    alert("Xóa thành công");
    loadTransactions();
  } catch (error) {
    console.log(error);
    alert("Xóa thất bại");
  }
}
