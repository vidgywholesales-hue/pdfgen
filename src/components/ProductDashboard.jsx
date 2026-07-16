import React, { useState, useEffect } from 'react';
import { Search, CheckCircle, Plus, Trash2, XCircle, CheckSquare } from 'lucide-react';
import AddProductModal from './AddProductModal';

const ProductDashboard = ({ selectedProducts, toggleSelection, clearSelection, selectAll }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/products');
      const data = await response.json();
      if (Array.isArray(data)) {
        setProducts(data);
      } else {
        console.error('Server returned an error:', data);
        setProducts([]); // Fallback to empty array to prevent crash
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleProductAdded = (newProduct) => {
    setProducts([newProduct, ...products]);
  };

  const handleDeleteProduct = async (e, id) => {
    e.stopPropagation(); // prevent triggering toggleSelection
    if (!window.confirm('Are you sure you want to delete this product from the catalog?')) {
      return;
    }

    try {
      const response = await fetch(`/api/products/${id}`, {
        method: 'DELETE'
      });
      if (response.ok) {
        setProducts(products.filter(p => p.id !== id));
      } else {
        alert('Failed to delete product');
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Error deleting product');
    }
  };

  const filteredProducts = products.filter(product => 
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <div className="dashboard-controls">
        <div className="search-bar" style={{ margin: 0, flex: 1 }}>
          <Search size={20} />
          <input 
            type="text" 
            placeholder="Search products..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        {selectedProducts.length > 0 && (
          <button className="btn-danger" style={{ width: 'auto', marginTop: 0 }} onClick={clearSelection}>
            <XCircle size={20} style={{ marginRight: '8px' }} />
            Clear Selection
          </button>
        )}
        
        {filteredProducts.length > 0 && (
          <button className="btn-secondary" style={{ width: 'auto', marginTop: 0, backgroundColor: 'var(--card-bg)', color: 'var(--text-main)', border: '1px solid var(--border-color)' }} onClick={() => selectAll(filteredProducts)}>
            <CheckSquare size={20} style={{ marginRight: '8px' }} />
            Select All
          </button>
        )}

        <button className="btn-primary" style={{ width: 'auto', marginTop: 0 }} onClick={() => setIsAddModalOpen(true)}>
          <Plus size={20} />
          Add Product
        </button>
      </div>

      {isLoading ? (
        <div className="empty-state">Loading catalog...</div>
      ) : products.length === 0 ? (
        <div className="empty-state">
          <h2>No products found</h2>
          <p>Click "Add Product" to start building your catalog.</p>
        </div>
      ) : (
        <div className="product-grid" style={{ marginTop: '2rem' }}>
          {filteredProducts.map(product => {
            const isSelected = selectedProducts.some(p => p.id === product.id);
            
            return (
              <div 
                key={product.id} 
                className={`glass-card ${isSelected ? 'selected' : ''}`}
                onClick={() => toggleSelection(product)}
                style={{ position: 'relative' }}
              >
                {isSelected && (
                  <div className="selection-indicator">
                    <CheckCircle size={24} color="#1a1a1a" />
                  </div>
                )}
                
                <button 
                  className="delete-product-btn"
                  onClick={(e) => handleDeleteProduct(e, product.id)}
                  title="Delete Product"
                >
                  <Trash2 size={16} />
                </button>
                
                <div className="image-container">
                  <img 
                    src={product.image} 
                    alt={product.name} 
                    className="product-image"
                  />
                </div>
                <div className="card-content" style={{ textAlign: 'center' }}>
                  <h3 className="product-name">{product.name}</h3>
                  {product.status === 'OUT OF STOCK' ? (
                    <div className="product-price" style={{ color: '#ef4444' }}>OUT OF STOCK</div>
                  ) : (
                    <div className="product-price">₹{product.price.toFixed(2)}</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <AddProductModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
        onProductAdded={handleProductAdded}
      />
    </div>
  );
};

export default ProductDashboard;
