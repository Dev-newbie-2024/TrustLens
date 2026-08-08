import React, { useState } from 'react';
import axios from 'axios';
function UploadForm(){
  const [text,setText]=useState(''); const [file,setFile]=useState(null);
  const [result,setResult]=useState(null); const [loading,setLoading]=useState(false);
  const handleFile=(e)=> setFile(e.target.files[0]);
  const handleAnalyze=async ()=>{
    setLoading(true);
    try{
      const form=new FormData();
      if(file) form.append('file',file);
      if(text && text.trim().length>0) form.append('text',text);
      form.append('userId','demo-user');
      const res=await axios.post('http://localhost:5000/api/analyze', form, { headers:{ 'Content-Type':'multipart/form-data' }});
      setResult(res.data);
    }catch(err){ alert('Error: '+(err.response?.data?.error||err.message)); } finally{ setLoading(false); }
  }
  return (<div>
    <div><label>Paste Terms & Conditions (or upload file)</label>
    <textarea rows="10" cols="80" value={text} onChange={e=>setText(e.target.value)} placeholder="Paste full text here..."></textarea>
    <div style={{marginTop:10}}><input type="file" onChange={handleFile} /></div>
    <div style={{marginTop:10}}><button onClick={handleAnalyze} disabled={loading}>{loading ? 'Analyzing...' : 'Analyze'}</button></div>
    </div>
    {result && (<div style={{marginTop:20,padding:12,background:'#f6f9ff',borderRadius:8}}>
      <h3>Summary</h3><p>{result.summary}</p>
      <h4>Trust Score: {result.trustScore} ({result.riskLevel})</h4>
      {result.detected && result.detected.length>0 && (<div><strong>Detected risky keywords:</strong><ul>{result.detected.map((k,i)=><li key={i}>{k}</li>)}</ul></div>)}
    </div>)}
  </div>);
}
export default UploadForm;
