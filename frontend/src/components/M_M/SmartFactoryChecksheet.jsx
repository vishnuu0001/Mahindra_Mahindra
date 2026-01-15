import React, { useState, useEffect } from 'react';
import { CheckSquare, Square, ChevronDown, ChevronRight, Save, RefreshCw } from 'lucide-react';
import { apiUrl } from '../../config';

const SmartFactoryChecksheet = () => {
  const [maturityLevels, setMaturityLevels] = useState([]);
  const [selectedItems, setSelectedItems] = useState({});
  const [expandedLevels, setExpandedLevels] = useState({
    1: true,
    2: false,
    3: false,
    4: false,
    5: false
  });
  const [plantName, setPlantName] = useState('');
  const [assessmentDate, setAssessmentDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [assessmentId, setAssessmentId] = useState(null);
  const [saving, setSaving] = useState(false);

  const initializeAssessment = async () => {
    try {
      // Create a new assessment session
      const response = await fetch(apiUrl('/api/mm/assessments'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plant_name: plantName || 'Default Plant',
          assessor_name: 'User',
          notes: 'Smart Factory CheckSheet Assessment'
        })
      });
      
      if (response.ok) {
        const assessment = await response.json();
        setAssessmentId(assessment.id);
        
        // Load existing selections if any
        const selectionsResponse = await fetch(apiUrl(`/api/mm/checksheet-selections/${assessment.id}`));
        if (selectionsResponse.ok) {
          const selections = await selectionsResponse.json();
          const selectedMap = {};
          selections.forEach(sel => {
            if (sel.is_selected) {
              selectedMap[sel.maturity_level_id] = true;
            }
          });
          setSelectedItems(selectedMap);
        }
      }
    } catch (error) {
      console.error('Error initializing assessment:', error);
    }
  };

  const fetchMaturityLevels = async () => {
    try {
      const response = await fetch(apiUrl('/api/mm/maturity-levels'));
      
      if (!response.ok) {
        console.error('Failed to fetch maturity levels:', response.status, response.statusText);
        setMaturityLevels([]);
        setLoading(false);
        return;
      }
      
      const data = await response.json();
      
      // Ensure data is an array
      if (Array.isArray(data)) {
        setMaturityLevels(data);
      } else {
        console.error('Maturity levels data is not an array:', data);
        setMaturityLevels([]);
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching maturity levels:', error);
      setMaturityLevels([]);
      setLoading(false);
    }
  };

  // Load data on mount
  useEffect(() => {
    fetchMaturityLevels();
    initializeAssessment();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const refreshSimulatedData = async () => {
    setRefreshing(true);
    try {
      const response = await fetch(apiUrl('/api/mm/refresh-simulated-data'), {
        method: 'POST',
      });
      const result = await response.json();
      
      if (response.ok) {
        // Reload the maturity levels
        await fetchMaturityLevels();
        alert(`✅ ${result.message}\n\nLoaded ${result.count} items from Excel`);
      } else {
        alert(`❌ Error: ${result.detail || 'Failed to refresh data'}`);
      }
    } catch (error) {
      console.error('Error refreshing data:', error);
      alert('❌ Error refreshing simulated data. Please check the console.');
    } finally {
      setRefreshing(false);
    }
  };

  const toggleLevel = (level) => {
    setExpandedLevels(prev => ({
      ...prev,
      [level]: !prev[level]
    }));
  };

  const toggleSelection = async (id) => {
    const newValue = !selectedItems[id];
    
    setSelectedItems(prev => ({
      ...prev,
      [id]: newValue
    }));

    // Save selection to backend immediately
    if (assessmentId) {
      try {
        await fetch(apiUrl('/api/mm/checksheet-selections'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify([{
            assessment_id: assessmentId,
            maturity_level_id: id,
            is_selected: newValue,
            evidence: null
          }])
        });
      } catch (error) {
        console.error('Error saving selection:', error);
      }
    }
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

  const groupByLevel = () => {
    const grouped = {};
    maturityLevels.forEach(ml => {
      if (!grouped[ml.level]) {
        grouped[ml.level] = {
          name: ml.name,
          items: []
        };
      }
      grouped[ml.level].items.push(ml);
    });
    return grouped;
  };

  const groupedLevels = groupByLevel();

  const handleSave = async () => {
    if (!assessmentId) {
      alert('❌ No assessment session found. Please refresh the page.');
      return;
    }

    setSaving(true);
    try {
      // Trigger dimension score calculation
      const response = await fetch(apiUrl(`/api/mm/calculate-dimension-scores?assessment_id=${assessmentId}`), {
        method: 'POST',
      });
      
      const result = await response.json();
      
      if (response.ok) {
        alert(`✅ Assessment Saved & Calculated!\n\nPlant: ${plantName}\nDate: ${assessmentDate}\nSelected Items: ${Object.values(selectedItems).filter(Boolean).length}\n\n${result.message}\nCalculated Level: ${result.calculated_level}\nDimensions Updated: ${result.dimensions_updated}`);
      } else {
        alert(`❌ Error: ${result.detail || 'Failed to calculate scores'}`);
      }
    } catch (error) {
      console.error('Error saving assessment:', error);
      alert('❌ Error saving assessment. Please check the console.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="animate-spin text-[#004A96]" size={32} />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-[fadeIn_0.5s]">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 uppercase italic tracking-tight">Smart Factory CheckSheet</h1>
          <p className="text-[#004A96] mt-2 font-black text-sm uppercase tracking-wider">Digital Maturity Assessment Tool</p>
        </div>
        <button
          onClick={refreshSimulatedData}
          disabled={refreshing}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-lg font-bold text-sm uppercase hover:from-emerald-600 hover:to-emerald-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
        >
          <RefreshCw size={18} className={refreshing ? 'animate-spin' : ''} />
          {refreshing ? 'Refreshing...' : 'Refresh Simulated Data'}
        </button>
      </div>

      {/* Assessment Information */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <h3 className="font-bold text-slate-900 uppercase text-xs tracking-widest mb-4">Assessment Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Plant Name</label>
            <input
              type="text"
              value={plantName}
              onChange={(e) => setPlantName(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#004A96] focus:border-transparent"
              placeholder="Enter plant name"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Assessment Date</label>
            <input
              type="date"
              value={assessmentDate}
              onChange={(e) => setAssessmentDate(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#004A96] focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Maturity Levels */}
      <div className="space-y-4">
        {Object.entries(groupedLevels).map(([level, data]) => (
          <div key={level} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            {/* Level Header */}
            <div
              className={`bg-gradient-to-r ${getLevelColor(parseInt(level))} p-5 cursor-pointer hover:opacity-90 transition-opacity`}
              onClick={() => toggleLevel(parseInt(level))}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {expandedLevels[level] ? (
                    <ChevronDown className="text-white" size={24} />
                  ) : (
                    <ChevronRight className="text-white" size={24} />
                  )}
                  <div>
                    <h2 className="text-xl font-black text-white uppercase tracking-tight">
                      Level {level}: {data.name}
                    </h2>
                    <p className="text-white/80 text-sm mt-1">{data.items.length} capabilities</p>
                  </div>
                </div>
                <div className={`px-4 py-2 rounded-lg border-2 border-white/30 ${getLevelBadgeColor(parseInt(level))}`}>
                  <span className="font-bold text-sm">L{level}</span>
                </div>
              </div>
            </div>

            {/* Level Content */}
            {expandedLevels[level] && (
              <div className="p-6 space-y-3">
                {data.items.map((item) => (
                  <div
                    key={item.id}
                    className={`p-4 rounded-xl border-2 transition-all cursor-pointer ${
                      selectedItems[item.id]
                        ? 'border-[#004A96] bg-blue-50'
                        : 'border-slate-200 bg-slate-50 hover:border-slate-300'
                    }`}
                    onClick={() => toggleSelection(item.id)}
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5">
                        {selectedItems[item.id] ? (
                          <CheckSquare className="text-[#004A96]" size={20} />
                        ) : (
                          <Square className="text-slate-400" size={20} />
                        )}
                      </div>
                      <div className="flex-1">
                        {item.sub_level && (
                          <div className="flex items-center gap-2 mb-2">
                            <span className={`px-2 py-1 rounded text-xs font-bold border ${getLevelBadgeColor(item.level)}`}>
                              {item.sub_level}
                            </span>
                            {item.category && (
                              <span className="text-xs font-semibold text-slate-600">
                                {item.category}
                              </span>
                            )}
                          </div>
                        )}
                        <p className="text-sm text-slate-700 leading-relaxed">{item.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end gap-4">
        <button
          onClick={() => setSelectedItems({})}
          className="px-6 py-3 bg-slate-200 text-slate-700 rounded-lg font-bold text-sm uppercase hover:bg-slate-300 transition-colors"
        >
          Clear Selection
        </button>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#004A96] to-[#0066CC] text-white rounded-lg font-bold text-sm uppercase hover:from-[#003875] hover:to-[#004A96] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Save size={18} />
          {saving ? 'Calculating...' : 'Save & Calculate Scores'}
        </button>
      </div>

      {/* Summary */}
      <div className="bg-gradient-to-r from-slate-50 to-slate-100 p-6 rounded-2xl border border-slate-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-900 uppercase text-xs tracking-widest mb-1">Assessment Progress</h3>
            <p className="text-slate-600 text-sm">Track your digital maturity evaluation</p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-[#004A96]">
              {Object.values(selectedItems).filter(Boolean).length}
            </div>
            <div className="text-xs text-slate-600 uppercase tracking-wider">Items Selected</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SmartFactoryChecksheet;
