import React, { useState, useEffect } from 'react';
import { useCookies } from 'react-cookie';
import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';

const ManagerSalesCreate = ({ showSuccessAlert, showErrorAlert, showLoading }) => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [total, setTotal] = useState(0);
  const [subtotal, setSubtotal] = useState(0);
  const [unitario, setUnitario] = useState(true);
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [cookies, setCookie, removeCookie] = useCookies(['cart', 'selectedUser']);
  const [paymentMethod, setPaymentMethod] = useState('Cancelado');
  const [city, setCity] = useState('');
  const [details, setDetails] = useState('');
  const [cash, setCash] = useState('');
  const [change, setChange] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentPageProducts, setCurrentPageProducts] = useState(1);
  const [currentPageUsers, setCurrentPageUsers] = useState(1);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const productsSnapshot = await firebase.firestore().collection('products').get();
        const productsData = productsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setProducts(productsData);
        setFilteredProducts(productsData.slice(0, 10)); 
      } catch (error) {
        showErrorAlert('Error fetching products.');
      }
    };

    const fetchUsers = async () => {
      try {
        const usersSnapshot = await firebase.firestore().collection('users').get();
        const usersData = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setUsers(usersData);
        setFilteredUsers(usersData.slice(0, 10));
      } catch (error) {
        showErrorAlert('Error fetching users.');
      }
    };

    fetchProducts();
    fetchUsers();

    const storedCart = cookies.cart ? JSON.parse(atob(cookies.cart)) : [];
    setCart(storedCart);
    const storedSelectedUser = cookies.selectedUser;
    setSelectedUser(storedSelectedUser);
  }, []);

  useEffect(() => {
    setCookie('cart', cart.length > 0 ? btoa(JSON.stringify(cart)) : '', { path: '/', secure: true });
    setCookie('selectedUser', selectedUser, { path: '/', secure: true });
  }, [cart, selectedUser, setCookie]);

  const handleAddToCart = (productId, availableQuantity) => {
    const existingCartItemIndex = cart.findIndex(item => item.productId === productId && item.typeSale === unitario);
    const existingCartItem = cart[existingCartItemIndex];
  
    const product = products.find(product => product.id === productId);
    const price = unitario ? product.priceByUnit : product.wholesalePrice;
  
    if (existingCartItem) {
      const newQuantity = existingCartItem.quantity + 1;
      if (newQuantity <= availableQuantity) {
        const updatedCart = [...cart];
        updatedCart[existingCartItemIndex] = { ...existingCartItem, quantity: newQuantity, price };
        setCart(updatedCart);
        showSuccessAlert('Product quantity updated.');
      } else {
        showErrorAlert('Insufficient quantity available.');
      }
    } else {
      setCart(prevCart => [...prevCart, { productId, quantity: 1, typeSale: unitario, price }]);
      showSuccessAlert('Product added to cart.');
    }
  };  

  const handleRemoveFromCart = (productId) => {
    const updatedCart = cart.filter(item => !(item.productId === productId && item.typeSale === unitario));
    setCart(updatedCart);
    showSuccessAlert('Product removed from cart.');
  };

  const handleQuantityChange = (productId, newQuantity) => {
    const cartItem = cart.find((item) => item.productId === productId);
    const product = products.find((product) => product.id === productId);
  
    if (newQuantity > product.quantity) {
      showErrorAlert("Insufficient quantity");
      return;
    }
  
    const updatedCart = cart.map((item) => {
      if (item.productId === productId) {
        return { ...item, quantity: newQuantity };
      }
      return item;
    });
  
    setCart(updatedCart);
  };

  const handleSelectUser = (userId) => {
    const user = users.find(user => user.id === userId);
    setSelectedUser(user ? user.email : null);
    showSuccessAlert('User selected.');
  };

  const handleUnitarioChange = () => {
    setUnitario(true);
    updateCartPrices(true);
  };

  const handleMayoristaChange = () => {
    setUnitario(false);
    updateCartPrices(false);
  };

  const updateCartPrices = (isUnitario) => {
    const updatedCart = cart.map(item => {
      const product = products.find(product => product.id === item.productId);
      if (product) {
        const price = isUnitario ? product.priceByUnit : product.wholesalePrice;
        return { ...item, typeSale: isUnitario, price };
      }
      return item;
    });
    setCart(updatedCart);
  };

  useEffect(() => {
    let newTotal = 0;
    let newSubtotal = 0;
    cart.forEach(item => {
      newTotal += item.price * item.quantity;
      newSubtotal += item.price * item.quantity;
    });
    setTotal(newTotal);
    setSubtotal(newSubtotal);
  }, [cart]);

  const handleProductSearch = (e) => {
    const searchTerm = e.target.value.toLowerCase();
    const filteredProducts = products.filter(product => {
      return product.code.toLowerCase().includes(searchTerm) || product.name.toLowerCase().includes(searchTerm);
    });
    setFilteredProducts(filteredProducts.slice(0, 5));
    setCurrentPageProducts(1);
  };

  const handleUserSearch = (e) => {
    const searchTerm = e.target.value.toLowerCase();
    const filteredUsers = users.filter(user => {
      return user.name.toLowerCase().includes(searchTerm) || user.email.toLowerCase().includes(searchTerm);
    });
    setFilteredUsers(filteredUsers.slice(0, 5));
    setCurrentPageUsers(1);
  };

  const handlePaymentMethodChange = (e) => {
    setPaymentMethod(e.target.value);
  };

  const handleCityChange = (e) => {
    setCity(e.target.value);
  };

  const handleDetailsChange = (e) => {
    setDetails(e.target.value);
  };

  const handleCashChange = (e) => {
    const cashValue = parseFloat(e.target.value);
    setCash(cashValue);
    if (!isNaN(cashValue)) {
      const changeValue = cashValue - total;
      setChange(changeValue >= 0 ? changeValue : '');
    }
  };

  const handleCompletePurchase = async () => {
    setLoading(true);
    try {
      const user = firebase.auth().currentUser;
      const saleData = {
        sellerId: user ? user.email : 'Seller',
        clientId: selectedUser || 'Client',
        total,
        typeSale: unitario ? 'Unitario' : 'Mayorista',
        status: paymentMethod,
        dateCreated: new Date(),
        city,
        details,
      };
  
      const saleRef = await firebase.firestore().collection('sales').add(saleData);
  
      await Promise.all(cart.map(async item => {
        const productRef = firebase.firestore().collection('products').doc(item.productId);
        const productDoc = await productRef.get();
        const currentQuantity = productDoc.data().quantity;
        const updatedQuantity = currentQuantity - item.quantity;
        await productRef.update({ quantity: updatedQuantity });
  
        await firebase.firestore().collection('detailsSales').add({
          saleId: saleRef.id,
          productId: item.productId,
          quantity: item.quantity,
        });
      }));
  
      setCart([]);
      setSelectedUser(null);
      removeCookie('cart', { path: '/' });
      removeCookie('selectedUser', { path: '/' });
  
      showSuccessAlert('Compra Registrada Exitosamente');
      window.location.href = '/manager-sales';
    } catch (error) {
      showErrorAlert(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="row">
        <div className="col-md-6">
          <h3>Productos</h3>
          <div className="mb-3">
            <input type="text" className="form-control" placeholder="Buscar Producto por codigo o nombre..." onChange={handleProductSearch} />
          </div>
          <table className="table table-striped">
            <thead>
              <tr>
                <th>Codido</th>
                <th>Nombre</th>
                <th>Precio (Unitario)</th>
                <th>Precio (Mayorista)</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map(product => (
                <tr key={product.id}>
                  <td>{product.code}</td>
                  <td>{product.name}</td>
                  <td>{product.priceByUnit}</td>
                  <td>{product.wholesalePrice}</td>
                  <td>
                    <button className="btn btn-primary" onClick={() => handleAddToCart(product.id, product.quantity)}><i class="fa-solid fa-cart-plus"></i></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div>
            <h3>Productos Seleccionados</h3>
            <div className="btn-group" role="group" aria-label="Basic radio toggle button group">
              <input type="radio" className="btn-check" name="btnradio" id="btnradio1" autoComplete="off" checked={unitario} onChange={handleUnitarioChange} />
              <label className="btn btn-outline-primary" htmlFor="btnradio1">Unitario</label>
              <input type="radio" className="btn-check" name="btnradio" id="btnradio2" autoComplete="off" checked={!unitario} onChange={handleMayoristaChange} />
              <label className="btn btn-outline-primary" htmlFor="btnradio2">Mayorista</label>
            </div>
            <table className="table">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Precio Sel.</th>
                  <th>Cantidad Sol.</th>
                  <th>SubTotal</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {cart.map((item, index) => {
                  const product = products.find(product => product.id === item.productId);
                  return (
                    <tr key={index}>
                      <td>{product ? product.name : ''}</td>
                      <td>{item.price}</td>
                      <td className='col-3'>
                        <div className="input-group">
                          <button
                            className="btn"
                            type="button"
                            onClick={() => handleQuantityChange(item.productId, item.quantity - 1)}
                          >
                            <i class="fa-solid fa-minus"></i>
                          </button>
                          <input
                            type="text"
                            className="form-control text-center"
                            value={item.quantity}
                            onChange={(e) =>
                              handleQuantityChange(item.productId, parseInt(e.target.value) || 0)
                            }
                          />
                          <button
                            className="btn"
                            type="button"
                            onClick={() => handleQuantityChange(item.productId, item.quantity + 1)}
                          >
                            <i class="fa-solid fa-plus"></i>
                          </button>
                        </div>
                      </td>
                      <td>{item.price * item.quantity}</td>
                      <td>
                        <button className="btn btn-danger" onClick={() => handleRemoveFromCart(item.productId)}><i class="fa-solid fa-circle-minus"></i></button>
                      </td>
                    </tr>
                  );
                })}
                <tr>
                  <td colSpan="3" className='text-end'>Total Bs.:</td>
                  <td><strong>{total}</strong></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="col-md-4">
          <h3>Clientes</h3>
          <div className="mb-3">
            <input type="text" className="form-control" placeholder="Buscar Clientes..." onChange={handleUserSearch} />
          </div>
          <table className="table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Correo Electronico</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map(user => (
                <tr key={user.id}>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>
                    <div className="btn-group-vertical" role="group" aria-label="Vertical radio toggle button group">
                      <input type="radio" className="btn-check" name="vbtn-radio" id={`vbtn-radio${user.id}`} autoComplete="off" checked={selectedUser === user.email} onChange={() => handleSelectUser(user.id)} />
                      <label className="btn" htmlFor={`vbtn-radio${user.id}`}><i class="fa-solid fa-circle-check"></i></label>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <h3>Detalles</h3>
          <div className="mb-3">
            <label htmlFor="city" className="form-label">Ubicación:</label>
            <select className="form-select" id="city" value={city} onChange={handleCityChange}>
              <option value="">Seleccionar Ubicacion</option>
              <option value="Oruro">Oruro</option>
              <option value="La Paz">La Paz</option>
              <option value="Potosi">Potosi</option>
            </select>
          </div>
          <div className="mb-3">
            <label htmlFor="details" className="form-label">Observaciones(Dejar en vacio si no hay):</label>
            <textarea className="form-control" id="details" value={details} onChange={handleDetailsChange}></textarea>
          </div>
          <div className="mb-3">
            <label className="form-check-label">Estado de pago: </label>
            <div className="btn-group" role="group" aria-label="Basic radio toggle button group">
              <input type="radio" className="btn-check" name="paymentMethod" id="paymentMethod1" autoComplete="off" value="Cancelado" checked={paymentMethod === 'Cancelado'} onChange={handlePaymentMethodChange} />
              <label className="btn btn-outline-primary" htmlFor="paymentMethod1">Cancelado</label>
              <input type="radio" className="btn-check" name="paymentMethod" id="paymentMethod2" autoComplete="off" value="Credito" checked={paymentMethod === 'Credito'} onChange={handlePaymentMethodChange} />
              <label className="btn" htmlFor="paymentMethod2">Credito</label>
            </div>
          </div>
          <div className="mb-3">
            <label htmlFor="cash" className="form-label">Monto Ingresado:</label>
            <input type="number" className="form-control" id="cash" value={cash} onChange={handleCashChange} />
          </div>
          <div className="mb-3">
            <label htmlFor="change" className="form-label">Su cambio es:</label>
            <input type="text" className="form-control" id="change" value={change} readOnly />
          </div>
          <button className="btn mb-4" onClick={handleCompletePurchase} disabled={loading}>
            {loading ? 'Cargando...' : 'Completar Venta'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ManagerSalesCreate;