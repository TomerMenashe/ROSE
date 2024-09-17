exports.login = (req, res) => {
    const { username, password } = req.body;
  
    // Hardcoded users (including admin)
    const users = [
      { username: 'testuser', password: 'password123' },
      { username: 'admin', password: 'admin' }  // Default admin user
    ];
  
    const user = users.find(u => u.username === username && u.password === password);
  
    if (user) {
      res.json({ success: true, message: 'Login successful' });
    } else {
      res.json({ success: false, message: 'Invalid username or password' });
    }
  };
  