import React, { useState, useEffect } from 'react';
import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';
import { Link } from 'react-router-dom';

const ManagerDistributions = ({ showSuccessAlert, showErrorAlert, showLoading }) => {
    const [users, setUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [userDistributions, setUserDistributions] = useState({});
    const [searchTerm, setSearchTerm] = useState('');
    const [products, setProducts] = useState([]);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                showLoading(true);
                const usersSnapshot = await firebase.firestore().collection('users').get();
                const usersData = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                const filteredUsersData = usersData.filter(user => user.role === 'Admin' || user.role === 'Seller');
                setUsers(filteredUsersData);
                setFilteredUsers(filteredUsersData);
                showLoading(false);
            } catch (error) {
                console.error('Error fetching users:', error);
                showLoading(false);
            }
        };

        const fetchProducts = async () => {
            try {
                const productsSnapshot = await firebase.firestore().collection('products').get();
                const productsData = productsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setProducts(productsData);
            } catch (error) {
                console.error('Error fetching products:', error);
            }
        };

        fetchUsers();
        fetchProducts();
    }, []);

    const getProductCode = (productId) => {
        const product = products.find(product => product.id === productId);
        return product ? product.code : '';
    };
    const getProductName = (productId) => {
        const product = products.find(product => product.id === productId);
        return product ? product.name : '';
    };

    const fetchDistributions = async (email) => {
        try {
            const distributionsSnapshot = await firebase.firestore().collection('distributions').where('sellerId', '==', email).get();
            const distributionsData = distributionsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setUserDistributions(prevState => ({
                ...prevState,
                [email]: distributionsData
            }));
        } catch (error) {
            console.error('Error fetching details sales:', error);
        }
    };

    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
        const filtered = users.filter(user =>
            user.name.toLowerCase().includes(e.target.value.toLowerCase()) ||
            user.email.toLowerCase().includes(e.target.value.toLowerCase())
        );
        setFilteredUsers(filtered);
    };

    return (
        <div className="container">
            <h2>Administrar Distribuciones</h2>

            <div className="col text-end mb-3">
                <Link to="/manager-distributions-create" className="btn"><i className="fa-solid fa-plus"></i> Nueva Administracion</Link>
            </div>

            <div className="mb-3">
                <input
                    type="text"
                    className="form-control"
                    placeholder="Buscar por nombre o correo electrónico"
                    value={searchTerm}
                    onChange={handleSearch}
                />
            </div>
            <table className="table">
                <thead>
                    <tr>
                        <th>Nombre</th>
                        <th>Correo Electronico</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredUsers.map(user => (
                        <React.Fragment key={user.id}>
                            <tr onClick={() => fetchDistributions(user.email)} data-bs-toggle="collapse" data-bs-target={`#details_${user.email}`} aria-expanded="false" aria-controls={`details_${user.email}`}>
                                <td>{user.name}</td>
                                <td>{user.email}</td>
                            </tr>
                            <tr>
                                <td colSpan="4" className="p-0">
                                    <div id={`details_${user.email}`} className="collapse" aria-labelledby={`details_${user.email}`} data-parent="#accordionExample">
                                        <div className="accordion-body">
                                            <h5>Detalles</h5>
                                            <table className="table">
                                                <thead>
                                                    <tr>
                                                        <th>Codigo</th>
                                                        <th>Producto</th>
                                                        <th>Cantidad</th>
                                                        <th>Total</th>
                                                        <th>Estado</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {userDistributions[user.email] && userDistributions[user.email].map(detail => (
                                                        <tr key={detail.id}>
                                                            <td>{getProductCode(detail.productId)}</td>
                                                            <td>{getProductName(detail.productId)}</td>
                                                            <td>{detail.productquantity}</td>
                                                            <td>{detail.total}</td>
                                                            <td>{detail.status}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </td>
                            </tr>
                        </React.Fragment>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default ManagerDistributions;