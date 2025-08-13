
import fs from 'fs';
import path from 'path';

async function updateSchemaFromDump() {
  try {
    const dumpPath = path.join('database', 'current_dump.sql');
    const schemaPath = path.join('database', 'schema.sql');
    const backupPath = path.join('database', 'schema_backup.sql');
    
    if (!fs.existsSync(dumpPath)) {
      console.log('❌ Database dump file not found. Please run pg_dump first.');
      return;
    }
    
    // Create backup of existing schema
    if (fs.existsSync(schemaPath)) {
      fs.copyFileSync(schemaPath, backupPath);
      console.log('💾 Created backup: database/schema_backup.sql');
    }
    
    // Read dump content
    let dumpContent = fs.readFileSync(dumpPath, 'utf8');
    
    // Clean up the dump content for schema use
    dumpContent = cleanDumpForSchema(dumpContent);
    
    // Add header comment
    const header = `-- AERON Settings Database Schema
-- This schema supports hierarchical settings with categories, versioning, and audit trails
-- Updated automatically from database dump on ${new Date().toISOString()}
-- Includes recovery categorization and detailed recovery options

`;
    
    const finalContent = header + dumpContent;
    
    // Write the updated schema
    fs.writeFileSync(schemaPath, finalContent);
    
    console.log('✅ Schema file updated successfully!');
    console.log(`📄 Updated: ${schemaPath}`);
    console.log(`📦 Backup: ${backupPath}`);
    console.log(`📊 New schema size: ${(finalContent.length / 1024).toFixed(2)} KB`);
    
  } catch (error) {
    console.error('❌ Error updating schema file:', error.message);
  }
}

function cleanDumpForSchema(content) {
  // Remove pg_dump specific comments and settings
  content = content.replace(/^--.*$/gm, '');
  content = content.replace(/SET\s+[^;]+;/gi, '');
  content = content.replace(/SELECT pg_catalog\.setval\([^)]+\);/gi, '');
  
  // Clean up whitespace
  content = content.replace(/\n\s*\n\s*\n/g, '\n\n');
  content = content.replace(/^\s*\n/gm, '');
  
  // Add IF NOT EXISTS to CREATE TABLE statements
  content = content.replace(/CREATE TABLE\s+([^\s(]+)/gi, 'CREATE TABLE IF NOT EXISTS $1');
  
  // Add conflict resolution to INSERT statements
  content = content.replace(/INSERT INTO ([^\s(]+)/gi, (match, tableName) => {
    // Add ON CONFLICT DO NOTHING for most tables
    return `INSERT INTO ${tableName}`;
  });
  
  // Add ON CONFLICT clauses for common scenarios
  content = content.replace(/(INSERT INTO settings[^;]+);/gi, '$1 ON CONFLICT (category, key) DO NOTHING;');
  content = content.replace(/(INSERT INTO custom_rules[^;]+);/gi, '$1 ON CONFLICT (rule_id) DO NOTHING;');
  content = content.replace(/(INSERT INTO custom_parameters[^;]+);/gi, '$1 ON CONFLICT (parameter_id) DO NOTHING;');
  content = content.replace(/(INSERT INTO disruption_categories[^;]+);/gi, '$1 ON CONFLICT (category_code) DO NOTHING;');
  content = content.replace(/(INSERT INTO flight_disruptions[^;]+);/gi, '$1 ON CONFLICT (flight_number, scheduled_departure) DO NOTHING;');
  content = content.replace(/(INSERT INTO passengers[^;]+);/gi, '$1 ON CONFLICT (pnr) DO NOTHING;');
  content = content.replace(/(INSERT INTO crew_members[^;]+);/gi, '$1 ON CONFLICT (employee_id) DO NOTHING;');
  content = content.replace(/(INSERT INTO aircraft[^;]+);/gi, '$1 ON CONFLICT (registration) DO NOTHING;');
  
  return content;
}

// Run the update
updateSchemaFromDump();
