import React, { useState } from 'react';
import { X, Upload, Save } from 'lucide-react';

const AddProductModal = ({ isOpen, onClose, onProductAdded }) => {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [status, setStatus] = useState('IN STOCK');
  const [imageBase64, setImageBase64] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        
        const MAX_DIM = 800;
        
        if (width > height) {
          if (width > MAX_DIM) {
            height *= MAX_DIM / width;
            width = MAX_DIM;
          }
        } else {
          if (height > MAX_DIM) {
            width *= MAX_DIM / height;
            height = MAX_DIM;
          }
        }
        
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        
        const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7);
        setImageBase64(compressedBase64);
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !price || !imageBase64) return;

    setIsLoading(true);
    try {
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name,
          price,
          status,
          image: imageBase64
        })
      });

      if (response.ok) {
        const newProduct = await response.json();
        onProductAdded(newProduct);
        // Reset form
        setName('');
        setPrice('');
        setStatus('IN STOCK');
        setImageBase64('');
        onClose();
      } else {
        alert('Failed to add product');
      }
    } catch (error) {
      console.error(error);
      alert('Error adding product');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="close-button" onClick={onClose}>
          <X size={24} />
        </button>

        <div className="modal-header">
          <h2>Add New Product</h2>
          <p>Add a new item to your catalog.</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Product Name</label>
            <input 
              type="text" 
              className="form-input" 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              placeholder="e.g. Magic Umbrella"
              required 
            />
          </div>

          <div className="form-group flex-group">
            <div className="flex-item">
              <label className="form-label">Price ($)</label>
              <input 
                type="number" 
                className="form-input" 
                value={price} 
                step="0.01"
                onChange={(e) => setPrice(e.target.value)} 
                placeholder="100.00"
                required 
              />
            </div>
            <div className="flex-item">
              <label className="form-label">Status</label>
              <select 
                className="form-input" 
                value={status} 
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="IN STOCK">IN STOCK</option>
                <option value="OUT OF STOCK">OUT OF STOCK</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Product Image</label>
            <div className="image-upload-area">
              {imageBase64 ? (
                <div className="image-preview-container">
                  <img src={imageBase64} alt="Preview" className="image-preview" />
                  <button type="button" className="btn-remove-image" onClick={() => setImageBase64('')}>Remove</button>
                </div>
              ) : (
                <label className="upload-label">
                  <Upload size={32} />
                  <span>Click to upload image</span>
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleImageUpload} 
                    style={{ display: 'none' }}
                  />
                </label>
              )}
            </div>
          </div>

          <button type="submit" className="btn-primary" disabled={isLoading || !imageBase64}>
            {isLoading ? 'Saving...' : <><Save size={20} /> Save Product</>}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddProductModal;
