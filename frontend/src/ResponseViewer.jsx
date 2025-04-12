
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
    <div className="max-w-6xl mx-auto p-6">
       
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">{form?.title}</h1>
          <p className="text-gray-600">{form?.description}</p>
        </div>
        <button
          onClick={() => navigate('/published', {
            state: {
              formId: formId,
              link: `${FRONTEND_URL}/respond/${formId}`
            }
          })}
          className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 text-sm"
        >
          Back to Form
        </button>
      </div>
      
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  #
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Submission Date
                </th>
                {form?.questions.map((question) => (
                  <th key={question.questionId} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {question.question}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {responses.map((response, idx) => (
                <tr key={response._id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {idx + 1}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(response.submittedAt).toLocaleString()}
                  </td>
                  {form?.questions.map((question) => {
                    const answer = response.responses.find(r => r.questionId === question.questionId)?.answer;
                    return (
                      <td key={question.questionId} className="px-6 py-4 text-sm text-gray-500">
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
      
      {responses.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          No responses yet for this form
        </div>
      )}
    </div>
  );
};

export default ResponsesViewer;