import React, { useState } from 'react';
import ProductDashboard from './components/ProductDashboard';
import SelectedDealsPage from './components/SelectedDealsPage';

function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [selectedProducts, setSelectedProducts] = useState([]);

  const toggleProductSelection = (product) => {
    setSelectedProducts(prev => {
      const exists = prev.find(p => p.id === product.id);
      if (exists) {
        return prev.filter(p => p.id !== product.id);
      } else {
        // Deep copy the product so editing one doesn't affect others if they were added multiple times (though we prevent duplicates here)
        return [...prev, { ...product, customName: product.name, customPrice: product.price.toString() }];
      }
    });
  };

  const updateSelectedProduct = (id, field, value) => {
    setSelectedProducts(prev => prev.map(p => {
      if (p.id === id) {
        return { ...p, [field]: value };
      }
      return p;
    }));
  };

  const removeSelectedProduct = (id) => {
    setSelectedProducts(prev => prev.filter(p => p.id !== id));
  };

  const clearSelection = () => {
    setSelectedProducts([]);
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <div>
          <h1 className="app-title">VIDGY</h1>
          <div style={{ color: 'var(--text-muted)' }}>Wholesale & Retail</div>
        </div>
        <nav className="app-nav">
          <button 
            className={`nav-btn ${currentPage === 'home' ? 'active' : ''}`}
            onClick={() => setCurrentPage('home')}
          >
            Catalog
          </button>
          <button 
            className={`nav-btn ${currentPage === 'deals' ? 'active' : ''}`}
            onClick={() => setCurrentPage('deals')}
          >
            Selected Deals ({selectedProducts.length})
          </button>
        </nav>
      </header>
      
      <main>
        {currentPage === 'home' && (
          <ProductDashboard 
            selectedProducts={selectedProducts} 
            toggleSelection={toggleProductSelection} 
            clearSelection={clearSelection}
          />
        )}
        
        {currentPage === 'deals' && (
          <SelectedDealsPage 
            selectedProducts={selectedProducts}
            updateProduct={updateSelectedProduct}
            removeProduct={removeSelectedProduct}
          />
        )}
      </main>
    </div>
  );
}

export default App;
