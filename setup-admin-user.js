// Setup admin user in Supabase
const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');

// Supabase credentials from .env
const supabaseUrl = 'https://bozdmfofraqhpubrddqo.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJvemRtZm9mcmFxaHB1YnJkZHFvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAxOTAyMDksImV4cCI6MjA3NTc2NjIwOX0.UuWyTeT_UTlL3SdZT_4xRbVs25pbdgnl4f3-s7h2LWo';

const supabase = createClient(supabaseUrl, supabaseKey);

async function setupAdminUser() {
  try {
    console.log('🔐 Setting up admin user...');
    
    // Hash the password
    const password = 'Admin@123';
    const hashedPassword = '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy';
    
    // Insert admin user
    const { data, error } = await supabase
      .from('users')
      .upsert({
        name: 'Admin',
        username: '@admin',
        email: 'admin@pollz.app',
        password_hash: hashedPassword,
        role: 'admin',
        avatar: 'https://ui-avatars.com/api/?name=Admin&background=ff0000&color=ffffff&size=150',
        followers: 0,
        following: 0,
        reputation: 0,
        poll_count: 0,
        win_rate: 0
      }, {
        onConflict: 'email'
      })
      .select();

    if (error) {
      console.error('❌ Error:', error);
    } else {
      console.log('✅ Admin user created successfully!');
      console.log('📧 Email: admin@pollz.app');
      console.log('🔑 Password: Admin@123');
    }
  } catch (err) {
    console.error('❌ Failed to setup admin user:', err);
  }
}

setupAdminUser();
