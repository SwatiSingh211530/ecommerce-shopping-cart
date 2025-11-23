// Debug utility to test image loading
export const testImageLoading = () => {
  const testImages = [
    '/images/Lace Push-Up Bra - Black.avif',
    '/images/Sports Bra - Pink.avif',
    '/images/panty.avif',
    '/images/Wireless Comfort Bra - Nude.webp',
    '/images/T-Shirt Bra - Beige.webp'
  ];

  console.log('Testing image loading...');
  
  testImages.forEach(imagePath => {
    const img = new Image();
    img.onload = () => {
      console.log(`✅ Image loaded successfully: ${imagePath}`);
    };
    img.onerror = () => {
      console.log(`❌ Failed to load image: ${imagePath}`);
    };
    img.src = process.env.PUBLIC_URL + imagePath;
  });
};

export const logPublicUrl = () => {
  console.log('PUBLIC_URL:', process.env.PUBLIC_URL);
  console.log('Current origin:', window.location.origin);
};