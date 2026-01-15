from contextlib import closing
from pathlib import Path
import sqlite3
from typing import Dict, List, Optional
from datetime import datetime
import random
import os

from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy.orm import Session

from database import get_db, Area, Dimension, MaturityLevel, RatingScale, Assessment, DimensionAssessment, ChecksheetSelection
from database import init_db as init_sqlalchemy_db

app = FastAPI(title="Mahindra and Mahindra WP1 Simulation Engine")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize database on startup (only for local development)
# For serverless (Vercel), initialization happens in api/index.py
if not os.environ.get('VERCEL'):
    @app.on_event("startup")
    async def startup_event():
        init_sqlalchemy_db()

# Root endpoint - API status
@app.get("/")
async def root():
    return {
        "status": "online",
        "service": "Mahindra and Mahindra Digital Maturity API",
        "version": "1.0.0",
        "docs": "/docs",
        "endpoints": {
            "areas": "/api/mm/areas",
            "maturity_levels": "/api/mm/maturity-levels",
            "rating_scales": "/api/mm/rating-scales",
            "assessments": "/api/mm/assessments"
        }
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.utcnow().isoformat()}

# Old SQLite DB_PATH - only used for legacy functions if needed
# In Vercel serverless, use /tmp directory
if os.environ.get('VERCEL'):
    DB_PATH = Path("/tmp/app.db")
else:
    DB_PATH = Path(__file__).with_name("app.db")


class AppMetrics(BaseModel):
    dc: int
    tf: int
    dr: int
    der: int
    er: int
    gross: float


def calculate_confidence(metrics: AppMetrics):
    avg_score = metrics.dc + metrics.tf + metrics.dr + metrics.der + metrics.er
    conf_pct = (avg_score / 25) * 100

    if conf_pct >= 75:
        band = "High (Committable)"
    elif conf_pct >= 50:
        band = "Medium (Conditional)"
    else:
        band = "Low (Aspirational)"

    weighted = (conf_pct / 100) * metrics.gross
    return round(conf_pct, 1), band, round(weighted, 2)


def get_connection() -> sqlite3.Connection:
    """Legacy SQLite connection - prefer using SQLAlchemy database"""
    if os.environ.get('VERCEL'):
        # In Vercel, /tmp is the only writable directory
        db_path = Path("/tmp/app.db")
    else:
        db_path = DB_PATH
        db_path.parent.mkdir(parents=True, exist_ok=True)
    
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    return conn


