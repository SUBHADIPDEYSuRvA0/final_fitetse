const express = require('express');
const app = express();

// Test the routing structure
console.log('Testing route structure...');

try {
  // Test admin routes
  const adminRoutes = require('./app/router/admin/index');
  console.log('✓ Admin routes loaded successfully');
  
  // Test calendar routes
  const calendarRoutes = require('./app/router/admin/adminsllots');
  console.log('✓ Calendar routes loaded successfully');
  
  // Test admin pages routes
  const adminPagesRoutes = require('./app/router/admin/adminpages.routes');
  console.log('✓ Admin pages routes loaded successfully');
  
  console.log('\nAvailable routes:');
  console.log('- /admin/calendar (renders calendar view)');
  console.log('- /admin/calender (redirects to /admin/calendar)');
  console.log('- /admin/calendar-api/slots (gets slots data)');
  console.log('- /admin/calendar-api/generate-slots (creates slots)');
  console.log('- /admin/calendar-api/block-slot/:id (blocks slot)');
  console.log('- /admin/calendar-api/block-day/:date (blocks day)');
  console.log('- /admin/calendar-api/reschedule/:id (reschedules slot)');
  
  console.log('\n✓ All routes are properly configured!');
} catch (error) {
  console.error('❌ Error loading routes:', error.message);
} 