import React, { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { getExamStudent, submitExam } from '../../utils/services/exams';

const ExamAttempt = ({ examId }) => {
  const [exam, setExam] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(null);

  useEffect(() => {
    const id = window.location.pathname.split('/').pop();
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const { data } = await getExamStudent(id);
        setExam(data.exam);
        setQuestions(data.questions || []);
      } catch (err) {
        setError(err.response?.data?.error || err.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const onSubmit = async () => {
    if (!exam) return;
    const payload = {
      answers: Object.entries(answers).map(([questionId, chosenIndex]) => ({ questionId, chosenIndex }))
    };
    try {
      setLoading(true);
      const { data } = await submitExam(exam.id, payload);
      setSubmitted(data);
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex">
      <Sidebar />
      <div className="flex-1 p-6 space-y-6">
        <h1 className="font-comic text-2xl">{exam ? exam.title : 'Exam'}</h1>
        {loading && <div className="text-bw-62">Loading...</div>}
        {error && <div className="text-bw-62">{error}</div>}
        {submitted ? (
          <Card className="p-4">
            <div className="font-comic text-lg">Submitted</div>
            <div>Score: {submitted.score}%</div>
            <div>Correct: {submitted.correct} / {submitted.total}</div>
          </Card>
        ) : (
          <div className="space-y-4">
            {questions.map((q) => (
              <Card key={q.id} className="p-4">
                <div className="font-comic mb-2">{q.text}</div>
                <div className="space-y-1">
                  {q.options.map((opt, idx) => (
                    <label key={idx} className="flex items-center gap-2">
                      <input
                        type="radio"
                        name={`q-${q.id}`}
                        onChange={() => setAnswers({ ...answers, [q.id]: idx })}
                        checked={answers[q.id] === idx}
                      />
                      <span>{opt}</span>
                    </label>
                  ))}
                </div>
              </Card>
            ))}
            {questions.length > 0 && (
              <Button onClick={onSubmit}>Submit Exam</Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ExamAttempt;