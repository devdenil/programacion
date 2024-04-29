import React, { useState, useEffect, useRef } from 'react';
import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';
import 'firebase/compat/auth';
import { Link } from 'react-router-dom';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const SalesManager = ({ showLoading }) => {
  const [sales, setSales] = useState([]);
  const [detailsSales, setDetailsSales] = useState([]);
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [filterType, setFilterType] = useState('all');
  const [filterSeller, setFilterSeller] = useState('');
  const [filterClient, setFilterClient] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [salesPerPage] = useState(30);
  const [userRole, setUserRole] = useState(null);
  const [authenticatedUser, setAuthenticatedUser] = useState(null);
  const salesTableRef = useRef(null);
  const [titlePdfRef, setTitlePdfRef] = useState("Todas las ventas");

  useEffect(() => {
    const unsubscribe = firebase.auth().onAuthStateChanged(user => {
      if (user) {
        setAuthenticatedUser(user);
        fetchUserRole(user.email);
      }
    });

    fetchUsers();
    fetchProducts();

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (authenticatedUser) {
      fetchSales();
    }
  }, [filterType, filterSeller, filterClient, filterDate, authenticatedUser, userRole]);

  const fetchUserRole = async (email) => {
    const userRef = firebase.firestore().collection('users').where('email', '==', email);
    const snap = await userRef.get();
    const userData = snap.docs.map(doc => doc.data());
    if (userData.length > 0) {
      setUserRole(userData[0].role);
    }
  };

  const fetchSales = async () => {
    if (!authenticatedUser) return;

    try {
      showLoading(true);
      let query = firebase.firestore().collection('sales');

      if (userRole === 'Seller') {
        query = query.where('sellerId', '==', authenticatedUser.email);
        setTitlePdfRef("Ventas segun Vendedor");
      } else if (filterSeller) {
        query = query.where('sellerId', '==', filterSeller);
        setTitlePdfRef("Ventas segun Vendedor");
      }

      if (filterClient) {
        query = query.where('clientId', '==', filterClient);
        setTitlePdfRef("Ventas segun Cliente");
      }

      if (filterType !== 'all') {
        query = query.where('typeSale', '==', filterType);
        setTitlePdfRef(`Ventas segun Tipo de Venta - ${filterType}`);
      }

      if (filterDate) {
        const selectedDate = new Date(filterDate);
        const startOfDay = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate(), 0, 0, 0);
        const endOfDay = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate(), 23, 59, 59, 999);

        query = query.where('dateCreated', '>=', firebase.firestore.Timestamp.fromDate(startOfDay)).where('dateCreated', '<=', firebase.firestore.Timestamp.fromDate(endOfDay));
        setTitlePdfRef(`Ventas del dia - ${selectedDate.toDateString()}`);
      }

      query = query.orderBy('dateCreated', 'desc');

      const salesSnapshot = await query.get();
      const salesData = salesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setSales(salesData);
      showLoading(false);
    } catch (error) {
      console.error('Error fetching sales:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      const usersSnapshot = await firebase.firestore().collection('users').get();
      const usersData = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setUsers(usersData);
      const filteredUsers = usersData.filter(user => user.role === 'Admin' || user.role === 'Seller');
      setFilteredUsers(filteredUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
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

  const fetchDetailsSales = async (saleId) => {
    try {
      const detailsSnapshot = await firebase.firestore().collection('detailsSales').where('saleId', '==', saleId).get();
      const detailsData = detailsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setDetailsSales(detailsData);
    } catch (error) {
      console.error('Error fetching details sales:', error);
    }
  };

  const getUserName = (email) => {
    const user = users.find(user => user.email === email);
    return user ? user.name : 'S/N';
  };

  const getProductName = (productId) => {
    const product = products.find(product => product.id === productId);
    return product ? product.name : '';
  };

  const handleFilterTypeChange = (e) => {
    setFilterType(e.target.value);
  };

  const handleFilterSellerChange = (e) => {
    setFilterSeller(e.target.value);
  };

  const handleFilterClientChange = (e) => {
    setFilterClient(e.target.value);
  };

  const handleFilterDateChange = (e) => {
    setFilterDate(e.target.value);
  };

  const handleSearchTermChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const filteredClients = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const indexOfLastSale = currentPage * salesPerPage;
  const indexOfFirstSale = indexOfLastSale - salesPerPage;
  const currentSales = sales.slice(indexOfFirstSale, indexOfLastSale);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const exportToPDF = () => {
    const pdf = new jsPDF();
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const tableRef = salesTableRef.current;

    html2canvas(tableRef).then(canvas => {
      const imgData = canvas.toDataURL('image/png');
      const imgWidth = pageWidth - 20;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 10, 40, imgWidth, imgHeight);
      pdf.text(titlePdfRef, 10, 30);
      pdf.save('ventas_del_dia.pdf');
    });
  };

  return (
    <div className="container">
      <div className="row mb-3">
        <div className="col">
          <h2>Ventas Realizadas</h2>
        </div>
        <div className="col text-end">
          <Link to="/manager-sales-create" className="btn"><i className="fa-solid fa-plus"></i> Nueva Venta</Link>
        </div>
      </div>
      <div className="row mb-3">
        <div className="col">
          <label htmlFor="filterType" className="form-label">Filtrar por Tipo:</label>
          <select className="form-select" id="filterType" value={filterType} onChange={handleFilterTypeChange}>
            <option value="all">Todos</option>
            <option value="Unitario">Unitario</option>
            <option value="Mayorista">Mayorista</option>
          </select>
        </div>
        {userRole === 'Admin' && (
          <div className="col">
            <label htmlFor="filterSeller" className="form-label">Filtrar por Vendedor:</label>
            <select className="form-select" id="filterSeller" value={filterSeller} onChange={handleFilterSellerChange}>
              <option value="">Todos</option>
              {filteredUsers.map(user => (
                <option key={user.id} value={user.email}>{user.name}</option>
              ))}
            </select>
          </div>
        )}
        <div className="col">
          <label htmlFor="filterClient" className="form-label">Filtrar por Cliente:</label>
          <input
            type="text"
            className="form-control"
            id="filterClient"
            placeholder="Buscar cliente..."
            value={searchTerm}
            onChange={handleSearchTermChange}
          />
          <select className="form-select mt-2" value={filterClient} onChange={handleFilterClientChange}>
            <option value="">Todos</option>
            {filteredClients.map(client => (
              <option key={client.id} value={client.email}>{client.name}</option>
            ))}
          </select>
        </div>
        <div className="col">
          <label htmlFor="filterDate" className="form-label">Filtrar por Fecha:</label>
          <input type="date" className="form-control" id="filterDate" value={filterDate} onChange={handleFilterDateChange} />
        </div>
        <div className="col text-start">
          <button className="btn btn-primary" onClick={exportToPDF}>Exportar a PDF</button>
        </div>
      </div>
      <table className="table" ref={salesTableRef}>
        <thead>
          <tr>
            <th>Vendedor</th>
            <th>Cliente</th>
            <th>Total</th>
            <th>Fecha y Hora</th>
          </tr>
        </thead>
        <tbody>
          {currentSales.map(sale => (
            <React.Fragment key={sale.id}>
              <tr onClick={() => fetchDetailsSales(sale.id)} data-bs-toggle="collapse" data-bs-target={`#details_${sale.id}`} aria-expanded="false" aria-controls={`details_${sale.id}`}>
                <td>{getUserName(sale.sellerId)}</td>
                <td>{getUserName(sale.clientId)}</td>
                <td>{sale.total}</td>
                <td>{sale.dateCreated?.toDate().toLocaleString()}</td>
              </tr>
              <tr>
                <td colSpan="4" className="p-0">
                  <div id={`details_${sale.id}`} className="collapse" aria-labelledby={`details_${sale.id}`} data-parent="#accordionExample">
                    <div className="accordion-body">
                      <h5>Detalles</h5>
                      <table className="table">
                        <thead>
                          <tr>
                            <th>Productos</th>
                            <th>Cantidad</th>
                          </tr>
                        </thead>
                        <tbody>
                          {detailsSales.map(detail => (
                            <tr key={detail.id}>
                              <td>{getProductName(detail.productId)}</td>
                              <td>{detail.quantity}</td>
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
      {/* Paginación */}
      <nav>
        <ul className="pagination">
          {Array.from({ length: Math.ceil(sales.length / salesPerPage) }).map((_, index) => (
            <li key={index} className={`page-item ${currentPage === index + 1 ? 'active' : ''}`}>
              <button onClick={() => paginate(index + 1)} className="page-link">
                {index + 1}
              </button>
            </li>
          ))}
        </ul>
      </nav>
      {/* Total de ventas */}
      <div className="row mt-3">
        <div className="col">
          <h5>Total de Ventas: ${sales.reduce((total, sale) => total + sale.total, 0)}</h5>
        </div>
      </div>
    </div>
  );
};

export default SalesManager;