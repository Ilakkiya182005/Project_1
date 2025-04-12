import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

const FormResponder = () => {
    const API_URL = import.meta.env.VITE_API_URL;
   
  const { formId } = useParams();
  const [form, setForm] = useState(null);
  const [responses, setResponses] = useState({});
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    const fetchForm = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/forms/${formId}`);
        setForm(response.data);
        
        // Initialize responses object
        const initialResponses = {};
        response.data.questions.forEach(question => {
          initialResponses[question.questionId] = question.type === 'checkbox' ? [] : question.type === 'date' ? '' : 
          '';
        });
        setResponses(initialResponses);
      } catch (error) {
        console.error('Error fetching form:', error);
      }
    };
    
    fetchForm();
  }, [formId]);

  const handleResponseChange = (questionId, value) => {
    setResponses(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/api/forms/${formId}/responses`, {
        responses: Object.entries(responses).map(([questionId, answer]) => ({
          questionId,
          answer
        }))
      });
      setIsSubmitted(true);
    } catch (error) {
      console.error('Error submitting response:', error);
    }
  };

  if (!form) return <div className="flex justify-center items-center h-screen">Loading form...</div>;
  
  if (isSubmitted) {
    return (
      <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-sm text-center mt-8">
        <div className="p-8">
          <svg className="mx-auto h-12 w-12 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <h2 className="mt-4 text-2xl font-medium text-gray-900">Your response has been recorded</h2>
          <p className="mt-2 text-gray-600">Thank you for completing the form.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f0ebf8] py-8 px-4">
  <div className="max-w-2xl mx-auto">
    {/* Form Header */}
    <div className="bg-white rounded-t-lg shadow-sm p-6 sm:p-8 mb-4">
      <h1 className="text-xl sm:text-2xl font-medium text-gray-900 mb-2">{form.title}</h1>
      <p className="text-sm sm:text-base text-gray-600">{form.description}</p>
    </div>

    {/* Questions */}
    <form onSubmit={handleSubmit} className="space-y-4">
      {form.questions.map((question) => (
        <div key={question.questionId} className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
          <div className="mb-4">
            <label className="block text-sm sm:text-base font-medium text-gray-700 mb-1">
              {question.question}
              {question.required && <span className="text-red-500 ml-1">*</span>}
            </label>

            {/* Text Input */}
            {question.type === 'text' && (
              <input
                type="text"
                className="w-full p-2 border-b border-gray-300 focus:border-purple-500 focus:outline-none"
                value={responses[question.questionId] || ''}
                onChange={(e) => handleResponseChange(question.questionId, e.target.value)}
                required={question.required}
              />
            )}
            {/* After other input types */}
            {question.type === 'date' && (
                   <input
                       type="date"
                      className="w-full p-2 border-b border-gray-300 focus:border-purple-500 focus:outline-none"
                      value={responses[question.questionId] || ''}
                      onChange={(e) => handleResponseChange(question.questionId, e.target.value)}
                      required={question.required}
                  />
            )}

            {/* Paragraph Input */}
            {question.type === 'paragraph' && (
              <textarea
                className="w-full p-2 border-b border-gray-300 focus:border-purple-500 focus:outline-none"
                rows={3}
                value={responses[question.questionId] || ''}
                onChange={(e) => handleResponseChange(question.questionId, e.target.value)}
                required={question.required}
              />
            )}

            {/* Radio Buttons */}
            {question.type === 'radio' && (
              <div className="space-y-2 mt-3">
                {question.options.map((option, i) => (
                  <div key={i} className="flex items-center">
                    <input
                      type="radio"
                      name={question.questionId}
                      value={option}
                      checked={responses[question.questionId] === option}
                      onChange={() => handleResponseChange(question.questionId, option)}
                      required={question.required}
                      className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300"
                    />
                    <label className="ml-3 text-sm text-gray-700">{option}</label>
                  </div>
                ))}
              </div>
            )}

            {/* Checkboxes */}
            {question.type === 'checkbox' && (
              <div className="space-y-2 mt-3">
                {question.options.map((option, i) => (
                  <div key={i} className="flex items-center">
                    <input
                      type="checkbox"
                      value={option}
                      checked={responses[question.questionId]?.includes(option) || false}
                      onChange={(e) => {
                        const current = responses[question.questionId] || [];
                        const updated = e.target.checked
                          ? [...current, option]
                          : current.filter(item => item !== option);
                        handleResponseChange(question.questionId, updated);
                      }}
                      className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                    />
                    <label className="ml-3 text-sm text-gray-700">{option}</label>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ))}

      {/* Submit Button */}
      <div className="sm:p-6 text-center">
        <button
          type="submit"
          className="w-full sm:w-auto px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
        >
          Submit
        </button>
      </div>
    </form>
  </div>
</div>

  );
};

export default FormResponder;