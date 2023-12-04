import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { AnimationType, animationSelector } from './animationValues';

interface FadeInProps {
  children: ReactNode;
  type?: AnimationType;
  overflow?: boolean;
}

UiAnimate.defaultProps = {
  type: 'fadeIn',
  overflow: false
};

export default function UiAnimate(props: FadeInProps) {
  return (
    <motion.div
      key="appLayout"
      className={`${props.overflow ? 'h-max' : 'h-full'} w-full`}
      {...animationSelector(props.type || 'fadeIn')}
    >
      {props.children}
    </motion.div>
  );
}