def init_old_sqlite_db() -> None:
    """Legacy init function - NOT USED in current version"""
    # This function is kept for backward compatibility but not called
    # SQLAlchemy database.py handles all database initialization now
    pass
    schema = """
    CREATE TABLE IF NOT EXISTS segments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE
    );

    CREATE TABLE IF NOT EXISTS apps (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        segment_id INTEGER NOT NULL,
        gross REAL NOT NULL,
        dc INTEGER NOT NULL,
        tf INTEGER NOT NULL,
        dr INTEGER NOT NULL,
        der INTEGER NOT NULL,
        er INTEGER NOT NULL,
        strategy TEXT NOT NULL,
        FOREIGN KEY(segment_id) REFERENCES segments(id)
    );

    CREATE TABLE IF NOT EXISTS app_findings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        app_id TEXT NOT NULL,
        detail TEXT NOT NULL,
        FOREIGN KEY(app_id) REFERENCES apps(id)
    );

    CREATE TABLE IF NOT EXISTS governance_raci (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        task TEXT NOT NULL,
        ddo TEXT NOT NULL,
        it TEXT NOT NULL,
        board TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS governance_gates (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        gate TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS change_plan (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        week TEXT NOT NULL,
        title TEXT NOT NULL,
        desc TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS stakeholders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        impact TEXT NOT NULL,
        focus TEXT NOT NULL,
        strategy TEXT NOT NULL
    );
    """

    with closing(get_connection()) as conn:
        cur = conn.cursor()
        cur.executescript(schema)

        segments = [
            "Finance & GBS",
            "Supply Chain & Logistics",
            "R&D & Innovation",
            "Operations & Manufacturing",
        ]
        cur.executemany("INSERT OR IGNORE INTO segments(name) VALUES (?)", [(s,) for s in segments])

        app_seed = [
            {
                "id": "A-101",
                "name": "Legacy Finance Reporting Tool",
                "segment": "Finance & GBS",
                "gross": 1.10,
                "dc": 5,
                "tf": 5,
                "dr": 4,
                "der": 5,
                "er": 4,
                "strategy": "Elimination First",
                "findings": [
                    "Redundant with Target Architecture 2030",
                    "High manual data reconciliation",
                    "License expires Q3 2026",
                ],
            },
            {
                "id": "A-699",
                "name": "Shadow IT Collaboration Tool",
                "segment": "Finance & GBS",
                "gross": 0.38,
                "dc": 5,
                "tf": 5,
                "dr": 5,
                "der": 4,
                "er": 5,
                "strategy": "Elimination",
                "findings": [
                    "Duplicate of standard MS Teams",
                    "Security non-compliant",
                    "High data leakage risk",
                ],
            },
            {
                "id": "A-214",
                "name": "Custom Procurement Workflow",
                "segment": "Supply Chain & Logistics",
                "gross": 0.95,
                "dc": 4,
                "tf": 4,
                "dr": 3,
                "der": 4,
                "er": 3,
                "strategy": "Migration",
                "findings": [
                    "Move to BASF SAP Core",
                    "Technical debt > 40%",
                    "Process standardization required",
                ],
            },
            {
                "id": "A-387",
                "name": "R&D Lab Data Tracker",
                "segment": "R&D & Innovation",
                "gross": 0.85,
                "dc": 3,
                "tf": 3,
                "dr": 2,
                "der": 3,
                "er": 2,
                "strategy": "Retain & Modernize",
                "findings": [
                    "Niche functionality not in global ERP",
                    "Low integration readiness",
                    "User adoption key challenge",
                ],
            },
            {
                "id": "A-512",
                "name": "Plant Maintenance Desktop App",
                "segment": "Operations & Manufacturing",
                "gross": 1.20,
                "dc": 4,
                "tf": 2,
                "dr": 2,
                "der": 3,
                "er": 2,
                "strategy": "Re-platform",
                "findings": [
                    "Legacy OS dependency (Win7)",
                    "Critical for shift handover",
                    "High latency issues",
                ],
            },
        ]

        for app_row in app_seed:
            segment_id = cur.execute(
                "SELECT id FROM segments WHERE name = ?", (app_row["segment"],)
            ).fetchone()[0]

            cur.execute(
                """
                INSERT OR REPLACE INTO apps (id, name, segment_id, gross, dc, tf, dr, der, er, strategy)
                VALUES (:id, :name, :segment_id, :gross, :dc, :tf, :dr, :der, :er, :strategy)
                """,
                {
                    **app_row,
                    "segment_id": segment_id,
                },
            )

            cur.execute("DELETE FROM app_findings WHERE app_id = ?", (app_row["id"],))
            cur.executemany(
                "INSERT INTO app_findings (app_id, detail) VALUES (?, ?)",
                [(app_row["id"], finding) for finding in app_row["findings"]],
            )

        if cur.execute("SELECT COUNT(1) FROM governance_raci").fetchone()[0] == 0:
            cur.executemany(
                "INSERT INTO governance_raci (task, ddo, it, board) VALUES (?, ?, ?, ?)",
                [
                    ("Scope Decision", "X", "Y", "Y"),
                    ("Savings Approval", "X", "Y", "X"),
                    ("Data Quality Sign-off", "Y", "X", "Y"),
                    ("Phase-Gate Readiness", "Y", "Y", "X"),
                ],
            )

        if cur.execute("SELECT COUNT(1) FROM governance_gates").fetchone()[0] == 0:
            cur.executemany(
                "INSERT INTO governance_gates (gate) VALUES (?)",
                [
                    ("Minimum data completeness threshold met",),
                    ("Cost allocation logic agreed",),
                    ("Stakeholder alignment workshops completed",),
                    ("Target Architecture 2030 alignment baseline established",),
                ],
            )

        if cur.execute("SELECT COUNT(1) FROM change_plan").fetchone()[0] == 0:
            cur.executemany(
                "INSERT INTO change_plan (week, title, desc) VALUES (?, ?, ?)",
                [
                    ("W1", "Mobilization", "Kickoff & Success Criteria"),
                    ("W2", "Standards", "Arch Alignment & Guardrails"),
                    ("W3", "Readiness", "Segment Onboarding"),
                    ("W4", "Go-Live", "Sprint 0 & Dashboard Validation"),
                ],
            )

        if cur.execute("SELECT COUNT(1) FROM stakeholders").fetchone()[0] == 0:
            cur.executemany(
                "INSERT INTO stakeholders (name, impact, focus, strategy) VALUES (?, ?, ?, ?)",
                [
                    (
                        "Board of Directors",
                        "High",
                        "Strategic Oversight",
                        "Executive readouts & portfolio steering",
                    ),
                    (
                        "DDO & Architecture",
                        "Critical",
                        "Future Readiness",
                        "Architecture alignment workshops",
                    ),
                    (
                        "Information Managers",
                        "Critical",
                        "Data Integrity",
                        "Process stewardship & validation",
                    ),
                ],
            )

        conn.commit()


