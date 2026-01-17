const api = "https://api-class-o1lo.onrender.com/api/damvt";
const loginForm = document.getElementById("login-form");
const registerForm = document.getElementById("register-form");
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

async function register(name, email, password) {
  try {
    if (!name || name.trim().length <= 3) {
      alert("Tên người dùng không được để trống và phải trên 3 ký tự");
      return;
    }

    if (!email || !email.trim()) {
      alert("Email không được để trống");
      return;
    }

    if (!EMAIL_REGEX.test(email)) {
      alert("Email không hợp lệ");
      return;
    }
    if (!password || password.trim().length <= 6) {
      alert("password không được để trống và phải lớn hơn 6 ký tự");
      return;
    }

    await axios.post(`${api}/auth/register`, { name, email, password });
    alert("Đăng ký thành công");
    window.location.href = "login.html";
  } catch (error) {
    console.log(error);
    alert(error.response.data.message || error.message);
  }
}
async function login(email, password) {
  try {
    const { data } = await axios.post(`${api}/auth/login`, {
      email,
      password,
    });
    localStorage.setItem("user", JSON.stringify(data.data));
    alert("Đăng nhập thành công");
    window.location.href = "/index.html";
  } catch (error) {
    console.log(error);
    alert(error.response?.data?.message || error.message);
  }
}
if (registerForm) {
  registerForm.addEventListener("submit", async function (e) {
    e.preventDefault();

    const registerData = new FormData(registerForm);
    const payload = Object.fromEntries(registerData.entries());
    const { name, email, password } = payload;
    register(name, email, password);
  });
}
if (loginForm) {
  loginForm.addEventListener("submit", async function (e) {
    e.preventDefault();
    const loginData = new FormData(loginForm);
    const payload = Object.fromEntries(loginData.entries());
    const { email, password } = payload;
    login(email, password);
  });
}
