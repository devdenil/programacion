import React, { useState, useEffect } from 'react';
import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';
import { useCookies } from 'react-cookie';

const Store = ({ showSuccessAlert, showErrorAlert }) => {
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [cookies, setCookie] = useCookies();
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [productsPerPage] = useState(20);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const productsSnapshot = await firebase.firestore().collection('products').get();
        const productsData = productsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setProducts(productsData);
      } catch (error) {
        console.error('Error fetching products:', error);
      }
    };

    fetchProducts();
  }, []);

  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = products.filter(product => {
    const productName = product.name.toLowerCase();
    return productName.includes(searchTerm.toLowerCase()) && product.quantity > 0;
  }).slice(indexOfFirstProduct, indexOfLastProduct);

  const paginate = pageNumber => setCurrentPage(pageNumber);

  const handleAddToCart = (product) => {
    const existingCart = cookies['cart' + firebase.auth().currentUser.email];
    const updatedCart = existingCart ? JSON.parse(atob(existingCart)) : [];

    const existingCartItemIndex = updatedCart.findIndex(item => item.id === product.id);
    const totalQuantityInCart = existingCartItemIndex !== -1 ? updatedCart[existingCartItemIndex].quantity : 0;

    if (totalQuantityInCart + quantity <= product.quantity) {
      if (existingCartItemIndex !== -1) {
        updatedCart[existingCartItemIndex].quantity += quantity;
      } else {
        updatedCart.push({ id: product.id, quantity });
      }
      setCookie('cart' + firebase.auth().currentUser.email, btoa(JSON.stringify(updatedCart)), { path: '/', secure: true });
      showSuccessAlert('Product added to cart successfully.');
    } else {
      showErrorAlert('Quantity exceeds available stock.');
    }
  };

  const handleModalOpen = (product) => {
    setSelectedProduct(product);
  };

  const handleModalClose = () => {
    setSelectedProduct(null);
  };

  const handleQuantityChange = (e) => {
    setQuantity(parseInt(e.target.value));
  };

  const isQuantityAvailable = (product) => {
    return product.quantity >= quantity;
  };

  return (
    <div className="container">
      <h2>Productos</h2>
      <div className="mb-3">
        <input type="search" className="form-control" placeholder="Buscar un producto..." onChange={(e) => setSearchTerm(e.target.value)} />
      </div>
      <div className="d-flex flex-wrap row">
        {currentProducts.map(product => (
          <div className="m-2 product" key={product.id}>
            <div className="card">
              {product.photos && product.photos.length > 0 ? (
                <img src={product.photos[0]} className="card-img-top" alt={product.name} onClick={() => handleModalOpen(product)} />
              ) : (
                <div className="no-image-placeholder" onClick={() => handleModalOpen(product)}>
                  Sin imagen
                </div>
              )}
              <div className="card-body">
                <h5 className="card-title">{product.name}</h5>
                <p className="card-text">Bs.<strong>{product.priceByUnit}</strong></p>
                {isQuantityAvailable(product) ? (
                  <button className="btn" onClick={() => handleAddToCart(product)}>Agregar a <i class="fa-solid fa-cart-plus"></i></button>
                ) : (
                  <button className="btn" disabled>No Disponible</button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
      <nav aria-label="Pagination">
        <ul className="pagination">
          {Array.from({ length: Math.ceil(products.filter(product => product.name.toLowerCase().includes(searchTerm.toLowerCase()) && product.quantity > 0).length / productsPerPage) }, (_, index) => (
            <li className={`page-item ${index + 1 === currentPage ? 'active' : ''}`} key={index + 1}>
              <button className="page-link" onClick={() => paginate(index + 1)}>{index + 1}</button>
            </li>
          ))}
        </ul>
      </nav>
      {selectedProduct && (
        <div className="modal show" tabIndex="-1" role="dialog" style={{ display: 'block' }}>
          <div className="modal-dialog" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">{selectedProduct.name}</h5>
                <button type="button" className="btn-close" onClick={handleModalClose}></button>
              </div>
              <div className="modal-body details-product row">
                <div id="carouselExampleControls" className="carousel slide col" data-bs-ride="carousel">
                  <div className="carousel-inner">
                    {selectedProduct.photos && selectedProduct.photos.length > 0 ? (
                      selectedProduct.photos.map((photo, index) => (
                        <div className={`carousel-item ${index === 0 ? 'active' : ''}`} key={index}>
                          <img src={photo} className="d-block w-100" alt={`Product Photo ${index + 1}`} />
                        </div>
                      ))
                    ) : (
                      <div className="no-image-placeholder">
                        Sin imagen
                      </div>
                    )}
                  </div>
                  <button className="carousel-control-prev" type="button" data-bs-target="#carouselExampleControls" data-bs-slide="prev">
                    <span className="carousel-control-prev-icon" aria-hidden="true"></span>
                    <span className="visually-hidden">Previous</span>
                  </button>
                  <button className="carousel-control-next" type="button" data-bs-target="#carouselExampleControls" data-bs-slide="next">
                    <span className="carousel-control-next-icon" aria-hidden="true"></span>
                    <span className="visually-hidden">Next</span>
                  </button>
                </div>
                <div className="col">
                  <p>{selectedProduct.details}</p>
                  <p>Precio: <strong>Bs.{selectedProduct.priceByUnit}</strong></p>
                  <div className="mb-3">
                    <label htmlFor="quantity" className="form-label">Cantidad:</label>
                    <input type="number" className="form-control" id="quantity" value={quantity} onChange={handleQuantityChange} />
                  </div>
                  {isQuantityAvailable(selectedProduct) ? (
                    <button className="btn" onClick={() => handleAddToCart(selectedProduct)}>Agregar a <i class="fa-solid fa-cart-plus"></i></button>
                  ) : (
                    <button className="btn" disabled>No Disponible</button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Store;