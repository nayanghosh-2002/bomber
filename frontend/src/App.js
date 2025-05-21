import React, { useState, useEffect } from 'react';
import axios from 'axios';
import History from './History';
import Login from './Login';

function App() {
  const [to, setTo] = useState('');
  const [body, setBody] = useState('');
  const [history, setHistory] = useState([]);
  const [token, setToken] = useState('');

  const sendMessage = async () => {
    try {
      await axios.post('/api/messages/send', { to, body });
      alert('Message sent!');
      fetchHistory();
    } catch (error) {
      alert('Error sending message: ' + error.message);
    }
  };

  const fetchHistory = async () => {
    const res = await axios.get('/api/messages/history');
    setHistory(res.data);
  };

  useEffect(() => { fetchHistory(); }, []);

  if (!token) return <Login setToken={setToken} />;

  return (
    <div className="App">
      <h1>Bulk SMS Sender</h1>
      <input type="text" placeholder="Recipient Number" value={to} onChange={e => setTo(e.target.value)} />
      <textarea placeholder="Your message" value={body} onChange={e => setBody(e.target.value)} />
      <button onClick={sendMessage}>Send</button>
      <History messages={history} />
    </div>
  );
}
export default App;
