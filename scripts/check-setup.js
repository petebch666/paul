/**
 * Setup Verification Script
 * Checks if everything is ready for the AI guardrails system
 */

const https = require('https');
const http = require('http');

console.log('🔍 Checking AI Guardrails System Setup...\n');

// Check 1: Ollama connection
async function checkOllama() {
  return new Promise((resolve) => {
    const req = http.get('http://localhost:11434/api/tags', (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const models = JSON.parse(data);
          if (models.models && models.models.length > 0) {
            console.log('✅ Ollama is running!');
            console.log(`   Models available: ${models.models.map(m => m.name).join(', ')}`);
            resolve(true);
          } else {
            console.log('⚠️  Ollama is running but no models found');
            console.log('   Run: ollama pull llama3.2:3b');
            resolve(false);
          }
        } catch (e) {
          console.log('⚠️  Ollama responded but with unexpected format');
          resolve(false);
        }
      });
    });
    
    req.on('error', () => {
      console.log('❌ Ollama is not running');
      console.log('   Install: https://ollama.ai/download');
      console.log('   Then run: ollama serve');
      resolve(false);
    });
    
    req.setTimeout(3000, () => {
      req.destroy();
      console.log('❌ Ollama connection timeout');
      console.log('   Make sure Ollama is running: ollama serve');
      resolve(false);
    });
  });
}

// Check 2: Environment variables
function checkEnv() {
  console.log('\n📋 Environment Configuration:');
  const endpoint = process.env.VITE_OLLAMA_ENDPOINT || 'http://localhost:11434';
  const model = process.env.VITE_OLLAMA_MODEL || 'llama3.2:3b';
  console.log(`   Ollama Endpoint: ${endpoint}`);
  console.log(`   Model: ${model}`);
  console.log('   (To customize, create .env file)');
}

// Check 3: Database schema
function checkDatabase() {
  console.log('\n📊 Database Schema:');
  console.log('   ⚠️  Manual step required:');
  console.log('   1. Open Supabase Dashboard → SQL Editor');
  console.log('   2. Copy/paste SUPABASE-SCHEMA.sql');
  console.log('   3. Run the SQL script');
  console.log('   4. Verify columns exist: validation_status, validation_reason, validated_at');
}

// Main check
async function main() {
  console.log('='.repeat(50));
  
  // Check Ollama
  const ollamaOk = await checkOllama();
  
  // Check environment
  checkEnv();
  
  // Check database
  checkDatabase();
  
  console.log('\n' + '='.repeat(50));
  console.log('\n📝 Summary:');
  
  if (ollamaOk) {
    console.log('✅ Ollama: Ready');
  } else {
    console.log('❌ Ollama: Not ready - see instructions above');
  }
  
  console.log('⚠️  Database: Manual setup required (see above)');
  console.log('\n💡 Next steps:');
  console.log('   1. Update Supabase database schema');
  console.log('   2. Start Ollama if not running');
  console.log('   3. Test in browser: await testValidation.runAllTests()');
}

main().catch(console.error);

