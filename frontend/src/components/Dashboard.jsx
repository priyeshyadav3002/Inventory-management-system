import { useState, useEffect } from 'react';
import { Package, Users, ShoppingCart, TrendingUp, Activity } from 'lucide-react';
import { productAPI, customerAPI, orderAPI } from '../services/api';
import { Link } from 'react-router-dom';

const StatCard = ({ title, value, icon: Icon, gradient, linkTo, delay }) => (
  <div className={`bg-white rounded-3xl p-6 border border-gray-100/50 shadow-sm card-hover-effect animate-fade-in`} style={{ animationDelay: `${delay}ms` }}>
    <div className="flex items-center justify-between mb-4">
      <div className={`p-3.5 rounded-2xl bg-gradient-to-br ${gradient} shadow-sm`}>
        <Icon size={24} className="text-white" strokeWidth={2.5} />
      </div>
      <div className="px-2.5 py-1 bg-green-50 text-green-600 rounded-full text-xs font-bold tracking-wide">
        +12.5%
      </div>
    </div>
    <div>
      <h3 className="text-4xl font-black text-gray-900 tracking-tight mb-1">{value}</h3>
      <p className="text-sm font-medium text-gray-400 uppercase tracking-wider">{title}</p>
    </div>
    <div className="mt-5 pt-5 border-t border-gray-100">
      <Link to={linkTo} className="text-sm font-bold text-indigo-600 hover:text-indigo-800 flex items-center group">
        Explore Data 
        <TrendingUp size={16} className="ml-1.5 group-hover:translate-x-1 transition-transform" />
      </Link>
    </div>
  </div>
);

const Dashboard = () => {
  const [stats, setStats] = useState({ products: 0, customers: 0, orders: 0, revenue: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [productsRes, customersRes, ordersRes] = await Promise.all([
          productAPI.getAll(),
          customerAPI.getAll(),
          orderAPI.getAll()
        ]);
        
        const orders = ordersRes.data;
        const revenue = orders.reduce((sum, order) => sum + order.total_amount, 0);

        setStats({
          products: productsRes.data.length,
          customers: customersRes.data.length,
          orders: orders.length,
          revenue: revenue.toFixed(2)
        });
      } catch (error) {
        console.error("Failed to fetch dashboard stats", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 rounded-full border-t-4 border-indigo-500 animate-spin opacity-80"></div>
          <div className="absolute inset-2 rounded-full border-r-4 border-fuchsia-500 animate-spin opacity-60 animation-delay-150"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="mb-10 flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight">Overview</h1>
          <p className="text-gray-500 mt-2 font-medium">Welcome back! Here is your business at a glance.</p>
        </div>
        <div className="hidden sm:flex items-center gap-2 bg-white px-4 py-2 rounded-full border border-gray-200 shadow-sm">
          <Activity size={18} className="text-emerald-500" />
          <span className="text-sm font-bold text-gray-700">System Healthy</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard delay={0} title="Total Products" value={stats.products} icon={Package} gradient="from-blue-500 to-cyan-400" linkTo="/products" />
        <StatCard delay={100} title="Active Customers" value={stats.customers} icon={Users} gradient="from-emerald-400 to-teal-500" linkTo="/customers" />
        <StatCard delay={200} title="Completed Orders" value={stats.orders} icon={ShoppingCart} gradient="from-indigo-500 to-purple-500" linkTo="/orders" />
        <StatCard delay={300} title="Gross Revenue" value={`$${stats.revenue}`} icon={TrendingUp} gradient="from-amber-400 to-orange-500" linkTo="/orders" />
      </div>

      <div className="mt-10 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-3xl border border-gray-100 shadow-sm p-8 card-hover-effect">
          <h2 className="text-xl font-bold mb-6 text-gray-900 flex items-center gap-2">
            <Activity className="text-indigo-500" /> Recent Activity Overview
          </h2>
          <div className="h-64 flex flex-col justify-center items-center rounded-2xl bg-gradient-to-tr from-gray-50 to-indigo-50/30 border border-gray-100 border-dashed">
            <TrendingUp size={48} className="text-indigo-200 mb-4" />
            <p className="text-gray-500 font-medium">Advanced chart visualizations will render here</p>
          </div>
        </div>
        <div className="bg-gradient-to-br from-indigo-900 to-purple-900 rounded-3xl p-8 text-white relative overflow-hidden shadow-xl card-hover-effect">
          <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 rounded-full bg-white opacity-10 blur-2xl"></div>
          <div className="absolute bottom-0 left-0 -ml-8 -mb-8 w-32 h-32 rounded-full bg-fuchsia-500 opacity-20 blur-2xl"></div>
          
          <h2 className="text-xl font-bold mb-2 relative z-10">Quick Actions</h2>
          <p className="text-indigo-200 text-sm mb-8 relative z-10">Accelerate your workflow with these shortcuts.</p>
          
          <div className="space-y-4 relative z-10">
            <Link to="/products" className="flex items-center gap-4 bg-white/10 hover:bg-white/20 p-4 rounded-2xl transition-all backdrop-blur-md border border-white/10">
              <div className="p-2 bg-white/20 rounded-lg">
                <Package size={20} />
              </div>
              <span className="font-semibold tracking-wide">Add New Product</span>
            </Link>
            <Link to="/orders" className="flex items-center gap-4 bg-white/10 hover:bg-white/20 p-4 rounded-2xl transition-all backdrop-blur-md border border-white/10">
              <div className="p-2 bg-white/20 rounded-lg">
                <ShoppingCart size={20} />
              </div>
              <span className="font-semibold tracking-wide">Draft New Order</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
