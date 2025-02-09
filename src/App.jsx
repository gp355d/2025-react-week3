import { useState, useEffect, useRef } from 'react';
import { Modal } from 'bootstrap';

import axios from 'axios';

const BASE_URL = import.meta.env.VITE_BASE_URL;
const API_PATH = import.meta.env.VITE_API_PATH;
//設定預設初始資料狀狀態
const defaultModalState = {
  imageUrl: "",
  title: "",
  category: "",
  unit: "",
  origin_price: "",
  price: "",
  description: "",
  content: "",
  is_enabled: 0,
  imagesUrl: [""]
};

function App() {
  const [isAuth, setIsAuth] = useState(false);//設定驗證初始狀態
  const [products, setProducts] = useState([]);//設定陣列初始狀態
  const [account, setAccount] = useState({//設定預設input會顯示的狀態
    username: "example@test.com",
    password: "example"
  });
  const [modalType, setModalType] = useState("");//設定執行動作的狀態
//取得後台產品資料
  const getProducts = async () => {
    try {
      const response = await axios.get(
        `${BASE_URL}/v2/api/${API_PATH}/admin/products`
      );
      setProducts(response.data.products);
    } catch (err) {
      console.error(err);
    }
  };
//修改input欄位的數值變更
  const handleInputChange = (e) => {
    const { value, name } = e.target;

    setAccount({
      ...account,
      [name]: value
    });
  }
//執行登入API，並儲存至cookie
  const handelLogin = (e) => {
    e.preventDefault();

    axios.post(`${BASE_URL}/v2/admin/signin`, account)
      .then((res) => {
        const {token, expired } = res.data;
        //將Token存到Cookie，並設定過期時間
        document.cookie = `hexToken=${token}; expires=${new Date(expired)}`;
        //所有axios的header加入token(這樣可以不用每個都輸入)
        axios.defaults.headers.common['Authorization'] = token;

        getProducts();

        setIsAuth(true);
      })
      .catch((err) => alert('登入失敗'));
  }
 //驗證登入API
  const checkUserLogin = async () => {
    try {
      await axios.post(`${BASE_URL}/v2/api/user/check`);
      getProducts();
      setIsAuth(true);//轉換狀態已登入
    } catch (error) {
      setIsAuth(false);
      console.error(error);
    }
  }
//初始執行checkUserLogin函式一次
  useEffect(() => {
    //從cookie取得token變數
    const token = document.cookie.replace(
      /(?:(?:^|.*;\s*)hexToken\s*=\s*([^;]*).*$)|^.*$/,
      "$1",
    );
    axios.defaults.headers.common['Authorization'] = token;

    checkUserLogin();
  }, []);

  const productModalRef = useRef(null);//設定產品modal的初始值狀態
  const delProductModalRef = useRef(null);//設定刪除產品modal的初始值狀態
  const [modalMode, setModalMode] = useState(null);//設定預設執行的初始值狀態
//設定modal不能被點擊空白處關閉
  useEffect(() => {
    new Modal(productModalRef.current, {
      backdrop: false
    });

    new Modal(delProductModalRef.current, {
      backdrop: false
    });
  }, []);

  const handleOpenProductModal = (mode, product) => {
    setModalMode(mode);

    if (mode === 'edit') {
      setTempProduct(product);
    } else {
      setTempProduct(defaultModalState);
    }
    //初始化modal
    const modalInstance = Modal.getInstance(productModalRef.current);
    //開啟產品modal
    modalInstance.show();
    setModalType(mode);
  }

  const handleCloseProductModal = () => {
    const modalInstance = Modal.getInstance(productModalRef.current);
    //關閉產品modal
    modalInstance.hide();
  }



  const handleOpenDelProductModal = (product) => {
    setTempProduct(product);
    //初始化modal
    const modalInstance = Modal.getInstance(delProductModalRef.current);
    //開啟刪除產品modal
    modalInstance.show();
  }

  const handleCloseDelProductModal = () => {
    const modalInstance = Modal.getInstance(delProductModalRef.current);
    modalInstance.hide();
  }

  const [tempProduct, setTempProduct] = useState(defaultModalState);//將初始預設資料狀態賦予到tempProduct的狀態
  //Modal表單內部input值的變更
  const handleModalInputChange = (e) => {
    const { value, name, checked, type } = e.target;

    setTempProduct({
      ...tempProduct,
      [name]: type === "checkbox" ? checked : value
    });
  };
  //副圖網址的input欄位，輸入網址可替換圖片
  const handleImageChange = (e, index) => {
    const { value } = e.target;

    const newImages = [...tempProduct.imagesUrl];
    newImages[index] = value;

    setTempProduct({
      ...tempProduct,
      imagesUrl: newImages
    });
  };
  //新增附圖
  const handleAddImage = () => {
    const newImages = [...tempProduct.imagesUrl, ''];

    setTempProduct({
      ...tempProduct,
      imagesUrl: newImages,
    });
  };
  //移除附圖
  const handleRemoveImage = () => {
    const newImages = [...tempProduct.imagesUrl];

    newImages.pop();

    setTempProduct({
      ...tempProduct,
      imagesUrl: newImages,
    });
  };
  //判斷執行行為的為新增或更新的API
  const updateProduct = async (id) => {
    let product;
    if (modalType === "edit") {
      product = `product/${id}`;
    } else {
      product = `product`;
    }
    const url = `${BASE_URL}/v2/api/${API_PATH}/admin/${product}`;
    const productData = {
      data: {
        ...tempProduct,
        origin_price: Number(tempProduct.origin_price),
        price: Number(tempProduct.price),
        is_enabled: tempProduct.is_enabled ? 1 : 0
      }
    }
    try {
      let res;
      if(modalType === 'edit'){
        res = await axios.put(url,productData);
        alert(res.data.message);
      }
      else{
        res = await axios.post(url, productData);
        alert(res.data.message);
      };
      handleCloseProductModal();
      getProducts()
    } catch (error) {
      alert(error.response.data.message);
    }
  }

  const deleteProduct = async (id) => {
    try {
      let res = await axios.delete(`${BASE_URL}/v2/api/${API_PATH}/admin/product/${id}`);
      handleCloseDelProductModal();
      getProducts();
      alert(res.data.message);
    } catch (error) {
      alert("刪除失敗", error.response.data.message);;
    }
  }

  const handleUpdateProduct = async(id) => {
   updateProduct(id);
  }

  const handleDeleteProduct = async (id) => {
    deleteProduct(id);
  }

  return (
    <>
      {isAuth ? (<div className="container py-5">
        <div className="row">
          <div className="col">
            <div className="d-flex justify-content-between">
              <h2>產品列表</h2>
              <button onClick={() => handleOpenProductModal('add')} type="button" className="btn btn-primary">建立新的產品</button>
            </div>
            <table className="table">
              <thead>
                <tr>
                  <th scope="col">產品名稱</th>
                  <th scope="col">原價</th>
                  <th scope="col">售價</th>
                  <th scope="col">是否啟用</th>
                  <th scope="col">操作</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.id}>
                    <th scope="row">{product.title}</th>
                    <td>{product.origin_price}</td>
                    <td>{product.price}</td>
                    <td>{product.is_enabled ? (
                      <span className="text-success">啟用</span>
                    ) : (
                    <span>未啟用</span>
                    )}</td>
                    <td>
                      <div className="btn-group">
                        <button onClick={() => handleOpenProductModal('edit', product)} type="button" className="btn btn-outline-primary btn-sm">編輯</button>
                        <button onClick={() => handleOpenDelProductModal(product)} type="button" className="btn btn-outline-danger btn-sm">刪除</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>) :
      (<div className="d-flex flex-column justify-content-center align-items-center vh-100">
      <h1 className="mb-5">請先登入</h1>
      <form className="d-flex flex-column gap-3">
        <div className="form-floating mb-3">
          <input name="username" type="email" className="form-control" id="username" placeholder="name@example.com" value={account.username} onChange={handleInputChange} />
          <label htmlFor="username">Email address</label>
        </div>
        <div className="form-floating">
          <input name="password" type="password" className="form-control" id="password" placeholder="Password" value={account.password} onChange={handleInputChange} />
          <label htmlFor="password">Password</label>
        </div>
        <button className="btn btn-primary" onClick={handelLogin}>登入</button>
      </form>
      <p className="mt-5 mb-3 text-muted">&copy; 2024~∞ - 六角學院</p>
      </div>
      )}

      <div ref={productModalRef} id="productModal" className="modal" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
        <div className="modal-dialog modal-dialog-centered modal-xl">
          <div className="modal-content border-0 shadow">
            <div className="modal-header border-bottom">
              <h5 className="modal-title fs-4">{modalMode === 'add' ? '新增產品' : '編輯產品'}</h5>
              <button onClick={handleCloseProductModal} type="button" className="btn-close" aria-label="Close"></button>
            </div>

            <div className="modal-body p-4">
              <div className="row g-4">
                <div className="col-md-4">
                  <div className="mb-4">
                    <label htmlFor="primary-image" className="form-label">
                      主圖
                    </label>
                    <div className="input-group">
                      <input
                        value={tempProduct.imageUrl}
                        onChange={handleModalInputChange}
                        name="imageUrl"
                        type="url"
                        id="primary-image"
                        className="form-control"
                        placeholder="請輸入圖片連結"
                      />
                    </div>
                    <img
                      src={tempProduct.imageUrl}
                      alt={tempProduct.title}
                      className="img-fluid"
                    />
                  </div>

                  {/* 副圖 */}
                  <div className="border border-2 border-dashed rounded-3 p-3">
                    {tempProduct.imagesUrl?.map((image, index) => (
                      <div key={index} className="mb-2">
                        <label
                          htmlFor={`imagesUrl-${index + 1}`}
                          className="form-label"
                        >
                          副圖 {index + 1}
                        </label>
                        <input
                          value={image}
                          onChange={(e) => handleImageChange(e, index)}
                          id={`imagesUrl-${index + 1}`}
                          type="url"
                          placeholder={`圖片網址 ${index + 1}`}
                          className="form-control mb-2"
                        />
                        {image && (
                          <img
                            src={image}
                            alt={`副圖 ${index + 1}`}
                            className="img-fluid mb-2"
                          />
                        )}
                      </div>
                    ))}

                    <div className="btn-group w-100">
                      {tempProduct.imagesUrl.length < 5 && tempProduct.imagesUrl[tempProduct.imagesUrl.length - 1] !== '' && (
                        <button onClick={handleAddImage} className="btn btn-outline-primary btn-sm w-100">新增圖片</button>
                      )}

                      {tempProduct.imagesUrl.length > 1 && (
                        <button onClick={handleRemoveImage} className="btn btn-outline-danger btn-sm w-100">取消圖片</button>
                      )}

                    </div>
                  </div>
                </div>

                <div className="col-md-8">
                  <div className="mb-3">
                    <label htmlFor="title" className="form-label">
                      標題
                    </label>
                    <input
                      value={tempProduct.title}
                      onChange={handleModalInputChange}
                      name="title"
                      id="title"
                      type="text"
                      className="form-control"
                      placeholder="請輸入標題"
                    />
                  </div>

                  <div className="mb-3">
                    <label htmlFor="category" className="form-label">
                      分類
                    </label>
                    <input
                      value={tempProduct.category}
                      onChange={handleModalInputChange}
                      name="category"
                      id="category"
                      type="text"
                      className="form-control"
                      placeholder="請輸入分類"
                    />
                  </div>

                  <div className="mb-3">
                    <label htmlFor="unit" className="form-label">
                      單位
                    </label>
                    <input
                      value={tempProduct.unit}
                      onChange={handleModalInputChange}
                      name="unit"
                      id="unit"
                      type="text"
                      className="form-control"
                      placeholder="請輸入單位"
                    />
                  </div>

                  <div className="row g-3 mb-3">
                    <div className="col-6">
                      <label htmlFor="origin_price" className="form-label">
                        原價
                      </label>
                      <input
                        value={tempProduct.origin_price}
                        onChange={handleModalInputChange}
                        name="origin_price"
                        id="origin_price"
                        type="number"
                        className="form-control"
                        placeholder="請輸入原價"
                      />
                    </div>
                    <div className="col-6">
                      <label htmlFor="price" className="form-label">
                        售價
                      </label>
                      <input
                        value={tempProduct.price}
                        onChange={handleModalInputChange}
                        name="price"
                        id="price"
                        type="number"
                        className="form-control"
                        placeholder="請輸入售價"
                      />
                    </div>
                  </div>

                  <div className="mb-3">
                    <label htmlFor="description" className="form-label">
                      產品描述
                    </label>
                    <textarea
                      value={tempProduct.description}
                      onChange={handleModalInputChange}
                      name="description"
                      id="description"
                      className="form-control"
                      rows={4}
                      placeholder="請輸入產品描述"
                    >
                    </textarea>
                  </div>

                  <div className="mb-3">
                    <label htmlFor="content" className="form-label">
                      說明內容
                    </label>
                    <textarea
                      value={tempProduct.content}
                      onChange={handleModalInputChange}
                      name="content"
                      id="content"
                      className="form-control"
                      rows={4}
                      placeholder="請輸入說明內容"
                    ></textarea>
                  </div>

                  <div className="form-check">
                    <input
                      checked={tempProduct.is_enabled}
                      onChange={handleModalInputChange}
                      name="is_enabled"
                      type="checkbox"
                      className="form-check-input"
                      id="isEnabled"
                    />
                    <label className="form-check-label" htmlFor="isEnabled">
                      是否啟用
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-footer border-top bg-light">
              <button onClick={handleCloseProductModal} type="button" className="btn btn-secondary">
                取消
              </button>
              <button onClick={() => handleUpdateProduct(tempProduct.id)} type="button" className="btn btn-primary">
                確認
              </button>
            </div>
          </div>
        </div>
      </div>

      <div
        ref={delProductModalRef}
        className="modal fade"
        id="delProductModal"
        tabIndex="-1"
        style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
      >
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h1 className="modal-title fs-5">刪除產品</h1>
              <button
                onClick={handleCloseDelProductModal}
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            <div className="modal-body">
              你是否要刪除
              <span className="text-danger fw-bold">{tempProduct.title}</span>
            </div>
            <div className="modal-footer">
              <button
                onClick={handleCloseDelProductModal}
                type="button"
                className="btn btn-secondary"
              >
                取消
              </button>
              <button onClick={() => handleDeleteProduct(tempProduct.id)} type="button" className="btn btn-danger">
                刪除
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default App