import React, { useState } from 'react';
import {
  Leaf,
  Droplets,
  Sun,
  Layers,
  Bug,
  Sprout,
  ChevronDown,
  ChevronUp,
  BookOpen,
  TrendingUp,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

const techniques = [
  {
    id: 1,
    icon: Droplets,
    color: 'blue',
    tag: 'Water Management',
    title: 'Drip Irrigation',
    shortDesc:
      'Deliver water directly to plant roots through a network of pipes, valves, and emitters — minimising evaporation and runoff.',
    benefits: [
      'Saves up to 50–60% water vs. flood irrigation',
      'Reduces weed growth between rows',
      'Allows fertigation (fertiliser through drip lines)',
      'Improves crop yield and quality uniformly',
    ],
    steps: [
      'Survey land and map crop rows accurately.',
      'Install main supply pipe, sub-mains, and lateral lines.',
      'Place emitters at each plant base (2–4 L/hr output).',
      'Connect filtration unit and pressure regulator at inlet.',
      'Schedule watering cycles using timer or sensor-based controller.',
    ],
    suitable: 'Vegetables, fruits, sugarcane, cotton, floriculture',
    season: 'Year-round',
    costEfficiency: 85,
    waterSaving: 55,
    yieldGain: 30,
  },
  {
    id: 2,
    icon: Layers,
    color: 'amber',
    tag: 'Soil Enrichment',
    title: 'Organic Composting',
    shortDesc:
      'Convert agricultural waste — crop residue, manure, kitchen scraps — into nutrient-rich organic matter to improve soil structure and fertility.',
    benefits: [
      'Improves soil water retention and aeration',
      'Supplies macro and micro nutrients slowly over time',
      'Reduces dependence on chemical fertilisers',
      'Boosts beneficial microbial activity in soil',
    ],
    steps: [
      'Collect green waste (nitrogen source) and brown waste (carbon source) in 1:3 ratio.',
      'Layer alternately in a compost pit or bin.',
      'Moisten the pile to 50–60% moisture level.',
      'Turn the pile every 7–10 days for aeration.',
      'Compost is ready in 45–90 days when dark, crumbly and earthy-smelling.',
    ],
    suitable: 'All crops, kitchen gardens, orchards',
    season: 'Year-round (best started pre-Kharif)',
    costEfficiency: 90,
    waterSaving: 20,
    yieldGain: 25,
  },
  {
    id: 3,
    icon: Sun,
    color: 'emerald',
    tag: 'Crop Planning',
    title: 'Crop Rotation',
    shortDesc:
      'Systematically grow different crop families on the same land each season to break pest cycles, restore nutrients, and maintain long-term soil health.',
    benefits: [
      'Breaks pest and disease life cycles naturally',
      'Legumes fix atmospheric nitrogen, reducing fertiliser costs',
      'Improves soil organic matter over years',
      'Reduces soil erosion and improves biodiversity',
    ],
    steps: [
      'Divide your farmland into 3–4 equal blocks.',
      'Assign a crop category to each block: cereals, legumes, root crops, fallow.',
      'Rotate categories clockwise each season.',
      'Maintain records of what was grown each season.',
      'Adjust fertiliser application based on previous crop nutrient use.',
    ],
    suitable: 'Wheat, rice, mustard, lentils, maize, soybean',
    season: 'Kharif → Rabi → Zaid rotation',
    costEfficiency: 80,
    waterSaving: 15,
    yieldGain: 20,
  },
  {
    id: 4,
    icon: Bug,
    color: 'rose',
    tag: 'Pest Management',
    title: 'Integrated Pest Management (IPM)',
    shortDesc:
      'Combine biological controls, habitat manipulation, resistant varieties, and targeted pesticides to suppress pests with minimum environmental and health impact.',
    benefits: [
      'Reduces pesticide costs by up to 40%',
      'Preserves beneficial insects like bees and ladybirds',
      'Prevents pesticide resistance in pest populations',
      'Ensures safer produce for consumers',
    ],
    steps: [
      'Monitor fields weekly — count pests and natural enemies.',
      'Set action thresholds (e.g., spray only if >5 pests/plant).',
      'Introduce biological controls: Trichogramma cards for stem borer.',
      'Use sticky yellow traps, pheromone lures, and light traps.',
      'Apply chemical pesticides only as a last resort at recommended doses.',
    ],
    suitable: 'Rice, vegetables, cotton, fruits, pulses',
    season: 'All seasons (monitor weekly)',
    costEfficiency: 78,
    waterSaving: 0,
    yieldGain: 22,
  },
  {
    id: 5,
    icon: Sprout,
    color: 'violet',
    tag: 'Agro-Forestry',
    title: 'Agroforestry',
    shortDesc:
      'Integrate trees and shrubs into crop and animal farming systems to create diversified, productive, and sustainable land-use that benefits the environment.',
    benefits: [
      'Provides shade reducing crop water stress in summer',
      'Tree roots prevent soil erosion and improve water table',
      'Additional income from timber, fruit, and fuelwood',
      'Sequesters carbon — eligible for carbon credit markets',
    ],
    steps: [
      'Select suitable tree species: Moringa, Neem, Amla, Eucalyptus, or fruit trees.',
      'Plan a silvopastoral or alley cropping layout with 6–10m between tree rows.',
      'Plant trees along bunds, borders, or in rows across slope contours.',
      'Prune trees regularly to control shading on crops.',
      'Harvest trees on a 5–10 year rotation alongside annual crops.',
    ],
    suitable: 'All crops; especially effective with vegetables, pulses, millets',
    season: 'Tree planting: pre-monsoon (June); crops as usual',
    costEfficiency: 75,
    waterSaving: 25,
    yieldGain: 35,
  },
  {
    id: 6,
    icon: Leaf,
    color: 'teal',
    tag: 'Modern Practice',
    title: 'Mulching',
    shortDesc:
      'Cover soil around plants with organic or plastic material to retain moisture, regulate temperature, suppress weeds, and improve crop growth.',
    benefits: [
      'Reduces soil moisture loss by up to 35%',
      'Suppresses weed growth without herbicides',
      'Maintains optimum soil temperature for root growth',
      'Prevents soil crusting after heavy rain',
    ],
    steps: [
      'Prepare soil bed and apply basal fertiliser before mulching.',
      'Choose mulch type: straw, crop residue, sugarcane trash, or black plastic film.',
      'Spread mulch 5–10 cm thick around crop base without touching stems.',
      'For plastic mulch: lay film, secure edges with soil, and transplant through holes.',
      'Replace organic mulch after decomposition (adds humus) or after harvest.',
    ],
    suitable: 'Vegetables, strawberry, potato, tomato, maize',
    season: 'Pre-planting; most effective in dry Rabi season',
    costEfficiency: 82,
    waterSaving: 35,
    yieldGain: 18,
  },
];

const colorMap = {
  blue: {
    badge: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    icon: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    bar: 'bg-blue-500',
    ring: 'border-blue-500/30 hover:border-blue-500/60',
  },
  amber: {
    badge: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    icon: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    bar: 'bg-amber-500',
    ring: 'border-amber-500/30 hover:border-amber-500/60',
  },
  emerald: {
    badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    icon: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    bar: 'bg-emerald-500',
    ring: 'border-emerald-500/30 hover:border-emerald-500/60',
  },
  rose: {
    badge: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
    icon: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
    bar: 'bg-rose-500',
    ring: 'border-rose-500/30 hover:border-rose-500/60',
  },
  violet: {
    badge: 'bg-violet-500/10 text-violet-400 border-violet-500/20',
    icon: 'bg-violet-500/10 text-violet-400 border-violet-500/20',
    bar: 'bg-violet-500',
    ring: 'border-violet-500/30 hover:border-violet-500/60',
  },
  teal: {
    badge: 'bg-teal-500/10 text-teal-400 border-teal-500/20',
    icon: 'bg-teal-500/10 text-teal-400 border-teal-500/20',
    bar: 'bg-teal-500',
    ring: 'border-teal-500/30 hover:border-teal-500/60',
  },
};

const StatBar = ({ label, value, barColor, icon: Icon }) => (
  <div className="space-y-1.5">
    <div className="flex justify-between items-center">
      <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider flex items-center gap-1">
        <Icon size={10} />
        {label}
      </span>
      <span className="text-xs font-bold text-slate-300">{value}%</span>
    </div>
    <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
      <div
        className={`h-full rounded-full transition-all duration-700 ${barColor}`}
        style={{ width: `${value}%` }}
      />
    </div>
  </div>
);

const TechniqueCard = ({ technique }) => {
  const [expanded, setExpanded] = useState(false);
  const c = colorMap[technique.color];
  const Icon = technique.icon;

  return (
    <div
      className={`bg-slate-900/70 border rounded-3xl overflow-hidden shadow-lg transition-all duration-300 ${c.ring}`}
    >
      {/* Card Header */}
      <div className="p-6 space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div className={`p-3 rounded-2xl border ${c.icon} shrink-0`}>
            <Icon size={22} />
          </div>
          <span className={`text-[9px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full border ${c.badge}`}>
            {technique.tag}
          </span>
        </div>

        <div>
          <h3 className="text-xl font-extrabold text-white leading-tight">{technique.title}</h3>
          <p className="text-xs text-slate-400 leading-relaxed mt-2">{technique.shortDesc}</p>
        </div>

        {/* Meta pills */}
        <div className="flex flex-wrap gap-2 text-[10px]">
          <span className="bg-slate-800 text-slate-400 border border-slate-700 px-2.5 py-1 rounded-full font-semibold">
            🌱 {technique.suitable}
          </span>
          <span className="bg-slate-800 text-slate-400 border border-slate-700 px-2.5 py-1 rounded-full font-semibold">
            📅 {technique.season}
          </span>
        </div>

        {/* Stats */}
        <div className="space-y-2.5 pt-2">
          <StatBar label="Cost Efficiency" value={technique.costEfficiency} barColor={c.bar} icon={TrendingUp} />
          {technique.waterSaving > 0 && (
            <StatBar label="Water Saving" value={technique.waterSaving} barColor={c.bar} icon={Droplets} />
          )}
          <StatBar label="Yield Gain" value={technique.yieldGain} barColor={c.bar} icon={TrendingUp} />
        </div>
      </div>

      {/* Expand Toggle */}
      <button
        onClick={() => setExpanded((prev) => !prev)}
        className="w-full flex items-center justify-between gap-2 px-6 py-3 bg-slate-800/40 border-t border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800/70 text-xs font-semibold transition-all"
      >
        <span className="flex items-center gap-1.5">
          <BookOpen size={12} />
          {expanded ? 'Hide' : 'View'} Step-by-Step Guide & Benefits
        </span>
        {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
      </button>

      {/* Expanded Details */}
      {expanded && (
        <div className="px-6 pb-6 pt-4 space-y-5 border-t border-slate-800 bg-slate-950/40 animate-fade-in">
          {/* Benefits */}
          <div className="space-y-2">
            <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Key Benefits</h4>
            <ul className="space-y-1.5">
              {technique.benefits.map((b, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-slate-300">
                  <CheckCircle2 size={13} className="text-emerald-500 mt-0.5 shrink-0" />
                  {b}
                </li>
              ))}
            </ul>
          </div>

          {/* Steps */}
          <div className="space-y-2">
            <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Implementation Steps</h4>
            <ol className="space-y-2">
              {technique.steps.map((s, i) => (
                <li key={i} className="flex items-start gap-3 text-xs text-slate-300">
                  <span
                    className={`shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold border ${c.badge}`}
                  >
                    {i + 1}
                  </span>
                  {s}
                </li>
              ))}
            </ol>
          </div>

          <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-xl px-4 py-3">
            <AlertCircle size={13} className="text-amber-400 shrink-0" />
            <p className="text-[10px] text-slate-400 leading-relaxed">
              Results may vary based on soil type, climate zone, and existing farm infrastructure. Consult your local
              Krishi Vigyan Kendra (KVK) before implementation.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

const FarmingTechniques = () => {
  const [filter, setFilter] = useState('All');

  const tags = ['All', ...new Set(techniques.map((t) => t.tag))];
  const filtered = filter === 'All' ? techniques : techniques.filter((t) => t.tag === filter);

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl flex flex-col xl:flex-row items-start xl:items-center justify-between gap-5">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
            <Leaf className="text-emerald-500" />
            Farming Techniques Library
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Science-backed modern and traditional farming practices to improve yield, save resources, and protect soil
            health.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <button
              key={tag}
              onClick={() => setFilter(tag)}
              className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all duration-200 ${
                filter === tag
                  ? 'bg-emerald-600/20 text-emerald-400 border-emerald-500/40'
                  : 'bg-slate-800/50 text-slate-400 border-slate-700 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* Summary Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Techniques', value: techniques.length, icon: BookOpen, color: 'text-emerald-400' },
          { label: 'Categories', value: tags.length - 1, icon: Layers, color: 'text-blue-400' },
          { label: 'Avg. Yield Gain', value: `${Math.round(techniques.reduce((a, t) => a + t.yieldGain, 0) / techniques.length)}%`, icon: TrendingUp, color: 'text-amber-400' },
          { label: 'Max Water Save', value: `${Math.max(...techniques.map((t) => t.waterSaving))}%`, icon: Droplets, color: 'text-cyan-400' },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center gap-3">
              <div className={`p-2 bg-slate-800 rounded-xl ${stat.color}`}>
                <Icon size={16} />
              </div>
              <div>
                <p className="text-lg font-extrabold text-white">{stat.value}</p>
                <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">{stat.label}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Technique Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filtered.map((technique) => (
          <TechniqueCard key={technique.id} technique={technique} />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="bg-slate-900/60 border border-slate-800 p-12 text-center rounded-3xl space-y-3">
          <Leaf size={32} className="text-slate-600 mx-auto" />
          <h3 className="text-lg font-bold text-white">No techniques found</h3>
          <p className="text-sm text-slate-400">Try a different category filter.</p>
        </div>
      )}
    </div>
  );
};

export default FarmingTechniques;
