import { useState, useEffect } from 'react';
import { productAPI } from '../services/api';
import { Plus, Search, Edit2, Trash2, Package } from 'lucide-react';
import { format } from 'date-fns';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ name: '', sku: '', description: '', price: '', stock: '' });
  const [error, setError] = useState(null);

  const fetchProducts = async () => {
    try {
      const res = await productAPI.getAll();
      setProducts(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const openAddModal = () => {
    setEditingId(null);
    setFormData({ name: '', sku: '', description: '', price: '', stock: '' });
    setError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (product) => {
    setEditingId(product.id);
    setFormData({ 
      name: product.name, 
      sku: product.sku, 
      description: product.description || '', 
      price: product.price, 
      stock: product.stock 
    });
    setError(null);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        await productAPI.delete(id);
        fetchProducts();
      } catch (err) {
        alert("Failed to delete product. It might be linked to existing orders.");
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      const payload = {
        ...formData,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock, 10)
      };

      if (editingId) {
        await productAPI.update(editingId, payload);
      } else {
        await productAPI.create(payload);
      }
      
      setIsModalOpen(false);
      setFormData({ name: '', sku: '', description: '', price: '', stock: '' });
      fetchProducts();
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to save product");
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-black text-stone-800 tracking-tight">Inventory Catalog</h1>
          <p className="text-stone-400 font-medium mt-1">Manage your products and track current stock levels.</p>
        </div>
        <button 
          onClick={openAddModal}
          className="premium-button text-white px-5 py-2.5 rounded-xl font-bold flex items-center shadow-md"
        >
          <Plus size={18} className="mr-2" strokeWidth={2.5} /> Add Product
        </button>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-stone-200 overflow-hidden">
        <div className="p-5 border-b border-stone-200 bg-white flex gap-4">
          <div className="relative flex-grow max-w-md">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search size={18} className="text-stone-300" />
            </div>
            <input 
              type="text" 
              placeholder="Search products by name or SKU..." 
              className="pl-11 pr-4 py-3 w-full bg-[#fdfbf7] border-none rounded-xl focus:ring-2 focus:ring-rose-300 focus:bg-white transition-all text-sm font-medium"
            />
          </div>
        </div>

        {loading ? (
          <div className="p-12 flex justify-center"><div className="w-10 h-10 border-4 border-rose-200 border-t-indigo-600 rounded-full animate-spin"></div></div>
        ) : products.length === 0 ? (
          <div className="p-16 text-center text-stone-400 flex flex-col items-center">
            <div className="bg-rose-50 p-6 rounded-full mb-6">
              <Package size={56} className="text-rose-300" strokeWidth={1.5} />
            </div>
            <h3 className="text-xl font-bold text-stone-800 mb-2">No Products Found</h3>
            <p className="text-sm max-w-sm mx-auto mb-6">You haven't added any products to your inventory yet. Get started by creating your first product.</p>
            <button onClick={openAddModal} className="text-rose-500 font-bold hover:text-indigo-800 transition-colors">Add First Product &rarr;</button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#fdfbf7]/50 text-stone-400 text-xs font-bold uppercase tracking-wider border-b border-stone-200">
                  <th className="p-5">SKU</th>
                  <th className="p-5">Product Details</th>
                  <th className="p-5">Price</th>
                  <th className="p-5">Status</th>
                  <th className="p-5">Date Added</th>
                  <th className="p-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {products.map((product) => (
                  <tr key={product.id} className="hover:bg-[#fdfbf7]/80 transition-colors group">
                    <td className="p-5 text-sm font-mono font-medium text-stone-400 bg-[#fdfbf7]/30">
                      {product.sku}
                    </td>
                    <td className="p-5">
                      <div className="font-bold text-stone-800 mb-1">{product.name}</div>
                      <div className="text-xs text-stone-400 truncate max-w-xs">{product.description || 'No description provided'}</div>
                    </td>
                    <td className="p-5 font-black text-stone-800">${product.price.toFixed(2)}</td>
                    <td className="p-5">
                      <div className="flex items-center">
                        <div className={`w-2 h-2 rounded-full mr-2 ${
                          product.stock > 10 ? 'bg-orange-500' : 
                          product.stock > 0 ? 'bg-amber-500' : 'bg-rose-500'
                        }`}></div>
                        <span className={`text-sm font-bold ${
                          product.stock > 10 ? 'text-orange-700' : 
                          product.stock > 0 ? 'text-amber-700' : 'text-rose-700'
                        }`}>
                          {product.stock} in stock
                        </span>
                      </div>
                    </td>
                    <td className="p-5 text-sm font-medium text-stone-400">
                      {product.created_at ? format(new Date(product.created_at), 'MMM d, yyyy') : 'N/A'}
                    </td>
                    <td className="p-5 text-right">
                      <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => openEditModal(product)} className="p-2 rounded-lg text-stone-300 hover:text-rose-500 hover:bg-rose-50 transition-colors"><Edit2 size={16} /></button>
                        <button onClick={() => handleDelete(product.id)} className="p-2 rounded-lg text-stone-300 hover:text-rose-600 hover:bg-rose-50 transition-colors"><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-[60]">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-fade-in border border-stone-200">
            <div className="p-6 border-b border-stone-200 bg-[#fdfbf7]/50">
              <h2 className="text-2xl font-black text-stone-800 tracking-tight">{editingId ? 'Edit Product' : 'Add New Product'}</h2>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {error && <div className="p-4 bg-rose-50 text-rose-700 rounded-xl text-sm font-medium border border-rose-100">{error}</div>}
              <div className="grid grid-cols-2 gap-5">
                <div className="col-span-2">
                  <label className="block text-sm font-bold text-stone-600 mb-2">Product Name</label>
                  <input required type="text" name="name" value={formData.name} onChange={handleChange} className="w-full bg-[#fdfbf7] border-none rounded-xl p-3 focus:ring-2 focus:ring-rose-300 focus:bg-white transition-all" placeholder="e.g. Wireless Headphones" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-stone-600 mb-2">SKU Code</label>
                  <input required type="text" name="sku" value={formData.sku} onChange={handleChange} disabled={!!editingId} className="w-full bg-[#fdfbf7] border-none rounded-xl p-3 focus:ring-2 focus:ring-rose-300 focus:bg-white transition-all font-mono text-sm disabled:opacity-50" placeholder="e.g. WH-100" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-stone-600 mb-2">Initial Stock</label>
                  <input required type="number" min="0" name="stock" value={formData.stock} onChange={handleChange} className="w-full bg-[#fdfbf7] border-none rounded-xl p-3 focus:ring-2 focus:ring-rose-300 focus:bg-white transition-all" placeholder="0" />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-bold text-stone-600 mb-2">Unit Price ($)</label>
                  <div className="relative">
                    <span className="absolute left-4 top-3 text-stone-400 font-bold">$</span>
                    <input required type="number" min="0.01" step="0.01" name="price" value={formData.price} onChange={handleChange} className="w-full bg-[#fdfbf7] border-none rounded-xl py-3 pl-8 pr-4 focus:ring-2 focus:ring-rose-300 focus:bg-white transition-all font-medium" placeholder="99.99" />
                  </div>
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-bold text-stone-600 mb-2">Description <span className="text-stone-300 font-normal">(Optional)</span></label>
                  <textarea name="description" value={formData.description} onChange={handleChange} rows="3" className="w-full bg-[#fdfbf7] border-none rounded-xl p-3 focus:ring-2 focus:ring-rose-300 focus:bg-white transition-all resize-none" placeholder="Brief product description..."></textarea>
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-6 mt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 text-stone-500 bg-stone-100 rounded-xl hover:bg-gray-200 font-bold transition-colors">Cancel</button>
                <button type="submit" className="premium-button px-6 py-2.5 text-white rounded-xl font-bold">Save Product</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Products;
