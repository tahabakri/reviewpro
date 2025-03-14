import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { join } from 'path';
import { config } from '../config';

async function initializeDatabase() {
  // Create Supabase client
  const supabase = createClient(
    config.database.url,
    config.database.key,
    {
      auth: {
        persistSession: false
      }
    }
  );

  try {
    console.log('Starting database initialization...');

    // Read SQL file
    const sqlContent = readFileSync(
      join(__dirname, 'tables.sql'),
      'utf-8'
    );

    // Split SQL into individual statements
    const statements = sqlContent
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0);

    // Execute each statement
    for (const statement of statements) {
      console.log(`Executing: ${statement.substring(0, 50)}...`);
      const { error } = await supabase.rpc('exec', { sql: statement });
      if (error) {
        throw error;
      }
    }

    console.log('Database initialization completed successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
    process.exit(1);
  }
}

// Run initialization if this script is executed directly
if (require.main === module) {
  initializeDatabase();
}

export { initializeDatabase };