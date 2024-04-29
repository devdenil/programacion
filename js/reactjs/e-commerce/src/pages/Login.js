import React, { useState, useEffect } from 'react';
import firebase from 'firebase/compat/app';

const Login = ({ showSuccessAlert, showErrorAlert, showLoading }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');
  const [isEmailVerified, setIsEmailVerified] = useState(true);
  const [showVerificationAlert, setShowVerificationAlert] = useState(false);

  useEffect(() => {
    const unsubscribe = firebase.auth().onAuthStateChanged((user) => {
      if (user) {
        setIsEmailVerified(user.emailVerified);
        if (!user.emailVerified) {
          setShowVerificationAlert(true);
          setTimeout(() => {
            setShowVerificationAlert(false);
            window.location.href = '/';
          }, 10000);
        }
      }
    });
    return () => unsubscribe();
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    showLoading(true);
    setError(null);
    
    try {
      const userCredential = await firebase.auth().signInWithEmailAndPassword(email, password);
      if (!userCredential.user.emailVerified) {
        setShowVerificationAlert(true);
        setTimeout(() => {
          setShowVerificationAlert(false);
          window.location.href = '/';
        }, 10000);
      } else {
        showSuccessAlert('Login successful!');
        setTimeout(() => {
          window.location.href = '/';
        }, 2000);
      }
    } catch (error) {
      setError('Correo o contraseña incorrectos');
    } finally {
      showLoading(false);
    }
  };

  const handleInputChange = () => {
    setError(null);
  };

  const handleForgotPassword = () => {
    setShowForgotPasswordModal(true);
  };

  const handleForgotPasswordClose = () => {
    setShowForgotPasswordModal(false);
  };

  const handleForgotPasswordSubmit = async (e) => {
    e.preventDefault();
    try {
      await firebase.auth().sendPasswordResetEmail(forgotPasswordEmail);
      showSuccessAlert('Se ha enviado un correo electrónico para restablecer su contraseña.');
      handleForgotPasswordClose();
    } catch (error) {
      showErrorAlert('Error al enviar el correo electrónico de restablecimiento de contraseña.');
    }
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

  const handleGoogleSignIn = async () => {
    showLoading(true);
    try {
      const provider = new firebase.auth.GoogleAuthProvider();
      await firebase.auth().signInWithPopup(provider);
      showSuccessAlert('Google sign-in successful!');
      window.location.href = '/';
    } catch (error) {
      showErrorAlert(error.message);
      showLoading(false);
    }
  };

  const handleMicrosoftSignIn = async () => {
    showLoading(true);
    try {
      const provider = new firebase.auth.OAuthProvider('microsoft.com');
      await firebase.auth().signInWithPopup(provider);
      showSuccessAlert('Microsoft sign-in successful!');
      window.location.href = '/';
    } catch (error) {
      showErrorAlert(error.message);
      showLoading(false);
    }
  };

  return (
    <div className="container">
      {error && <div className="alert alert-danger">{error}</div>}
      
      <h2>Iniciar Sesión</h2>
      <form onSubmit={handleLogin}>
        <div className="mb-3">
          <label htmlFor="email" className="form-label">Correo Electrónico</label>
          <input type="email" className="form-control" id="email" value={email} onChange={(e) => setEmail(e.target.value)} onFocus={handleInputChange} />
        </div>
        <div className="mb-3">
          <label htmlFor="password" className="form-label">Contraseña</label>
          <div className="input-group">
            <input type={showPassword ? "text" : "password"} className="form-control" id="password" value={password} onChange={(e) => setPassword(e.target.value)} onFocus={handleInputChange} />
            <button className="btn btn-outline-secondary" type="button" onClick={() => setShowPassword(!showPassword)}>
              {showPassword ? "Ocultar" : "Mostrar"}
            </button>
          </div>
        </div>
        <button type="submit" className="btn btn-primary">Iniciar Sesión</button>
        <button type="button" className="btn btn-link" onClick={handleForgotPassword}>¿Olvidó su contraseña?</button>
      </form>

      <div className="mt-3">
        <button type="button" className="btn btn-danger me-2" onClick={handleGoogleSignIn}>Iniciar Sesión con Google</button>
        <button type="button" className="btn btn-primary" onClick={handleMicrosoftSignIn}>Iniciar Sesión con Microsoft</button>
      </div>

      {showForgotPasswordModal && (
        <div className="modal" tabIndex="-1" role="dialog" style={{ display: 'block', backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
          <div className="modal-dialog" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Recuperar Contraseña</h5>
                <button type="button" className="close" onClick={handleForgotPasswordClose}>
                  <span aria-hidden="true">&times;</span>
                </button>
              </div>
              <div className="modal-body">
                <form onSubmit={handleForgotPasswordSubmit}>
                  <div className="mb-3">
                    <label htmlFor="forgotEmail" className="form-label">Email</label>
                    <input type="email" className="form-control" id="forgotEmail" value={forgotPasswordEmail} onChange={(e) => setForgotPasswordEmail(e.target.value)} onFocus={handleInputChange} />
                  </div>
                  <button type="submit" className="btn btn-primary">Enviar Correo de Restablecimiento</button>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {showVerificationAlert && (
        <div className="alert alert-warning alert-dismissible fade show" role="alert">
          Verificar su correo electrónico! <button type="button" className="btn btn-link" onClick={handleSendVerificationEmail}>Enviar Correo de Verificación</button>
          <button type="button" className="close" data-dismiss="alert" aria-label="Close" onClick={() => setShowVerificationAlert(false)}>
            <span aria-hidden="true">&times;</span>
          </button>
        </div>
      )}
      <p>Aun no tiene una cuenta? <a href="/register">Registrarse</a></p>
    </div>
  );
};

export default Login;