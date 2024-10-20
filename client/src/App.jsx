import React, {useState} from "react";
import MonacoEditor from '@monaco-editor/react'
import './App.css';
import { toast } from "sonner";
import { Routes, Route, BrowserRouter } from 'react-router-dom';
import Login from "./pages/Login/Login";
import { useNavigate } from "react-router-dom";

function Home() {
  const navigate = useNavigate();
  const [content, setContent] = useState('');
  const [responseMessage, setResponseMessage] = useState('');
  const [compilationMessage, setCompilationMessage] = useState('');

  
  const handleLogout = async () => {
    try {
      const response = await fetch('/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        toast.success('Logged out successfully');
        navigate('/');
      } else {
        const message = await response.text();
        throw new Error(message);
      }
    } catch (error) {
      toast.error('Error: ' + error.message);
    }
  };
  const handleSubmit = async (e) => {
    e.preventDefault();

    try{
      const response = await fetch('/save-asm', {
        method: 'POST', 
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({content}),
      });

      const message = await response.text();
      if (response.status === 401) {
        toast.error('User not logged in')
        navigate('/');
        return;
      }
      if (response.status !== 200){
        throw new Error(message)
      }
      toast.success(message);
    } catch (error) {

      toast.error('Error: '+error.message);
    }
  };
  
  const handleCompile = async () => {
    let toastID = toast.loading('Compiling code...'); 
    try {
      console.log("Content being compiled:", content); // For debugging
      const response = await fetch('/compile-asm', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content }), // Send the content to be compiled
      });

      const result = await response.text();
      if (response.status !== 200) {
        throw new Error(result);
      }
      toast.success(result, { id: toastID });
    } catch (error) {
      toast.error('Error: ' + error.message, { id: toastID });
    }
  };

  const handleUpload = (event) =>{
    const file = event.target.files[0];
    if (!file){
      toast.error('No file selected');
      return;
    }

    if (!file.name.endsWith('.asm')){
      toast.error('File must be a .asm file');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e)=>{
      const fileContent = e.target.result;
      setContent(fileContent);
    }
    reader.readAsText(file);
    toast.success('File copied');
  }

  return(
    <div className="App">
      <button onClick={handleLogout} style={{marginTop:"4rem"}}>Logout</button> 
      <h1> Submit Asm File content</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <MonacoEditor
            height="400px"
            width="600px"
            language="asm"
            theme="vs-dark"
            value={content}
            onChange={(value) => setContent(value)}
            options={{
              automaticLayout: true,
              minimap: { enabled: false },
            }}
          />
        </div>
        <br />
        <button type="submit">Save as test.asm</button>
      </form>
      <p>{responseMessage}</p>
      
      <button onClick={handleCompile}>Compile Code</button>
      <p>{compilationMessage}</p> {/* Compilation result */}
      <label htmlFor="file-upload" className="file-input-label">Upload .asm file</label>
      <input id="file-upload" type="file" accept=".asm" onChange={handleUpload} className="file-input" />
      
    </div>
  );
}
function App(){
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/home" element={<Home />} />
        <Route path="/" element={<Login/>} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;
