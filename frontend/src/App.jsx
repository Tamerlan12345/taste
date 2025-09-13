import React, { useState } from 'react';
import axios from 'axios';
import InputForm from './components/InputForm';
import './App.css';

const PresentationView = ({ presentationHtml, loading }) => {
  if (loading) {
    return (
      <div className="presentation-view-placeholder">
        <div className="skeleton-loader"></div>
      </div>
    );
  }

  if (!presentationHtml) {
    return (
      <div className="presentation-view-placeholder">
        <h2>Preview</h2>
        <p>Your generated presentation will appear here.</p>
      </div>
    );
  }

  return (
    <iframe
      srcDoc={presentationHtml}
      title="Presentation Preview"
      sandbox="allow-scripts allow-same-origin"
      style={{ width: '100%', height: '100%', border: 'none' }}
    />
  );
};

function App() {
  const [presentationHtml, setPresentationHtml] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGenerate = async (formData) => {
    setIsLoading(true);
    setError('');

    const data = new FormData();
    data.append('theme', formData.theme);
    data.append('audience', formData.audience);
    data.append('style', formData.style);
    data.append('content', formData.content);
    if (formData.files) {
      for (const file of formData.files) {
        data.append('files', file);
      }
    }

    try {
      const response = await axios.post('/api/generate', data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        // The backend expects HTML, so let's set the responseType
        // The spec says the backend will return text/html
        responseType: 'text',
      });
      setPresentationHtml(response.data);

    } catch (error) {
      console.error('Error generating presentation:', error);
      setError('Failed to generate presentation. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>Genesis Presentations</h1>
      </header>
      <main className="main-content">
        <div className="control-panel">
          <InputForm onGenerate={handleGenerate} isLoading={isLoading} />
        </div>
        <div className="presentation-view">
          {error ? <div className="error-message">{error}</div> : <PresentationView presentationHtml={presentationHtml} loading={isLoading} />}
        </div>
      </main>
    </div>
  );
}

export default App;
