import React, { useEffect, useState } from 'react';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { ShoppingBag, Plus, Trash2, X, Search, MapPin, Phone, Mail, User, Tag, Loader } from 'lucide-react';

const Marketplace = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [products, setProducts] = useState([]);
  const [myListings, setMyListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('browse'); // 'browse' or 'mine'
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Search filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [searchLocation, setSearchLocation] = useState('');

  // Form states
  const [cropName, setCropName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [price, setPrice] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [contactPhone, setContactPhone] = useState(user.phone);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await API.get(`/marketplace?search=${searchQuery}&location=${searchLocation}`);
      setProducts(res.data.data);

      if (user.role === 'Farmer') {
        const myRes = await API.get('/marketplace/my-listings');
        setMyListings(myRes.data.data);
      }
    } catch (err) {
      console.error(err);
      showToast('Failed to load marketplace listings', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [activeTab]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchProducts();
  };

  const openAddModal = () => {
    setCropName('');
    setQuantity('');
    setPrice('');
    setLocation(user.district + ', ' + user.state);
    setDescription('');
    setContactPhone(user.phone);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!cropName || !quantity || !price || !location || !contactPhone) {
      showToast('Please fill in all required fields', 'warning');
      return;
    }

    try {
      await API.post('/marketplace', { cropName, quantity, price, location, description, contactPhone });
      showToast('Product listed on AgriVision Marketplace!', 'success');
      setIsModalOpen(false);
      setActiveTab('mine');
      fetchProducts();
    } catch (err) {
      console.error(err);
      showToast('Failed to create listing', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Remove this marketplace listing?')) {
      return;
    }
    try {
      await API.delete(`/marketplace/${id}`);
      showToast('Listing removed successfully', 'success');
      fetchProducts();
    } catch (err) {
      console.error(err);
      showToast('Failed to delete listing', 'error');
    }
  };

  return (
    <div className="space-y-8">
      {/* Header and Search Filters */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6 bg-slate-900 border border-slate-800 p-6 rounded-3xl">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
            <ShoppingBag className="text-emerald-500" />
            AgriVision Marketplace
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Browse crop commodities offered directly by regional farmers.
          </p>
        </div>

        {/* Tab Selection + Listing Action */}
        <div className="flex flex-wrap items-center gap-4 w-full xl:w-auto">
          {user.role === 'Farmer' && (
            <div className="flex bg-slate-950 p-1 rounded-2xl border border-slate-850">
              <button
                onClick={() => setActiveTab('browse')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'browse' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
                }`}
              >
                Browse All
              </button>
              <button
                onClick={() => setActiveTab('mine')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'mine' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
                }`}
              >
                My Listings ({myListings.length})
              </button>
            </div>
          )}

          {user.role === 'Farmer' && (
            <button
              onClick={openAddModal}
              className="flex items-center justify-center gap-2 px-5 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all shadow-md ml-auto xl:ml-0"
            >
              <Plus size={14} /> Sell Produce
            </button>
          )}
        </div>
      </div>

      {/* Search Forms Panel (Visible only when browsing) */}
      {activeTab === 'browse' && (
        <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 sm:grid-cols-12 gap-3 bg-slate-900/40 p-4 border border-slate-850 rounded-2xl">
          <div className="sm:col-span-5 relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full pl-4 pr-10 py-3 bg-slate-950 border border-slate-850 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 transition-all rounded-xl text-xs text-white placeholder-slate-500"
              placeholder="Search by crop varieties (e.g. Wheat)..."
            />
          </div>
          <div className="sm:col-span-5 relative">
            <input
              type="text"
              value={searchLocation}
              onChange={(e) => setSearchLocation(e.target.value)}
              className="block w-full pl-4 pr-10 py-3 bg-slate-950 border border-slate-850 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 transition-all rounded-xl text-xs text-white placeholder-slate-500"
              placeholder="Filter by location (e.g. Karnal)..."
            />
            <MapPin size={14} className="absolute right-3 top-3 text-slate-500" />
          </div>
          <button
            type="submit"
            className="sm:col-span-2 flex items-center justify-center gap-1.5 px-4 py-3 bg-slate-800 hover:bg-slate-705 border border-slate-750 text-xs font-bold text-white rounded-xl transition-all"
          >
            <Search size={14} /> Filter
          </button>
        </form>
      )}

      {/* Grid listing */}
      {loading ? (
        <div className="h-[40vh] flex flex-col items-center justify-center gap-4">
          <Loader className="w-10 h-10 text-emerald-500 animate-spin" />
          <p className="text-slate-400 text-sm font-semibold">Browsing storefronts...</p>
        </div>
      ) : (activeTab === 'browse' ? products : myListings).length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {(activeTab === 'browse' ? products : myListings).map((prod) => {
            const isOwner = prod.farmerId?._id === user._id || prod.farmerId === user._id;
            return (
              <div
                key={prod._id}
                className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-lg flex flex-col justify-between hover:border-slate-700/80 transition-all group"
              >
                {/* Header detail */}
                <div className="p-6 space-y-4">
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] bg-slate-950 text-emerald-400 border border-slate-800/85 py-1 px-2.5 rounded-xl font-bold uppercase tracking-wider">
                      {prod.quantity}
                    </span>
                    {(isOwner || user.role === 'Admin') && (
                      <button
                        onClick={() => handleDelete(prod._id)}
                        className="text-slate-500 hover:text-rose-400 p-1 hover:bg-slate-950 rounded-lg transition-colors border border-transparent hover:border-slate-800"
                        title="Delete Listing"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>

                  <div>
                    <h3 className="text-lg font-black text-white capitalize group-hover:text-emerald-400 transition-colors">
                      {prod.cropName}
                    </h3>
                    <div className="flex items-center gap-1.5 text-slate-400 text-xs mt-1">
                      <MapPin size={12} className="text-emerald-500" />
                      <span>{prod.location}</span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-450 leading-relaxed min-h-[40px] line-clamp-3">
                    {prod.description || 'No product remarks provided by the seller.'}
                  </p>

                  <div className="flex items-baseline gap-1 pt-2">
                    <span className="text-xl font-black text-emerald-400">₹{prod.price.toLocaleString()}</span>
                    <span className="text-[10px] text-slate-500 font-bold block uppercase tracking-wider">Asking Price</span>
                  </div>
                </div>

                {/* Seller Detail Footer */}
                <div className="px-6 py-4 bg-slate-950 border-t border-slate-850 flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <User size={12} className="text-slate-500" />
                    <span className="text-xs text-slate-300 font-semibold">
                      {prod.farmerId?.name || (isOwner ? user.name : 'Farmer')}
                    </span>
                  </div>
                  <div className="flex flex-col gap-1.5 pt-1.5 border-t border-slate-900/50">
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <Phone size={12} className="text-emerald-500" />
                      <a href={`tel:${prod.contactPhone}`} className="hover:text-emerald-400 font-medium transition-colors">
                        {prod.contactPhone}
                      </a>
                    </div>
                    {prod.farmerId?.email && (
                      <div className="flex items-center gap-2 text-[11px] text-slate-500">
                        <Mail size={11} />
                        <span className="truncate">{prod.farmerId.email}</span>
                      </div>
                    )}
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-slate-900/60 border border-slate-850 p-12 text-center rounded-3xl max-w-xl mx-auto space-y-4">
          <ShoppingBag size={32} className="text-slate-650 mx-auto" />
          <h3 className="text-lg font-bold text-white">No Listings Listed</h3>
          <p className="text-sm text-slate-400 max-w-xs mx-auto leading-relaxed">
            There are no products currently listed in this category of the marketplace.
          </p>
          {user.role === 'Farmer' && activeTab !== 'mine' && (
            <button
              onClick={openAddModal}
              className="px-5 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all shadow-md mt-2"
            >
              List Produce
            </button>
          )}
        </div>
      )}

      {/* Add Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl relative animate-scale-in">
            <div className="flex items-center justify-between p-6 border-b border-slate-800">
              <h2 className="text-lg font-bold text-white">Create Marketplace Listing</h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 hover:bg-slate-850 rounded-lg transition-all"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Commodity Crop
                </label>
                <input
                  type="text"
                  value={cropName}
                  onChange={(e) => setCropName(e.target.value)}
                  className="block w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-xs"
                  placeholder="Organic Basmati Rice, Red Onions..."
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Quantity details
                  </label>
                  <input
                    type="text"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    className="block w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-xs"
                    placeholder="25 Quintals / 500 kg"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Total Price (INR)
                  </label>
                  <input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="block w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-xs"
                    placeholder="75000"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Contact Phone Number
                </label>
                <input
                  type="text"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  className="block w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-xs"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Selling Location
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="block w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-xs"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Description / Quality remarks
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                  className="block w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-xs resize-none"
                  placeholder="Freshly harvested, sorted, and packed. Ready for bulk transport."
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800/80 mt-6">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-3 bg-slate-850 hover:bg-slate-800 text-slate-300 rounded-xl text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-md"
                >
                  Publish Listing
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Marketplace;
