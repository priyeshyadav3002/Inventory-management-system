import { useState, useEffect } from 'react';
import { customerAPI } from '../services/api';
import { Plus, Search, Edit2, Trash2, Mail, Phone, Users, MapPin } from 'lucide-react';

const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', address: '' });
  const [error, setError] = useState(null);

  const fetchCustomers = async () => {
    try {
      const res = await customerAPI.getAll();
      setCustomers(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      await customerAPI.create(formData);
      setIsModalOpen(false);
      setFormData({ name: '', email: '', phone: '', address: '' });
      fetchCustomers();
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to create customer");
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Customer Directory</h1>
          <p className="text-gray-500 font-medium mt-1">Manage your customer relationships and contact info.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white px-5 py-2.5 rounded-xl font-bold flex items-center shadow-lg shadow-emerald-500/30 transition-all hover:-translate-y-0.5"
        >
          <Plus size={18} className="mr-2" strokeWidth={2.5} /> Add Customer
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
              placeholder="Search customers by name or email..." 
              className="pl-11 pr-4 py-3 w-full bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all text-sm font-medium"
            />
          </div>
        </div>

        {loading ? (
          <div className="p-12 flex justify-center"><div className="w-10 h-10 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin"></div></div>
        ) : customers.length === 0 ? (
          <div className="p-16 text-center text-gray-500 flex flex-col items-center">
            <div className="bg-emerald-50 p-6 rounded-full mb-6">
              <Users size={56} className="text-emerald-400" strokeWidth={1.5} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No Customers Found</h3>
            <p className="text-sm max-w-sm mx-auto mb-6">You don't have any customers in your database yet. Add one to start processing orders.</p>
            <button onClick={() => setIsModalOpen(true)} className="text-emerald-600 font-bold hover:text-emerald-800 transition-colors">Add First Customer &rarr;</button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 text-gray-500 text-xs font-bold uppercase tracking-wider border-b border-gray-100">
                  <th className="p-5">Customer Profile</th>
                  <th className="p-5">Contact Details</th>
                  <th className="p-5">Location</th>
                  <th className="p-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {customers.map((customer) => (
                  <tr key={customer.id} className="hover:bg-gray-50/80 transition-colors group">
                    <td className="p-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-emerald-100 to-teal-100 text-emerald-700 font-bold flex items-center justify-center shrink-0">
                          {customer.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-bold text-gray-900">{customer.name}</div>
                          <div className="text-xs font-mono text-gray-400">ID: #{customer.id.toString().padStart(4, '0')}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-5">
                      <div className="flex flex-col gap-1.5">
                        <a href={`mailto:${customer.email}`} className="flex items-center text-sm font-medium text-gray-700 hover:text-emerald-600 transition-colors group/link">
                          <Mail size={14} className="mr-2 text-gray-400 group-hover/link:text-emerald-500" />
                          {customer.email}
                        </a>
                        {customer.phone && (
                          <a href={`tel:${customer.phone}`} className="flex items-center text-sm font-medium text-gray-600 hover:text-emerald-600 transition-colors group/link">
                            <Phone size={14} className="mr-2 text-gray-400 group-hover/link:text-emerald-500" />
                            {customer.phone}
                          </a>
                        )}
                      </div>
                    </td>
                    <td className="p-5">
                      <div className="flex items-start text-sm text-gray-600 max-w-xs">
                        <MapPin size={16} className="mr-2 mt-0.5 text-gray-400 shrink-0" />
                        <span className="truncate">{customer.address || <span className="text-gray-400 italic">No address provided</span>}</span>
                      </div>
                    </td>
                    <td className="p-5 text-right">
                      <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="p-2 rounded-lg text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"><Edit2 size={16} /></button>
                        <button className="p-2 rounded-lg text-gray-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"><Trash2 size={16} /></button>
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
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-fade-in border border-gray-100">
            <div className="p-6 border-b border-gray-100 bg-gray-50/50">
              <h2 className="text-2xl font-black text-gray-900 tracking-tight">Register Customer</h2>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {error && <div className="p-4 bg-rose-50 text-rose-700 rounded-xl text-sm font-medium border border-rose-100">{error}</div>}
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Full Name</label>
                  <input required type="text" name="name" value={formData.name} onChange={handleChange} className="w-full bg-gray-50 border-none rounded-xl p-3 focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all" placeholder="Jane Doe" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Email Address</label>
                  <input required type="email" name="email" value={formData.email} onChange={handleChange} className="w-full bg-gray-50 border-none rounded-xl p-3 focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all" placeholder="jane@example.com" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Phone Number <span className="text-gray-400 font-normal">(Optional)</span></label>
                  <input type="tel" name="phone" value={formData.phone} onChange={handleChange} className="w-full bg-gray-50 border-none rounded-xl p-3 focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all" placeholder="+1 (555) 000-0000" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Shipping Address <span className="text-gray-400 font-normal">(Optional)</span></label>
                  <textarea name="address" value={formData.address} onChange={handleChange} rows="2" className="w-full bg-gray-50 border-none rounded-xl p-3 focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all resize-none" placeholder="123 Main St, City, Country"></textarea>
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-6 mt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 font-bold transition-colors">Cancel</button>
                <button type="submit" className="bg-emerald-600 text-white px-6 py-2.5 rounded-xl font-bold shadow-md hover:bg-emerald-700 transition-colors">Save Customer</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Customers;
