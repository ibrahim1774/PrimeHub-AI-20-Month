import React from 'react';

interface EditableTextProps {
    value: string;
    onChange: (newValue: string) => void;
    className?: string;
    multiline?: boolean;
}

const EditableText: React.FC<EditableTextProps> = ({ value, onChange, className = '', multiline = false }) => {
    const handleInput = (e: React.FormEvent<HTMLDivElement>) => {
        onChange(e.currentTarget.innerText);
    };

    return (
        <div
            contentEditable
            suppressContentEditableWarning
            onBlur={handleInput}
            className={`outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-50 rounded px-1 -mx-1 transition-all hover:bg-black/5 ${className}`}
            style={{ display: multiline ? 'block' : 'inline-block' }}
        >
            {value}
        </div>
    );
};

export default EditableText;
