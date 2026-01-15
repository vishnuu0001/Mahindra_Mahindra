import React, { useState, useEffect } from 'react';
import { FileText, Download, Calendar, Filter, TrendingUp, Target, CheckCircle2, AlertCircle, ChevronDown, ChevronRight, RefreshCw, Calculator } from 'lucide-react';
import { apiUrl } from '../../config';

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
      const response = await fetch(apiUrl('/api/mm/areas'));
      
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
      const response = await fetch(apiUrl('/api/mm/refresh-all-data'), {
        method: 'POST',
      });
      const result = await response.json();
      
      if (response.ok) {
        // Reload the areas
        await fetchAreas();
        
        // Build success message
        let message = '✅ All data refreshed successfully!\n\n';
        if (result.results?.reports) {
          message += `📊 Reports: ${result.results.reports.area_count} Areas, ${result.results.reports.dimension_count} Dimensions\n`;
        }
        if (result.results?.rating_scales) {
          message += `⭐ Rating Scales: ${result.results.rating_scales.dimension_count} Dimensions, ${result.results.rating_scales.rating_count} Ratings\n`;
        }
        if (result.results?.maturity_levels) {
          message += `📈 Maturity Levels: ${result.results.maturity_levels.count} Items\n`;
        }
        
        alert(message);
      } else {
        alert(`❌ Error: ${result.detail || result.message || 'Failed to refresh data'}`);
      }
    } catch (error) {
      console.error('Error refreshing data:', error);
      alert('❌ Error refreshing data. Please check the console.');
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

  const generateReport = async () => {
    try {
      // Generate PDF report
      const response = await fetch(apiUrl('/api/mm/generate-report'), {
        method: 'POST',
      });
      
      if (!response.ok) {
        throw new Error('Failed to generate report');
      }
      
      // Download the HTML report
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Mahindra_Maturity_Assessment_${new Date().toISOString().split('T')[0]}.html`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      alert('✅ Report generated and downloaded successfully!');
    } catch (error) {
      console.error('Error generating report:', error);
      alert('❌ Error generating report. Please check the console.');
    }
  };

  const downloadCSV = () => {
    try {
      // Prepare CSV data
      const csvRows = [];
      
      // Headers
      csvRows.push(['Area', 'Dimension', 'Current Level', 'Desired Level', 'Gap', 'Status', 'Priority']);
      
      // Data rows
      areas.forEach(area => {
        if (area.dimensions && area.dimensions.length > 0) {
          area.dimensions.forEach(dim => {
            const gap = dim.desired_level - dim.current_level;
            const status = gap === 0 ? 'On Target' : gap > 0 ? 'Below Target' : 'Above Target';
            const priority = gap > 2 ? 'High' : gap > 0 ? 'Medium' : 'Low';
            
            csvRows.push([
              area.name,
              dim.name,
              dim.current_level,
              dim.desired_level,
              gap,
              status,
              priority
            ]);
          });
        }
      });
      
      // Convert to CSV string
      const csvContent = csvRows.map(row => 
        row.map(cell => `"${cell}"`).join(',')
      ).join('\n');
      
      // Download
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Mahindra_Assessment_Data_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      alert(`✅ CSV downloaded successfully!\n\n${areas.length} areas with ${areas.reduce((sum, a) => sum + (a.dimensions?.length || 0), 0)} dimensions exported.`);
    } catch (error) {
      console.error('Error downloading CSV:', error);
      alert('❌ Error downloading CSV. Please check the console.');
    }
  };

  const viewRoadmap = () => {
    try {
      // Prepare roadmap data
      const roadmapItems = [];
      
      areas.forEach(area => {
        if (area.dimensions && area.dimensions.length > 0) {
          area.dimensions.forEach(dim => {
            const gap = dim.desired_level - dim.current_level;
            if (gap > 0) {
              roadmapItems.push({
                area: area.name,
                dimension: dim.name,
                currentLevel: dim.current_level,
                targetLevel: dim.desired_level,
                gap: gap,
                priority: gap > 2 ? 'High' : gap > 0 ? 'Medium' : 'Low',
                effort: gap * 2, // Estimate: 2 months per level
                impact: dim.desired_level * 20 // Score based on target level
              });
            }
          });
        }
      });
      
      // Sort by priority (High > Medium > Low) and gap (largest first)
      roadmapItems.sort((a, b) => {
        const priorityOrder = { 'High': 3, 'Medium': 2, 'Low': 1 };
        if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
          return priorityOrder[b.priority] - priorityOrder[a.priority];
        }
        return b.gap - a.gap;
      });
      
      // Create roadmap visualization
      let roadmapHTML = `
        <html>
        <head>
          <title>Digital Maturity Transformation Roadmap</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; background: #f5f5f5; }
            h1 { color: #004A96; text-align: center; }
            h2 { color: #0066CC; margin-top: 30px; }
            table { width: 100%; border-collapse: collapse; background: white; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
            th { background: #004A96; color: white; padding: 12px; text-align: left; font-weight: bold; }
            td { padding: 10px; border-bottom: 1px solid #e0e0e0; }
            .high { background: #fee; }
            .medium { background: #ffc; }
            .low { background: #efe; }
            .summary { background: white; padding: 20px; margin-bottom: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
            .metric { display: inline-block; margin: 10px 20px; }
            .metric-value { font-size: 32px; font-weight: bold; color: #004A96; }
            .metric-label { color: #666; font-size: 14px; }
          </style>
        </head>
        <body>
          <h1>🚀 Digital Maturity Transformation Roadmap</h1>
          
          <div class="summary">
            <h2>Executive Summary</h2>
            <div class="metric">
              <div class="metric-value">${roadmapItems.length}</div>
              <div class="metric-label">Transformation Initiatives</div>
            </div>
            <div class="metric">
              <div class="metric-value">${roadmapItems.filter(i => i.priority === 'High').length}</div>
              <div class="metric-label">High Priority</div>
            </div>
            <div class="metric">
              <div class="metric-value">${Math.round(roadmapItems.reduce((sum, i) => sum + i.effort, 0) / 12)} years</div>
              <div class="metric-label">Estimated Duration</div>
            </div>
            <div class="metric">
              <div class="metric-value">${areas.length}</div>
              <div class="metric-label">Focus Areas</div>
            </div>
          </div>
          
          <h2>📊 Initiative Prioritization Matrix</h2>
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Area</th>
                <th>Dimension</th>
                <th>Current → Target</th>
                <th>Gap</th>
                <th>Priority</th>
                <th>Effort (months)</th>
                <th>Impact Score</th>
              </tr>
            </thead>
            <tbody>
              ${roadmapItems.map((item, index) => `
                <tr class="${item.priority.toLowerCase()}">
                  <td><strong>${index + 1}</strong></td>
                  <td>${item.area}</td>
                  <td>${item.dimension}</td>
                  <td>Level ${item.currentLevel} → Level ${item.targetLevel}</td>
                  <td><strong>${item.gap} levels</strong></td>
                  <td><strong>${item.priority}</strong></td>
                  <td>${item.effort}</td>
                  <td>${item.impact}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          
          <div style="margin-top: 30px; padding: 20px; background: white; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <h3>Legend</h3>
            <p><span style="background: #fee; padding: 5px 10px; border-radius: 4px;">High Priority</span> - Gap > 2 levels - Immediate attention required</p>
            <p><span style="background: #ffc; padding: 5px 10px; border-radius: 4px;">Medium Priority</span> - Gap 1-2 levels - Plan for next phase</p>
            <p><span style="background: #efe; padding: 5px 10px; border-radius: 4px;">Low Priority</span> - On track or minimal gap</p>
          </div>
        </body>
        </html>
      `;
      
      // Open in new window
      const newWindow = window.open('', '_blank');
      newWindow.document.write(roadmapHTML);
      newWindow.document.close();
    } catch (error) {
      console.error('Error generating roadmap:', error);
      alert('❌ Error generating roadmap. Please check the console.');
    }
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
          <button 
            onClick={generateReport}
            className="w-full px-4 py-2 bg-gradient-to-r from-[#004A96] to-[#0066CC] text-white rounded-lg text-xs font-bold uppercase hover:from-[#003875] hover:to-[#004A96] transition-all">
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
          <button 
            onClick={downloadCSV}
            className="w-full px-4 py-2 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-lg text-xs font-bold uppercase hover:from-emerald-700 hover:to-emerald-800 transition-all">
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
          <button 
            onClick={viewRoadmap}
            className="w-full px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg text-xs font-bold uppercase hover:from-purple-700 hover:to-purple-800 transition-all">
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