# Legacy startup event removed - database initialization now handled by SQLAlchemy
# in database.py and api/index.py for serverless


@app.get("/api/v1/portfolio")
async def get_portfolio_simulation():
    with closing(get_connection()) as conn:
        cur = conn.cursor()

        segments = cur.execute("SELECT id, name FROM segments ORDER BY id").fetchall()
        portfolio: List[Dict] = []

        for seg in segments:
            apps_for_segment = cur.execute(
                "SELECT * FROM apps WHERE segment_id = ? ORDER BY id", (seg["id"],)
            ).fetchall()

            app_payload = []
            for app_row in apps_for_segment:
                findings = [
                    row["detail"]
                    for row in cur.execute(
                        "SELECT detail FROM app_findings WHERE app_id = ? ORDER BY id",
                        (app_row["id"],),
                    ).fetchall()
                ]

                confidence, band, weighted = calculate_confidence(
                    AppMetrics(
                        dc=app_row["dc"],
                        tf=app_row["tf"],
                        dr=app_row["dr"],
                        der=app_row["der"],
                        er=app_row["er"],
                        gross=app_row["gross"],
                    )
                )

                app_payload.append(
                    {
                        "id": app_row["id"],
                        "name": app_row["name"],
                        "gross": app_row["gross"],
                        "dc": app_row["dc"],
                        "tf": app_row["tf"],
                        "dr": app_row["dr"],
                        "der": app_row["der"],
                        "er": app_row["er"],
                        "strategy": app_row["strategy"],
                        "findings": findings,
                        "confidence": confidence,
                        "band": band,
                        "weighted": weighted,
                    }
                )

            portfolio.append(
                {
                    "segment": seg["name"],
                    "apps": app_payload,
                    "total_weighted": round(sum(app["weighted"] for app in app_payload), 2),
                }
            )

        governance = {
            "raci": [
                {
                    "task": row["task"],
                    "ddo": row["ddo"],
                    "it": row["it"],
                    "board": row["board"],
                }
                for row in cur.execute("SELECT task, ddo, it, board FROM governance_raci ORDER BY id")
            ],
            "gates": [row["gate"] for row in cur.execute("SELECT gate FROM governance_gates ORDER BY id")],
        }

        change_management = {
            "comms_plan": [
                {
                    "week": row["week"],
                    "title": row["title"],
                    "desc": row["desc"],
                }
                for row in cur.execute("SELECT week, title, desc FROM change_plan ORDER BY id")
            ],
            "stakeholders": [
                {
                    "name": row["name"],
                    "impact": row["impact"],
                    "focus": row["focus"],
                    "strategy": row["strategy"],
                }
                for row in cur.execute(
                    "SELECT name, impact, focus, strategy FROM stakeholders ORDER BY id"
                )
            ],
        }

        return {"portfolio": portfolio, "governance": governance, "change_management": change_management}


