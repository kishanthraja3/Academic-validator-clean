import React from "react";

function App() {
  return (
    <div style={{ 
      padding: '20px', 
      backgroundColor: '#f0f0f0', 
      minHeight: '100vh',
      fontFamily: 'Arial, sans-serif'
    }}>
      <h1 style={{ color: '#333', marginBottom: '20px' }}>
        🎉 Frontend is Working!
      </h1>
      <p style={{ color: '#666', marginBottom: '10px' }}>
        If you can see this, the React app is rendering correctly.
      </p>
      <p style={{ color: '#666', marginBottom: '10px' }}>
        Current time: {new Date().toLocaleString()}
      </p>
      <div style={{ 
        backgroundColor: '#e8f5e8', 
        padding: '15px', 
        borderRadius: '5px',
        border: '1px solid #4caf50'
      }}>
        <h3 style={{ color: '#2e7d32', marginBottom: '10px' }}>✅ System Status:</h3>
        <ul style={{ color: '#2e7d32', marginLeft: '20px' }}>
          <li>Frontend: Running on port 5173</li>
          <li>React: Working</li>
          <li>CSS: Loading</li>
          <li>JavaScript: Executing</li>
        </ul>
      </div>
    </div>
  );
}

export default App;







