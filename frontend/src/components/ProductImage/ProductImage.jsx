import { useState } from 'react';
import styles from './ProductImage.module.css';

const ProductImage = ({ src, alt, className }) => {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // SVG placeholder inline
  const placeholderSVG = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400' viewBox='0 0 400 400'%3E%3Crect width='400' height='400' fill='%23f5f5f5'/%3E%3Cg transform='translate(200, 200)'%3E%3Ccircle r='50' fill='%23d0d0d0'/%3E%3Cpath d='M-20,-10 L20,-10 L10,20 L-10,20 Z' fill='%23f5f5f5'/%3E%3Crect x='-8' y='-25' width='16' height='20' rx='2' fill='%23f5f5f5'/%3E%3C/g%3E%3Ctext x='200' y='280' text-anchor='middle' font-family='Arial' font-size='16' fill='%23999'%3ESem Imagem%3C/text%3E%3C/svg%3E`;

  // Se não há src ou deu erro, mostra placeholder
  const shouldShowPlaceholder = !src || hasError || src === 'null' || src === 'undefined' || src.trim() === '';
  const imageSrc = shouldShowPlaceholder ? placeholderSVG : src;

  const handleLoad = () => {
    setIsLoading(false);
  };

  const handleError = () => {
    setHasError(true);
    setIsLoading(false);
  };

  return (
    <div className={`${styles.container} ${className || ''}`}>
      {isLoading && !shouldShowPlaceholder && (
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
        </div>
      )}
      <img
        src={imageSrc}
        alt={alt || 'Produto'}
        className={`${styles.image} ${isLoading ? styles.imageLoading : ''}`}
        onLoad={handleLoad}
        onError={handleError}
        loading="lazy"
      />
    </div>
  );
};

export default ProductImage;