# ==================== M&M Digital Maturity APIs ====================

# Pydantic models
class DimensionResponse(BaseModel):
    id: int
    name: str
    current_level: int
    desired_level: int
    updated_at: datetime
    
    class Config:
        orm_mode = True

class AreaResponse(BaseModel):
    id: int
    name: str
    description: Optional[str]
    desired_level: Optional[int]
    dimensions: List[DimensionResponse]
    
    class Config:
        orm_mode = True

class MaturityLevelResponse(BaseModel):
    id: int
    level: int
    name: str
    sub_level: Optional[str]
    category: Optional[str]
    description: str
    
    class Config:
        orm_mode = True

class RatingScaleResponse(BaseModel):
    id: int
    dimension_name: str
    level: int
    rating_name: str
    digital_maturity_description: str
    business_relevance: Optional[str] = None
    
    class Config:
        orm_mode = True

class DimensionUpdate(BaseModel):
    current_level: int
    desired_level: Optional[int]

class AssessmentCreate(BaseModel):
    plant_name: Optional[str] = None
    assessor_name: Optional[str] = None
    notes: Optional[str] = None

class AssessmentResponse(BaseModel):
    id: int
    plant_name: Optional[str] = None
    assessment_date: datetime
    assessor_name: Optional[str] = None
    notes: Optional[str] = None
    
    class Config:
        orm_mode = True

class ChecksheetSelectionCreate(BaseModel):
    assessment_id: Optional[int] = None
    maturity_level_id: int
    is_selected: bool
    evidence: Optional[str] = None

class ChecksheetSelectionResponse(BaseModel):
    id: int
    assessment_id: Optional[int] = None
    maturity_level_id: int
    is_selected: bool
    evidence: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    
    class Config:
        orm_mode = True

# API Endpoints
@app.get("/api/mm/areas", response_model=List[AreaResponse])
def get_areas(db: Session = Depends(get_db)):
    """Get all manufacturing areas with their dimensions"""
    areas = db.query(Area).all()
    return areas

@app.post("/api/mm/refresh-reports-data")
def refresh_reports_data(db: Session = Depends(get_db)):
    """Refresh Reports data (Areas and Dimensions) from Excel file"""
    try:
        import os
        import pandas as pd
        import random
        
        # Build path to Excel file
        backend_dir = os.path.dirname(os.path.abspath(__file__))
        project_root = os.path.dirname(backend_dir)
        excel_path = os.path.join(project_root, 'frontend', 'src', 'components', 'M_M_Data', 'MM_Data.xlsx')
        
        if not os.path.exists(excel_path):
            raise HTTPException(status_code=404, detail=f"Excel file not found at {excel_path}")
        
        # Clear existing areas and dimensions
        db.query(Dimension).delete()
        db.query(Area).delete()
        db.commit()
        
        # Read the Reports sheet
        df = pd.read_excel(excel_path, sheet_name='Reports', header=None)
        
        current_area = None
        area_obj = None
        dimension_count = 0
        area_count = 0
        
        # Parse the data
        for idx, row in df.iterrows():
            if idx < 3:  # Skip header rows
                continue
            
            area_name = str(row[0]) if pd.notna(row[0]) else ""
            col1_value = str(row[1]) if pd.notna(row[1]) else ""
            col8_value = row[8] if pd.notna(row[8]) else None
            
            # Check if this is an area header (has area name in column 0)
            if area_name and area_name != "nan":
                current_area = area_name
                
                # Get desired level from the first row of the area
                if col8_value and str(col8_value) != "nan":
                    try:
                        desired_level = int(float(col8_value))
                    except:
                        desired_level = 3
                else:
                    desired_level = 3
                
                # Create Area
                area_obj = Area(
                    name=current_area,
                    description=f"{current_area} Digital Maturity Assessment",
                    desired_level=desired_level
                )
                db.add(area_obj)
                db.flush()
                area_count += 1
                
                # Also add the first dimension from this row
                if col1_value and col1_value != "nan" and col1_value != "Dimension":
                    dimension_name = col1_value
                    current_level = random.randint(max(1, desired_level - 2), min(desired_level + 1, 5))
                    
                    dimension = Dimension(
                        name=dimension_name,
                        area_id=area_obj.id,
                        current_level=current_level,
                        desired_level=desired_level
                    )
                    db.add(dimension)
                    dimension_count += 1
                continue
            
            # Check if this is a dimension row
            dimension_name = str(row[1]) if pd.notna(row[1]) else ""
            
            if area_obj and dimension_name and dimension_name != "nan" and dimension_name != "Dimension":
                # Assign current level (simulated with randomization)
                current_level = random.randint(max(1, area_obj.desired_level - 2), min(area_obj.desired_level + 1, 5))
                
                dimension = Dimension(
                    name=dimension_name,
                    area_id=area_obj.id,
                    current_level=current_level,
                    desired_level=area_obj.desired_level
                )
                db.add(dimension)
                dimension_count += 1
        
        db.commit()
        return {
            "status": "success",
            "message": f"Successfully loaded {area_count} areas with {dimension_count} dimensions",
            "area_count": area_count,
            "dimension_count": dimension_count
        }
        
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error refreshing reports data: {str(e)}")

