import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import type { Cycle } from '../../domain/types';
import { FullDatasetChart } from './FullDatasetChart';

export interface CycleDetailsModalProps {
  cycle: Cycle;
  onClose: () => void;
}

export const CycleDetailsModal: React.FC<CycleDetailsModalProps> = ({ cycle, onClose }) => {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return createPortal(
    <div style={backdropStyle} onClick={onClose}>
      <div
        style={modalStyle}
        role="dialog"
        aria-modal="true"
        aria-labelledby={modalTitleId(cycle.cycle)}
        onClick={(event) => event.stopPropagation()}
      >
        <div style={modalHeaderStyle}>
          <h2 id={modalTitleId(cycle.cycle)} style={{ margin: 0 }}>
            Детализация цикла {cycle.cycle}
          </h2>
          <button type="button" onClick={onClose} style={closeButtonStyle}>
            Закрыть
          </button>
        </div>
        <div style={{ flex: 1, minHeight: 0 }}>
          <FullDatasetChart
            cycles={[cycle]}
            showControls={false}
            highlightCycle={cycle.cycle}
            height={380}
            initialShowCurrent
          />
        </div>
      </div>
    </div>,
    document.body,
  );
};

const modalTitleId = (cycleId: number) => `cycle-modal-${cycleId}`;

const backdropStyle: React.CSSProperties = {
  position: 'fixed',
  inset: 0,
  background: 'rgba(15, 23, 42, 0.45)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '2rem',
  zIndex: 1000,
};

const modalStyle: React.CSSProperties = {
  width: 'min(960px, 100%)',
  background: 'white',
  borderRadius: 16,
  boxShadow: '0 24px 48px rgba(15, 23, 42, 0.35)',
  display: 'flex',
  flexDirection: 'column',
  gap: '1rem',
  padding: '1.25rem 1.5rem 1.5rem',
  maxHeight: '90vh',
};

const modalHeaderStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
};

const closeButtonStyle: React.CSSProperties = {
  border: 'none',
  background: 'rgba(15,23,42,0.08)',
  borderRadius: 999,
  padding: '0.4rem 0.9rem',
  cursor: 'pointer',
  fontSize: 14,
};
