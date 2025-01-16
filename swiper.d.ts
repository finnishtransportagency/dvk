import React from 'react';
import { SwiperOptions } from 'swiper/types';

declare module "react" {
  namespace JSX {
    interface IntrinsicElements {
      'swiper-container': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & SwiperOptions;
      'swiper-slide': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        lazy?: string;
      };
    }
  }
}
