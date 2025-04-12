import { useState, useEffect } from 'react';
import { FaPlus, FaTrash, FaPaperPlane, FaChevronDown, FaCheck, FaArrowDown, FaAlignLeft, FaListUl, FaCheckSquare, FaCalendarAlt, FaCopy } from 'react-icons/fa';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const questionTypes = [
  { id: 'text', label: 'Short Answer', icon: <FaAlignLeft /> },
  { id: 'paragraph', label: 'Paragraph', icon: <FaAlignLeft /> },
  { id: 'radio', label: 'Multiple Choice', icon: <FaCheck /> },
  { id: 'checkbox', label: 'Checkboxes', icon: <FaCheckSquare /> },
  { id: 'date', label: 'Date', icon: <FaCalendarAlt /> },
];

const FormBuilder = ({ publishedData, setPublishedData }) => {
  const API_URL = import.meta.env.VITE_API_URL;
  const FRONTEND_URL = import.meta.env.VITE_FRONTEND_URL;
  const [copied, setCopied] = useState(false);
  const [formTitle, setFormTitle] = useState('Untitled Form');
  const [formDescription, setFormDescription] = useState('Form Description');
  const [questions, setQuestions] = useState([]);
  const [activeMenu, setActiveMenu] = useState(null);
  const { isPublished, formId, link } = publishedData;
  const navigate = useNavigate();

  useEffect(() => {
    if (questions.length === 0) {
      addQuestion();
    }
  }, []);

  const addQuestion = (type = 'text') => {
    const newQuestion = {
      id: Date.now().toString(),
      type,
      question: '',
      required: false,
      options: ['', '']
    };
    setQuestions([...questions, newQuestion]);
  };

  const updateQuestion = (id, field, value) => {
    setQuestions(questions.map(q => 
      q.id === id ? { ...q, [field]: value } : q
    ));
  };

  const updateOption = (questionId, index, value) => {
    setQuestions(questions.map(q => {
      if (q.id === questionId) {
        const newOptions = [...q.options];
        newOptions[index] = value;
        return { ...q, options: newOptions };
      }
      return q;
    }));
  };

  const addOption = (questionId) => {
    setQuestions(questions.map(q => 
      q.id === questionId ? { ...q, options: [...q.options, ''] } : q
    ));
  };

  const removeOption = (questionId, index) => {
    setQuestions(questions.map(q => {
      if (q.id === questionId && q.options.length > 2) {
        const newOptions = [...q.options];
        newOptions.splice(index, 1);
        return { ...q, options: newOptions };
      }
      return q;
    }));
  };

  const removeQuestion = (id) => {
    if (questions.length > 1) {
      setQuestions(questions.filter(q => q.id !== id));
    }
  };

  const changeQuestionType = (id, type) => {
    setQuestions(questions.map(q => {
      if (q.id === id) {
        return { 
          ...q, 
          type,
          options: ['', '']
        };
      }
      return q;
    }));
    setActiveMenu(null);
  };

  const toggleMenu = (id) => {
    setActiveMenu(activeMenu === id ? null : id);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePublish = async () => {
    try {
      const response = await axios.post(`${API_URL}/api/forms`, {
        title: formTitle,
        description: formDescription,
        questions: questions.map(q => ({
          questionId: q.id,
          type: q.type,
          question: q.question,
          required: q.required,
          options: Array.isArray(q.options) ? q.options.filter(opt => opt.trim() !== '') : []
        }))
      });
      
      const newFormId = response.data.formId;
      const newLink = `${FRONTEND_URL}/respond/${newFormId}`;
      
      setPublishedData({
        isPublished: true,
        formId: newFormId,
        link: newLink
      });
    } catch (error) {
      console.error('Error publishing form:', error);
    }
  };
  
  if (isPublished) {
    return (
      <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-4">Form Published!</h2>
        <p className="mb-4">Share this link with respondents:</p>
        
        <div className="flex items-center mb-6 p-3 bg-gray-100 rounded">
          <input
            type="text"
            value={link}
            readOnly
            className="flex-1 bg-transparent outline-none"
          />
          <button
            onClick={copyToClipboard}
            className="ml-2 text-primary hover:text-primary-dark flex items-center"
            title="Copy to clipboard"
          >
            <FaCopy className="mr-1" />
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>
        
        <div className="flex space-x-3">
          <button
            onClick={() => setPublishedData({...publishedData, isPublished: false})}
            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
          >
            Back to Form
          </button>
          <button
            onClick={() => navigate(`/responses/${formId}`)}
            className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
          >
            View Responses
          </button>
        </div>
      </div>
    );
  }

  const renderQuestionContent = (question) => {
    switch(question.type) {
      case 'text':
        return <input type="text" className="text-input w-full py-2" disabled placeholder="Short answer text" />;
      case 'paragraph':
        return <textarea className="text-input w-full py-2" disabled placeholder="Long answer text" rows="3"></textarea>;
      case 'date':
        return <input type="date" className="text-input w-full py-2" disabled />;
      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto max-w-3xl p-5">
      <div className="form-header p-6 mb-3">
        <h1 
          className="text-3xl font-normal mb-4 border-b border-transparent pb-2 focus:border-border focus:outline-none" 
          contentEditable 
          onBlur={(e) => setFormTitle(e.target.textContent)}
          suppressContentEditableWarning
        >
          {formTitle}
        </h1>
        <div 
          className="text-text-secondary text-sm border-b border-transparent pb-2 focus:border-border focus:outline-none" 
          contentEditable 
          onBlur={(e) => setFormDescription(e.target.textContent)}
          suppressContentEditableWarning
        >
          {formDescription}
        </div>
      </div>

      {questions.map((q, index) => (
        <div key={q.id} className="question-container p-6 mb-3">
          <div className="flex items-center mb-4">
            <input
              type="text"
              className="question-input"
              placeholder="Question"
              value={q.question}
              onChange={(e) => updateQuestion(q.id, 'question', e.target.value)}
            />
            
            <div className="relative ml-4">
              <button 
                className="type-button"
                onClick={() => toggleMenu(q.id)}
              >
                {questionTypes.find(t => t.id === q.type)?.label}
                <FaChevronDown className="ml-1" />
              </button>
              
              {activeMenu === q.id && (
                <div className="absolute top-full left-0 bg-white rounded shadow-md w-48 z-10">
                  {questionTypes.map(type => (
                    <div
                      key={type.id}
                      className="flex items-center px-4 py-3 hover:bg-secondary cursor-pointer"
                      onClick={() => changeQuestionType(q.id, type.id)}
                    >
                      <span className="mr-3">{type.icon}</span>
                      {type.label}
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <label className="flex items-center text-text-secondary text-sm ml-4">
              <div className="switch">
                <input
                  type="checkbox"
                  checked={q.required}
                  onChange={(e) => updateQuestion(q.id, 'required', e.target.checked)}
                  className="opacity-0 w-0 h-0"
                />
                <span className="slider"></span>
              </div>
              <span className="ml-2">Required</span>
            </label>
            
            {index > 0 && (
              <button
                className="ml-4 text-text-secondary hover:text-error"
                onClick={() => removeQuestion(q.id)}
              >
                <FaTrash />
              </button>
            )}
          </div>
          
          <div className="ml-6">
            {renderQuestionContent(q)}
            
            {(q.type === 'radio' || q.type === 'checkbox') && (
              <div className="mt-4">
                {q.options.map((option, i) => (
                  <div key={i} className="flex items-center mb-3">
                    <input
                      type={q.type === 'checkbox' ? 'checkbox' : 'radio'}
                      disabled
                      className="mr-3"
                    />
                    <input
                      type="text"
                      className="option-input"
                      placeholder={`Option ${i + 1}`}
                      value={option}
                      onChange={(e) => updateOption(q.id, i, e.target.value)}
                    />
                    {i >= 2 && (
                      <button
                        className="ml-2 text-text-secondary hover:text-error"
                        onClick={() => removeOption(q.id, i)}
                      >
                        <FaTrash size={14} />
                      </button>
                    )}
                  </div>
                ))}
                
                <button
                  className="add-option"
                  onClick={() => addOption(q.id)}
                >
                  <FaPlus className="mr-2" />
                  Add Option
                </button>
              </div>
            )}
          </div>
        </div>
      ))}
      
      <div className="flex justify-between mt-6">
        <button
          className="bg-white text-primary px-6 py-2 rounded border border-border hover:bg-secondary flex items-center"
          onClick={() => addQuestion()}
        >
          <FaPlus className="mr-2" />
          Add Question
        </button>
        
        <div className="flex gap-3">
          <button
            className="bg-primary text-black px-6 py-2 rounded hover:bg-primary-dark flex items-center"
            onClick={handlePublish}
          >
            <FaPaperPlane className="mr-2" />
            Publish
          </button>
        </div>
      </div>
    </div>
  );
};

export default FormBuilder;