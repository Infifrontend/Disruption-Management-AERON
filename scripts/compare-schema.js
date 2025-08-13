
import fs from 'fs';
import path from 'path';

async function compareSchemaFiles() {
  try {
    const dumpPath = path.join('database', 'current_dump.sql');
    const schemaPath = path.join('database', 'schema.sql');
    
    if (!fs.existsSync(dumpPath)) {
      console.log('❌ Database dump file not found. Please run pg_dump first.');
      return;
    }
    
    if (!fs.existsSync(schemaPath)) {
      console.log('❌ Existing schema file not found.');
      return;
    }
    
    const dumpContent = fs.readFileSync(dumpPath, 'utf8');
    const schemaContent = fs.readFileSync(schemaPath, 'utf8');
    
    console.log('📊 Schema Comparison Report');
    console.log('=' .repeat(50));
    
    // Basic size comparison
    console.log(`Dump file size: ${(dumpContent.length / 1024).toFixed(2)} KB`);
    console.log(`Schema file size: ${(schemaContent.length / 1024).toFixed(2)} KB`);
    
    // Extract table names from both files
    const dumpTables = extractTableNames(dumpContent);
    const schemaTables = extractTableNames(schemaContent);
    
    console.log('\n📋 Tables in dump:', dumpTables.length);
    console.log('📋 Tables in schema:', schemaTables.length);
    
    // Find differences
    const newTables = dumpTables.filter(t => !schemaTables.includes(t));
    const removedTables = schemaTables.filter(t => !dumpTables.includes(t));
    
    if (newTables.length > 0) {
      console.log('\n➕ New tables in dump:');
      newTables.forEach(t => console.log(`  - ${t}`));
    }
    
    if (removedTables.length > 0) {
      console.log('\n➖ Tables removed from dump:');
      removedTables.forEach(t => console.log(`  - ${t}`));
    }
    
    // Extract data inserts
    const dumpInserts = extractDataInserts(dumpContent);
    const schemaInserts = extractDataInserts(schemaContent);
    
    console.log(`\n📝 Data inserts in dump: ${dumpInserts.length}`);
    console.log(`📝 Data inserts in schema: ${schemaInserts.length}`);
    
    console.log('\n✅ Comparison completed. Ready for schema update.');
    
  } catch (error) {
    console.error('❌ Error comparing schema files:', error.message);
  }
}

function extractTableNames(content) {
  const tableRegex = /CREATE TABLE\s+(?:IF NOT EXISTS\s+)?([^\s(]+)/gi;
  const matches = [];
  let match;
  
  while ((match = tableRegex.exec(content)) !== null) {
    matches.push(match[1].replace(/["`]/g, ''));
  }
  
  return [...new Set(matches)].sort();
}

function extractDataInserts(content) {
  const insertRegex = /INSERT INTO\s+([^\s(]+)/gi;
  const matches = [];
  let match;
  
  while ((match = insertRegex.exec(content)) !== null) {
    matches.push(match[1].replace(/["`]/g, ''));
  }
  
  return matches;
}

// Run the comparison
compareSchemaFiles();