@app.get("/api/mm/areas/{area_id}", response_model=AreaResponse)
def get_area(area_id: int, db: Session = Depends(get_db)):
    """Get specific area with dimensions"""
    area = db.query(Area).filter(Area.id == area_id).first()
    if not area:
        raise HTTPException(status_code=404, detail="Area not found")
    return area

@app.put("/api/mm/dimensions/{dimension_id}")
def update_dimension(dimension_id: int, update: DimensionUpdate, db: Session = Depends(get_db)):
    """Update dimension current/desired level"""
    dimension = db.query(Dimension).filter(Dimension.id == dimension_id).first()
    if not dimension:
        raise HTTPException(status_code=404, detail="Dimension not found")
    
    dimension.current_level = update.current_level
    if update.desired_level is not None:
        dimension.desired_level = update.desired_level
    dimension.updated_at = datetime.utcnow()
    
    db.commit()
    db.refresh(dimension)
    return {"status": "success", "dimension": dimension}

@app.get("/api/mm/maturity-levels", response_model=List[MaturityLevelResponse])
def get_maturity_levels(db: Session = Depends(get_db)):
    """Get all maturity level definitions"""
    levels = db.query(MaturityLevel).order_by(MaturityLevel.level, MaturityLevel.sub_level).all()
    return levels

@app.post("/api/mm/assessments", response_model=AssessmentResponse)
def create_assessment(assessment: AssessmentCreate, db: Session = Depends(get_db)):
    """Create a new assessment session"""
    # For now, create a simple assessment linked to first area (we can enhance this later)
    first_area = db.query(Area).first()
    if not first_area:
        raise HTTPException(status_code=404, detail="No areas found. Please load data first.")
    
    new_assessment = Assessment(
        area_id=first_area.id,
        plant_name=assessment.plant_name,
        assessor_name=assessment.assessor_name,
        notes=assessment.notes,
        assessment_date=datetime.utcnow()
    )
    db.add(new_assessment)
    db.commit()
    db.refresh(new_assessment)
    return new_assessment

@app.get("/api/mm/assessments/{assessment_id}", response_model=AssessmentResponse)
def get_assessment(assessment_id: int, db: Session = Depends(get_db)):
    """Get assessment by ID"""
    assessment = db.query(Assessment).filter(Assessment.id == assessment_id).first()
    if not assessment:
        raise HTTPException(status_code=404, detail="Assessment not found")
    return assessment

