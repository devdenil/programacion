import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';

import Home from './pages/Home';
import Store from './pages/Store';
import Cart from './pages/Cart';
import ManagerProducts from './pages/ManagerProducts';
import ManagerSales from './pages/ManagerSales';
import ManagerUser from './pages/ManagerUsers.js';
import ManagerSalesCreate from './pages/ManagerSalesCreate';
import ManagerDistributions from './pages/ManagerDistributions.js';
import ManagerDistributionsCreate from './pages/ManagerDistributionsCreate.js';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile.js';
import Pay from './pages/Pay.js';

import "./css/bootstrap.min.css";
import "./css/style.css";
import "./js/bootstrap.bundle.min.js";

const firebaseConfig = {
  apiKey: "AIzaSyC4GMxW1IVrsOctE333-hJOuFftIxBVbdg",
  authDomain: "e-commerce-88fb4.firebaseapp.com",
  projectId: "e-commerce-88fb4",
  storageBucket: "e-commerce-88fb4.appspot.com",
  messagingSenderId: "1005368544785",
  appId: "1:1005368544785:web:8ba20b731035109d116bb0"
};
firebase.initializeApp(firebaseConfig);

const App = () => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorAlert, setErrorAlert] = useState(null);
  const [successAlert, setSuccessAlert] = useState(null);
  const [theme, setTheme] = useState('dark');
  const [themeDropdownOpen, setThemeDropdownOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const handleThemeDropdownOpen = () => {
    setThemeDropdownOpen(true);
  };

  const handleThemeDropdownClose = () => {
    setThemeDropdownOpen(false);
  };

  const handleProfileDropdownOpen = () => {
    setProfileDropdownOpen(true);
  };

  const handleProfileDropdownClose = () => {
    setProfileDropdownOpen(false);
  };

  const toggleTheme = (selectedTheme) => {
    setTheme(selectedTheme);
    localStorage.setItem('theme', selectedTheme);
    document.documentElement.setAttribute('data-bs-theme', selectedTheme);
  };

  useEffect(() => {
    const storedTheme = localStorage.getItem('theme');
    const preferredTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';

    setTheme(storedTheme || preferredTheme);
    document.documentElement.setAttribute('data-bs-theme', storedTheme || preferredTheme);
  }, []);
  const themeIcon = theme === 'dark' ? 'fa-moon' : theme === 'light' ? 'fa-sun' : 'fa-sync';

  useEffect(() => {
    const unsubscribe = firebase.auth().onAuthStateChanged(async (authUser) => {
      setIsLoading(true);
      if (authUser) {
        const userSnapshot = await firebase.firestore().collection('users').where('email', '==', authUser.email).get();
        if (!userSnapshot.empty) {
          const userData = userSnapshot.docs[0].data();
          setUser(userData);
        }
      } else {
        setUser(null);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const showSuccessAlert = (message) => {
    setSuccessAlert(message);
    setTimeout(() => {
      setSuccessAlert(null);
    }, 3000);
  };

  const showErrorAlert = (message) => {
    setErrorAlert(message);
    setTimeout(() => {
      setErrorAlert(null);
    }, 3000);
  };

  const handleLogout = async () => {
    try {
      setIsLoading(true);
      await firebase.auth().signOut();
      setUser(null);
    } catch (error) {
      showErrorAlert(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const isAuthenticated = !!user;
  const isAdmin = isAuthenticated && user.role === 'Admin';
  const isSeller = isAuthenticated && user.role === 'Seller';
  const isClient = isAuthenticated && user.role === 'Client';
  const isVerified = isAuthenticated && isClient || isSeller || isAdmin && user.verify === 'verified';

  return (
    <header class="">
      <Router>
        {isLoading && <div className="loading">
          <div className="spinner-border" role="status"></div>
          <span className="text-loading">Loading...</span>
        </div>}
        {errorAlert && <div className="alert alert-danger">{errorAlert}</div>}
        {successAlert && <div className="alert alert-success">{successAlert}</div>}

        {isAuthenticated && !isClient && (
          <div class="drawer">
            <ul class="navbar-nav flex-column">
              <Link class="navbar-brand" to="/">
                <label class="ps-2 display-4">E <label class="fs-3">commerce</label></label>
              </Link>
              {isAdmin && (
                <>
                  <li class="nav-item py-3">
                    <Link class="nav-link" to="/manager-users">
                      <i class="fa-solid fa-users"></i>
                      <span class="text">Adm. Usuarios</span>
                    </Link>
                  </li>
                  <li class="nav-item py-3">
                    <Link class="nav-link" to="/manager-products">
                      <i class="fa-solid fa-boxes-stacked"></i>
                      <span class="text">Adm. Productos</span>
                    </Link>
                  </li>
                  <li class="nav-item py-3">
                    <Link class="nav-link" to="/manager-sales">
                      <i class="fa-brands fa-shopify"></i>
                      <span class="text">Adm. Ventas</span>
                    </Link>
                  </li>
                  <li class="nav-item py-3">
                    <Link class="nav-link" to="/manager-distributions">
                      <i class="fa-brands fa-shopify"></i>
                      <span class="text">Adm. Distribucion</span>
                    </Link>
                  </li>
                </>
              )}
              {isSeller && (
                <li class="nav-item py-3">
                  <Link class="nav-link" to="/manager-sales">
                    <i class="fa-brands fa-shopify"></i>
                    <span class="text">Adm. Ventas</span>
                  </Link>
                </li>
              )}
            </ul>
          </div>
        )}

        <nav class="navbar navbar-expand-lg pt-0 mb-4">
          <Link class="nav-link" to="/">
            <label class="ps-2 display-4">E <label class="fs-3">commerce</label></label>
          </Link>
          <button className="navbar-toggler btn fs-1 me-2 mt-2" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation" onClick={() => setMenuOpen(!menuOpen)}> {/* Agregar onClick para alternar el estado del menú */}
            <i class="fa-solid fa-bars"></i>
          </button>
          <div class={`collapse navbar-collapse justify-content-between ${menuOpen ? 'show' : ''}`} id="navbarNav">
            <ul id="navbar" class="navbar-nav nav-underline">
              <li class="nav-item active">
                <Link class="nav-link" to="/home" onClick={() => setMenuOpen(false)}>Inicio</Link>
              </li>
              <li class="nav-item">
                <Link class="nav-link" to="/store" onClick={() => setMenuOpen(false)}>Tienda</Link>
              </li>
              <li class="nav-item">
                <Link class="nav-link" to="/cart" onClick={() => setMenuOpen(false)}>Carrito</Link>
              </li>

              {isAuthenticated && !isClient && (
                <div class="drawer-reponsive">
                  {isAdmin && (
                    <>
                      <li class="nav-item py-3">
                        <Link class="nav-link" to="/manager-users" onClick={() => setMenuOpen(false)}>
                          <i class="fa-solid fa-users"></i>
                          <span class="text"> Adm. Usuarios</span>
                        </Link>
                      </li>
                      <li class="nav-item py-3">
                        <Link class="nav-link" to="/manager-products" onClick={() => setMenuOpen(false)}>
                          <i class="fa-solid fa-boxes-stacked"></i>
                          <span class="text"> Adm. Productos</span>
                        </Link>
                      </li>
                      <li class="nav-item py-3">
                        <Link class="nav-link" to="/manager-sales" onClick={() => setMenuOpen(false)}>
                          <i class="fa-brands fa-shopify"></i>
                          <span class="text"> Adm. Ventas</span>
                        </Link>
                      </li>
                    </>
                  )}
                  {isSeller && (
                    <li class="nav-item py-3">
                      <Link class="nav-link" to="/manager-sales" onClick={() => setMenuOpen(false)}>
                        <i class="fa-brands fa-shopify"></i>
                        <span class="text"> Adm. Ventas</span>
                      </Link>
                    </li>
                  )}
                </div>
              )}

            </ul>
            <ul class="navbar-nav">
              <li className="nav-item dropdown">
                <div
                  className="nav-link dropdown-toggle"
                  id="themeDropdown"
                  role="button"
                  data-bs-toggle="dropdown"
                  aria-haspopup="true"
                  aria-expanded={themeDropdownOpen ? 'true' : 'false'}
                  onMouseEnter={handleThemeDropdownOpen}
                  onMouseLeave={handleThemeDropdownClose}
                >
                  <i className={`fas ${themeIcon}`}></i> Modo
                </div>
                <ul
                  className={`dropdown-menu dropdown-menu-end ${themeDropdownOpen ? 'show' : ''}`}
                  aria-labelledby="themeDropdown"
                  onMouseEnter={handleThemeDropdownOpen}
                  onMouseLeave={handleThemeDropdownClose}
                >
                  <li><a className="dropdown-item" onClick={() => toggleTheme('light')}><i className="fas fa-sun"></i> Modo Claro</a></li>
                  <li><a className="dropdown-item" onClick={() => toggleTheme('dark')}><i className="fas fa-moon"></i> Modo Oscuro</a></li>
                  <li><a className="dropdown-item" onClick={() => toggleTheme('auto')}><i className="fas fa-sync"></i> Automático</a></li>
                </ul>
              </li>
              {isAuthenticated ? (
                <li className="nav-item dropdown">
                  <div
                    className="nav-link dropdown-toggle"
                    id="profileDropdown"
                    role="button"
                    data-bs-toggle="dropdown"
                    aria-haspopup="true"
                    aria-expanded={profileDropdownOpen ? 'true' : 'false'}
                    onMouseEnter={handleProfileDropdownOpen}
                    onMouseLeave={handleProfileDropdownClose}
                  >
                    {user.photoUrl ? <img className="nav-profile rounded-circle" src={user.photoUrl} /> : user.name}
                  </div>
                  <ul
                    className={`dropdown-menu dropdown-menu-end ${profileDropdownOpen ? 'show' : ''}`}
                    aria-labelledby="profileDropdown"
                    onMouseEnter={handleProfileDropdownOpen}
                    onMouseLeave={handleProfileDropdownClose}
                  >
                    <Link className="dropdown-item" to="/profile"><i class="fa-solid fa-user"></i> Perfil</Link>
                    <Link className="dropdown-item" onClick={handleLogout}><i class="fa-solid fa-right-from-bracket"></i> Cerrar Sesión</Link>
                  </ul>
                </li>
              ) : (
                <>
                  <li class="nav-item">
                    <Link class="nav-link" to="/login">Ingresar</Link>
                  </li>
                  <li class="nav-item">
                    <Link class="btn" to="/register">Registrarse</Link>
                  </li>
                </>
              )}
            </ul>
          </div>
        </nav>

        <Routes>
          <Route path="/" element={<Home showLoading={setIsLoading} showSuccessAlert={showSuccessAlert} showErrorAlert={showErrorAlert} />} />
          <Route path="/home" element={<Home showLoading={setIsLoading} showSuccessAlert={showSuccessAlert} showErrorAlert={showErrorAlert} />} />
          <Route path="/store" element={<Store showSuccessAlert={showSuccessAlert} showErrorAlert={showErrorAlert} />} />
          {isAuthenticated ? (
            <>
              <Route path="/cart" element={<Cart showSuccessAlert={showSuccessAlert} showErrorAlert={showErrorAlert} />} />
              <Route path="/profile" element={<Profile showLoading={setIsLoading} showSuccessAlert={showSuccessAlert} showErrorAlert={showErrorAlert} />} />
              {isVerified ? (
                <Route path="/pay" element={<Pay showLoading={setIsLoading} showSuccessAlert={showSuccessAlert} showErrorAlert={showErrorAlert} />} />
              ) : (
                <Route path="/pay" element={<Navigate to="/cart" />} />
              )}
              {isAdmin &&
                <>
                  <Route path="/manager-products" element={<ManagerProducts showLoading={setIsLoading} showSuccessAlert={showSuccessAlert} showErrorAlert={showErrorAlert} />} />
                  <Route path="/manager-users" element={<ManagerUser showLoading={setIsLoading} showSuccessAlert={showSuccessAlert} showErrorAlert={showErrorAlert} />} />
                  <Route path="/manager-distributions" element={<ManagerDistributions showLoading={setIsLoading} showSuccessAlert={showSuccessAlert} showErrorAlert={showErrorAlert} />} />
                  <Route path="/manager-distributions-create" element={<ManagerDistributionsCreate showLoading={setIsLoading} showSuccessAlert={showSuccessAlert} showErrorAlert={showErrorAlert} />} />
                </>
              }
              {(isAdmin || isSeller) &&
                <>
                  <Route path="/manager-sales" element={<ManagerSales showLoading={setIsLoading} />} />
                  <Route path="/manager-sales-create" element={<ManagerSalesCreate showLoading={setIsLoading} showSuccessAlert={showSuccessAlert} showErrorAlert={showErrorAlert} />} />
                </>
              }
            </>
          ) : (
            <>
              <Route path="/login" element={<Login showLoading={setIsLoading} showSuccessAlert={showSuccessAlert} showErrorAlert={showErrorAlert} />} />
              <Route path="/register" element={<Register showLoading={setIsLoading} showSuccessAlert={showSuccessAlert} showErrorAlert={showErrorAlert} />} />
            </>
          )}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>

      </Router>
    </header>
  );
}
export default App;