import React, { useState, useEffect } from 'react';
import { Star, Award, BarChart3, RefreshCw, ChevronDown, ChevronRight } from 'lucide-react';

const RatingScales = () => {
  const [ratingScales, setRatingScales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedDimensions, setExpandedDimensions] = useState({});

  useEffect(() => {
    fetchRatingScales();
  }, []);

  const fetchRatingScales = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/mm/rating-scales');
      
      if (!response.ok) {
        console.error('Failed to fetch rating scales:', response.status, response.statusText);
        setRatingScales([]);
        setLoading(false);
        return;
      }
      
      const data = await response.json();
      
      // Ensure data is an array
      if (Array.isArray(data)) {
        setRatingScales(data);
        
        // Expand first dimension by default
        if (data.length > 0) {
          setExpandedDimensions({ [data[0].dimension_name]: true });
        }
      } else {
        console.error('Rating scales data is not an array:', data);
        setRatingScales([]);
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching rating scales:', error);
      setRatingScales([]);
      setLoading(false);
    }
  };

  const toggleDimension = (dimensionName) => {
    setExpandedDimensions(prev => ({
      ...prev,
      [dimensionName]: !prev[dimensionName]
    }));
  };

  const groupByDimension = () => {
    const grouped = {};
    
    // Ensure ratingScales is an array before using forEach
    if (!Array.isArray(ratingScales)) {
      return grouped;
    }
    
    ratingScales.forEach(scale => {
      if (!grouped[scale.dimension_name]) {
        grouped[scale.dimension_name] = [];
      }
      grouped[scale.dimension_name].push(scale);
    });
    return grouped;
  };

  const getLevelColor = (level) => {
    const colors = {
      1: 'from-red-500 to-red-600',
      2: 'from-orange-500 to-orange-600',
      3: 'from-yellow-500 to-yellow-600',
      4: 'from-blue-500 to-blue-600',
      5: 'from-green-500 to-green-600'
    };
    return colors[level] || 'from-gray-500 to-gray-600';
  };

  const getLevelBadgeColor = (level) => {
    const colors = {
      1: 'bg-red-100 text-red-700 border-red-200',
      2: 'bg-orange-100 text-orange-700 border-orange-200',
      3: 'bg-yellow-100 text-yellow-700 border-yellow-200',
      4: 'bg-blue-100 text-blue-700 border-blue-200',
      5: 'bg-green-100 text-green-700 border-green-200'
    };
    return colors[level] || 'bg-gray-100 text-gray-700 border-gray-200';
  };

  const getBusinessRelevanceColor = (relevance) => {
    const colors = {
      'Tactical': 'bg-blue-100 text-blue-700 border-blue-200',
      'Strategic': 'bg-purple-100 text-purple-700 border-purple-200',
      'Transformational': 'bg-green-100 text-green-700 border-green-200'
    };
    return colors[relevance] || 'bg-gray-100 text-gray-700 border-gray-200';
  };

  const groupedScales = groupByDimension();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="animate-spin text-[#004A96]" size={32} />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-[fadeIn_0.5s]">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 uppercase italic tracking-tight">Rating Scales</h1>
        <p className="text-[#004A96] mt-2 font-black text-sm uppercase tracking-wider">Digital Maturity & Business Relevance Framework</p>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-blue-600 to-blue-700 p-6 rounded-2xl text-white shadow-lg">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <Star className="text-white" size={20} />
            </div>
            <h3 className="font-black uppercase text-sm">Maturity Levels</h3>
          </div>
          <p className="text-4xl font-extrabold mb-2">5</p>
          <p className="text-blue-100 text-xs">From Connected to Autonomous</p>
        </div>

        <div className="bg-gradient-to-br from-purple-600 to-purple-700 p-6 rounded-2xl text-white shadow-lg">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <Award className="text-white" size={20} />
            </div>
            <h3 className="font-black uppercase text-sm">Dimensions</h3>
          </div>
          <p className="text-4xl font-extrabold mb-2">{Object.keys(groupedScales).length}</p>
          <p className="text-purple-100 text-xs">Assessment Categories</p>
        </div>

        <div className="bg-gradient-to-br from-emerald-600 to-emerald-700 p-6 rounded-2xl text-white shadow-lg">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <BarChart3 className="text-white" size={20} />
            </div>
            <h3 className="font-black uppercase text-sm">Total Ratings</h3>
          </div>
          <p className="text-4xl font-extrabold mb-2">{ratingScales.length}</p>
          <p className="text-emerald-100 text-xs">Rating Criteria Defined</p>
        </div>
      </div>

      {/* Rating Scales by Dimension */}
      <div className="space-y-6">
        {Object.entries(groupedScales).map(([dimensionName, scales]) => (
          <div key={dimensionName} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            {/* Dimension Header */}
            <div
              className="bg-gradient-to-r from-[#004A96] to-[#0066CC] p-5 cursor-pointer hover:from-[#003875] hover:to-[#004A96] transition-all"
              onClick={() => toggleDimension(dimensionName)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {expandedDimensions[dimensionName] ? (
                    <ChevronDown className="text-white" size={24} />
                  ) : (
                    <ChevronRight className="text-white" size={24} />
                  )}
                  <div>
                    <h2 className="text-xl font-black text-white uppercase tracking-tight">{dimensionName}</h2>
                    <p className="text-blue-100 text-sm mt-1">{scales.length} maturity levels</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Dimension Content */}
            {expandedDimensions[dimensionName] && (
              <div className="p-6 space-y-4">
                {scales.sort((a, b) => a.level - b.level).map((scale) => (
                  <div key={scale.id} className="bg-slate-50 rounded-xl border border-slate-200 overflow-hidden">
                    {/* Level Header */}
                    <div className={`bg-gradient-to-r ${getLevelColor(scale.level)} p-4`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className={`px-3 py-1.5 rounded-lg border-2 border-white/30 font-bold text-sm ${getLevelBadgeColor(scale.level)}`}>
                            Level {scale.level}
                          </span>
                          <span className="text-white font-bold text-sm uppercase tracking-wide">
                            {scale.level === 1 ? 'Connected & Visible' :
                             scale.level === 2 ? 'Integrated & Data-Driven' :
                             scale.level === 3 ? 'Predictive & Optimized' :
                             scale.level === 4 ? 'Flexible, Agile Factory' :
                             'Autonomous SDF'}
                          </span>
                        </div>
                        <span className={`px-3 py-1.5 rounded-lg border font-semibold text-xs ${getBusinessRelevanceColor(scale.business_relevance)}`}>
                          {scale.business_relevance}
                        </span>
                      </div>
                    </div>

                    {/* Level Content */}
                    <div className="p-4 space-y-3">
                      <div>
                        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Digital Maturity</h4>
                        <p className="text-sm text-slate-700 leading-relaxed">{scale.digital_maturity_description}</p>
                      </div>
                      <div className="border-t border-slate-200 pt-3">
                        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Business Impact</h4>
                        <p className="text-sm text-slate-700 leading-relaxed">{scale.business_description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <h3 className="font-bold text-slate-900 uppercase text-xs tracking-widest mb-4">Business Relevance Classification</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl border-2 border-blue-200 bg-blue-50">
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2 py-1 rounded bg-blue-100 text-blue-700 border border-blue-200 font-bold text-xs">Tactical</span>
            </div>
            <p className="text-xs text-slate-600">Improves operational efficiency and reduces manual errors</p>
          </div>
          <div className="p-4 rounded-xl border-2 border-purple-200 bg-purple-50">
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2 py-1 rounded bg-purple-100 text-purple-700 border border-purple-200 font-bold text-xs">Strategic</span>
            </div>
            <p className="text-xs text-slate-600">Enables cross-functional decisions and supply chain resilience</p>
          </div>
          <div className="p-4 rounded-xl border-2 border-green-200 bg-green-50">
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2 py-1 rounded bg-green-100 text-green-700 border border-green-200 font-bold text-xs">Transformational</span>
            </div>
            <p className="text-xs text-slate-600">Drives new business models and competitive differentiation</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RatingScales;
