import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const ResponsesViewer = () => {
  const API_URL = import.meta.env.VITE_API_URL;
  const FRONTEND_URL = import.meta.env.VITE_FRONTEND_URL;
  const { formId } = useParams();
  const [form, setForm] = useState(null);
  const [responses, setResponses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [formRes, responsesRes] = await Promise.all([
          axios.get(`${API_URL}/api/forms/${formId}`),
          axios.get(`${API_URL}/api/forms/${formId}/responses`)
        ]);
        
        setForm(formRes.data);
        setResponses(responsesRes.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [formId]);

  if (isLoading) return <div className="text-center py-8">Loading responses...</div>;

  return (
    <div className="max-w-6xl mx-auto p-3 sm:p-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
        <div className="w-full">
          <h1 className="text-xl sm:text-2xl font-bold break-words">{form?.title}</h1>
          <p className="text-gray-600 text-sm sm:text-base break-words">{form?.description}</p>
        </div>
        <button
          onClick={() => navigate('/published', {
            state: {
              formId: formId,
              link: `${FRONTEND_URL}/respond/${formId}`
            }
          })}
          className="w-full sm:w-auto px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 text-sm cursor-pointer whitespace-nowrap"
        >
          Back to Form
        </button>
      </div>
      
      {/* Responses Table - Desktop View */}
      <div className="hidden sm:block bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  #
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Submission Date
                </th>
                {form?.questions.map((question) => (
                  <th key={question.questionId} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {question.question}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {responses.map((response, idx) => (
                <tr key={response._id}>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                    {idx + 1}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                    {new Date(response.submittedAt).toLocaleString()}
                  </td>
                  {form?.questions.map((question) => {
                    const answer = response.responses.find(r => r.questionId === question.questionId)?.answer;
                    return (
                      <td key={question.questionId} className="px-4 py-3 text-sm text-gray-500">
                        {Array.isArray(answer) ? (
                          <ul className="list-disc pl-5">
                            {answer.map((item, i) => (
                              <li key={i}>{item}</li>
                            ))}
                          </ul>
                        ) : (
                          answer || '-'
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Mobile Cards View */}
      <div className="sm:hidden space-y-4">
        {responses.map((response, idx) => (
          <div key={response._id} className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex justify-between items-start mb-3">
              <span className="text-sm font-medium text-gray-700">#{idx + 1}</span>
              <span className="text-xs text-gray-500">
                {new Date(response.submittedAt).toLocaleString()}
              </span>
            </div>
            
            <div className="space-y-3">
              {form?.questions.map((question) => {
                const answer = response.responses.find(r => r.questionId === question.questionId)?.answer;
                return (
                  <div key={question.questionId} className="border-b border-gray-100 pb-2 last:border-0">
                    <p className="text-xs font-medium text-gray-500 mb-1">{question.question}</p>
                    <div className="text-sm text-gray-700">
                      {Array.isArray(answer) ? (
                        <ul className="list-disc pl-4">
                          {answer.map((item, i) => (
                            <li key={i}>{item}</li>
                          ))}
                        </ul>
                      ) : (
                        answer || '-'
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
      
      {responses.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          No responses yet for this form
        </div>
      )}
    </div>
  );
};

export default ResponsesViewer;