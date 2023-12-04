import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

import UiAnimate from '@shared/animatedLayout/uiAnimate';
import React, { useCallback } from 'react';

type SidebarLinksProps = {
  path: string;
  title: string;
  expand: boolean;
  Icon: React.FC<React.SVGProps<SVGSVGElement>>;
  childs?: { label: string; path: string }[];
}

export default function SidebarLinks({ Icon, ...props }: SidebarLinksProps) {
  const location = useLocation();
  const navigate = useNavigate();

  const isPathActive = useCallback((path: string) => path === location.pathname, [location]);

  const navigator = useCallback((path: string) => (ev: React.MouseEvent) => {
    ev.stopPropagation();
    ev.preventDefault();
    navigate(path);
  }, [location]);

  return (
    <motion.div className="h-max">
      <NavLink to={props.path} className="h-max flex flex-col">
        {({ isActive }) => (
          <>
            <div
              className={`w-full h-8 flex relative ${isActive ? 'bg-accent' : ''}`}
            >
              <div
                className={`flex-1 px-2 flex items-center gap-x-5 h-full ${isActive ? 'bg-accent' : ''}`}
              >
                <Icon
                  className={`scale-125 
                ${!props.expand ? 'ml-1' : ''} 
                ${isActive ? 'fill-white' : 'fill-accent'}`}
                />
                {props.expand && (
                  <motion.span
                    initial={{ x: -100, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.01 }}
                    className={`flex-1 capitalize text-sm font-medium ${isActive ? 'text-white' : ''}`}
                  >
                    {props.title}
                  </motion.span>
                )}
              </div>
              <motion.div
                initial={{ y: -4, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -4, opacity: 0 }}
                transition={{ delay: 0.01 }}
                className={`absolute -right-10 ${isActive ? 'bg-accent' : ''} h-full w-10`}
                style={{ clipPath: 'polygon(12% 48%, 0 0, 0 100%)' }}
              />
            </div>
            {props.childs && props.expand && isActive && (
              <UiAnimate type="slideDown">
                <div className="text-sm bg-light-accent flex gap-y-1 justify-between flex-col py-1">
                  {
                    props.childs.map((item: { label: string; path: string }) => (
                      <span
                        role="button"
                        tabIndex={-1}
                        key={item.label}
                        className={`pl-[40px] pt-[6px] h-8 capitalize truncate 
                        ${isPathActive(item.path) ? 'text-accent' : ''}`}
                        onClick={navigator(item.path)}
                        title={item.label}
                      >
                        {item.label}
                      </span>
                    ))
                  }
                </div>
              </UiAnimate>
            )}
          </>
        )}
      </NavLink>

    </motion.div>
  );
}
