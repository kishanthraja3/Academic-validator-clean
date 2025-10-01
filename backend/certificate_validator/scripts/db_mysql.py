# scripts/db_mysql.py
import mysql.connector
from mysql.connector import Error
import os
from dotenv import load_dotenv
import logging

# Load environment variables
load_dotenv(os.path.join(os.path.dirname(__file__), '..', 'config.env'))

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class MySQLDatabase:
    def __init__(self):
        self.connection = None
        self.cursor = None
        self.connect()
    
    def connect(self):
        """Establish connection to MySQL database"""
        try:
            self.connection = mysql.connector.connect(
                host=os.getenv('DB_HOST', 'localhost'),
                port=int(os.getenv('DB_PORT', 3306)),
                database=os.getenv('DB_NAME', 'certificate_validator'),
                user=os.getenv('DB_USER'),
                password=os.getenv('DB_PASSWORD'),
                ssl_disabled=os.getenv('DB_SSL_DISABLED', 'false').lower() == 'true',
                autocommit=True
            )
            
            if self.connection.is_connected():
                self.cursor = self.connection.cursor(dictionary=True)
                logger.info("Successfully connected to MySQL database")
            else:
                raise Error("Failed to connect to MySQL database")
                
        except Error as e:
            logger.error(f"Error connecting to MySQL: {e}")
            raise
    
    def disconnect(self):
        """Close database connection"""
        if self.cursor:
            self.cursor.close()
        if self.connection and self.connection.is_connected():
            self.connection.close()
            logger.info("MySQL connection closed")
    
    def create_tables(self):
        """Create the certificates table if it doesn't exist"""
        try:
            create_table_query = """
            CREATE TABLE IF NOT EXISTS certificates (
                id INT AUTO_INCREMENT PRIMARY KEY,
                roll VARCHAR(50) UNIQUE NOT NULL,
                name VARCHAR(255) NOT NULL,
                university VARCHAR(255) NOT NULL,
                degree_title VARCHAR(255) NOT NULL,
                year_of_passing VARCHAR(10) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                INDEX idx_roll (roll)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
            """
            
            self.cursor.execute(create_table_query)
            logger.info("Certificates table created or already exists")
            
        except Error as e:
            logger.error(f"Error creating table: {e}")
            raise
    
    def insert_certificate(self, roll, name, university, degree_title, year_of_passing):
        """Insert a new certificate record"""
        try:
            insert_query = """
            INSERT INTO certificates (roll, name, university, degree_title, year_of_passing)
            VALUES (%s, %s, %s, %s, %s)
            ON DUPLICATE KEY UPDATE
            name = VALUES(name),
            university = VALUES(university),
            degree_title = VALUES(degree_title),
            year_of_passing = VALUES(year_of_passing),
            updated_at = CURRENT_TIMESTAMP
            """
            
            self.cursor.execute(insert_query, (roll, name, university, degree_title, year_of_passing))
            logger.info(f"Certificate record inserted/updated for roll: {roll}")
            
        except Error as e:
            logger.error(f"Error inserting certificate: {e}")
            raise
    
    def fetch_by_roll(self, roll):
        """Fetch certificate data by roll number"""
        try:
            select_query = """
            SELECT roll, name, university, degree_title, year_of_passing
            FROM certificates 
            WHERE roll = %s
            """
            
            self.cursor.execute(select_query, (roll,))
            result = self.cursor.fetchone()
            
            if result:
                # Convert to the format expected by the verification scripts
                return {
                    "roll": result['roll'],
                    "name": result['name'],
                    "university": result['university'],
                    "degreeTitle": result['degree_title'],
                    "yearOfPassing": str(result['year_of_passing'])
                }
            return None
            
        except Error as e:
            logger.error(f"Error fetching certificate by roll: {e}")
            raise
    
    def get_all_certificates(self):
        """Get all certificates as a dictionary indexed by roll number"""
        try:
            select_query = """
            SELECT roll, name, university, degree_title, year_of_passing
            FROM certificates
            ORDER BY roll
            """
            
            self.cursor.execute(select_query)
            results = self.cursor.fetchall()
            
            index = {}
            for row in results:
                roll = row['roll']
                index[roll] = {
                    "roll": roll,
                    "name": row['name'],
                    "university": row['university'],
                    "degreeTitle": row['degree_title'],
                    "yearOfPassing": str(row['year_of_passing'])
                }
            
            return index
            
        except Error as e:
            logger.error(f"Error fetching all certificates: {e}")
            raise
    
    def count_certificates(self):
        """Get total count of certificates"""
        try:
            self.cursor.execute("SELECT COUNT(*) as count FROM certificates")
            result = self.cursor.fetchone()
            return result['count'] if result else 0
            
        except Error as e:
            logger.error(f"Error counting certificates: {e}")
            raise

# Global database instance
db_instance = None

def get_db():
    """Get or create database instance"""
    global db_instance
    if db_instance is None:
        db_instance = MySQLDatabase()
    return db_instance

def load_database_index():
    """Load all certificates into memory (replaces load_csv_index)"""
    db = get_db()
    return db.get_all_certificates()

def fetch_by_roll(roll):
    """Fetch certificate by roll number (replaces CSV fetch_by_roll)"""
    db = get_db()
    return db.fetch_by_roll(roll)

def migrate_csv_to_mysql(csv_path):
    """Migrate data from CSV to MySQL"""
    import csv
    
    db = get_db()
    db.create_tables()
    
    migrated_count = 0
    error_count = 0
    
    try:
        with open(csv_path, newline='', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            for row in reader:
                try:
                    roll = (row.get('roll') or '').strip()
                    if not roll:
                        continue
                    
                    name = (row.get('name') or '').strip()
                    university = (row.get('university') or '').strip()
                    degree_title = (row.get('degreetitle') or '').strip()
                    year_of_passing = str((row.get('yearofpassing') or '').strip())
                    
                    db.insert_certificate(roll, name, university, degree_title, year_of_passing)
                    migrated_count += 1
                    
                except Exception as e:
                    logger.error(f"Error migrating row {row}: {e}")
                    error_count += 1
        
        logger.info(f"Migration completed: {migrated_count} records migrated, {error_count} errors")
        return migrated_count, error_count
        
    except Exception as e:
        logger.error(f"Error during CSV migration: {e}")
        raise

if __name__ == "__main__":
    # Test the database connection and migration
    try:
        db = get_db()
        db.create_tables()
        
        # Test migration if CSV exists
        csv_path = os.path.join(os.path.dirname(__file__), '..', 'data', 'certificates_legacy.csv')
        if os.path.exists(csv_path):
            print("Migrating CSV data to MySQL...")
            migrated, errors = migrate_csv_to_mysql(csv_path)
            print(f"Migration complete: {migrated} records migrated, {errors} errors")
        
        # Test fetching
        index = load_database_index()
        print(f"Loaded {len(index)} certificates from database")
        
        if index:
            # Test with first roll number
            first_roll = list(index.keys())[0]
            result = fetch_by_roll(first_roll)
            print(f"Test fetch for roll {first_roll}: {result}")
        
    except Exception as e:
        print(f"Error: {e}")
    finally:
        if db_instance:
            db_instance.disconnect()

