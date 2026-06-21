import React, { useEffect, useState } from 'react';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { FileText, Plus, Trash2, Edit3, X, Loader, Search, HelpCircle, ArrowRight } from 'lucide-react';

const IndianStates = [
  'All', 'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa', 'Gujarat', 
  'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 
  'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 
  'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal', 'Delhi'
];

const Schemes = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [schemes, setSchemes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingScheme, setEditingScheme] = useState(null);

  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedState, setSelectedState] = useState('All');

  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [eligibility, setEligibility] = useState('');
  const [state, setState] = useState('All');

  const fetchSchemes = async () => {
    try {
      setLoading(true);
      const res = await API.get(`/schemes?state=${selectedState}&search=${searchQuery}`);
      setSchemes(res.data.data);
    } catch (err) {
      console.error(err);
      showToast('Failed to fetch government schemes', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchemes();
  }, [selectedState]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchSchemes();
  };

  const openAddModal = () => {
    setEditingScheme(null);
    setTitle('');
    setDescription('');
    setEligibility('');
    setState('All');
    setIsModalOpen(true);
  };

  const openEditModal = (sch) => {
    setEditingScheme(sch);
    setTitle(sch.title);
    setDescription(sch.description);
    setEligibility(sch.eligibility);
    setState(sch.state);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !description || !eligibility || !state) {
      showToast('Please fill in all fields', 'warning');
      return;
    }

    try {
      if (editingScheme) {
        await API.put(`/schemes/${editingScheme._id}`, { title, description, eligibility, state });
        showToast('Scheme details updated successfully', 'success');
      } else {
        await API.post('/schemes', { title, description, eligibility, state });
        showToast('Scheme added successfully', 'success');
      }
      setIsModalOpen(false);
      fetchSchemes();
    } catch (err) {
      console.error(err);
      showToast('Error saving scheme details', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this scheme?')) {
      return;
    }
    try {
      await API.delete(`/schemes/${id}`);
      showToast('Scheme deleted successfully', 'success');
      fetchSchemes();
    } catch (err) {
      console.error(err);
      showToast('Failed to delete scheme', 'error');
    }
  };

  return (
    <div className="space-y-8">
      {/* Header and Search Filters */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6 bg-slate-900 border border-slate-800 p-6 rounded-3xl">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
            <FileText className="text-emerald-500" />
            Government Schemes Portal
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Browse and query welfare schemes listed by central and state agricultural boards.
          </p>
        </div>

        {/* Filters Form */}
        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3 w-full xl:w-auto items-stretch">
          <select
            value={selectedState}
            onChange={(e) => setSelectedState(e.target.value)}
            className="px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-xs"
          >
            {IndianStates.map((st) => (
              <option key={st} value={st}>
                {st === 'All' ? 'All Schemes (National)' : st}
              </option>
            ))}
          </select>

          <div className="relative flex-1 sm:w-64">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full pl-4 pr-10 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-xs"
              placeholder="Search by keywords..."
            />
            <button
              type="submit"
              className="absolute right-2 top-2 p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors"
            >
              <Search size={14} />
            </button>
          </div>

          {user.role === 'Admin' && (
            <button
              type="button"
              onClick={openAddModal}
              className="flex items-center justify-center gap-2 px-5 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shrink-0"
            >
              <Plus size={14} /> Add Scheme
            </button>
          )}
        </form>
      </div>

      {/* Grid of Schemes */}
      {loading ? (
        <div className="h-[40vh] flex flex-col items-center justify-center gap-4">
          <Loader className="w-10 h-10 text-emerald-500 animate-spin" />
          <p className="text-slate-400 text-sm font-semibold">Querying scheme records...</p>
        </div>
      ) : schemes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {schemes.map((sch) => (
            <div
              key={sch._id}
              className="bg-slate-900/60 border border-slate-800 hover:border-slate-750 p-6 rounded-3xl shadow-lg flex flex-col justify-between space-y-6"
            >
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <span className="text-[9px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-1 rounded-full font-bold uppercase tracking-wider">
                    {sch.state === 'All' ? 'Central Scheme' : sch.state}
                  </span>
                  {user.role === 'Admin' && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => openEditModal(sch)}
                        className="text-slate-400 hover:text-white p-1"
                        title="Edit Scheme"
                      >
                        <Edit3 size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(sch._id)}
                        className="text-slate-500 hover:text-rose-400 p-1"
                        title="Delete Scheme"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  )}
                </div>

                <div>
                  <h3 className="text-lg font-bold text-white leading-snug">{sch.title}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed mt-2">{sch.description}</p>
                </div>

                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-850 space-y-2">
                  <span className="text-[10px] text-slate-500 font-bold block uppercase tracking-wider">Eligibility Criteria</span>
                  <p className="text-xs text-slate-350 leading-relaxed">{sch.eligibility}</p>
                </div>
              </div>

              {user.role !== 'Admin' && (
                <button
                  onClick={() => showToast('Eligibility request submitted. Verified offline by agriculture office.', 'success')}
                  className="w-full flex items-center justify-center gap-1.5 px-4 py-2.5 bg-slate-800 hover:bg-slate-700/80 text-xs font-semibold rounded-xl transition-all text-slate-300"
                >
                  Apply Online <ArrowRight size={12} />
                </button>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-slate-900/60 border border-slate-850 p-12 text-center rounded-3xl max-w-xl mx-auto space-y-4">
          <HelpCircle size={32} className="text-slate-650 mx-auto" />
          <h3 className="text-lg font-bold text-white">No Schemes Found</h3>
          <p className="text-sm text-slate-400 max-w-xs mx-auto leading-relaxed">
            There are no active schemes listed matching your search inputs or state constraints.
          </p>
        </div>
      )}

      {/* Add / Edit Scheme Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl relative animate-scale-in">
            <div className="flex items-center justify-between p-6 border-b border-slate-800">
              <h2 className="text-lg font-bold text-white">
                {editingScheme ? 'Modify Scheme details' : 'Publish Scheme details'}
              </h2>
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
                  Scheme Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="block w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-xs"
                  placeholder="PM-KISAN Samman Nidhi Yojana"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Target State / Scope
                </label>
                <select
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="block w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-xs"
                >
                  {IndianStates.map((st) => (
                    <option key={st} value={st}>
                      {st === 'All' ? 'All India (Central)' : st}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Scheme Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="block w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-xs resize-none"
                  placeholder="Provide brief summary about benefits..."
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Eligibility Criteria
                </label>
                <textarea
                  value={eligibility}
                  onChange={(e) => setEligibility(e.target.value)}
                  rows={2}
                  className="block w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-xs resize-none"
                  placeholder="Landholding constraints, farmer validation specifications..."
                  required
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
                  Publish Scheme
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Schemes;
