import React, { useCallback } from 'react';

export const FileDropZone: React.FC<{ onFiles: (fl: FileList) => void }> = ({ onFiles }) => {
  const onChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) onFiles(e.target.files);
  }, [onFiles]);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files) onFiles(e.dataTransfer.files);
  }, [onFiles]);

  const onDragOver = useCallback((e: React.DragEvent) => { e.preventDefault(); }, []);

  return (
    <div onDrop={onDrop} onDragOver={onDragOver} style={{ border: '2px dashed #666', padding: '1rem', marginBottom: '1rem' }}>
      <p>Drop EDF/XLSX file here or select:</p>
      <input type="file" accept=".edf,.xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" onChange={onChange} />
    </div>
  );
};
