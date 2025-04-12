import { FaCopy } from 'react-icons/fa';
import { useState } from 'react';
import { useParams } from 'react-router-dom';
const FormPublished = ({ formId: propFormId, onBack }) => {
   
    const FRONTEND_URL = import.meta.env.VITE_FRONTEND_URL;
    const { formId: urlFormId } = useParams();
    const formId = propFormId || urlFormId;
    
    const formLink = `${FRONTEND_URL}/respond/${formId}`;
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(formLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="container mx-auto max-w-3xl p-5">
      <div className="bg-white rounded-lg p-6">
        <h2 className="text-2xl mb-4">Form Published!</h2>
        <p className="mb-4">Share this link with respondents:</p>
        
        <div className="flex items-center mb-6">
          <a 
            href={formLink} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-primary underline break-all"
          >
            {formLink}
          </a>
          <button
            onClick={copyToClipboard}
            className="ml-2 text-primary hover:text-primary-dark flex items-center"
            title="Copy to clipboard"
          >
            <FaCopy className="mr-1" />
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>
        
        <button
          onClick={onBack}
          className="bg-primary text-white px-4 py-2 rounded hover:bg-primary-dark"
        >
          Back to Form
        </button>
      </div>
    </div>
  );
};

export default FormPublished;