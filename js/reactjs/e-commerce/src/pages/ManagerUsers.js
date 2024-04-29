import React, { useState, useEffect } from 'react';
import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';

const ManagerUsers = ({ showSuccessAlert, showErrorAlert, showLoading }) => {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUserActions, setSelectedUserActions] = useState({});
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState('');
  const [selectedUserId, setSelectedUserId] = useState('');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        showLoading(true);
        const usersSnapshot = await firebase.firestore().collection('users').get();
        const usersData = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setUsers(usersData);
        showLoading(false);
      } catch (error) {
        showErrorAlert(error.message);
        showLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handleActionChange = (event, userId) => {
    const action = event.target.value;
    setSelectedUserActions(prevState => ({
      ...prevState,
      [userId]: action
    }));
    setSelectedUserId(userId);
  };

  const handleActionSubmit = async () => {
    try {
      const selectedAction = selectedUserActions[selectedUserId];
      if (selectedAction === 'resetPassword') {
        await firebase.auth().sendPasswordResetEmail(users.find(user => user.id === selectedUserId).email);
        showSuccessAlert('Correo de restablecimiento de contraseña enviado correctamente.');
      } else if (selectedAction === 'sendVerificationEmail') {
        await firebase.auth().currentUser.sendEmailVerification();
        showSuccessAlert('Correo de verificación enviado correctamente.');
      } else if (selectedAction === 'changeRole') {
        setIsRoleModalOpen(true);
      }
    } catch (error) {
      showErrorAlert(error.message);
    }
  };

  const handleRoleChange = (event) => {
    setSelectedRole(event.target.value);
  };

  const handleRoleSubmit = async () => {
    try {
      await firebase.firestore().collection('users').doc(selectedUserId).update({
        role: selectedRole
      });
      showSuccessAlert('Rol de usuario actualizado correctamente.');
      setIsRoleModalOpen(false);
    } catch (error) {
      showErrorAlert(error.message);
    }
  };

  const filteredUsers = users.filter(user => {
    const nameMatch = user.name.toLowerCase().includes(searchTerm.toLowerCase());
    const emailMatch = user.email.toLowerCase().includes(searchTerm.toLowerCase());
    return nameMatch || emailMatch;
  });

  return (
    <div className="container">
      <h2>Administrar Usuarios</h2>
      <div className="mb-3">
        <input type="text" className="form-control" placeholder="Buscar por nombre o correo electrónico" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
      </div>
      <table className="table">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Correo Electrónico</th>
            <th>Telefono</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {filteredUsers.map(user => (
            <tr key={user.id}>
              <td>{user.name}</td>
              <td>{user.email}</td>
              <td>{user.phone}</td>
              <td>
                <select className="form-select" value={selectedUserActions[user.id] || ''} onChange={(e) => handleActionChange(e, user.id)}>
                  <option value="">Seleccione una acción</option>
                  <option value="resetPassword">Enviar Restablecimiento de Contraseña</option>
                  <option value="sendVerificationEmail">Enviar Correo de Verificación</option>
                  <option value="changeRole">Cambiar Rol</option>
                </select>
                {selectedUserActions[user.id] && (
                  <button className="btn btn-primary" onClick={handleActionSubmit}>Ejecutar</button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {isRoleModalOpen && (
        <div className="modal" tabIndex="-1" role="dialog" style={{ display: 'block' }}>
          <div className="modal-dialog" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Cambiar Rol</h5>
                <button type="button" className="btn-close" aria-label="Close" onClick={() => setIsRoleModalOpen(false)}></button>
              </div>
              <div className="modal-body">
                <select className="form-select" value={selectedRole} onChange={handleRoleChange}>
                  <option value="">Seleccione un rol</option>
                  <option value="Client">Cliente</option>
                  <option value="Seller">Vendedor</option>
                </select>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setIsRoleModalOpen(false)}>Cancelar</button>
                <button type="button" className="btn btn-primary" onClick={handleRoleSubmit}>Guardar</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManagerUsers;