import React, { useState } from 'react';
import styles from './index.module.css';

export default function PollModal({ onClose }) {
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['', '']);

  const addOption = () => setOptions([...options, '']);
  const updateOption = (i, value) => {
    const newOptions = [...options];
    newOptions[i] = value;
    setOptions(newOptions);
  };

  const handleSubmit = () => {
    // TODO: send poll data via socket or API
    console.log({ question, options });
    onClose();
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modal}>
        <h2>Create Poll</h2>
        <input
          type="text"
          placeholder="Question"
          value={question}
          onChange={e => setQuestion(e.target.value)}
        />
        {options.map((opt, idx) => (
          <input
            key={idx}
            type="text"
            placeholder={`Option ${idx + 1}`}
            value={opt}
            onChange={e => updateOption(idx, e.target.value)}
          />
        ))}
        <button onClick={addOption}>Add Option</button>
        <div className={styles.buttons}>
          <button onClick={handleSubmit}>Submit Poll</button>
          <button onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
}
