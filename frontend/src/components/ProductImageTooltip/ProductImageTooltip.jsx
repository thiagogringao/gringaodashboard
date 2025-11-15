import { useState, useEffect } from 'react';
import api from '../../services/api';
import styles from './ProductImageTooltip.module.css';

const ProductImageTooltip = ({ codigo, children, tipo = 'loja-fisica' }) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageUrl, setImageUrl] = useState(null);

  // Buscar URL da imagem quando o tooltip abrir
  useEffect(() => {
    if (showTooltip && !imageUrl && !imageError) {
      const fetchImageUrl = async () => {
        try {
          const endpoint = tipo === 'ecommerce'
            ? `/api/produtos/ecommerce/${codigo}/imagem`
            : `/api/produtos/loja-fisica/${codigo}/imagem`;
          
          const response = await api.get(endpoint);
          
          if (response.data.success && response.data.url) {
            console.log(`✅ URL da imagem obtida: ${codigo}`, response.data.url);
            setImageUrl(response.data.url);
          } else {
            throw new Error('URL não encontrada');
          }
        } catch (error) {
          console.error(`❌ Erro ao buscar URL da imagem: ${codigo}`, error);
          setImageError(true);
        }
      };
      
      fetchImageUrl();
    }
  }, [showTooltip, codigo, tipo, imageUrl, imageError]);

  const handleImageLoad = () => {
    console.log(`✅ Imagem carregada: ${codigo}`);
    setImageLoaded(true);
    setImageError(false);
  };

  const handleImageError = (e) => {
    console.error(`❌ Erro ao carregar imagem: ${codigo}`, e);
    console.log(`URL tentada: ${imageUrl}`);
    setImageError(true);
    setImageLoaded(false);
  };

  return (
    <div 
      className={styles.container}
      onMouseEnter={() => {
        console.log(`🖼️ Abrindo tooltip para: ${codigo}`);
        setShowTooltip(true);
      }}
      onMouseLeave={() => {
        setShowTooltip(false);
        setImageError(false);
        setImageLoaded(false);
        setImageUrl(null);
      }}
    >
      {children}
      
      {showTooltip && (
        <div className={styles.tooltip}>
          {!imageError ? (
            <>
              {!imageUrl && (
                <div className={styles.loading}>
                  <div className={styles.spinner}></div>
                  <p>Carregando...</p>
                </div>
              )}
              {imageUrl && (
                <>
                  {!imageLoaded && (
                    <div className={styles.loading}>
                      <div className={styles.spinner}></div>
                      <p>Carregando imagem...</p>
                    </div>
                  )}
                  <img 
                    src={imageUrl}
                    alt={`Produto ${codigo}`}
                    className={styles.image}
                    onLoad={handleImageLoad}
                    onError={handleImageError}
                    style={{ display: imageLoaded ? 'block' : 'none' }}
                  />
                  {imageLoaded && <div className={styles.codigo}>{codigo}</div>}
                </>
              )}
            </>
          ) : (
            <div className={styles.noImage}>
              <span className={styles.noImageIcon}>📦</span>
              <p className={styles.noImageText}>Sem imagem disponível</p>
              <div className={styles.codigo}>{codigo}</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ProductImageTooltip;
