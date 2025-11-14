import { useState } from 'react';
import styles from './ImageTooltip.module.css';

const ImageTooltip = ({ src, alt, children }) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const placeholderSVG = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400' viewBox='0 0 400 400'%3E%3Crect width='400' height='400' fill='%23f5f5f5'/%3E%3Cg transform='translate(200, 200)'%3E%3Ccircle r='50' fill='%23d0d0d0'/%3E%3Cpath d='M-20,-10 L20,-10 L10,20 L-10,20 Z' fill='%23f5f5f5'/%3E%3Crect x='-8' y='-25' width='16' height='20' rx='2' fill='%23f5f5f5'/%3E%3C/g%3E%3Ctext x='200' y='280' text-anchor='middle' font-family='Arial' font-size='16' fill='%23999'%3ESem Imagem%3C/text%3E%3C/svg%3E`;

  const handleMouseEnter = (e) => {
    if (!src || src === 'null' || src === 'undefined' || src === null) return;
    setShowTooltip(true);
    updatePosition(e);
  };

  const handleMouseMove = (e) => {
    if (showTooltip) {
      updatePosition(e);
    }
  };

  const handleMouseLeave = () => {
    setShowTooltip(false);
  };

  const updatePosition = (e) => {
    const offset = 20;
    setPosition({
      x: e.clientX + offset,
      y: e.clientY + offset
    });
  };

  const imageSrc = (!src || src === 'null' || src === 'undefined' || src === null) ? placeholderSVG : src;

  return (
    <div
      className={styles.container}
      onMouseEnter={handleMouseEnter}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {children}

      {showTooltip && (
        <div
          className={styles.tooltip}
          style={{
            left: `${position.x}px`,
            top: `${position.y}px`
          }}
        >
          <img
            src={imageSrc}
            alt={alt || 'Preview'}
            className={styles.tooltipImage}
          />
        </div>
      )}
    </div>
  );
};

export default ImageTooltip;
