"""
Music21 Corpus API Backend
Provides access to music21's extensive corpus of musical works
"""

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response
from pydantic import BaseModel
from typing import Optional, List
import music21
from music21 import corpus, converter, analysis, key, roman
import io
import json

app = FastAPI(
    title="Music21 Corpus API",
    description="API para acceder al corpus de music21 y realizar análisis musical",
    version="1.0.0"
)

# CORS middleware for frontend access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─────────────────────────────────────────────────────────────
# MODELS
# ─────────────────────────────────────────────────────────────

class WorkInfo(BaseModel):
    id: str
    title: str
    composer: Optional[str] = None
    movement_name: Optional[str] = None
    file_path: str
    
class CorpusSearchResult(BaseModel):
    total: int
    works: List[WorkInfo]

class ChordInfo(BaseModel):
    offset: float
    duration: float
    pitches: List[str]
    roman_numeral: Optional[str] = None
    function: Optional[str] = None

class AnalysisResult(BaseModel):
    key: Optional[str] = None
    time_signature: Optional[str] = None
    tempo: Optional[str] = None
    measure_count: int = 0
    chords: List[ChordInfo] = []
    cadences: List[dict] = []

# ─────────────────────────────────────────────────────────────
# CORPUS ENDPOINTS
# ─────────────────────────────────────────────────────────────

@app.get("/")
async def root():
    """Health check endpoint"""
    return {"status": "ok", "service": "Music21 Corpus API"}


@app.get("/corpus/composers", response_model=List[str])
async def get_composers():
    """Get list of all composers in the corpus"""
    composers = set()
    for work in corpus.getComposer():
        composers.add(work)
    return sorted(list(composers))


@app.get("/corpus/search", response_model=CorpusSearchResult)
async def search_corpus(
    composer: Optional[str] = Query(None, description="Filter by composer name"),
    title: Optional[str] = Query(None, description="Filter by title"),
    form: Optional[str] = Query(None, description="Filter by form (fugue, sonata, etc)"),
    limit: int = Query(50, ge=1, le=200, description="Max results to return")
):
    """
    Search the music21 corpus for works matching the criteria
    """
    works = []
    
    try:
        # Get all paths in the corpus
        all_paths = corpus.getCorePaths()
        
        count = 0
        for path in all_paths:
            if count >= limit:
                break
                
            path_str = str(path).lower()
            
            # Apply filters
            if composer and composer.lower() not in path_str:
                continue
            if title and title.lower() not in path_str:
                continue
            if form and form.lower() not in path_str:
                continue
            
            # Extract info from path
            parts = str(path).split('/')
            work_id = str(path)
            
            # Try to get metadata
            try:
                md = corpus.parse(path).metadata
                work_title = md.title if md and md.title else parts[-1].replace('.xml', '').replace('.mxl', '')
                work_composer = md.composer if md and md.composer else _extract_composer_from_path(path_str)
            except:
                work_title = parts[-1].replace('.xml', '').replace('.mxl', '')
                work_composer = _extract_composer_from_path(path_str)
            
            works.append(WorkInfo(
                id=work_id,
                title=work_title,
                composer=work_composer,
                file_path=str(path)
            ))
            count += 1
        
        return CorpusSearchResult(total=len(works), works=works)
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


def _extract_composer_from_path(path: str) -> Optional[str]:
    """Extract composer name from corpus path"""
    composers = ['bach', 'beethoven', 'mozart', 'haydn', 'chopin', 'schubert', 
                 'schumann', 'brahms', 'handel', 'vivaldi', 'palestrina', 
                 'monteverdi', 'josquin', 'corelli', 'purcell', 'couperin']
    path_lower = path.lower()
    for comp in composers:
        if comp in path_lower:
            return comp.capitalize()
    return None


@app.get("/corpus/bach", response_model=CorpusSearchResult)
async def get_bach_works(
    collection: Optional[str] = Query(None, description="Collection: wtc1, wtc2, bwv, etc"),
    limit: int = Query(100, ge=1, le=500)
):
    """Get Bach works from the corpus (most extensive collection)"""
    works = []
    
    try:
        bach_paths = corpus.getComposer('bach')
        
        for i, path in enumerate(bach_paths[:limit]):
            path_str = str(path)
            
            if collection and collection.lower() not in path_str.lower():
                continue
            
            # Parse to get metadata
            try:
                score = corpus.parse(path)
                title = score.metadata.title if score.metadata and score.metadata.title else path_str.split('/')[-1]
                movement = score.metadata.movementName if score.metadata else None
            except:
                title = path_str.split('/')[-1]
                movement = None
            
            works.append(WorkInfo(
                id=path_str,
                title=title,
                composer="J.S. Bach",
                movement_name=movement,
                file_path=path_str
            ))
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
    return CorpusSearchResult(total=len(works), works=works)


