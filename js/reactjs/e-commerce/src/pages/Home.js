import React, { useState, useEffect } from 'react';
import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';
import { Link } from 'react-router-dom';

const Home = ({ showSuccessAlert, showErrorAlert, showLoading }) => {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        showLoading(true);
        const productsSnapshot = await firebase.firestore().collection('products').orderBy('dateUpdate', 'desc').limit(3).get();
        const productsData = productsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setProducts(productsData);
        showLoading(false);
      } catch (error) {
        console.error('Error fetching products:', error);
        showLoading(false);
      }
    };

    fetchProducts();
  }, [showLoading]);

  return (
    <div className="container">
      <div className="hero-section">
        <h1>Bienvenidos a Nuestro E-commerce</h1>
        <div className="info-overlay">
          <div className="info-section">
            <p>Descubre los mejores productos al mejor precio, solo con nosotros.</p>
            <div className="arrow">
              <i className="position-relative start-50 mt-5 fs-2 fa-solid fa-angles-down"></i>
            </div>
          </div>
        </div>
      </div>
      <div id="carouselExample" className="carousel slide my-5 mx-auto" data-bs-ride="carousel">
        <div className="carousel-inner rounded">
          {products.map((product, index) => (
            <div className={`carousel-item ${index === 0 ? 'active' : ''}`} key={product.id}>
              <img src={product.photos[0]} className="d-block w-100" alt={product.name} />
              <div className="rounded-bottom carousel-caption">
                <h5>{product.name}</h5>
                <p>{product.details}</p>
              </div>
            </div>
          ))}
        </div>
        <button className="carousel-control-prev" type="button" data-bs-target="#carouselExample" data-bs-slide="prev">
          <span className="carousel-control-prev-icon" aria-hidden="true"></span>
        </button>
        <button className="carousel-control-next" type="button" data-bs-target="#carouselExample" data-bs-slide="next">
          <span className="carousel-control-next-icon" aria-hidden="true"></span>
        </button>
      </div>
    </div>
  );
};

export default Home;