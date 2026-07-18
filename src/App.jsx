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
        return [...prev, { ...product, customName: product.name, customPrice: product.price.toString(), customPackOf: '1' }];
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

  const selectAllProducts = (productsToSelect) => {
    setSelectedProducts(prev => {
      const newProducts = [...prev];
      productsToSelect.forEach(product => {
        if (!newProducts.find(p => p.id === product.id)) {
          newProducts.push({ ...product, customName: product.name, customPrice: product.price.toString(), customPackOf: '1' });
        }
      });
      return newProducts;
    });
  };

  const moveProduct = (fromIndex, toIndex) => {
    setSelectedProducts(prev => {
      const newProducts = [...prev];
      const [moved] = newProducts.splice(fromIndex, 1);
      newProducts.splice(toIndex, 0, moved);
      return newProducts;
    });
  };

  const reorderSelectedProduct = (index, direction) => {
    setSelectedProducts(prev => {
      const newProducts = [...prev];
      if (direction === 'up' && index > 0) {
        const temp = newProducts[index - 1];
        newProducts[index - 1] = newProducts[index];
        newProducts[index] = temp;
      } else if (direction === 'down' && index < newProducts.length - 1) {
        const temp = newProducts[index + 1];
        newProducts[index + 1] = newProducts[index];
        newProducts[index] = temp;
      }
      return newProducts;
    });
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
            selectAll={selectAllProducts}
          />
        )}
        
        {currentPage === 'deals' && (
          <SelectedDealsPage 
            selectedProducts={selectedProducts}
            updateProduct={updateSelectedProduct}
            removeProduct={removeSelectedProduct}
            reorderProduct={reorderSelectedProduct}
            moveProduct={moveProduct}
          />
        )}
      </main>

      <footer className="app-footer">
        <div className="branding-container">
          <span className="branding-text">Software developed by</span>
          <img src="/webiox-logo.png" alt="Webiox" className="webiox-logo" />
          <span className="branding-name">Webiox Tech Solution</span>
        </div>
      </footer>
    </div>
  );
}

export default App;
