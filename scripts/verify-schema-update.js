
import fs from 'fs';
import path from 'path';

async function verifySchemaUpdate() {
  try {
    const schemaPath = path.join('database', 'schema.sql');
    const backupPath = path.join('database', 'schema_backup.sql');
    
    if (!fs.existsSync(schemaPath)) {
      console.log('❌ Updated schema file not found.');
      return;
    }
    
    const schemaContent = fs.readFileSync(schemaPath, 'utf8');
    
    console.log('🔍 Schema Verification Report');
    console.log('=' .repeat(50));
    
    // Count various elements
    const tables = (schemaContent.match(/CREATE TABLE IF NOT EXISTS/gi) || []).length;
    const indexes = (schemaContent.match(/CREATE INDEX/gi) || []).length;
    const triggers = (schemaContent.match(/CREATE TRIGGER/gi) || []).length;
    const functions = (schemaContent.match(/CREATE OR REPLACE FUNCTION/gi) || []).length;
    const inserts = (schemaContent.match(/INSERT INTO/gi) || []).length;
    
    console.log(`📋 Tables: ${tables}`);
    console.log(`📇 Indexes: ${indexes}`);
    console.log(`⚡ Triggers: ${triggers}`);
    console.log(`🔧 Functions: ${functions}`);
    console.log(`📝 Data Inserts: ${inserts}`);
    console.log(`📄 Total Size: ${(schemaContent.length / 1024).toFixed(2)} KB`);
    
    // Check for common patterns
    const hasConflictResolution = schemaContent.includes('ON CONFLICT');
    const hasIfNotExists = schemaContent.includes('IF NOT EXISTS');
    const hasAuditTables = schemaContent.includes('settings_audit');
    
    console.log('\n✅ Schema Features:');
    console.log(`  - IF NOT EXISTS clauses: ${hasIfNotExists ? '✅' : '❌'}`);
    console.log(`  - Conflict resolution: ${hasConflictResolution ? '✅' : '❌'}`);
    console.log(`  - Audit tables: ${hasAuditTables ? '✅' : '❌'}`);
    
    if (fs.existsSync(backupPath)) {
      const backupContent = fs.readFileSync(backupPath, 'utf8');
      console.log(`\n💾 Backup created: ${(backupContent.length / 1024).toFixed(2)} KB`);
    }
    
    console.log('\n🎉 Schema update verification completed!');
    
  } catch (error) {
    console.error('❌ Error verifying schema update:', error.message);
  }
}

// Run the verification
verifySchemaUpdate();
