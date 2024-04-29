import React, { useState, useEffect } from 'react';
import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';
import { useCookies } from 'react-cookie';
import { Link } from 'react-router-dom';

const Cart = ({ showSuccessAlert, showErrorAlert }) => {
  const [cart, setCart] = useCookies();
  const [cartItems, setCartItems] = useState([]);
  const [subtotal, setSubtotal] = useState(0);
  const [total, setTotal] = useState(0);
  const [isVerified, setIsVerified] = useState(false);
  const [showProceedButton, setShowProceedButton] = useState(false);
  const [showVerificationAlert, setShowVerificationAlert] = useState(false);

  useEffect(() => {
    const fetchCartItems = async () => {
      const items = [];
      let subtotalValue = 0;

      const decodedCart = cart['cart' + firebase.auth().currentUser.email];
      const decodedCartItems = decodedCart ? JSON.parse(atob(decodedCart)) : [];

      for (const item of decodedCartItems) {
        const productSnapshot = await firebase.firestore().collection('products').doc(item.id).get();
        if (productSnapshot.exists) {
          const productData = productSnapshot.data();
          const subtotalItem = productData.priceByUnit * item.quantity;
          subtotalValue += subtotalItem;

          items.push({
            id: item.id,
            name: productData.name,
            quantity: item.quantity,
            subtotal: subtotalItem,
            availableQuantity: productData.quantity
          });
        }
      }

      setCartItems(items);
      setSubtotal(subtotalValue);
      setTotal(subtotalValue);
    };

    fetchCartItems();

    const user = firebase.auth().currentUser;
    setIsVerified(user ? user.emailVerified : false);

    setShowProceedButton(cartItems.length > 0);

    if (!user.emailVerified) {
      setShowVerificationAlert(true);
    }
  }, [cart, cartItems.length]);

  const handleRemoveFromCart = (productId) => {
    const updatedCart = cartItems.filter(item => item.id !== productId);
    setCart('cart' + firebase.auth().currentUser.email, btoa(JSON.stringify(updatedCart)), { path: '/', secure: true });
    showSuccessAlert('Product removed from cart successfully.');
  };

  const handleQuantityChange = (productId, newQuantity) => {
    const updatedCart = cartItems.map(item => {
      if (item.id === productId) {
        if (newQuantity <= item.availableQuantity) {
          return { ...item, quantity: newQuantity };
        } else {
          showErrorAlert('Quantity exceeds available stock.');
          return item;
        }
      }
      return item;
    });
    setCart('cart' + firebase.auth().currentUser.email, btoa(JSON.stringify(updatedCart)), { path: '/', secure: true });
  };

  const handleSendVerificationEmail = async () => {
    try {
      const user = firebase.auth().currentUser;
      await user.sendEmailVerification();
      showSuccessAlert('Se ha enviado un correo electrónico de verificación.');
    } catch (error) {
      showErrorAlert('Error al enviar el correo electrónico de verificación.');
    }
  };

  return (
    <div className="container">
      <h2>Carrito</h2>
      <table className="table">
        <thead>
          <tr>
            <th>Producto</th>
            <th>Cantidad</th>
            <th>Subtotal</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {cartItems.map(item => (
            <tr key={item.id}>
              <td>{item.name}</td>
              <td className='col-2'>
                <div className="input-group">
                  <button className="btn" type="button" onClick={() => handleQuantityChange(item.id, item.quantity - 1)}>-</button>
                  <input type="text" className="form-control text-center" value={item.quantity} onChange={(e) => handleQuantityChange(item.id, parseInt(e.target.value) || 0)} />
                  <button className="btn" type="button" onClick={() => handleQuantityChange(item.id, item.quantity + 1)}>+</button>
                </div>
              </td>
              <td>Bs.{item.subtotal.toFixed(2)}</td>
              <td><button className="btn" onClick={() => handleRemoveFromCart(item.id)}><i class="fa-solid fa-minus"></i></button></td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <td colSpan="2">Total</td>
            <td>Bs.{total.toFixed(2)}</td>
            <td></td>
          </tr>
         
          {showProceedButton && isVerified && (
            <tr>
              <td colSpan="4">
                <Link to="/pay" className="btn"><i class="fa-solid fa-comments-dollar"></i> Proceder con el Pago</Link>
              </td>
            </tr>
          )}
          {!isVerified && (
            <tr>
              <td colSpan="4">
                <div className="alert alert-danger">
                  Verificar su correo electrónico! 
                  <button type="button" className="btn-link" onClick={handleSendVerificationEmail}>
                     Enviar Correo de Verificación
                  </button>
                </div>
              </td>
            </tr>
          )}
          {!showProceedButton && (
            <tr>
              <td colSpan="4">
                <div className="alert alert-danger">El carrito está vacío</div>
              </td>
            </tr>
          )}
        </tfoot>
      </table>
    </div>
  );
};

export default Cart;