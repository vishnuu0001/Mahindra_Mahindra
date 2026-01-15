# Reports Page Features

## Three New Interactive Features Added

### 1. 📄 Export Report (Generate Report)
**Purpose**: Download comprehensive maturity assessment report

**How it works**:
- Generates HTML report with all areas and dimensions
- Includes current levels, target levels, and gaps
- Color-coded by maturity level
- Shows executive summary with key metrics

**Output**: HTML file (`Mahindra_Maturity_Assessment_YYYY-MM-DD.html`)

**Usage**:
1. Click "GENERATE REPORT" button
2. Browser downloads HTML report automatically
3. Open in browser to view formatted report
4. Can be printed to PDF using browser's print function

**Features**:
- Professional formatting with Mahindra branding colors
- Detailed area-by-area breakdown
- Gap analysis with visual status indicators
- Date-stamped for record-keeping

---

### 2. 💾 Download Data (Download CSV)
**Purpose**: Export raw assessment data for analysis in Excel/data tools

**How it works**:
- Converts all dimension data to CSV format
- Includes calculated gaps and priorities
- Ready for pivot tables and further analysis

**Output**: CSV file (`Mahindra_Assessment_Data_YYYY-MM-DD.csv`)

**Columns**:
- Area name
- Dimension name
- Current Level (1-5)
- Desired Level (1-5)
- Gap (difference)
- Status (On Target / Below Target / Above Target)
- Priority (High / Medium / Low)

**Usage**:
1. Click "DOWNLOAD CSV" button
2. CSV file downloads automatically
3. Open in Excel, Google Sheets, or any CSV viewer
4. Perform custom analysis, create charts, or share with stakeholders

**Priority Calculation**:
- **High**: Gap > 2 levels - Requires immediate attention
- **Medium**: Gap = 1-2 levels - Plan for next phase
- **Low**: Gap ≤ 0 - On track or ahead

---

### 3. 🎯 Roadmap View (View Roadmap)
**Purpose**: Visualize transformation roadmap and initiative prioritization

**How it works**:
- Identifies all dimensions with gaps (below target)
- Calculates priority based on gap size
- Estimates effort (2 months per level gap)
- Computes impact score based on target level
- Sorts initiatives by priority and gap size
- Opens interactive HTML report in new window

**Features**:
- **Executive Summary Dashboard**
  - Total transformation initiatives
  - High priority count
  - Estimated total duration
  - Number of focus areas

- **Initiative Prioritization Matrix**
  - Ranked list of all improvement initiatives
  - Current state → Target state visualization
  - Effort estimation
  - Impact scoring
  - Color-coded priorities

- **Visual Prioritization**
  - 🔴 Red (High Priority): Gap > 2 levels
  - 🟡 Yellow (Medium Priority): Gap 1-2 levels
  - 🟢 Green (Low Priority): Minimal or no gap

**Usage**:
1. Click "VIEW ROADMAP" button
2. New browser window opens with roadmap
3. Review prioritized initiatives
4. Use for planning and resource allocation
5. Print or save for stakeholder presentations

**Calculation Logic**:
- **Effort**: Gap × 2 months (e.g., 3-level gap = 6 months)
- **Impact**: Target level × 20 (e.g., Level 5 = 100 points)
- **Priority**: High if gap > 2, Medium if gap 1-2, Low otherwise

---

## Technical Implementation

### Frontend (Reports.jsx)
- `generateReport()`: Calls backend API to generate HTML report
- `downloadCSV()`: Client-side CSV generation from current data
- `viewRoadmap()`: Client-side HTML generation in new window

### Backend (main.py)
- New endpoint: `POST /api/mm/generate-report`
- Returns StreamingResponse with HTML content
- Includes all areas with dimensions and gap analysis

### Files Modified
1. `frontend/src/components/M_M/Reports.jsx` - Added three new functions
2. `backend/main.py` - Added report generation endpoint

---

## Future Enhancements

### Potential Improvements:
1. **PDF Generation**: Add library like WeasyPrint for true PDF output
2. **Excel Export**: Generate .xlsx files with multiple sheets
3. **Custom Filters**: Allow filtering by area, priority, or level
4. **Charts & Graphs**: Add visual charts to reports
5. **Email Integration**: Send reports directly to stakeholders
6. **Schedule Reports**: Auto-generate weekly/monthly reports
7. **Comparison Reports**: Compare assessments over time
8. **Custom Templates**: Allow users to customize report format

### Libraries for PDF (if needed):
```bash
pip install weasyprint  # For HTML to PDF conversion
pip install reportlab   # For programmatic PDF generation
pip install fpdf        # Lightweight PDF generation
```

---

## Testing Checklist

- [ ] Generate Report button downloads HTML file
- [ ] HTML report opens correctly in browser
- [ ] All areas and dimensions appear in report
- [ ] Gap calculations are correct
- [ ] Download CSV button creates CSV file
- [ ] CSV opens in Excel/Sheets
- [ ] All columns present with correct data
- [ ] Priorities calculated correctly
- [ ] View Roadmap opens new window
- [ ] Roadmap shows all initiatives
- [ ] Initiatives sorted by priority
- [ ] Effort and impact scores calculated
- [ ] Color coding works (High/Med/Low)
- [ ] Handles empty data gracefully
- [ ] Works on both local and deployed versions

---

## User Guide

### For Business Users:

**When to use each feature:**

- **Generate Report** → For presentations, stakeholder reviews, archiving
- **Download CSV** → For detailed analysis, custom charts, sharing with analysts
- **View Roadmap** → For planning sessions, prioritization meetings, resource allocation

**Best Practices:**
1. Refresh data before generating reports
2. Use CSV for deep-dive analysis
3. Use Roadmap for strategic planning
4. Save reports with dates for version control
5. Share roadmap with transformation teams

---

## Troubleshooting

### Report not downloading:
- Check browser popup blocker settings
- Ensure backend is running and accessible
- Check browser console for errors

### CSV empty or incomplete:
- Verify data is loaded (check Reports page shows areas)
- Click "Refresh Simulated Data" first
- Check browser console for errors

### Roadmap window blocked:
- Allow popups for the site
- Disable popup blocker temporarily
- Use browser's "always allow" option

### Errors in production:
- Verify backend API is deployed
- Check CORS settings
- Ensure `/api/mm/generate-report` endpoint exists
