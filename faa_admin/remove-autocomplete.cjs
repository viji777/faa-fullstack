const fs = require('fs');
const files = [
  'd:/MyTech/faa/faa_admin/src/components/Layout.jsx',
  'd:/MyTech/faa/faa_admin/src/pages/Banners.jsx',
  'd:/MyTech/faa/faa_admin/src/pages/Category.jsx',
  'd:/MyTech/faa/faa_admin/src/pages/Dashboard.jsx',
  'd:/MyTech/faa/faa_admin/src/pages/ForgotPassword.jsx',
  'd:/MyTech/faa/faa_admin/src/pages/Login.jsx',
  'd:/MyTech/faa/faa_admin/src/pages/ResetPassword.jsx',
  'd:/MyTech/faa/faa_admin/src/pages/Signup.jsx',
  'd:/MyTech/faa/faa_admin/src/pages/VerifyOTP.jsx'
];

files.forEach(f => {
  let content = fs.readFileSync(f, 'utf8');
  content = content.replace(/<input(?![^>]*autoComplete=)/g, '<input autoComplete="off"');
  fs.writeFileSync(f, content, 'utf8');
});
