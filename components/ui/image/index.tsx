'use client';
import React from 'react';
import { ImageProps, Platform, Image as RNImage } from 'react-native';

const imageStyle = {
  '2xs': 'h-6 w-6',
  'xs': 'h-10 w-10', 
  'sm': 'h-16 w-16',
  'md': 'h-20 w-20',
  'lg': 'h-24 w-24',
  'xl': 'h-32 w-32',
  '2xl': 'h-64 w-64',
  'full': 'h-full w-full',
  'none': ''
};

type IImageProps = ImageProps & {
  size?: keyof typeof imageStyle;
  alt?: string;
  className?: string;
};

const Image = React.forwardRef<React.ElementRef<typeof RNImage>, IImageProps>(
  ({ size = 'md', alt, className, style, ...props }, ref) => {
    return (
      <RNImage
        ref={ref}
        style={[
          Platform.OS === 'web' 
            ? { height: 'revert-layer' as any, width: 'revert-layer' as any } 
            : undefined,
          style,
        ]}
        accessibilityLabel={alt}
        {...props}
      />
    );
  }
);

Image.displayName = 'Image';

export { Image };