@app.post("/api/mm/checksheet-selections")
def save_checksheet_selections(selections: List[ChecksheetSelectionCreate], db: Session = Depends(get_db)):
    """Save multiple checksheet selections"""
    try:
        saved_count = 0
        for selection_data in selections:
            # Check if selection already exists
            existing = db.query(ChecksheetSelection).filter(
                ChecksheetSelection.assessment_id == selection_data.assessment_id,
                ChecksheetSelection.maturity_level_id == selection_data.maturity_level_id
            ).first()
            
            if existing:
                # Update existing selection
                existing.is_selected = selection_data.is_selected
                existing.evidence = selection_data.evidence
                existing.updated_at = datetime.utcnow()
            else:
                # Create new selection
                new_selection = ChecksheetSelection(
                    assessment_id=selection_data.assessment_id,
                    maturity_level_id=selection_data.maturity_level_id,
                    is_selected=selection_data.is_selected,
                    evidence=selection_data.evidence
                )
                db.add(new_selection)
            saved_count += 1
        
        db.commit()
        return {
            "status": "success",
            "message": f"Saved {saved_count} selections",
            "count": saved_count
        }
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error saving selections: {str(e)}")

@app.get("/api/mm/checksheet-selections/{assessment_id}", response_model=List[ChecksheetSelectionResponse])
def get_checksheet_selections(assessment_id: int, db: Session = Depends(get_db)):
    """Get all checksheet selections for an assessment"""
    selections = db.query(ChecksheetSelection).filter(
        ChecksheetSelection.assessment_id == assessment_id
    ).all()
    return selections

@app.get("/api/mm/checksheet-selections")
def get_all_checksheet_selections(db: Session = Depends(get_db)):
    """Get all checksheet selections (for demo/testing)"""
    selections = db.query(ChecksheetSelection).all()
    return selections
    
    new_assessment = Assessment(
        area_id=first_area.id,
        plant_name=assessment.plant_name,
        assessor_name=assessment.assessor_name,
        notes=assessment.notes,
        assessment_date=datetime.utcnow()
    )
    db.add(new_assessment)
    db.commit()
    db.refresh(new_assessment)
    return new_assessment

@app.get("/api/mm/assessments/{assessment_id}", response_model=AssessmentResponse)
def get_assessment(assessment_id: int, db: Session = Depends(get_db)):
    """Get assessment by ID"""
    assessment = db.query(Assessment).filter(Assessment.id == assessment_id).first()
    if not assessment:
        raise HTTPException(status_code=404, detail="Assessment not found")
    return assessment

@app.post("/api/mm/checksheet-selections")
def save_checksheet_selections(selections: List[ChecksheetSelectionCreate], db: Session = Depends(get_db)):
    """Save multiple checksheet selections"""
    try:
        saved_count = 0
        for selection_data in selections:
            # Check if selection already exists
            existing = db.query(ChecksheetSelection).filter(
                ChecksheetSelection.assessment_id == selection_data.assessment_id,
                ChecksheetSelection.maturity_level_id == selection_data.maturity_level_id
            ).first()
            
            if existing:
                # Update existing selection
                existing.is_selected = selection_data.is_selected
                existing.evidence = selection_data.evidence
                existing.updated_at = datetime.utcnow()
            else:
                # Create new selection
                new_selection = ChecksheetSelection(
                    assessment_id=selection_data.assessment_id,
                    maturity_level_id=selection_data.maturity_level_id,
                    is_selected=selection_data.is_selected,
                    evidence=selection_data.evidence
                )
                db.add(new_selection)
            saved_count += 1
        
        db.commit()
        return {
            "status": "success",
            "message": f"Saved {saved_count} selections",
            "count": saved_count
        }
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error saving selections: {str(e)}")

@app.get("/api/mm/checksheet-selections/{assessment_id}", response_model=List[ChecksheetSelectionResponse])
def get_checksheet_selections(assessment_id: int, db: Session = Depends(get_db)):
    """Get all checksheet selections for an assessment"""
    selections = db.query(ChecksheetSelection).filter(
        ChecksheetSelection.assessment_id == assessment_id
    ).all()
    return selections

