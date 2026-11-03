import { Image, type ImageProps } from "expo-image";
import { useState } from "react";

export function UIImage({
  source,
  fallback,
  onError,
  ...props
}: ImageProps & { fallback: ImageProps["source"] }) {
  const [failedSource, setFailedSource] = useState<ImageProps["source"]>();
  return (
    <Image
      {...props}
      source={!source || failedSource === source ? fallback : source}
      onError={(event) => {
        setFailedSource(source);
        onError?.(event);
      }}
    />
  );
}
