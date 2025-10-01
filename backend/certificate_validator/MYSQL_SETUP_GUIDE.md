# MySQL Database Setup Guide

This guide will help you migrate from CSV to MySQL for your certificate validation system.

## Prerequisites

1. **MySQL Server**: Install MySQL Server 8.0 or later
2. **Python Dependencies**: Install required packages
3. **Database Access**: Create a MySQL user with appropriate permissions

## Step 1: Install MySQL Server

### Windows
1. Download MySQL Installer from https://dev.mysql.com/downloads/installer/
2. Run the installer and follow the setup wizard
3. Remember the root password you set during installation

### Linux (Ubuntu/Debian)
```bash
sudo apt update
sudo apt install mysql-server
sudo mysql_secure_installation
```

### macOS
```bash
brew install mysql
brew services start mysql
```

## Step 2: Create Database and User

Connect to MySQL as root:
```bash
mysql -u root -p
```

Create database and user:
```sql
CREATE DATABASE certificate_validator CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'cert_user'@'localhost' IDENTIFIED BY 'your_secure_password';
GRANT ALL PRIVILEGES ON certificate_validator.* TO 'cert_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

## Step 3: Install Python Dependencies

```bash
cd certificate_validator
pip install -r reruirements.txt
```

## Step 4: Configure Database Connection

1. Copy the example configuration:
```bash
cp config.env.example config.env
```

2. Edit `config.env` with your database credentials:
```env
DB_HOST=localhost
DB_PORT=3306
DB_NAME=certificate_validator
DB_USER=cert_user
DB_PASSWORD=your_secure_password
DB_SSL_DISABLED=true
```

## Step 5: Run Migration

### Option A: Full Migration (Recommended)
```bash
python scripts/migrate_to_mysql.py
```

### Option B: Setup Tables Only
```bash
python scripts/migrate_to_mysql.py --setup-only
```

### Option C: Migrate Data Only (if tables already exist)
```bash
python scripts/migrate_to_mysql.py --migrate-only
```

## Step 6: Test the Migration

Test the legacy verification with MySQL:
```bash
python scripts/verify_legacy.py legacy_pdfs/
```

Test with CSV fallback (if needed):
```bash
python scripts/verify_legacy.py legacy_pdfs/ --use-csv-only
```

## Step 7: Verify Database Content

Connect to MySQL and check your data:
```sql
mysql -u cert_user -p certificate_validator
SELECT COUNT(*) FROM certificates;
SELECT * FROM certificates LIMIT 5;
```

## Troubleshooting

### Connection Issues
- Verify MySQL server is running: `systemctl status mysql` (Linux) or check Services (Windows)
- Test connection: `mysql -u cert_user -p -h localhost`
- Check firewall settings if using remote MySQL

### Permission Issues
- Ensure user has proper privileges: `SHOW GRANTS FOR 'cert_user'@'localhost';`
- Re-grant permissions if needed

### Python Import Errors
- Install missing packages: `pip install mysql-connector-python python-dotenv`
- Check Python path and virtual environment

### Data Migration Issues
- Check CSV file format and encoding
- Verify all required columns exist: roll, name, university, degreetitle, yearofpassing
- Use `--force` flag to overwrite existing data

## System Behavior

### Automatic Fallback
The system is designed to automatically fall back to CSV if MySQL is unavailable:
1. **Primary**: MySQL database
2. **Fallback**: CSV file (certificates_legacy.csv)

### Command Line Options
- `--use-csv-only`: Force CSV usage instead of MySQL
- `--csv`: Specify custom CSV path (fallback only)

## Performance Benefits

MySQL provides several advantages over CSV:
- **Faster lookups**: Indexed roll numbers for O(log n) searches
- **Concurrent access**: Multiple processes can read simultaneously
- **Data integrity**: ACID compliance and constraints
- **Scalability**: Handle thousands of certificates efficiently
- **Backup/Recovery**: Built-in database backup tools

## Maintenance

### Regular Backups
```bash
mysqldump -u cert_user -p certificate_validator > backup_$(date +%Y%m%d).sql
```

### Adding New Certificates
Use the database interface or import from CSV:
```python
from scripts.db_mysql import get_db
db = get_db()
db.insert_certificate("20201501", "John Doe", "University", "BBA", "2020")
```

### Monitoring
Check database size and performance:
```sql
SELECT 
    table_name,
    ROUND(((data_length + index_length) / 1024 / 1024), 2) AS 'Size (MB)'
FROM information_schema.tables 
WHERE table_schema = 'certificate_validator';
```