@app.get("/corpus/popular")
async def get_popular_works():
    """Get commonly used works for music education"""
    popular = {
        "bach_fugues": [],
        "bach_chorales": [],
        "beethoven_sonatas": [],
        "mozart": [],
        "haydn": []
    }
    
    try:
        # Bach Fugues from WTC
        for path in corpus.getComposer('bach'):
            path_str = str(path).lower()
            if 'wtc' in path_str or 'well-tempered' in path_str:
                if 'fugue' in path_str or 'fuga' in path_str:
                    popular["bach_fugues"].append({
                        "id": str(path),
                        "title": str(path).split('/')[-1],
                        "path": str(path)
                    })
        
        # Bach Chorales
        chorales = corpus.search('bwv', 'bach')
        for i, ch in enumerate(chorales[:20]):
            popular["bach_chorales"].append({
                "id": str(ch.sourcePath),
                "title": f"Coral BWV {i+1}",
                "path": str(ch.sourcePath)
            })
        
    except Exception as e:
        print(f"Error loading popular works: {e}")
    
    return popular


# ─────────────────────────────────────────────────────────────
# MUSICXML ENDPOINTS
# ─────────────────────────────────────────────────────────────

@app.get("/corpus/work/musicxml")
async def get_work_as_musicxml(work_id: str = Query(..., description="Work ID/path from search")):
    """
    Get a work from the corpus as MusicXML
    """
    try:
        # Parse the work from corpus
        score = corpus.parse(work_id)
        
        # Convert to MusicXML
        musicxml_str = score.write('musicxml').read_text()
        
        return Response(
            content=musicxml_str,
            media_type="application/vnd.recordare.musicxml+xml",
            headers={"Content-Disposition": f"inline; filename={work_id.split('/')[-1]}.musicxml"}
        )
        
    except Exception as e:
        raise HTTPException(status_code=404, detail=f"Work not found: {str(e)}")


@app.get("/corpus/work/info")
async def get_work_info(work_id: str = Query(..., description="Work ID/path from search")):
    """Get detailed information about a work"""
    try:
        score = corpus.parse(work_id)
        
        info = {
            "title": score.metadata.title if score.metadata else None,
            "composer": score.metadata.composer if score.metadata else None,
            "movement": score.metadata.movementName if score.metadata else None,
            "parts": [p.partName for p in score.parts if p.partName],
            "measures": len(score.parts[0].getElementsByClass('Measure')) if score.parts else 0,
            "key": str(score.analyze('key')) if score else None,
            "time_signature": str(score.getTimeSignatures()[0]) if score.getTimeSignatures() else None
        }
        
        return info
        
    except Exception as e:
        raise HTTPException(status_code=404, detail=str(e))


# ─────────────────────────────────────────────────────────────
# ANALYSIS ENDPOINTS
# ─────────────────────────────────────────────────────────────

@app.get("/corpus/work/analyze", response_model=AnalysisResult)
async def analyze_work(work_id: str = Query(..., description="Work ID/path")):
    """
    Perform harmonic analysis on a work from the corpus
    """
    try:
        score = corpus.parse(work_id)
        
        # Key analysis
        analyzed_key = score.analyze('key')
        
        # Get time signature
        time_sigs = score.getTimeSignatures()
        time_sig = str(time_sigs[0]) if time_sigs else None
        
        # Measure count
        measures = score.parts[0].getElementsByClass('Measure') if score.parts else []
        
        # Chord analysis - reduce to chords and analyze
        chords_list = []
        try:
            reduction = score.chordify()
            for chord in reduction.recurse().getElementsByClass('Chord')[:50]:  # Limit for performance
                rn = roman.romanNumeralFromChord(chord, analyzed_key)
                chords_list.append(ChordInfo(
                    offset=float(chord.offset),
                    duration=float(chord.duration.quarterLength),
                    pitches=[str(p) for p in chord.pitches],
                    roman_numeral=str(rn.figure) if rn else None,
                    function=rn.functionalityScore if rn else None
                ))
        except Exception as ce:
            print(f"Chord analysis error: {ce}")
        
        return AnalysisResult(
            key=str(analyzed_key),
            time_signature=time_sig,
            measure_count=len(measures),
            chords=chords_list
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/analyze/musicxml")
async def analyze_uploaded_musicxml(content: str):
    """
    Analyze uploaded MusicXML content
    """
    try:
        score = converter.parse(content)
        
        analyzed_key = score.analyze('key')
        time_sigs = score.getTimeSignatures()
        measures = score.parts[0].getElementsByClass('Measure') if score.parts else []
        
        # Basic chord analysis
        chords_list = []
        try:
            reduction = score.chordify()
            for chord in reduction.recurse().getElementsByClass('Chord')[:30]:
                rn = roman.romanNumeralFromChord(chord, analyzed_key)
                chords_list.append({
                    "offset": float(chord.offset),
                    "pitches": [str(p) for p in chord.pitches],
                    "roman": str(rn.figure) if rn else None
                })
        except:
            pass
        
        return {
            "key": str(analyzed_key),
            "time_signature": str(time_sigs[0]) if time_sigs else None,
            "measures": len(measures),
            "chords": chords_list
        }
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


# ─────────────────────────────────────────────────────────────
# STARTUP
# ─────────────────────────────────────────────────────────────

@app.on_event("startup")
async def startup_event():
    """Pre-load corpus index on startup"""
    print("🎵 Music21 Corpus API starting...")
    print(f"📚 Corpus location: {corpus.getCorePaths()[0].parent if corpus.getCorePaths() else 'Not found'}")
    print("✅ Ready to serve musical analysis!")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
