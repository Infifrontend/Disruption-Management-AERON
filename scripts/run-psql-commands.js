
import { execSync } from 'child_process';
import { formatNeonConnectionString } from '../server/database-utils.js';

async function runPsqlCommands() {
  try {
    // Get the properly formatted connection string
    const connectionString = formatNeonConnectionString(process.env.DB_URL);
    
    if (!connectionString) {
      console.error('❌ DB_URL environment variable is not set');
      process.exit(1);
    }

    console.log('🔌 Using formatted connection string for Neon database...');
    
    // Commands to run
    const commands = [
      {
        description: 'Describe flight_disruptions table structure',
        sql: '\\d flight_disruptions'
      },
      {
        description: 'Add categorization column if it doesn\'t exist',
        sql: 'ALTER TABLE flight_disruptions ADD COLUMN IF NOT EXISTS categorization VARCHAR(255);'
      }
    ];

    // Execute each command
    for (const command of commands) {
      console.log(`\n📋 ${command.description}:`);
      console.log('─'.repeat(50));
      
      try {
        const result = execSync(`psql "${connectionString}" -c "${command.sql}"`, {
          encoding: 'utf8',
          stdio: 'pipe'
        });
        
        console.log(result);
        console.log('✅ Command executed successfully');
      } catch (error) {
        console.error('❌ Command failed:', error.message);
        if (error.stdout) console.log('STDOUT:', error.stdout);
        if (error.stderr) console.log('STDERR:', error.stderr);
      }
    }

    console.log('\n🎉 All commands completed!');

  } catch (error) {
    console.error('❌ Script failed:', error.message);
    process.exit(1);
  }
}

// Run the commands
runPsqlCommands();