@app.get("/api/mm/checksheet-selections")
def get_all_checksheet_selections(db: Session = Depends(get_db)):
    """Get all checksheet selections (for demo/testing)"""
    selections = db.query(ChecksheetSelection).all()
    return selections

@app.post("/api/mm/calculate-dimension-scores")
def calculate_dimension_scores(assessment_id: int, db: Session = Depends(get_db)):
    """Calculate dimension scores based on checksheet selections"""
    try:
        # Get all selected capabilities for this assessment
        selections = db.query(ChecksheetSelection).filter(
            ChecksheetSelection.assessment_id == assessment_id,
            ChecksheetSelection.is_selected == True
        ).all()
        
        if not selections:
            return {
                "status": "info",
                "message": "No capabilities selected yet",
                "dimension_updates": []
            }
        
        # Get all maturity levels to understand the mapping
        maturity_levels = {sel.maturity_level_id: db.query(MaturityLevel).get(sel.maturity_level_id) for sel in selections}
        
        # Calculate score for each dimension based on selected capabilities
        # This is a simplified algorithm - can be enhanced based on business rules
        dimension_scores = {}
        
        for selection in selections:
            ml = maturity_levels.get(selection.maturity_level_id)
            if not ml:
                continue
            
            # Map capability categories to dimensions
            # We'll use the category field or derive from description
            level = ml.level
            
            # For simplicity, we'll update all dimensions based on highest selected level
            # In reality, you'd want more sophisticated mapping
            if 'level_score' not in dimension_scores:
                dimension_scores['level_score'] = level
            else:
                dimension_scores['level_score'] = max(dimension_scores['level_score'], level)
        
        # Update all dimensions with the calculated score
        calculated_level = dimension_scores.get('level_score', 1)
        dimensions = db.query(Dimension).all()
        updated_count = 0
        
        for dimension in dimensions:
            # Only update if calculated level is different
            if dimension.current_level != calculated_level:
                dimension.current_level = calculated_level
                dimension.updated_at = datetime.utcnow()
                updated_count += 1
        
        db.commit()
        
        return {
            "status": "success",
            "message": f"Calculated dimension scores based on {len(selections)} selected capabilities",
            "selected_count": len(selections),
            "calculated_level": calculated_level,
            "dimensions_updated": updated_count
        }
        
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error calculating scores: {str(e)}")

@app.post("/api/mm/refresh-simulated-data")
def refresh_simulated_data(db: Session = Depends(get_db)):
    """Refresh all simulated data from Excel file"""
    try:
        import os
        import pandas as pd
        
        # Build path to Excel file
        backend_dir = os.path.dirname(os.path.abspath(__file__))
        project_root = os.path.dirname(backend_dir)
        excel_path = os.path.join(project_root, 'frontend', 'src', 'components', 'M_M_Data', 'MM_Data.xlsx')
        
        if not os.path.exists(excel_path):
            raise HTTPException(status_code=404, detail=f"Excel file not found at {excel_path}")
        
        # Clear existing maturity levels
        db.query(MaturityLevel).delete()
        db.commit()
        
        # Read the Excel sheet
        df = pd.read_excel(excel_path, sheet_name='Smart Factory CheckSheet', header=None)
        
        current_level = None
        current_level_name = None
        loaded_count = 0
        
        for idx, row in df.iterrows():
            if idx < 3:  # Skip header rows
                continue
            
            # Check if this is a level header
            first_col = str(row[1]) if pd.notna(row[1]) else ""
            
            if "Level" in first_col and ":" in first_col:
                parts = first_col.split(":")
                level_part = parts[0].strip()
                level_num = int(level_part.replace("Level", "").strip())
                level_name = parts[1].strip() if len(parts) > 1 else f"Level {level_num}"
                
                current_level = level_num
                current_level_name = level_name
                continue
            
            # Check for capability description
            sub_level_col = str(row[0]) if pd.notna(row[0]) else ""
            description_col = str(row[1]) if pd.notna(row[1]) else ""
            
            if description_col == "SUV" or description_col == "nan" or not description_col:
                continue
            
            if sub_level_col and sub_level_col != "nan":
                sub_level = sub_level_col
                description = description_col
                
                # Determine category from dimension columns
                category = None
                dimension_map = {
                    2: "Asset connectivity & OEE",
                    3: "MES & system integration",
                    4: "Traceability & quality",
                    5: "Maintenance & reliability",
                    6: "Logistics & supply chain",
                    7: "Workforce & UX",
                    8: "Sustainability & energy",
                    9: "Multi-plant orchestration"
                }
                
                for col_idx in range(2, 11):
                    if pd.notna(row[col_idx]) and str(row[col_idx]).strip():
                        category = dimension_map.get(col_idx, "General")
                        break
                
                if current_level and description:
                    maturity_level = MaturityLevel(
                        level=current_level,
                        name=current_level_name or f"Level {current_level}",
                        sub_level=sub_level,
                        category=category,
                        description=description.strip()
                    )
                    db.add(maturity_level)
                    loaded_count += 1
        
        db.commit()
        return {
            "status": "success",
            "message": f"Successfully loaded {loaded_count} maturity level items",
            "count": loaded_count
        }
        
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error refreshing data: {str(e)}")

