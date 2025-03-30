import { useState, useEffect } from 'react';
import Image from 'next/image';

const ImageWithFallback = ({ src, fallbackSrc, ...props }) => {
  const [imgSrc, setImgSrc] = useState(src);

  useEffect(() => {
    setImgSrc(src);
  }, [src]);

  return (
    <Image
      {...props}
      src={imgSrc}
      onError={() => setImgSrc(fallbackSrc)}
    />
  );
};

export default ImageWithFallback;