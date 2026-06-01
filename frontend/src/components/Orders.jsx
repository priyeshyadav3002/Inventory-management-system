import { useState, useEffect } from 'react';
import { orderAPI, productAPI, customerAPI } from '../services/api';
import { Plus, Search, Eye, ShoppingCart, Trash2, ArrowRight } from 'lucide-react';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [viewOrder, setViewOrder] = useState(null);
  const [error, setError] = useState(null);
  
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [orderItems, setOrderItems] = useState([{ product_id: '', quantity: 1 }]);

  const fetchData = async () => {
    try {
      const [ordersRes, productsRes, customersRes] = await Promise.all([
        orderAPI.getAll(),
        productAPI.getAll(),
        customerAPI.getAll()
      ]);
      setOrders(ordersRes.data);
      setProducts(productsRes.data);
      setCustomers(customersRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleItemChange = (index, field, value) => {
    const newItems = [...orderItems];
    newItems[index][field] = value;
    setOrderItems(newItems);
  };

  const handleViewOrder = async (orderId) => {
    try {
      const res = await orderAPI.getById(orderId);
      setViewOrder(res.data);
      setIsViewModalOpen(true);
    } catch (err) {
      console.error("Failed to fetch order details", err);
    }
  };

  const handleDeleteOrder = async (orderId) => {
    if (window.confirm("Are you sure you want to delete this order? This will restore the stock to the products.")) {
      try {
        await orderAPI.delete(orderId);
        fetchData();
      } catch (err) {
        console.error("Failed to delete order", err);
        alert("Failed to delete order");
      }
    }
  };

  const addItem = () => {
    setOrderItems([...orderItems, { product_id: '', quantity: 1 }]);
  };

  const removeItem = (index) => {
    const newItems = [...orderItems];
    newItems.splice(index, 1);
    setOrderItems(newItems);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    
    if (!selectedCustomerId) {
      setError("Please select a customer");
      return;
    }
    
    const validItems = orderItems.filter(item => item.product_id !== '' && item.quantity > 0);
    if (validItems.length === 0) {
      setError("Please add at least one valid product");
      return;
    }

    const payload = {
      customer_id: parseInt(selectedCustomerId, 10),
      items: validItems.map(item => ({
        product_id: parseInt(item.product_id, 10),
        quantity: parseInt(item.quantity, 10)
      }))
    };

    try {
      await orderAPI.create(payload);
      setIsModalOpen(false);
      setSelectedCustomerId('');
      setOrderItems([{ product_id: '', quantity: 1 }]);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to create order");
    }
  };

  const getCustomerName = (id) => {
    const c = customers.find(c => c.id === id);
    return c ? c.name : 'Unknown';
  };

  const calculateSubtotal = () => {
    let total = 0;
    orderItems.forEach(item => {
      if (item.product_id && item.quantity > 0) {
        const product = products.find(p => p.id === parseInt(item.product_id, 10));
        if (product) total += product.price * item.quantity;
      }
    });
    return total;
  };

  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Order Management</h1>
          <p className="text-gray-500 font-medium mt-1">Process orders and track sales performance.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white px-5 py-2.5 rounded-xl font-bold flex items-center shadow-lg shadow-purple-500/30 transition-all hover:-translate-y-0.5"
        >
          <Plus size={18} className="mr-2" strokeWidth={2.5} /> New Order
        </button>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-5 border-b border-gray-100 bg-white flex gap-4">
          <div className="relative flex-grow max-w-md">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search size={18} className="text-gray-400" />
            </div>
            <input 
              type="text" 
              placeholder="Search by order ID..." 
              className="pl-11 pr-4 py-3 w-full bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-purple-500 focus:bg-white transition-all text-sm font-medium"
            />
          </div>
        </div>

        {loading ? (
          <div className="p-12 flex justify-center"><div className="w-10 h-10 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div></div>
        ) : orders.length === 0 ? (
          <div className="p-16 text-center text-gray-500 flex flex-col items-center">
            <div className="bg-purple-50 p-6 rounded-full mb-6">
              <ShoppingCart size={56} className="text-purple-400" strokeWidth={1.5} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No Orders Yet</h3>
            <p className="text-sm max-w-sm mx-auto mb-6">You haven't processed any orders. Create your first order to see it here.</p>
            <button onClick={() => setIsModalOpen(true)} className="text-purple-600 font-bold hover:text-purple-800 transition-colors">Create First Order &rarr;</button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 text-gray-500 text-xs font-bold uppercase tracking-wider border-b border-gray-100">
                  <th className="p-5">Order ID</th>
                  <th className="p-5">Customer</th>
                  <th className="p-5">Date Processed</th>
                  <th className="p-5">Status</th>
                  <th className="p-5">Total Value</th>
                  <th className="p-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50/80 transition-colors group">
                    <td className="p-5 font-mono font-bold text-indigo-600">
                      ORD-{order.id.toString().padStart(5, '0')}
                    </td>
                    <td className="p-5 text-sm font-bold text-gray-900">
                      {getCustomerName(order.customer_id)}
                    </td>
                    <td className="p-5 text-sm font-medium text-gray-500">
                      {new Date(order.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="p-5">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 mr-2"></span>
                        {order.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="p-5 font-black text-gray-900">${order.total_amount.toFixed(2)}</td>
                    <td className="p-5 text-right flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => handleViewOrder(order.id)} className="p-2 rounded-lg text-gray-400 hover:text-purple-600 hover:bg-purple-50 transition-colors" title="View Details">
                        <Eye size={18} />
                      </button>
                      <button onClick={() => handleDeleteOrder(order.id)} className="p-2 rounded-lg text-gray-400 hover:text-rose-600 hover:bg-rose-50 transition-colors" title="Delete Order">
                        <Trash2 size={18} />
                      </button>
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
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl overflow-hidden animate-fade-in border border-gray-100 flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-gray-100 bg-gray-50/50 shrink-0 flex items-center gap-3">
              <div className="p-2 bg-purple-100 text-purple-600 rounded-lg"><ShoppingCart size={20} /></div>
              <h2 className="text-2xl font-black text-gray-900 tracking-tight">Process New Order</h2>
            </div>
            
            <div className="p-6 overflow-y-auto grow">
              {error && <div className="mb-6 p-4 bg-rose-50 text-rose-700 rounded-xl text-sm font-medium border border-rose-100">{error}</div>}
              
              <div className="space-y-8">
                {/* Client Selection */}
                <div className="bg-gray-50/50 p-5 rounded-2xl border border-gray-100">
                  <label className="block text-sm font-bold text-gray-700 mb-3">1. Select Customer <span className="text-rose-500">*</span></label>
                  <select 
                    value={selectedCustomerId} 
                    onChange={(e) => setSelectedCustomerId(e.target.value)}
                    className="w-full border-none bg-white rounded-xl p-3.5 focus:ring-2 focus:ring-purple-500 shadow-sm font-medium text-gray-700"
                  >
                    <option value="">-- Click to choose a customer --</option>
                    {customers.map(c => (
                      <option key={c.id} value={c.id}>{c.name} ({c.email})</option>
                    ))}
                  </select>
                </div>
                
                {/* Product Selection */}
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <label className="block text-sm font-bold text-gray-700">2. Add Line Items <span className="text-rose-500">*</span></label>
                  </div>
                  
                  <div className="space-y-3">
                    {orderItems.map((item, index) => (
                      <div key={index} className="flex gap-4 items-center bg-white p-4 rounded-2xl border border-gray-100 shadow-sm transition-all hover:shadow-md">
                        <div className="grow">
                          <select 
                            value={item.product_id}
                            onChange={(e) => handleItemChange(index, 'product_id', e.target.value)}
                            className="w-full border-none bg-gray-50 rounded-xl p-3 text-sm font-medium focus:ring-2 focus:ring-purple-500"
                          >
                            <option value="">Select a product...</option>
                            {products.map(p => (
                              <option key={p.id} value={p.id} disabled={p.stock === 0}>
                                {p.name} - ${p.price.toFixed(2)} {p.stock === 0 ? '(Out of Stock)' : `(${p.stock} available)`}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="w-28 shrink-0 flex items-center gap-2">
                          <span className="text-sm font-bold text-gray-400">Qty:</span>
                          <input 
                            type="number" 
                            min="1" 
                            value={item.quantity}
                            onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                            className="w-full border-none bg-gray-50 rounded-xl p-3 text-center font-bold focus:ring-2 focus:ring-purple-500"
                          />
                        </div>
                        {orderItems.length > 1 && (
                          <button 
                            type="button" 
                            onClick={() => removeItem(index)}
                            className="p-3 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors shrink-0"
                          >
                            <Trash2 size={18} />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                  
                  <button type="button" onClick={addItem} className="mt-4 text-sm font-bold text-purple-600 hover:text-purple-800 flex items-center gap-1">
                    <Plus size={16} strokeWidth={3} /> Add another item
                  </button>
                </div>
              </div>
            </div>
            
            <div className="p-6 border-t border-gray-100 bg-gray-50 shrink-0 flex justify-between items-center">
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Estimated Total</p>
                <p className="text-2xl font-black text-gray-900">${calculateSubtotal().toFixed(2)}</p>
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-3 text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 font-bold transition-colors">Cancel</button>
                <button onClick={handleSubmit} className="px-6 py-3 text-white bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl hover:from-purple-700 hover:to-indigo-700 font-bold shadow-lg shadow-purple-500/30 flex items-center gap-2 transition-all hover:scale-105">
                  Confirm Order <ArrowRight size={18} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {isViewModalOpen && viewOrder && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-[60]">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden animate-fade-in border border-gray-100 flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg"><Eye size={20} /></div>
                <h2 className="text-2xl font-black text-gray-900">Order Details</h2>
              </div>
              <span className="font-mono font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-lg">ORD-{viewOrder.id.toString().padStart(5, '0')}</span>
            </div>
            
            <div className="p-6 overflow-y-auto grow space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-2xl">
                  <p className="text-xs font-bold text-gray-500 uppercase">Customer</p>
                  <p className="text-lg font-bold text-gray-900 mt-1">{getCustomerName(viewOrder.customer_id)}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-2xl">
                  <p className="text-xs font-bold text-gray-500 uppercase">Date</p>
                  <p className="text-lg font-bold text-gray-900 mt-1">
                    {new Date(viewOrder.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-bold text-gray-700 mb-3 border-b pb-2">Purchased Items</h3>
                <div className="space-y-3">
                  {viewOrder.items.map((item, idx) => {
                    const product = products.find(p => p.id === item.product_id);
                    return (
                      <div key={idx} className="flex justify-between items-center p-3 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors">
                        <div>
                          <p className="font-bold text-gray-900">{product ? product.name : 'Unknown Product'}</p>
                          <p className="text-sm text-gray-500">{item.quantity} x ${item.price_at_purchase.toFixed(2)}</p>
                        </div>
                        <p className="font-black text-gray-900">${(item.quantity * item.price_at_purchase).toFixed(2)}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
            
            <div className="p-6 border-t border-gray-100 bg-gray-50 shrink-0 flex justify-between items-center">
               <div>
                  <p className="text-xs font-bold text-gray-500 uppercase">Total Amount</p>
                  <p className="text-2xl font-black text-purple-600">${viewOrder.total_amount.toFixed(2)}</p>
               </div>
               <button onClick={() => setIsViewModalOpen(false)} className="px-6 py-2.5 bg-gray-900 text-white rounded-xl font-bold hover:bg-gray-800 transition-colors">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;
