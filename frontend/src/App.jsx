import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import FormBuilder from './FormBuilder';
import FormResponder from './FormResponder';
import ResponsesViewer from './ResponseViewer';

function App() {
  const [publishedData, setPublishedData] = useState({
    isPublished: false,
    formId: null,
    link: ''
  });

  return (
    <Router>
      <Routes>
        <Route 
          path="/" 
          element={<FormBuilder 
            publishedData={publishedData}
            setPublishedData={setPublishedData}
          />} 
        />
        <Route 
          path="/published" 
          element={<FormBuilder 
            publishedData={publishedData}
            setPublishedData={setPublishedData}
          />}
        />
        <Route 
          path="/responses/:formId" 
          element={<ResponsesViewer />} 
        />
        <Route path="/respond/:formId" element={<FormResponder />} />
      </Routes>
    </Router>
  );
}

export default App;