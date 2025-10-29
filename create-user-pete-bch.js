// Create regular user "Pete Bch" in Supabase
import { createClient } from '@supabase/supabase-js';

// Supabase credentials from .env
const supabaseUrl = 'https://bozdmfofraqhpubrddqo.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJvemRtZm9mcmFxaHB1YnJkZHFvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAxOTAyMDksImV4cCI6MjA3NTc2NjIwOX0.UuWyTeT_UTlL3SdZT_4xRbVs25pbdgnl4f3-s7h2LWo';

const supabase = createClient(supabaseUrl, supabaseKey);

async function createPeteBchUser() {
  try {
    console.log('👤 Creating user "Pete Bch"...');
    
    // Hash the password (using the same hash as admin for testing)
    // Password: PeteBch123
    const hashedPassword = '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy';
    
    // Insert user with regular 'user' role (not admin)
    const { data, error } = await supabase
      .from('users')
      .upsert({
        name: 'Pete Bch',
        username: '@petebch',
        email: 'petebch@pollz.app',
        password_hash: hashedPassword,
        role: 'user', // Regular user, not admin
        avatar: 'https://ui-avatars.com/api/?name=Pete+Bch&background=667eea&color=ffffff&size=150',
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
      throw error;
    } else {
      console.log('✅ User "Pete Bch" created successfully!');
      console.log('📧 Email: petebch@pollz.app');
      console.log('🔑 Password: PeteBch123');
      console.log('👤 Role: user (regular user, not admin)');
      console.log('🆔 Username: @petebch');
      console.log('');
      console.log('📝 User details:', JSON.stringify(data[0], null, 2));
    }
  } catch (err) {
    console.error('❌ Failed to create user:', err);
  }
}

createPeteBchUser();

