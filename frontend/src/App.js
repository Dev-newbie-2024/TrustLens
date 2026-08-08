import React from 'react';
import UploadForm from './components/UploadForm';
function App(){ return (
  <div className="container">
    <h1>TrustLens - Terms & Conditions Analyzer</h1>
    <p>Paste text or upload a PDF/image to get a quick summary and Trust Score.</p>
    <UploadForm />
  </div>
); }
export default App;
