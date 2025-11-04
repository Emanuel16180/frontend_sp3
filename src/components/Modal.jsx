// src/components/Modal.jsx

import React from 'react';
// import './Modal.css'; // <-- ¡Ya no se necesita!

function Modal({ isOpen, onClose, children }) {
    if (!isOpen) {
        return null;
    }

    return (
        <div 
            className="fixed inset-0 bg-black/50 z-50 flex justify-center items-center backdrop-blur-sm p-4" 
            onClick={onClose}
        >
            <div 
                className="bg-popover text-popover-foreground p-8 rounded-xl shadow-2xl w-full max-w-lg relative animate-fade-in-up" 
                onClick={e => e.stopPropagation()}
            >
                <button 
                    className="absolute top-4 right-4 text-muted-foreground hover:text-foreground text-3xl font-light cursor-pointer" 
                    onClick={onClose}
                >
                    &times;
                </button>
                {children}
            </div>
        </div>
    );
}

export default Modal;