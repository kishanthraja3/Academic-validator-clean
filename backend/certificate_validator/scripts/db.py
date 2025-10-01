# scripts/db.py - MySQL Database Interface
import os
import sys
import csv

# Add the current directory to Python path to import db_mysql
sys.path.append(os.path.dirname(__file__))

try:
    from db_mysql import load_database_index as mysql_load_index, fetch_by_roll as mysql_fetch_by_roll, get_db
    USE_MYSQL = True
except ImportError as e:
    print(f"Warning: MySQL not available, falling back to CSV: {e}")
    USE_MYSQL = False

def load_csv(path):
    """Fallback CSV loader (kept for compatibility)"""
    if not os.path.exists(path):
        raise FileNotFoundError(f"CSV not found: {path}")
    index = {}
    with open(path, newline='', encoding='utf-8') as f:
        r = csv.DictReader(f)
        for row in r:
            roll = (row.get('roll') or '').strip()
            if not roll: continue
            index[roll] = {
                "roll": roll,
                "name": (row.get('name') or '').strip(),
                "university": (row.get('university') or '').strip(),
                "degreeTitle": (row.get('degreetitle') or '').strip(),
                "yearOfPassing": str((row.get('yearofpassing') or '').strip()),
            }
    return index

def load_database_index():
    """Load certificate data from MySQL or CSV fallback"""
    if USE_MYSQL:
        try:
            return mysql_load_index()
        except Exception as e:
            print(f"MySQL error, falling back to CSV: {e}", file=sys.stderr)
            # Fallback to CSV
            csv_path = os.path.join(os.path.dirname(__file__), '..', 'data', 'certificates_legacy.csv')
            return load_csv(csv_path)
    else:
        # Direct CSV fallback
        csv_path = os.path.join(os.path.dirname(__file__), '..', 'data', 'certificates_legacy.csv')
        return load_csv(csv_path)

def fetch_by_roll(roll):
    """Fetch certificate by roll number from MySQL or CSV fallback"""
    if USE_MYSQL:
        try:
            return mysql_fetch_by_roll(roll)
        except Exception as e:
            print(f"MySQL error, falling back to CSV: {e}", file=sys.stderr)
            # Fallback to CSV
            csv_path = os.path.join(os.path.dirname(__file__), '..', 'data', 'certificates_legacy.csv')
            index = load_csv(csv_path)
            return index.get(roll)
    else:
        # Direct CSV fallback
        csv_path = os.path.join(os.path.dirname(__file__), '..', 'data', 'certificates_legacy.csv')
        index = load_csv(csv_path)
        return index.get(roll)

# Legacy function for backward compatibility
def load_csv_index(csv_path):
    """Legacy function - now uses MySQL with CSV fallback"""
    return load_database_index()
