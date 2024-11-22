import React, { useState } from 'react';

const SettingsPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  const handleSave = () => {
    // Implement save functionality here
    console.log('Settings saved:', { username, email, notificationsEnabled });
  };

  return (
    <div className="text-white p-6 space-y-6 h-[calc(100vh-17rem)]">
      <h2 className="text-2xl font-bold mb-4">Settings</h2>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm text-white/70 mb-2">Username</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
            placeholder="Enter your username..."
          />
        </div>

        <div>
          <label className="block text-sm text-white/70 mb-2">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
            placeholder="Enter your email..."
          />
        </div>

        <div className="flex items-center space-x-4">
          <label className="block text-sm text-white/70">Enable Notifications</label>
          <input
            type="checkbox"
            checked={notificationsEnabled}
            onChange={(e) => setNotificationsEnabled(e.target.checked)}
            className="w-5 h-5 bg-white/5 border border-white/10 rounded-lg text-white"
          />
        </div>
      </div>

      <button
        onClick={handleSave}
        className="w-full py-2 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg hover:opacity-90 transition"
      >
        Save Settings
      </button>
    </div>
  );
};

export default SettingsPage;