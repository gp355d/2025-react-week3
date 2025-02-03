import { useState } from "react";
import axios from "axios";
const BASE_URL = import.meta.env.VITE_BASE_URL;
// const API_PATH = import.meta.env.VITE_API_PATH;

// const [isAuth, setIsAuth] = useState(false);
// const checkUserLogin = async () => {
//   try {
//     await axios.post(`${BASE_URL}/v2/api/user/check`);
//     getProducts();
//     setIsAuth(true);
//   } catch (error) {
//     console.error(error);
//   }
// };
function LoginPage({getProducts}) {
  const [account, setAccount] = useState({
    username: "example@test.com",
    password: "example",
  });
  const handleInputChange = (e) => {
    const { value, name } = e.target;
  
    setAccount({
      ...account,
      [name]: value,
    });
  };
  const handleLogin = async (e) => {
    e.preventDefault();
  
    try {
      const res = await axios.post(`${BASE_URL}/v2/admin/signin`, account);
  
      const { token, expired } = res.data;
      document.cookie = `hexToken=${token}; expires=${new Date(expired)}`;
  
      axios.defaults.headers.common["Authorization"] = token;
  
      getProducts();
  
      setIsAuth(true);
    } catch (error) {
      alert("登入失敗");
    }
  };
  // const [products, setProducts] = useState([]);
  // const [tempProduct, setTempProduct] = useState({defaultModalState});
  // const [pageInfo, setTempPageInfo] = useState({});
  return (
    <div className="d-flex flex-column justify-content-center align-items-center vh-100">
    <h1 className="mb-5">請先登入</h1>
    <form onSubmit={handleLogin} className="d-flex flex-column gap-3">
      <div className="form-floating mb-3">
        <input
          name="username"
          value={account.username}
          onChange={handleInputChange}
          type="email"
          className="form-control"
          id="username"
          placeholder="name@example.com"
        />
        <label htmlFor="username">Email address</label>
      </div>
      <div className="form-floating">
        <input
          name="password"
          value={account.password}
          onChange={handleInputChange}
          type="password"
          className="form-control"
          id="password"
          placeholder="Password"
        />
        <label htmlFor="password">Password</label>
      </div>
      <button className="btn btn-primary">登入</button>
    </form>
    <p className="mt-5 mb-3 text-muted">&copy; 2024~∞ - 六角學院</p>
  </div>
  )
}
export default LoginPage;