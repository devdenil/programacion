import React, { useState } from 'react';
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/storage';
import 'firebase/compat/firestore';

const Register = ({ showSuccessAlert, showErrorAlert, showLoading }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [photo, setPhoto] = useState(null);
  const [error, setError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    showLoading(true);
    setError(null);

    try {
      // Verificar si el correo electrónico ya está en uso
      const emailExists = await firebase.auth().fetchSignInMethodsForEmail(email);
      if (emailExists.length > 0) {
        throw new Error('Email already in use');
      }

      // Crear el usuario en Firebase Authentication
      const authUser = await firebase.auth().createUserWithEmailAndPassword(email, password);

      // Subir la foto a Firebase Storage y obtener la URL
      let photoUrl = '';
      if (photo) {
        const photoName = `${email}_${photo.name}`;
        const storageRef = firebase.storage().ref(`users/${photoName}`);
        const photoSnapshot = await storageRef.put(photo);
        photoUrl = await photoSnapshot.ref.getDownloadURL();
      }

      // Guardar el usuario en Firestore
      await firebase.firestore().collection('users').doc(authUser.uid).set({
        name,
        email,
        photoUrl,
        phone: null,
        role: 'Client',
        status: 'live',
        dateCreate: firebase.firestore.FieldValue.serverTimestamp()
      });

      showSuccessAlert('Registration successful!'); // Mostrar mensaje temporal
      setTimeout(() => {
        // Redirigir a la página de inicio después de 2 segundos
        window.location.href = '/';
      }, 2000);
    } catch (error) {
      setError(error.message);
      showLoading(false);
    }
  };

  const handleInputChange = () => {
    // Ocultar el mensaje de error al cambiar los campos
    setError(null);
  };

  const handlePhotoChange = (e) => {
    // Verificar el tamaño del archivo de la foto
    const file = e.target.files[0];
    if (file && file.size > 2 * 1024 * 1024) {
      setError('Photo must be less than 2MB');
      setPhoto(null);
      return;
    }
    setPhoto(file);
  };

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleGoogleSignIn = async () => {
    showLoading(true);
    try {
      const provider = new firebase.auth.GoogleAuthProvider();
      const result = await firebase.auth().signInWithPopup(provider);
      const { user } = result;

      // Guardar los datos del usuario en Firestore
      await saveUserData(user);

      showSuccessAlert('Google sign-in successful!');
      // Redirigir a la página de inicio después de iniciar sesión
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
      const result = await firebase.auth().signInWithPopup(provider);
      const { user } = result;

      // Guardar los datos del usuario en Firestore
      await saveUserData(user);

      showSuccessAlert('Microsoft sign-in successful!');
      // Redirigir a la página de inicio después de iniciar sesión
      window.location.href = '/';
    } catch (error) {
      showErrorAlert(error.message);
      showLoading(false);
    }
  };

  const saveUserData = async (user) => {
    try {
      let photoUrl = '';
      if (user.photoURL) {
        const photoName = `${user.email}_${user.photoURL}`;
        const storageRef = firebase.storage().ref(`users/${photoName}`);
        await storageRef.put(user.photoURL);
        photoUrl = await storageRef.getDownloadURL();
      }

      await firebase.firestore().collection('users').doc(user.uid).set({
        name: user.displayName,
        email: user.email,
        photoUrl,
        phone: null,
        role: 'Client',
        status: 'live',
        dateCreate: firebase.firestore.FieldValue.serverTimestamp()
      });
    } catch (error) {
      console.error('Error saving user data:', error);
      throw new Error('Error saving user data');
    }
  };

  return (
    <div className="container">
      <h2>Register</h2>
      <form onSubmit={handleRegister}>
        <div className="mb-3">
          <label htmlFor="name" className="form-label">Name</label>
          <input type="text" className="form-control" id="name" value={name} onChange={(e) => setName(e.target.value)} onFocus={handleInputChange} />
        </div>
        <div className="mb-3">
          <label htmlFor="email" className="form-label">Email</label>
          <input type="email" className="form-control" id="email" value={email} onChange={(e) => setEmail(e.target.value)} onFocus={handleInputChange} />
        </div>
        <div className="mb-3">
          <label htmlFor="password" className="form-label">Password</label>
          <div className="input-group">
            <input type={showPassword ? "text" : "password"} className="form-control" id="password" value={password} onChange={(e) => setPassword(e.target.value)} onFocus={handleInputChange} />
            <button className="btn btn-outline-secondary" type="button" onClick={toggleShowPassword}>{showPassword ? "Hide" : "Show"}</button>
          </div>
        </div>
        <div className="mb-3">
          <label htmlFor="photo" className="form-label">Photo (Optional)</label>
          <input type="file" className="form-control" id="photo" onChange={handlePhotoChange} />
          {photo && (
            <div className="mt-2">
              <img src={URL.createObjectURL(photo)} alt="Preview" style={{ width: '30px', height: '30px', marginRight: '5px' }} />
            </div>
          )}
        </div>

        <button type="submit" className="btn btn-primary">Register</button>

        <button type="button" className="btn btn-success ms-2" onClick={handleGoogleSignIn}>Register with Google</button>
        <button type="button" className="btn btn-primary ms-2" onClick={handleMicrosoftSignIn}>Register with Microsoft</button>
      </form>
      {error && <div className="alert alert-danger mt-3">{error}</div>}
    </div>
  );
};

export default Register;