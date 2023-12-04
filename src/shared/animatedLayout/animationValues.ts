export type AnimationType = 'slideIn' | 'fadeIn' | 'slideDown'
export const appTransition = {
  type: 'spring',
  stiffness: 700,
  damping: 35
};

export const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { ...appTransition, delay: 0.1 }
};
export const slideIn = {
  initial: { x: -50 },
  animate: { x: 0 },
  exit: { x: -50 },
  transition: { ...appTransition }
};

export const slideDown = {
  initial: { y: -2 },
  animate: { y: 0 },
  exit: { y: -2 },
  transition: { ...appTransition }
};

export function animationSelector (type: string) {
  switch (type) {
    case 'slideIn':
      return slideIn;
    case 'fadeIn':
      return fadeIn;
    case 'slideDown':
      return slideDown;
    default:
      return {};
  }
}
