import React, { useState } from 'react';
import { Trash2, FileDown, ArrowUp, ArrowDown, Save } from 'lucide-react';
import { generateDealsPDF } from '../utils/pdfGenerator';

const SelectedDealsPage = ({ selectedProducts, updateProduct, removeProduct, reorderProduct, moveProduct, updateCatalogPrice }) => {
  const [draggedIndex, setDraggedIndex] = useState(null);

  const handleSavePrice = async (product) => {
    if (updateCatalogPrice) {
      const success = await updateCatalogPrice(product.id, product.customPrice);
      if (success) {
        alert('Price saved to catalog successfully!');
      } else {
        alert('Failed to save price to catalog.');
      }
    }
  };

  const handleDragStart = (e, index) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    setTimeout(() => {
      if (e.target) e.target.style.opacity = '0.5';
    }, 0);
  };

  const handleDragEnd = (e) => {
    if (e.target) e.target.style.opacity = '1';
    setDraggedIndex(null);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e, index) => {
    e.preventDefault();
    if (draggedIndex !== null && draggedIndex !== index && moveProduct) {
      moveProduct(draggedIndex, index);
    }
  };

  const handleGenerate = async () => {
    if (selectedProducts.length === 0) return;
    await generateDealsPDF(selectedProducts);
  };

  if (selectedProducts.length === 0) {
    return (
      <div className="empty-state">
        <h2>No products selected</h2>
        <p>Go back to the catalog to select products for your deal.</p>
      </div>
    );
  }

  return (
    <div className="deals-page">
      <div className="deals-header">
        <h2>Selected Products</h2>
        <button className="btn-primary generate-btn" onClick={handleGenerate}>
          <FileDown size={20} />
          Generate PDF ({selectedProducts.length})
        </button>
      </div>

      <div className="deals-list">
        {selectedProducts.map((product, index) => (
          <div 
            key={product.id + index} 
            className="deal-list-item"
            draggable
            onDragStart={(e) => handleDragStart(e, index)}
            onDragEnd={handleDragEnd}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, index)}
            style={{ cursor: 'grab', transition: 'all 0.2s ease' }}
          >
            <div className="deal-image-stage">
              <img src={product.image} alt={product.name} className="deal-image" />
            </div>
            
            <div className="deal-details">
              <div className="form-group">
                <label className="form-label">Product Name</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={product.customName} 
                  onChange={(e) => updateProduct(product.id, 'customName', e.target.value)} 
                />
              </div>

              <div className="form-group pack-group" style={{ flex: '0 0 80px' }}>
                <label className="form-label">Pack of</label>
                <input 
                  type="number" 
                  className="form-input" 
                  value={product.customPackOf || '1'} 
                  min="1"
                  onChange={(e) => updateProduct(product.id, 'customPackOf', e.target.value)} 
                />
              </div>

              <div className="form-group price-group">
                <label className="form-label">Price (₹)</label>
                <div style={{ display: 'flex', gap: '4px' }}>
                  <input 
                    type="number" 
                    className="form-input" 
                    value={product.customPrice} 
                    step="0.01"
                    onChange={(e) => updateProduct(product.id, 'customPrice', e.target.value)} 
                  />
                  <button 
                    className="btn-secondary" 
                    title="Save to Catalog"
                    onClick={() => handleSavePrice(product)}
                    style={{ padding: '8px', background: 'var(--card-bg)', border: '1px solid var(--border-color)', color: 'var(--text-main)', cursor: 'pointer', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  >
                    <Save size={16} />
                  </button>
                </div>
              </div>
            </div>

            <div className="deal-actions" style={{ display: 'flex', flexDirection: 'column', gap: '8px', justifyContent: 'center' }}>
              <div style={{ display: 'flex', gap: '4px' }}>
                <button 
                  className="btn-secondary"
                  style={{ padding: '8px', background: 'var(--card-bg)', border: '1px solid var(--border-color)', color: 'var(--text-main)', cursor: 'pointer', borderRadius: '4px' }}
                  onClick={() => reorderProduct(index, 'up')}
                  disabled={index === 0}
                  title="Move up"
                >
                  <ArrowUp size={16} />
                </button>
                <button 
                  className="btn-secondary"
                  style={{ padding: '8px', background: 'var(--card-bg)', border: '1px solid var(--border-color)', color: 'var(--text-main)', cursor: 'pointer', borderRadius: '4px' }}
                  onClick={() => reorderProduct(index, 'down')}
                  disabled={index === selectedProducts.length - 1}
                  title="Move down"
                >
                  <ArrowDown size={16} />
                </button>
              </div>
              <button 
                className="btn-danger-icon" 
                onClick={() => removeProduct(product.id)}
                title="Remove product"
                style={{ width: '100%', display: 'flex', justifyContent: 'center' }}
              >
                <Trash2 size={20} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SelectedDealsPage;
