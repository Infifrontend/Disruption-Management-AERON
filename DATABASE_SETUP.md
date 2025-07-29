
# AERON Settings Database Setup

This document explains how to set up the PostgreSQL database for AERON settings storage.

## Option 1: Using Replit PostgreSQL (Recommended)

1. **Add PostgreSQL Database to your Repl:**
   - In your Repl, go to the "Tools" panel
   - Click on "Database" 
   - Select "PostgreSQL"
   - Replit will automatically provision a PostgreSQL database for you

2. **Initialize the Database:**
   - The database URL will be automatically available as `DATABASE_URL` environment variable
   - Run the schema initialization:
   ```bash
   # Connect to your database and run the schema
   psql $DATABASE_URL -f database/schema.sql
   ```

3. **Start the Application:**
   - The application will automatically connect to the PostgreSQL database
   - If the database is unavailable, it will fall back to localStorage

## Option 2: Local Development Setup

If you want to run PostgreSQL locally for development:

1. **Install PostgreSQL:**
   ```bash
   # On Ubuntu/Debian
   sudo apt-get install postgresql postgresql-contrib
   
   # On macOS with Homebrew
   brew install postgresql
   ```

2. **Create Database:**
   ```bash
   # Start PostgreSQL service
   sudo systemctl start postgresql  # Linux
   brew services start postgresql   # macOS
   
   # Create database
   createdb aeron_settings
   ```

3. **Initialize Schema:**
   ```bash
   psql aeron_settings -f database/schema.sql
   ```

4. **Set Environment Variable:**
   ```bash
   export DATABASE_URL="postgresql://localhost:5432/aeron_settings"
   ```

## Running the Application

1. **Start the Database API Server:**
   ```bash
   node server/start.js
   ```
   This will start the Express server on port 3001 that handles database operations.

2. **Start the Main Application:**
   ```bash
   npm run dev
   ```
   This will start the Vite development server on port 5000.

## Database Features

### Settings Storage
- **Hierarchical organization** by category and key
- **Type safety** with boolean, number, string, object support
- **Audit trail** for all changes with timestamps and user tracking
- **Soft deletion** to maintain data integrity

### Custom Rules Management
- **Business rules** with hard/soft classification
- **Priority ordering** for rule execution
- **Override permissions** for operational flexibility
- **Status management** (Active/Inactive/Draft)

### Custom Parameters
- **Dynamic parameters** for recovery algorithms
- **Weighted scoring** for decision-making
- **Category-based organization**

### Performance Features
- **Connection pooling** for efficient database usage
- **Indexed queries** for fast lookups
- **Automatic failover** to localStorage if database unavailable
- **Health monitoring** with connection retry logic

## API Endpoints

The database API server provides the following endpoints:

### Settings
- `GET /api/settings` - Get all settings
- `GET /api/settings/:category/:key` - Get specific setting
- `GET /api/settings/category/:category` - Get settings by category
- `POST /api/settings` - Save/update setting
- `DELETE /api/settings/:category/:key` - Delete setting

### Custom Rules
- `GET /api/custom-rules` - Get all custom rules
- `POST /api/custom-rules` - Create new rule
- `PUT /api/custom-rules/:ruleId` - Update rule
- `DELETE /api/custom-rules/:ruleId` - Delete rule

### Custom Parameters
- `GET /api/custom-parameters` - Get all custom parameters
- `POST /api/custom-parameters` - Create new parameter
- `DELETE /api/custom-parameters/:parameterId` - Delete parameter

### Utilities
- `GET /api/health` - Database health check
- `POST /api/settings/reset` - Reset settings to defaults

## Monitoring and Maintenance

### Database Health
The application continuously monitors database connectivity and provides:
- Real-time connection status in the Settings panel
- Automatic retry mechanisms
- Graceful fallback to localStorage
- Health check endpoint for external monitoring

### Data Backup
Regular backups are recommended:
```bash
# Export all settings
pg_dump $DATABASE_URL > aeron_settings_backup.sql

# Restore from backup
psql $DATABASE_URL < aeron_settings_backup.sql
```

### Performance Monitoring
Monitor database performance with:
- Connection pool metrics
- Query execution times
- Index usage statistics
- Storage utilization

## Troubleshooting

### Common Issues

1. **Connection Failed:**
   - Check DATABASE_URL environment variable
   - Verify PostgreSQL service is running
   - Check network connectivity

2. **Schema Errors:**
   - Ensure schema.sql has been run
   - Check for conflicting table names
   - Verify user permissions

3. **Performance Issues:**
   - Monitor connection pool usage
   - Check for long-running queries
   - Review index effectiveness

### Logs
Check application logs for detailed error messages:
- Database connection logs
- Query execution logs
- Fallback activation logs

## Security Considerations

- Use strong passwords for database connections
- Enable SSL/TLS for production databases
- Implement proper access controls
- Regular security updates
- Monitor for suspicious activity

For additional support, check the application logs or contact the development team.
