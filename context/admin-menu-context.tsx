'use client';
import React, { createContext, useContext, useState } from "react";

interface MenuContextProps {
  mobileOpen: boolean;
  isClosing: boolean;
  handleDrawerToggle: () => void;
  handleDrawerClose: () => void;
  handleDrawerTransitionEnd: () => void;
}

const MenuContext = createContext<MenuContextProps | undefined>(undefined);

export const MenuProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  const handleDrawerClose = () => {
    setIsClosing(true);
    setMobileOpen(false);
  };

  const handleDrawerTransitionEnd = () => {
    setIsClosing(false);
  };

  const handleDrawerToggle = () => {
    if (!isClosing) {
      setMobileOpen(!mobileOpen);
    }
  };  

  return (
    <MenuContext.Provider value={{mobileOpen, isClosing, handleDrawerClose, handleDrawerTransitionEnd, handleDrawerToggle}}>
      {children}
    </MenuContext.Provider>
  );

}

export const useMenuContext = () => {
  const context = useContext(MenuContext);
  if(!context) {
    throw new Error('useMenuContext must be used within a MenuProvider');
  }

  return context;
}