import React from 'react';
import { Trash2, FileDown } from 'lucide-react';
import { generateDealsPDF } from '../utils/pdfGenerator';

const SelectedDealsPage = ({ selectedProducts, updateProduct, removeProduct }) => {

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
        {selectedProducts.map(product => (
          <div key={product.id} className="deal-list-item">
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

              <div className="form-group price-group">
                <label className="form-label">Price (₹)</label>
                <input 
                  type="number" 
                  className="form-input" 
                  value={product.customPrice} 
                  step="0.01"
                  onChange={(e) => updateProduct(product.id, 'customPrice', e.target.value)} 
                />
              </div>
            </div>

            <button 
              className="btn-danger-icon" 
              onClick={() => removeProduct(product.id)}
              title="Remove product"
            >
              <Trash2 size={20} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SelectedDealsPage;
