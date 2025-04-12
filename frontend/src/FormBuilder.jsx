import { useState, useEffect } from 'react';
import { FaPlus, FaTrash, FaPaperPlane, FaChevronDown, FaCheck, FaAlignLeft, FaCheckSquare, FaCalendarAlt, FaCopy } from 'react-icons/fa';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const questionTypes = [
  { id: 'text', label: 'Short', icon: <FaAlignLeft />, mobileLabel: 'Text' },
  { id: 'paragraph', label: 'Paragraph', icon: <FaAlignLeft />, mobileLabel: 'Long Text' },
  { id: 'radio', label: 'Multiple', icon: <FaCheck />, mobileLabel: 'Multi' },
  { id: 'checkbox', label: 'Checkboxes', icon: <FaCheckSquare />, mobileLabel: 'Check' },
  { id: 'date', label: 'Date', icon: <FaCalendarAlt />, mobileLabel: 'Date' },
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
      <div className="max-w-2xl mx-auto p-4 sm:p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-xl sm:text-2xl font-bold mb-4">Form Published!</h2>
        <p className="mb-4 text-sm sm:text-base">Share this link with respondents:</p>
        
        <div className="flex items-center mb-6 p-2 sm:p-3 bg-gray-100 rounded">
          <input
            type="text"
            value={link}
            readOnly
            className="flex-1 bg-transparent outline-none text-xs sm:text-sm"
          />
          <button
            onClick={copyToClipboard}
            className="ml-2 text-primary hover:text-primary-dark flex items-center text-sm sm:text-base"
            title="Copy to clipboard"
          >
            <FaCopy className="mr-1" />
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>
        
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
          <button
            onClick={() => setPublishedData({...publishedData, isPublished: false})}
            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 text-sm sm:text-base"
          >
            Back to Form
          </button>
          <button
            onClick={() => navigate(`/responses/${formId}`)}
            className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 text-sm sm:text-base"
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
        return <input type="text" className="text-input w-full py-2 px-1 text-sm sm:text-base" disabled placeholder="Short answer text" />;
      case 'paragraph':
        return <textarea className="text-input w-full py-2 px-1 text-sm sm:text-base" disabled placeholder="Long answer text" rows="3"></textarea>;
      case 'date':
        return <input type="date" className="text-input w-full py-2 px-1 text-sm sm:text-base" disabled />;
      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto max-w-3xl p-3 sm:p-5">
      {/* Form Header */}
      <div className="form-header p-4 sm:p-6 mb-3">
        <h1 
          className="text-xl sm:text-3xl font-normal mb-3 sm:mb-4 border-b border-transparent pb-2 focus:border-border focus:outline-none" 
          contentEditable 
          onBlur={(e) => setFormTitle(e.target.textContent)}
          suppressContentEditableWarning
        >
          {formTitle}
        </h1>
        <div 
          className="text-text-secondary text-xs sm:text-sm border-b border-transparent pb-2 focus:border-border focus:outline-none" 
          contentEditable 
          onBlur={(e) => setFormDescription(e.target.textContent)}
          suppressContentEditableWarning
        >
          {formDescription}
        </div>
      </div>

      {/* Questions List */}
      {questions.map((q, index) => (
        <div key={q.id} className="question-container p-4 sm:p-6 mb-3 rounded-lg bg-white shadow-sm">
          {/* Question Header Row */}
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            {/* Question Input */}
            <input
              type="text"
              className="question-input flex-1 py-2 px-3 text-sm sm:text-base border-b border-gray-300 focus:border-purple-500 focus:outline-none"
              placeholder="Question"
              value={q.question}
              onChange={(e) => updateQuestion(q.id, 'question', e.target.value)}
            />
            
            {/* Question Type Dropdown */}
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="relative">
                <button 
                  className="flex items-center justify-between bg-gray-100 hover:bg-gray-200 rounded px-3 py-2 text-xs sm:text-sm min-w-[80px] sm:min-w-[120px] transition-colors"
                  onClick={() => toggleMenu(q.id)}
                >
                  <span className="hidden sm:inline">{questionTypes.find(t => t.id === q.type)?.label}</span>
                  <span className="sm:hidden">{questionTypes.find(t => t.id === q.type)?.mobileLabel}</span>
                  <FaChevronDown className="ml-2" size={12} />
                </button>
                
                {activeMenu === q.id && (
                  <div className="absolute z-20 mt-1 w-full sm:w-48 bg-white rounded-md shadow-lg border border-gray-200">
                    {questionTypes.map(type => (
                      <div
                        key={type.id}
                        className="flex items-center px-3 py-2 text-sm hover:bg-gray-100 cursor-pointer"
                        onClick={() => changeQuestionType(q.id, type.id)}
                      >
                        <span className="mr-2 text-gray-600">{type.icon}</span>
                        <span className="sm:hidden">{type.mobileLabel}</span>
                        <span className="hidden sm:inline">{type.label}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Required Toggle */}
              <label className="flex items-center text-xs sm:text-sm whitespace-nowrap">
                <div className="switch mr-1">
                  <input
                    type="checkbox"
                    checked={q.required}
                    onChange={(e) => updateQuestion(q.id, 'required', e.target.checked)}
                    className="opacity-0 w-0 h-0"
                  />
                  <span className="slider"></span>
                </div>
                Required
              </label>

              {/* Delete Button (not for first question) */}
              {index > 0 && (
                <button
                  className="text-gray-500 hover:text-red-500 p-1"
                  onClick={() => removeQuestion(q.id)}
                  aria-label="Delete question"
                >
                  <FaTrash size={14} />
                </button>
              )}
            </div>
          </div>

          {/* Question Content */}
          <div className="ml-0 sm:ml-6">
            {renderQuestionContent(q)}
            
            {/* Options for radio/checkbox */}
            {(q.type === 'radio' || q.type === 'checkbox') && (
              <div className="mt-3 space-y-2">
                {q.options.map((option, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <input
                      type={q.type === 'checkbox' ? 'checkbox' : 'radio'}
                      disabled
                      className="flex-none"
                    />
                    <input
                      type="text"
                      className="option-input flex-1 py-1 px-2 text-sm sm:text-base border-b border-gray-300 focus:border-purple-500 focus:outline-none"
                      placeholder={`Option ${i + 1}`}
                      value={option}
                      onChange={(e) => updateOption(q.id, i, e.target.value)}
                    />
                    {i >= 2 && (
                      <button
                        className="text-gray-400 hover:text-red-500 p-1"
                        onClick={() => removeOption(q.id, i)}
                        aria-label="Remove option"
                      >
                        <FaTrash size={12} />
                      </button>
                    )}
                  </div>
                ))}
                
                <button
                  className="mt-2 text-xs sm:text-sm text-purple-600 hover:text-purple-800 flex items-center"
                  onClick={() => addOption(q.id)}
                >
                  <FaPlus className="mr-1" size={10} />
                  Add Option
                </button>
              </div>
            )}
          </div>
        </div>
      ))}

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 mt-6">
        <button
          className="flex-1 sm:flex-none bg-white text-purple-600 px-4 py-2 rounded border border-purple-600 hover:bg-purple-50 flex items-center justify-center text-sm sm:text-base"
          onClick={() => addQuestion()}
        >
          <FaPlus className="mr-2" size={12} />
          Add Question
        </button>
        
        <button
  className="flex-1 text-black px-4 py-2 rounded flex items-center justify-center sm:justify-end text-sm sm:text-base cursor-pointer"
  onClick={handlePublish}
>
  <FaPaperPlane className="mr-3" size={12} />
  Publish
</button>

      </div>
    </div>
  );
};

export default FormBuilder;