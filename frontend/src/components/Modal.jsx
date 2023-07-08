import { XMarkIcon } from "@heroicons/react/24/outline";
import React, { useContext } from "react";
import { useRef } from "react";
import { useEffect } from "react";
import { useState } from "react";
import { createContext } from "react";

const ModalContext = createContext();

function useModalContext() {
  return useContext(ModalContext);
}

function ModalContextProvider({ children, onClose }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    if (visible === false) onClose();
  }, [visible]);

  return (
    <ModalContext.Provider value={{ visible, setVisible }}>
      {children}
    </ModalContext.Provider>
  );
}

function Modal({ children, show = false, onClose }) {
  return (
    <ModalContextProvider onClose={onClose}>
      <BaseModal show={show}>{children}</BaseModal>
    </ModalContextProvider>
  );
}

function BaseModal({ children, show }) {
  const { visible, setVisible } = useModalContext();
  const backdrop = useRef(null);
  useEffect(() => {
    setVisible(show);
  }, [show]);

  function handleMouseDown(e) {
    let label = e.target;
    if (label === backdrop.current) {
      setVisible(false);
    }
  }

  return (
    <div
      ref={backdrop}
      onMouseDown={(e) => handleMouseDown(e)}
      className={
        visible === false
          ? "hidden"
          : "fixed top-0 left-0 z-10 w-screen h-screen flex justify-center items-center backdrop-blur bg-black/10"
      }
    >
      <div className="flex-1 flex flex-col gap-3 max-w-xl p-3 rounded-md shadow-xl border bg-white dark:bg-gray-800">
        {children}
      </div>
    </div>
  );
}

function Header({ children, closeButton = false }) {
  const { setVisible } = useModalContext();
  return (
    <div className="flex gap-1 ">
      <div className="flex-1">{children}</div>
      {closeButton && (
        <div
          onClick={() => setVisible(false)}
          className="w-6 h-6 cursor-pointer p-1 rounded-full hover:bg-black/10 dark:hover:bg-white/10"
        >
          <XMarkIcon />
        </div>
      )}
    </div>
  );
}

function Body({ children }) {
  return <div>{children}</div>;
}

function Footer({ children }) {
  return <div>{children}</div>;
}

Modal.Body = Body;
Modal.Header = Header;
Modal.Footer = Footer;

export default Modal;