@app.get("/api/mm/rating-scales", response_model=List[RatingScaleResponse])
def get_rating_scales(db: Session = Depends(get_db)):
    """Get all rating scale definitions"""
    print("DEBUG: Fetching rating scales...")  # DEBUG
    scales = db.query(RatingScale).order_by(RatingScale.dimension_name, RatingScale.level).all()
    print(f"DEBUG: Found {len(scales)} scales")  # DEBUG
    return scales

@app.get("/api/mm/rating-scales/{dimension_name}")
def get_rating_scale_by_dimension(dimension_name: str, db: Session = Depends(get_db)):
    """Get rating scales for a specific dimension"""
    scales = db.query(RatingScale).filter(RatingScale.dimension_name == dimension_name).order_by(RatingScale.level).all()
    if not scales:
        raise HTTPException(status_code=404, detail="Rating scales not found for this dimension")
    return scales

@app.post("/api/mm/simulate-update/{dimension_id}")
def simulate_dimension_update(dimension_id: int, db: Session = Depends(get_db)):
    """Simulate a random level change for streaming data demo"""
    dimension = db.query(Dimension).filter(Dimension.id == dimension_id).first()
    if not dimension:
        raise HTTPException(status_code=404, detail="Dimension not found")
    
    # Simulate improvement or regression
    change = random.choice([-1, 0, 1])
    new_level = max(1, min(5, dimension.current_level + change))
    
    dimension.current_level = new_level
    dimension.updated_at = datetime.utcnow()
    
    db.commit()
    db.refresh(dimension)
    
    return {
        "status": "updated",
        "dimension_id": dimension_id,
        "old_level": dimension.current_level - change,
        "new_level": new_level,
        "timestamp": dimension.updated_at
    }

@app.get("/api/mm/reports/summary")
def get_reports_summary(db: Session = Depends(get_db)):
    """Get summary statistics for all areas"""
    areas = db.query(Area).all()
    summary = []
    
    for area in areas:
        dimensions = area.dimensions
        if dimensions:
            avg_current = sum(d.current_level for d in dimensions) / len(dimensions)
            on_track = sum(1 for d in dimensions if d.current_level >= d.desired_level - 1)
            completed = sum(1 for d in dimensions if d.current_level >= d.desired_level)
        else:
            avg_current = 0
            on_track = 0
            completed = 0
        
        summary.append({
            "area_id": area.id,
            "area_name": area.name,
            "desired_level": area.desired_level,
            "avg_current_level": round(avg_current, 1),
            "total_dimensions": len(dimensions),
            "on_track_count": on_track,
            "completed_count": completed,
            "needs_attention": len(dimensions) - on_track
        })
    
    return summary
