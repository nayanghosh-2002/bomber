import React from 'react';

function History({ messages }) {
  return (
    <div>
      <h2>Message History</h2>
      <ul>
        {messages.map((msg, idx) => (
          <li key={idx}>
            To: {msg.to} | Message: {msg.body} | Date: {new Date(msg.dateSent).toLocaleString()}
          </li>
        ))}
      </ul>
    </div>
  );
}
export default History;
