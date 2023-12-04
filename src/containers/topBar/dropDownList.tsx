import { AnimatePresence, motion } from 'framer-motion';
import React from 'react';
import ReactDOM from 'react-dom';
import { Link } from 'react-router-dom';

type ChildType = { label: string; path: string };
type Props = {
  childs?: ChildType[] | undefined;
  open: boolean;
}

const DropDownList = React.forwardRef((props: Props, ref: any) => {
  const { left, top, width } = ref.current;
  if (props.open && props.childs) {
    return ReactDOM.createPortal((
      <AnimatePresence>
        <motion.ul
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{
            type: 'spring',
            stiffness: 700,
            damping: 35,
            delay: 0.1
          }}
          className="h-max rounded-b-md shadow-lg flex flex-col bg-gray-100 z-50"
          style={{
            position: 'absolute',
            top: `${top + 60}px`,
            left: `${left}px`,
            minWidth: `${width}px`
          }}
        >
          {
            props?.childs?.map((item: ChildType) => (
              <Link
                key={item.label}
                to={item.path}
                className="py-2 hover:bg-linegray px-2"
              >
                {item.label}
              </Link>
            ))
          }
        </motion.ul>
      </AnimatePresence>
    ), document.querySelector('body')!);
  }
  return null;
});

export default DropDownList;
