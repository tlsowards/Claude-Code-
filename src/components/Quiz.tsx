import { useState } from 'react';
import type { QuizQuestion } from '../data/types';

export default function Quiz({ questions }: { questions: QuizQuestion[] }) {
  const [picked, setPicked] = useState<Record<number, number>>({});
  const answered = Object.keys(picked).length;
  const correct = questions.filter((q, i) => picked[i] === q.answer).length;

  return (
    <section id="knowledge-check" className="no-print">
      <div className="section-title"><h2>Knowledge check</h2></div>
      <p className="meta">Three questions from this week's brief. Pick an answer to see the teaching point. Nothing is recorded.</p>
      {questions.map((q, i) => {
        const chosen = picked[i];
        const done = chosen !== undefined;
        return (
          <div className="card quiz" key={i}>
            <h3>{i + 1}. {q.q}</h3>
            <div className="quiz-options">
              {q.options.map((opt, j) => {
                let cls = 'quiz-option';
                if (done && j === q.answer) cls += ' correct';
                else if (done && j === chosen) cls += ' wrong';
                return (
                  <button key={j} type="button" className={cls} disabled={done} onClick={() => setPicked({ ...picked, [i]: j })} aria-pressed={chosen === j}>
                    <span className="quiz-letter">{String.fromCharCode(65 + j)}</span> {opt}
                  </button>
                );
              })}
            </div>
            {done && (
              <div className={`callout ${chosen === q.answer ? '' : 'warn'}`} style={{ marginBottom: 0 }}>
                <strong>{chosen === q.answer ? 'Correct.' : `Not quite. The answer is ${String.fromCharCode(65 + q.answer)}.`}</strong> {q.teach}
              </div>
            )}
          </div>
        );
      })}
      {answered === questions.length && (
        <p className="callout"><strong>{correct} of {questions.length}.</strong> {correct === questions.length ? 'Take the roll call brief to your next briefing.' : 'Re-read the cases you missed above, then print the roll call brief for your next briefing.'}</p>
      )}
    </section>
  );
}
