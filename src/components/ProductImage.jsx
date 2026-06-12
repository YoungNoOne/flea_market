import { useEffect, useState } from "react";

export default function ProductImage({ src, alt, className = "" }) {
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [src]);

  if (!src || failed) {
    return (
      <div className={`image-fallback ${className}`} role="img" aria-label={`${alt} 图片暂不可用`}>
        <span>{alt}</span>
        <small>图片待同步</small>
      </div>
    );
  }

  return <img className={className} src={src} alt={alt} loading="lazy" onError={() => setFailed(true)} />;
}
