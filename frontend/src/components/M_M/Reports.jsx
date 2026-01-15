import React, { useState, useEffect } from 'react';
import { FileText, Download, Calendar, Filter, TrendingUp, Target, CheckCircle2, AlertCircle, ChevronDown, ChevronRight, RefreshCw, Calculator } from 'lucide-react';

const Reports = () => {
  const [areas, setAreas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedSections, setExpandedSections] = useState({});
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [lastCalculated, setLastCalculated] = useState(null);

  useEffect(() => {
    fetchAreas();
    
    // Auto-refresh every 5 seconds for streaming data demo
    if (autoRefresh) {
      const interval = setInterval(fetchAreas, 5000);
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  const fetchAreas = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/mm/areas');
      
      if (!response.ok) {
        console.error('Failed to fetch areas:', response.status, response.statusText);
        setAreas([]);
        setLoading(false);
        return;
      }
      
      const data = await response.json();
      
      // Ensure data is an array
      if (Array.isArray(data)) {
        setAreas(data);
        
        // Expand all areas by default to show the data
        if (data.length > 0) {
          const expandedState = {};
          data.forEach(area => {
            expandedState[area.id] = true;
          });
          setExpandedSections(expandedState);
        }
      } else {
        console.error('Areas data is not an array:', data);
        setAreas([]);
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching areas:', error);
      setAreas([]);
      setLoading(false);
    }
  };

  const refreshSimulatedData = async () => {
    setRefreshing(true);
    try {
      const response = await fetch('http://localhost:8000/api/mm/refresh-reports-data', {
        method: 'POST',
      });
      const result = await response.json();
      
      if (response.ok) {
        // Reload the areas
        await fetchAreas();
        alert(`✅ ${result.message}\n\n${result.area_count} Areas\n${result.dimension_count} Dimensions`);
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

  const toggleSection = (areaId) => {
    setExpandedSections(prev => ({
      ...prev,
      [areaId]: !prev[areaId]
    }));
  };

  const getLevelColor = (level) => {
    const colors = {
      1: 'bg-red-100 text-red-700 border-red-200',
      2: 'bg-orange-100 text-orange-700 border-orange-200',
      3: 'bg-yellow-100 text-yellow-700 border-yellow-200',
      4: 'bg-blue-100 text-blue-700 border-blue-200',
      5: 'bg-green-100 text-green-700 border-green-200'
    };
    return colors[level] || 'bg-gray-100 text-gray-700 border-gray-200';
  };

  const getLevelName = (level) => {
    const names = {
      1: 'Connected & Visible',
      2: 'Integrated & Data Driven',
      3: 'Predictive & Optimized',
      4: 'Flexible, Agile Factory',
      5: 'Autonomous SDF'
    };
    return names[level] || 'N/A';
  };

  const getProgressPercentage = (current, desired) => {
    return (current / desired) * 100;
  };

  const getStatusIcon = (current, desired) => {
    if (current >= desired) {
      return <CheckCircle2 className="text-green-600" size={18} />;
    } else if (current >= desired - 1) {
      return <TrendingUp className="text-blue-600" size={18} />;
    } else {
      return <AlertCircle className="text-orange-600" size={18} />;
    }
  };

  const renderAreaReport = (area) => {
    const isExpanded = expandedSections[area.id];
    const dimensions = area.dimensions || [];
    const avgCurrent = dimensions.length > 0 
      ? (dimensions.reduce((sum, d) => sum + d.current_level, 0) / dimensions.length).toFixed(1) 
      : 0;
    const onTrackCount = dimensions.filter(d => d.current_level >= d.desired_level - 1).length;
    const completedCount = dimensions.filter(d => d.current_level >= d.desired_level).length;

    return (
      <div key={area.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Header */}
        <div 
          className="bg-gradient-to-r from-[#004A96] to-[#0066CC] p-6 cursor-pointer hover:from-[#003875] hover:to-[#004A96] transition-all"
          onClick={() => toggleSection(area.id)}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {isExpanded ? 
                <ChevronDown className="text-white" size={24} /> : 
                <ChevronRight className="text-white" size={24} />
              }
              <div>
                <h2 className="text-2xl font-black text-white uppercase tracking-tight">{area.name}</h2>
                <p className="text-blue-100 text-sm mt-1">Digital Maturity Assessment</p>
              </div>
            </div>
            <div className="flex gap-6">
              <div className="text-right">
                <div className="text-blue-100 text-xs uppercase tracking-wider">Avg Current</div>
                <div className="text-2xl font-bold text-white">{avgCurrent}</div>
              </div>
              <div className="text-right">
                <div className="text-blue-100 text-xs uppercase tracking-wider">Target Level</div>
                <div className="text-2xl font-bold text-white">{area.desired_level || 'Variable'}</div>
              </div>
              <div className="text-right">
                <div className="text-blue-100 text-xs uppercase tracking-wider">On Track</div>
                <div className="text-2xl font-bold text-white">{onTrackCount}/{dimensions.length}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Summary Stats */}
        {isExpanded && (
          <div className="bg-slate-50 px-6 py-4 border-b border-slate-200">
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-white p-4 rounded-xl border border-slate-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <CheckCircle2 className="text-green-600" size={20} />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-slate-900">{completedCount}</div>
                    <div className="text-xs text-slate-600 uppercase tracking-wider">Achieved Target</div>
                  </div>
                </div>
              </div>
              <div className="bg-white p-4 rounded-xl border border-slate-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <TrendingUp className="text-blue-600" size={20} />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-slate-900">{onTrackCount - completedCount}</div>
                    <div className="text-xs text-slate-600 uppercase tracking-wider">In Progress</div>
                  </div>
                </div>
              </div>
              <div className="bg-white p-4 rounded-xl border border-slate-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                    <AlertCircle className="text-orange-600" size={20} />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-slate-900">{dimensions.length - onTrackCount}</div>
                    <div className="text-xs text-slate-600 uppercase tracking-wider">Needs Attention</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Dimensions Detail */}
        {isExpanded && (
          <div className="p-6">
            <div className="space-y-4">
              {dimensions.map((dimension) => (
                <div key={dimension.id} className="bg-slate-50 rounded-xl p-4 border border-slate-200 hover:border-[#004A96] transition-colors">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3 flex-1">
                      {getStatusIcon(dimension.current_level, dimension.desired_level)}
                      <div className="flex-1">
                        <h4 className="font-bold text-slate-900 text-sm">{dimension.name}</h4>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-center">
                        <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">Current</div>
                        <span className={`px-3 py-1 rounded-lg text-xs font-bold border ${getLevelColor(dimension.current_level)}`}>
                          L{dimension.current_level}
                        </span>
                      </div>
                      <div className="text-slate-400">→</div>
                      <div className="text-center">
                        <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">Target</div>
                        <span className={`px-3 py-1 rounded-lg text-xs font-bold border ${getLevelColor(dimension.desired_level)}`}>
                          L{dimension.desired_level}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="space-y-2">
                    <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                      <div 
                        className="bg-gradient-to-r from-[#004A96] to-[#0066CC] h-2 rounded-full transition-all duration-500"
                        style={{ width: `${getProgressPercentage(dimension.current_level, dimension.desired_level)}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-slate-600">
                      <span>{getLevelName(dimension.current_level)}</span>
                      <span className="font-semibold">{Math.round(getProgressPercentage(dimension.current_level, dimension.desired_level))}%</span>
                      <span className="text-slate-400">{getLevelName(dimension.desired_level)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
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
          <h1 className="text-3xl font-extrabold text-slate-900 uppercase italic tracking-tight">Digital Maturity Reports</h1>
          <p className="text-[#004A96] mt-2 font-black text-sm uppercase tracking-wider">M & M Analytics & Reporting • Live Data</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={refreshSimulatedData}
            disabled={refreshing}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-lg font-bold text-sm uppercase hover:from-emerald-600 hover:to-emerald-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
          >
            <RefreshCw size={18} className={refreshing ? 'animate-spin' : ''} />
            {refreshing ? 'Refreshing...' : 'Refresh Simulated Data'}
          </button>
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-xs uppercase transition-all ${
              autoRefresh 
                ? 'bg-green-100 text-green-700 border-2 border-green-300' 
                : 'bg-slate-100 text-slate-600 border-2 border-slate-300'
            }`}
          >
            <RefreshCw className={autoRefresh ? 'animate-spin' : ''} size={14} />
            {autoRefresh ? 'Live Updates ON' : 'Live Updates OFF'}
          </button>
        </div>
      </div>

      {/* Calculation Status Banner */}
      <div className="bg-gradient-to-r from-blue-50 to-blue-100 border-l-4 border-[#004A96] p-4 rounded-lg">
        <div className="flex items-center gap-3">
          <Calculator className="text-[#004A96]" size={20} />
          <div>
            <p className="text-sm font-semibold text-slate-900">
              📊 Dimension scores are calculated from Smart Factory CheckSheet selections
            </p>
            <p className="text-xs text-slate-600 mt-1">
              Go to Smart Factory CheckSheet to select capabilities and click "Save & Calculate Scores" to update these values
            </p>
          </div>
        </div>
      </div>

      {/* Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-lg transition-shadow cursor-pointer">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
              <FileText className="text-blue-600" size={20} />
            </div>
            <h3 className="font-black text-slate-900 uppercase text-sm">Export Report</h3>
          </div>
          <p className="text-slate-600 text-sm mb-4">Download comprehensive maturity assessment reports in PDF or Excel format</p>
          <button className="w-full px-4 py-2 bg-gradient-to-r from-[#004A96] to-[#0066CC] text-white rounded-lg text-xs font-bold uppercase hover:from-[#003875] hover:to-[#004A96] transition-all">
            Generate Report
          </button>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-lg transition-shadow cursor-pointer">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
              <Download className="text-emerald-600" size={20} />
            </div>
            <h3 className="font-black text-slate-900 uppercase text-sm">Download Data</h3>
          </div>
          <p className="text-slate-600 text-sm mb-4">Export raw assessment data with dimension scores and gap analysis</p>
          <button className="w-full px-4 py-2 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-lg text-xs font-bold uppercase hover:from-emerald-700 hover:to-emerald-800 transition-all">
            Download CSV
          </button>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-lg transition-shadow cursor-pointer">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
              <Target className="text-purple-600" size={20} />
            </div>
            <h3 className="font-black text-slate-900 uppercase text-sm">Roadmap View</h3>
          </div>
          <p className="text-slate-600 text-sm mb-4">View transformation roadmap and initiative prioritization matrix</p>
          <button className="w-full px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg text-xs font-bold uppercase hover:from-purple-700 hover:to-purple-800 transition-all">
            View Roadmap
          </button>
        </div>
      </div>

      {/* Area Reports */}
      <div className="space-y-6">
        {areas.map(area => renderAreaReport(area))}
      </div>

      {/* Legend */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <h3 className="font-bold text-slate-900 uppercase text-xs tracking-widest mb-4">Maturity Level Legend</h3>
        <div className="grid grid-cols-5 gap-4">
          {[1, 2, 3, 4, 5].map(level => (
            <div key={level} className={`p-3 rounded-lg border ${getLevelColor(level)}`}>
              <div className="font-bold text-sm mb-1">Level {level}</div>
              <div className="text-xs">{getLevelName(level)}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Reports;
