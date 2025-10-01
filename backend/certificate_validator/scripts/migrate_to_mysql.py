#!/usr/bin/env python3
"""
Migration script to set up MySQL database and migrate CSV data
"""

import os
import sys
import argparse
from pathlib import Path

# Add the current directory to Python path
sys.path.append(os.path.dirname(__file__))

def main():
    parser = argparse.ArgumentParser(description='Migrate CSV data to MySQL database')
    parser.add_argument('--setup-only', action='store_true', 
                       help='Only create database tables, do not migrate data')
    parser.add_argument('--migrate-only', action='store_true',
                       help='Only migrate data, assume tables exist')
    parser.add_argument('--csv-path', 
                       default=os.path.join(os.path.dirname(__file__), '..', 'data', 'certificates_legacy.csv'),
                       help='Path to CSV file to migrate')
    parser.add_argument('--force', action='store_true',
                       help='Force migration even if data already exists')
    
    args = parser.parse_args()
    
    print("=== MySQL Migration Script ===")
    print()
    
    # Check if config file exists
    config_path = os.path.join(os.path.dirname(__file__), '..', 'config.env')
    if not os.path.exists(config_path):
        print("❌ Configuration file not found!")
        print(f"Please create {config_path} with your MySQL credentials.")
        print("You can copy from config.env.example and update the values.")
        print()
        print("Example config.env:")
        print("DB_HOST=localhost")
        print("DB_PORT=3306")
        print("DB_NAME=certificate_validator")
        print("DB_USER=your_username")
        print("DB_PASSWORD=your_password")
        return 1
    
    try:
        from db_mysql import MySQLDatabase, migrate_csv_to_mysql
        
        print("✅ Configuration file found")
        print("🔌 Connecting to MySQL database...")
        
        # Create database instance
        db = MySQLDatabase()
        
        if not args.migrate_only:
            print("📋 Creating database tables...")
            db.create_tables()
            print("✅ Tables created successfully")
        
        if not args.setup_only:
            # Check if CSV exists
            if not os.path.exists(args.csv_path):
                print(f"❌ CSV file not found: {args.csv_path}")
                return 1
            
            print(f"📄 Found CSV file: {args.csv_path}")
            
            # Check if data already exists
            if not args.force:
                count = db.count_certificates()
                if count > 0:
                    print(f"⚠️  Database already contains {count} certificates")
                    response = input("Do you want to continue and add/update records? (y/N): ")
                    if response.lower() != 'y':
                        print("Migration cancelled")
                        return 0
            
            print("🔄 Migrating CSV data to MySQL...")
            migrated, errors = migrate_csv_to_mysql(args.csv_path)
            
            print()
            print("=== Migration Results ===")
            print(f"✅ Successfully migrated: {migrated} records")
            if errors > 0:
                print(f"❌ Errors encountered: {errors} records")
            print()
            
            # Verify migration
            total_count = db.count_certificates()
            print(f"📊 Total certificates in database: {total_count}")
            
            # Show sample data
            if total_count > 0:
                print("\n📋 Sample data:")
                index = db.get_all_certificates()
                sample_rolls = list(index.keys())[:3]
                for roll in sample_rolls:
                    cert = index[roll]
                    print(f"  Roll: {cert['roll']}, Name: {cert['name']}, University: {cert['university']}")
        
        print()
        print("🎉 Migration completed successfully!")
        print()
        print("Next steps:")
        print("1. Test the verification scripts with: python verify_legacy.py legacy_pdfs/")
        print("2. The system will automatically use MySQL with CSV fallback")
        print("3. You can force CSV-only mode with: --use-csv-only flag")
        
        return 0
        
    except ImportError as e:
        print(f"❌ Missing dependencies: {e}")
        print("Please install required packages:")
        print("pip install mysql-connector-python python-dotenv")
        return 1
        
    except Exception as e:
        print(f"❌ Migration failed: {e}")
        print()
        print("Troubleshooting:")
        print("1. Check your MySQL server is running")
        print("2. Verify database credentials in config.env")
        print("3. Ensure the database exists")
        print("4. Check network connectivity")
        return 1
        
    finally:
        try:
            if 'db' in locals():
                db.disconnect()
        except:
            pass

if __name__ == "__main__":
    sys.exit(main())

