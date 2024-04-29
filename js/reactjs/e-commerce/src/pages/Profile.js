import React, { useState, useEffect } from 'react';
import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';
import 'firebase/compat/auth';

const Profile = ({ showLoading, showSuccessAlert, showErrorAlert }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [editingField, setEditingField] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [newPhoto, setNewPhoto] = useState(null);
  const [hovering, setHovering] = useState(false);

  useEffect(() => {
    const unsubscribe = firebase.auth().onAuthStateChanged(async (authUser) => {
      showLoading(true);
      if (authUser) {
        try {
          const userSnapshot = await firebase.firestore().collection('users').where('email', '==', authUser.email).get();
          if (!userSnapshot.empty) {
            const userData = userSnapshot.docs[0].data();
            setUser({ ...userData, id: userSnapshot.docs[0].id });
          }
        } catch (error) {
          showErrorAlert(error.message);
        }
      } else {
        setUser(null);
      }
      setIsLoading(false);
      showLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleEdit = (field) => {
    setEditingField(field);
    setEditValue(user[field]);
  };

  const handleCloseModal = () => {
    setEditingField(null);
    setEditValue('');
  };

  const handleUpdateField = async () => {
    try {
      showLoading(true);
      await firebase.firestore().collection('users').doc(user.id).update({
        [editingField]: editValue
      });
      setUser(prevUser => ({
        ...prevUser,
        [editingField]: editValue
      }));
      handleCloseModal();
      showSuccessAlert('Field updated successfully!');
    } catch (error) {
      showErrorAlert(error.message);
    }
    showLoading(false);
  };

  const handlePhotoChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
  
    showLoading(true);
    
    // Renombrar la foto
    const userEmail = firebase.auth().currentUser.email;
    const photoName = userEmail.replace('@', '_').replace('.', '_');
    const newFileName = `${photoName}_${Date.now()}_${file.name}`; // Nuevo nombre de archivo
    
    // Eliminar foto anterior si existe
    if (user.photoUrl) {
      try {
        await firebase.storage().refFromURL(user.photoUrl).delete();
      } catch (error) {
        console.error('Error deleting previous photo:', error);
      }
    }
  
    // Subir la nueva foto con el nuevo nombre
    const storageRef = firebase.storage().ref(`users/${newFileName}`);
    try {
      await storageRef.put(file);
      const photoUrl = await storageRef.getDownloadURL();
      await firebase.firestore().collection('users').doc(user.id).update({
        photoUrl
      });
      // Actualizar localmente el estado del usuario
      setUser(prevUser => ({
        ...prevUser,
        photoUrl
      }));
      showSuccessAlert('Photo updated successfully!');
    } catch (error) {
      showErrorAlert(error.message);
    }
    showLoading(false);
  };

  const handleMouseEnter = () => {
    setHovering(true);
  };

  const handleMouseLeave = () => {
    setHovering(false);
  };

  return (
    <div className="container">
      {user && (
        <div class="row">
          <h2>Hola, {user.name}!</h2>
          <div class="col-2"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            {user.photoUrl ? (
              <img
                src={user.photoUrl}
                className="w-100 border border-secondary rounded-5"
                onClick={() => document.getElementById('file-input').click()}
              />
            ) : (
              <button
                className="btn"
                onClick={() => document.getElementById('file-input').click()}
              >
                Subir foto
              </button>
            )}
            {hovering && (
              <div className="edit-photo-text">Cambiar foto</div>
            )}
          </div>
          <input
            type="file"
            id="file-input"
            style={{ display: 'none' }}
            accept="image/*"
            onChange={handlePhotoChange}
          />
          <div class="col-8">
            <h5>Tus Datos:</h5>
            <p>
              Nombre: {user.name}
              <button className="btn-link" onClick={() => handleEdit('name')}><i class="fa-solid fa-pen-to-square"></i></button>
            </p>
            <p>
              Correo: {user.email}
            </p>
            <p>
              Telefono: {user.phone}
              <button className="btn-link" onClick={() => handleEdit('phone')}><i class="fa-solid fa-pen-to-square"></i></button>
            </p>
          </div>
        </div>
      )}

      <div className={`modal ${editingField ? 'show' : ''}`} tabIndex="-1" role="dialog" style={{ display: editingField ? 'block' : 'none' }}>
        <div className="modal-dialog" role="document">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Editar {editingField}</h5>
              <button type="button" className="btn-close" aria-label="Close" onClick={handleCloseModal}></button>
            </div>
            <div className="modal-body">
              <input type="text" className="form-control" value={editValue} onChange={(e) => setEditValue(e.target.value)} />
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={handleCloseModal}>Cancelar</button>
              <button type="button" className="btn btn-primary" onClick={handleUpdateField}>Guardar</button>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default Profile;