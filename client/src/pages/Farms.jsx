import React, { useEffect, useState } from 'react';
import API from '../services/api';
import { useToast } from '../context/ToastContext';
import { Sprout, MapPin, Grid, Plus, Trash2, Edit3, X } from 'lucide-react';

const soilTypes = ['Alluvial', 'Black', 'Red', 'Laterite', 'Desert/Sandy', 'Clayey', 'Loamy', 'Silty'];

const Farms = () => {
  const { showToast } = useToast();
  const [farms, setFarms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFarm, setEditingFarm] = useState(null);

  // Form states
  const [farmName, setFarmName] = useState('');
  const [area, setArea] = useState('');
  const [soilType, setSoilType] = useState('Loamy');
  const [location, setLocation] = useState('');

  const fetchFarms = async () => {
    try {
      setLoading(true);
      const res = await API.get('/farms');
      setFarms(res.data.data);
    } catch (err) {
      console.error(err);
      showToast('Failed to fetch farms', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFarms();
  }, []);

  const openAddModal = () => {
    setEditingFarm(null);
    setFarmName('');
    setArea('');
    setSoilType('Loamy');
    setLocation('');
    setIsModalOpen(true);
  };

  const openEditModal = (farm) => {
    setEditingFarm(farm);
    setFarmName(farm.farmName);
    setArea(farm.area);
    setSoilType(farm.soilType);
    setLocation(farm.location);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!farmName || !area || !location) {
      showToast('Please fill in all fields', 'warning');
      return;
    }

    try {
      if (editingFarm) {
        // Update
        await API.put(`/farms/${editingFarm._id}`, { farmName, area, soilType, location });
        showToast('Farm updated successfully', 'success');
      } else {
        // Create
        await API.post('/farms', { farmName, area, soilType, location });
        showToast('Farm added successfully', 'success');
      }
      setIsModalOpen(false);
      fetchFarms();
    } catch (err) {
      console.error(err);
      showToast(err.response?.data?.message || 'Error saving farm details', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this farm? This will cascade-delete all crops, irrigation logs, expenses, and harvests associated with it.')) {
      return;
    }

    try {
      await API.delete(`/farms/${id}`);
      showToast('Farm and all related data deleted successfully', 'success');
      fetchFarms();
    } catch (err) {
      console.error(err);
      showToast('Failed to delete farm', 'error');
    }
  };

  return (
    <div className="space-y-8">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900 border border-slate-800 p-6 rounded-3xl">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
            <Sprout className="text-emerald-500" />
            Farm Management
          </h1>
          <p className="text-sm text-slate-400 mt-1">Register and monitor your cultivation land plots.</p>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center gap-2 px-5 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl text-xs font-bold transition-all shadow-md"
        >
          <Plus size={16} />
          Register New Farm
        </button>
      </div>

      {loading ? (
        <div className="h-[40vh] flex flex-col items-center justify-center gap-4">
          <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-400 text-sm font-medium">Fetching farm data...</p>
        </div>
      ) : farms.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {farms.map((farm) => (
            <div
              key={farm._id}
              className="bg-slate-900/60 border border-slate-800 rounded-3xl overflow-hidden hover:border-slate-700 transition-all shadow-lg flex flex-col justify-between"
            >
              {/* Card Body */}
              <div className="p-6 space-y-6">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-white tracking-wide truncate max-w-[180px]">
                      {farm.farmName}
                    </h3>
                    <div className="flex items-center gap-1.5 text-slate-400 text-xs mt-1.5">
                      <MapPin size={12} className="text-emerald-500" />
                      <span className="truncate max-w-[200px]">{farm.location}</span>
                    </div>
                  </div>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full">
                    {farm.soilType}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 bg-slate-950 p-4 rounded-2xl border border-slate-850">
                  <div>
                    <span className="text-[10px] text-slate-500 font-bold block uppercase tracking-wider">Area Size</span>
                    <span className="text-sm font-semibold text-white mt-1 block">{farm.area} Acres</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 font-bold block uppercase tracking-wider">Current Crop</span>
                    <span className="text-sm font-semibold text-emerald-400 mt-1 block truncate">
                      {farm.activeCrop || 'None'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Card Actions */}
              <div className="px-6 py-4 bg-slate-900 border-t border-slate-800/80 flex justify-end gap-2">
                <button
                  onClick={() => openEditModal(farm)}
                  className="p-2.5 text-slate-400 hover:text-white bg-slate-800 rounded-xl transition-colors border border-slate-700/50"
                  title="Edit Farm"
                >
                  <Edit3 size={14} />
                </button>
                <button
                  onClick={() => handleDelete(farm._id)}
                  className="p-2.5 text-slate-400 hover:text-rose-400 bg-slate-800 hover:bg-rose-950/20 rounded-xl transition-all border border-slate-700/50 hover:border-rose-500/20"
                  title="Delete Farm"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-slate-900/60 border border-slate-850 p-12 text-center rounded-3xl max-w-xl mx-auto space-y-4">
          <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center text-slate-500 mx-auto border border-slate-700/50">
            <Sprout size={32} />
          </div>
          <h3 className="text-lg font-bold text-white">No registered farms</h3>
          <p className="text-sm text-slate-400 max-w-xs mx-auto leading-relaxed">
            Register your first farm plot to begin planning crop schedules and logging harvests.
          </p>
          <button
            onClick={openAddModal}
            className="px-5 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl text-xs font-bold transition-all shadow-md mt-2"
          >
            Add First Farm
          </button>
        </div>
      )}

      {/* Modal dialog for Add / Edit */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl relative animate-scale-in">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-800">
              <h2 className="text-lg font-bold text-white">
                {editingFarm ? 'Edit Farm details' : 'Register New Farm'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 hover:bg-slate-850 rounded-lg transition-all"
              >
                <X size={18} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Farm Name
                </label>
                <input
                  type="text"
                  value={farmName}
                  onChange={(e) => setFarmName(e.target.value)}
                  className="block w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-xs"
                  placeholder="Green Fields Block A"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Area (In Acres)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={area}
                    onChange={(e) => setArea(e.target.value)}
                    className="block w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-xs"
                    placeholder="12.5"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Soil Type
                  </label>
                  <select
                    value={soilType}
                    onChange={(e) => setSoilType(e.target.value)}
                    className="block w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-xs"
                  >
                    {soilTypes.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Location (District, State, or Village)
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="block w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-xs"
                  placeholder="Karnal District, Haryana"
                  required
                />
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800/80 mt-6">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-3 bg-slate-850 hover:bg-slate-800 text-slate-300 rounded-xl text-xs font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all shadow-md"
                >
                  {editingFarm ? 'Save Changes' : 'Register Farm'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Farms;
