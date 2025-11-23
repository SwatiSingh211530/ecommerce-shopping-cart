import React, { useState } from 'react';

const ImageWithFallback = ({ src, alt, className, ...props }) => {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentSrc, setCurrentSrc] = useState(src);

  const handleError = (e) => {
    console.log('Image failed to load:', currentSrc);
    setHasError(true);
    setIsLoading(false);
    
    // Try different fallback strategies based on file extension
    if (currentSrc && currentSrc.includes('.avif')) {
      // Try replacing .avif with .webp first
      const webpSrc = currentSrc.replace('.avif', '.webp');
      console.log('Trying webp fallback:', webpSrc);
      setCurrentSrc(webpSrc);
      e.target.src = webpSrc;
      setHasError(false);
      setIsLoading(true);
      return;
    }
    
    if (currentSrc && currentSrc.includes('.webp') && !currentSrc.includes('panty.avif')) {
      // Try replacing .webp with .jpg
      const jpgSrc = currentSrc.replace('.webp', '.jpg');
      console.log('Trying jpg fallback:', jpgSrc);
      setCurrentSrc(jpgSrc);
      e.target.src = jpgSrc;
      setHasError(false);
      setIsLoading(true);
      return;
    }

    // For ladies garments, try using the generic panty.avif image
    if (alt && alt.toLowerCase().includes('bra') || alt.toLowerCase().includes('panty') || alt.toLowerCase().includes('underwear')) {
      const fallbackSrc = `${process.env.PUBLIC_URL}/images/panty.avif`;
      if (currentSrc !== fallbackSrc) {
        console.log('Trying ladies garments fallback:', fallbackSrc);
        setCurrentSrc(fallbackSrc);
        e.target.src = fallbackSrc;
        setHasError(false);
        setIsLoading(true);
        return;
      }
    }
    
    // Use placeholder as last resort
    const placeholderSrc = `https://via.placeholder.com/300x250/f8f9fa/666?text=${encodeURIComponent(alt)}`;
    console.log('Using placeholder:', placeholderSrc);
    e.target.src = placeholderSrc;
  };

  const handleLoad = () => {
    console.log('Image loaded successfully:', currentSrc);
    setIsLoading(false);
    setHasError(false);
  };

  return (
    <div className="image-container" style={{ position: 'relative' }}>
      {isLoading && (
        <div className="image-loading" style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          fontSize: '12px',
          color: '#666',
          background: 'rgba(255,255,255,0.8)',
          padding: '5px 10px',
          borderRadius: '3px'
        }}>
          Loading...
        </div>
      )}
      <img
        src={currentSrc || `https://via.placeholder.com/300x250?text=${encodeURIComponent(alt)}`}
        alt={alt}
        className={className}
        onError={handleError}
        onLoad={handleLoad}
        style={{
          opacity: isLoading ? 0.7 : 1,
          transition: 'opacity 0.3s ease',
          ...props.style
        }}
        {...props}
      />
    </div>
  );
};

export default ImageWithFallback;