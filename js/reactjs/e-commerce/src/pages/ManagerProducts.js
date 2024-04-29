import React, { useState, useEffect } from 'react';
import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';
import * as XLSX from 'xlsx';

const ManagerProducts = ({ showSuccessAlert, showErrorAlert, showLoading }) => {
  const [products, setProducts] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    priceByUnit: '',
    wholesalePrice: '',
    photos: [],
    details: '',
    quantity: '',
    category: '',
    dateCreate: firebase.firestore.FieldValue.serverTimestamp(),
    dateUpdate: null
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [isExcelModalOpen, setIsExcelModalOpen] = useState(false);
  const [excelData, setExcelData] = useState(null);
  const [categories, setCategories] = useState([]);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [isCategoriesModalOpen, setIsCategoriesModalOpen] = useState(false);
  

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        showLoading(true);
        const productsSnapshot = await firebase.firestore().collection('products').get();
        const productsData = productsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setProducts(productsData);
        showLoading(false);
      } catch (error) {
        showErrorAlert(error.message);
        showLoading(false);
      }
    };

    const fetchCategories = async () => {
      try {
        const categoriesSnapshot = await firebase.firestore().collection('categories').get();
        const categoriesData = categoriesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setCategories(categoriesData);
      } catch (error) {
        showErrorAlert(error.message);
      }
    };

    fetchProducts();
    fetchCategories();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setFormData({
      ...formData,
      photos: files
    });
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setIsEditModalOpen(false);
    setFormData({
      code: '',
      name: '',
      priceByUnit: '',
      wholesalePrice: '',
      photos: [],
      details: '',
      quantity: '',
      category: '',
      dateCreate: firebase.firestore.FieldValue.serverTimestamp(),
      dateUpdate: null
    });
  };

  const generateUniqueName = (originalName) => {
    const timestamp = new Date().getTime();
    const randomString = Math.random().toString(36).substring(7);
    const fileExtension = originalName.split('.').pop();
    return `${timestamp}_${randomString}.${fileExtension}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    showLoading(true);

    try {
      const codeExists = products.some(product => product.code === formData.code);
      if (codeExists) {
        throw new Error('Product code already exists.');
      }
      const photoUrls = [];
      for (const photo of formData.photos) {
        const uniqueName = generateUniqueName(photo.name);
        const storageRef = firebase.storage().ref(`products/${uniqueName}`);
        await storageRef.put(photo);
        const photoUrl = await storageRef.getDownloadURL();
        photoUrls.push(photoUrl);
      }
      await firebase.firestore().collection('products').add({
        ...formData,
        photos: photoUrls
      });

      showSuccessAlert('Product added successfully!');
      setIsModalOpen(false);
      showLoading(false);
      setProducts([...products, formData]);
    } catch (error) {
      showErrorAlert(error.message);
      showLoading(false);
    }
  };

  const handleEditModalOpen = (product) => {
    setSelectedProduct(product);
    setFormData({
      ...product,
      dateUpdate: firebase.firestore.FieldValue.serverTimestamp()
    });
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    showLoading(true);

    try {
      const newPhotoUrls = [];
      for (const photo of formData.photos) {
        if (photo instanceof File) {
          const uniqueName = generateUniqueName(photo.name);
          const storageRef = firebase.storage().ref(`products/${uniqueName}`);
          await storageRef.put(photo);
          const photoUrl = await storageRef.getDownloadURL();
          newPhotoUrls.push(photoUrl);
        }
      }

      if (newPhotoUrls.length > 0) {
        for (const oldPhotoUrl of selectedProduct.photos) {
          try {
            const oldPhotoRef = firebase.storage().refFromURL(oldPhotoUrl);
            await oldPhotoRef.delete();
          } catch (error) {
            console.error("Error deleting old photo:", error.message);
          }
        }
      }

      await firebase.firestore().collection('products').doc(selectedProduct.id).update({
        ...formData,
        photos: newPhotoUrls.length > 0 ? newPhotoUrls : selectedProduct.photos
      });

      showSuccessAlert('Product updated successfully!');
      setIsEditModalOpen(false);
      showLoading(false);
      const updatedProducts = products.map(prod => {
        if (prod.id === selectedProduct.id) {
          return { ...formData, id: selectedProduct.id };
        }
        return prod;
      });
      setProducts(updatedProducts);
    } catch (error) {
      showErrorAlert(error.message);
      showLoading(false);
    }
  };

  const filteredProducts = products.filter(product => {
    const codeMatch = product.code.toLowerCase().includes(searchTerm.toLowerCase());
    const nameMatch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    return codeMatch || nameMatch;
  });

  const handleExcelFileChange = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    
    reader.onload = (event) => {
      const data = new Uint8Array(event.target.result);
      const workbook = XLSX.read(data, { type: 'array' });
      const sheets = workbook.SheetNames;
      const excelData = XLSX.utils.sheet_to_json(workbook.Sheets[sheets[0]]);
      setExcelData(excelData);
      setIsModalOpen(false);
      setIsExcelModalOpen(true);
    };
    
    reader.readAsArrayBuffer(file);
  };

  const handleExcelImportSubmit = async () => {
    try {
      const batch = firebase.firestore().batch();

      excelData.forEach((row) => {
        const productData = {
          code: row['Código'],
          name: row['Nombre'],
          wholesalePrice: row['Precio Mayorista'],
          priceByUnit: row['Precio Unitario'],
          quantity: row['Cantidad'],
          details: row['Detalles'],
          photos: [],
          category: row['Categoría'],
          dateCreate: firebase.firestore.FieldValue.serverTimestamp(),
        };
        const productRef = firebase.firestore().collection('products').doc();
        batch.set(productRef, productData);
      });

      await batch.commit();
      showSuccessAlert('Productos importados con éxito!');
      setIsExcelModalOpen(false);
      setExcelData(null);
    } catch (error) {
      showErrorAlert(error.message);
    }
  };

  const handleDeleteCategory = async (categoryId) => {
    try {
      await firebase.firestore().collection('categories').doc(categoryId).delete();
      setCategories(categories.filter(category => category.id !== categoryId));
      showSuccessAlert('Categoría eliminada correctamente.');
    } catch (error) {
      showErrorAlert(error.message);
    }
  };

  const handleAddCategory = async (e) => {
    e.preventDefault();
    try {
      const categoryRef = await firebase.firestore().collection('categories').add({
        name: newCategoryName,
      });
      setCategories([...categories, { id: categoryRef.id, name: newCategoryName }]);
      setNewCategoryName('');
      showSuccessAlert('Categoría agregada correctamente.');
    } catch (error) {
      showErrorAlert(error.message);
    }
  };

  return (
    <div className="container">
      <h2>Administrar Productos</h2>
      <div className="mb-3">
        <input type="text" className="form-control" placeholder="Buscar por codigo o nombre" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
      </div>
      <button className="btn btn-primary mb-3" onClick={() => setIsModalOpen(true)}><i class="fa-solid fa-plus"></i> Agregar Producto</button>

      <button className="btn btn-primary mb-3 ms-3" onClick={() => setIsCategoriesModalOpen(true)}>Categorías</button>

      <div className="mb-3">
        <label htmlFor="excelFile" className="form-label">Importar Desde Excel</label>
        <input type="file" className="form-control" id="excelFile" name="excelFile" onChange={handleExcelFileChange} accept=".xlsx, .xls" />
      </div>

      <table className="table">
        <thead>
          <tr>
            <th>Código</th>
            <th>Nombre</th>
            <th>Precio Unitario</th>
            <th>Precio Mayorista</th>
            <th>Cantidad Disp.</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {filteredProducts.map(product => (
            <tr key={product.id}>
              <td>{product.code}</td>
              <td>{product.name}</td>
              <td>{product.priceByUnit}</td>
              <td>{product.wholesalePrice}</td>
              <td>{product.quantity}</td>
              <td>
                <button className="btn btn-secondary" onClick={() => handleEditModalOpen(product)}><i class="fa-solid fa-pen-to-square"></i></button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {isModalOpen && (
        <div className="modal" tabIndex="-1" role="dialog" style={{ display: 'block' }}>
          <div className="modal-dialog" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Datos del Nuevo Producto</h5>
                <button type="button" className="btn-close" aria-label="Close" onClick={handleModalClose}></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label htmlFor="code" className="form-label">Código</label>
                    <input type="text" className="form-control" id="code" name="code" value={formData.code} onChange={handleInputChange} required />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="name" className="form-label">Nombre</label>
                    <input type="text" className="form-control" id="name" name="name" value={formData.name} onChange={handleInputChange} required />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="priceByUnit" className="form-label">Precio Unitario</label>
                    <input type="number" className="form-control" id="priceByUnit" name="priceByUnit" value={formData.priceByUnit} onChange={handleInputChange} required />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="wholesalePrice" className="form-label">Precio Mayorista</label>
                    <input type="number" className="form-control" id="wholesalePrice" name="wholesalePrice" value={formData.wholesalePrice} onChange={handleInputChange} required />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="photos" className="form-label">Imágenes</label>
                    <input type="file" className="form-control" id="photos" name="photos" onChange={handleFileChange} multiple required />
                    {formData.photos && formData.photos.length > 0 && (
                      <div className="mt-2">
                        {formData.photos.map((photo, index) => (
                          <img key={index} src={URL.createObjectURL(photo)} alt="Product Thumbnail" style={{ width: '30px', height: '30px', marginRight: '5px' }} />
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="mb-3">
                    <label htmlFor="details" className="form-label">Detalles</label>
                    <textarea className="form-control" id="details" name="details" value={formData.details} onChange={handleInputChange} required />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="quantity" className="form-label">Cantidad Disponible</label>
                    <input type="number" className="form-control" id="quantity" name="quantity" value={formData.quantity} onChange={handleInputChange} required />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="category" className="form-label">Categoria</label>
                    <select className="form-select" id="category" name="category" value={formData.category} onChange={handleInputChange} required>
                      <option value="">Seleccionar categoria</option>
                      {categories.map(category => (
                        <option value={category.name}>{category.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={handleModalClose}>Cancelar</button>
                  <button type="submit" className="btn btn-primary">Publicar</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {isEditModalOpen && (
        <div className="modal" tabIndex="-1" role="dialog" style={{ display: 'block' }}>
          <div className="modal-dialog" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Edit Product</h5>
                <button type="button" className="btn-close" aria-label="Close" onClick={handleModalClose}></button>
              </div>
              <form onSubmit={handleEditSubmit}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label htmlFor="name" className="form-label">Name</label>
                    <input type="text" className="form-control" id="name" name="name" value={formData.name} onChange={handleInputChange} required />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="priceByUnit" className="form-label">Price By Unit</label>
                    <input type="number" className="form-control" id="priceByUnit" name="priceByUnit" value={formData.priceByUnit} onChange={handleInputChange} required />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="wholesalePrice" className="form-label">Wholesale Price</label>
                    <input type="number" className="form-control" id="wholesalePrice" name="wholesalePrice" value={formData.wholesalePrice} onChange={handleInputChange} required />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="photos" className="form-label">Photos</label>
                    {selectedProduct && selectedProduct.photos && (
                      <div>
                        <p>Old Photos:</p>
                        <div className="mt-2">
                          {selectedProduct.photos.map((photo, index) => (
                            typeof photo === 'string' ? (
                              <img key={index} src={photo} alt="Old Product Thumbnail" style={{ width: '30px', height: '30px', marginRight: '5px' }} />
                            ) : null
                          ))}
                        </div>
                      </div>
                    )}
                    <input type="file" className="form-control" id="photos" name="photos" onChange={handleFileChange} multiple />
                    {formData.photos && formData.photos.length > 0 && (
                      <div>
                        <p>New Photos:</p>
                        <div className="mt-2">
                          {formData.photos.map((photo, index) => (
                            typeof photo === 'object' && photo instanceof File ? (
                              <img key={index} src={URL.createObjectURL(photo)} alt="New Product Thumbnail" style={{ width: '30px', height: '30px', marginRight: '5px' }} />
                            ) : null
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="mb-3">
                    <label htmlFor="details" className="form-label">Details</label>
                    <textarea className="form-control" id="details" name="details" value={formData.details} onChange={handleInputChange} required />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="category" className="form-label">Category</label>
                    <select className="form-select" id="category" name="category" value={formData.category} onChange={handleInputChange}>
                      <option value="">Select category</option>
                      {categories.map(category => (
                        <option value={category.name}>{category.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={handleModalClose}>Close</button>
                  <button type="submit" className="btn btn-primary">Update Product</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

{isExcelModalOpen && (
        <div className="modal" tabIndex="-1" role="dialog" style={{ display: 'block' }}>
          <div className="modal-dialog" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Vista previa de productos</h5>
                <button type="button" className="btn-close" aria-label="Close" onClick={() => setIsExcelModalOpen(false)}></button>
              </div>
              <div className="modal-body">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Código</th>
                      <th>Nombre</th>
                      <th>Precio Mayorista</th>
                      <th>Precio Unitario</th>
                      <th>Cantidad</th>
                      <th>Detalles</th>
                      <th>Categoria</th>
                    </tr>
                  </thead>
                  <tbody>
                    {excelData && excelData.map((row, index) => (
                      <tr key={index}>
                        <td>{row['Código']}</td>
                        <td>{row['Nombre']}</td>
                        <td>{row['Precio Mayorista']}</td>
                        <td>{row['Precio Unitario']}</td>
                        <td>{row['Cantidad']}</td>
                        <td>{row['Detalles']}</td>
                        <td>{row['Categoría']}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setIsExcelModalOpen(false)}>Cancelar</button>
                <button type="button" className="btn btn-primary" onClick={handleExcelImportSubmit}>Importar productos</button>
              </div>
            </div>
          </div>
        </div>
      )}
      {isCategoriesModalOpen && (
        <div className="modal" tabIndex="-1" role="dialog" style={{ display: 'block' }}>
          <div className="modal-dialog" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Categorías</h5>
                <button type="button" className="btn-close" aria-label="Close" onClick={() => setIsCategoriesModalOpen(false)}></button>
              </div>
              <div className="modal-body">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Nombre</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {categories.map(category => (
                      <tr key={category.id}>
                        <td>{category.name}</td>
                        <td>
                          <button className="btn btn-danger" onClick={() => handleDeleteCategory(category.id)}>Eliminar</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="modal-footer">
                <form onSubmit={handleAddCategory}>
                  <div className="mb-3">
                    <input type="text" className="form-control" placeholder="Nombre de la nueva categoría" value={newCategoryName} onChange={(e) => setNewCategoryName(e.target.value)} required />
                  </div>
                  <button type="submit" className="btn btn-primary">Agregar Categoría</button>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManagerProducts;