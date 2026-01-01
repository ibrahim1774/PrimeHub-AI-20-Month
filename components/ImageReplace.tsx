import React, { useRef } from 'react';
import { Camera } from 'lucide-react';

interface ImageReplaceProps {
    src: string;
    onChange: (newBase64: string) => void;
    className?: string;
    alt?: string;
}

const ImageReplace: React.FC<ImageReplaceProps> = ({ src, onChange, className = '', alt = '' }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                onChange(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className={`relative group ${className}`}>
            <img src={src} alt={alt} className="w-full h-full object-cover" />

            <div
                className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
            >
                <div className="bg-white/90 p-3 rounded-full mb-2 shadow-lg transform group-hover:scale-110 transition-transform">
                    <Camera className="w-6 h-6 text-black" />
                </div>
                <span className="text-white text-xs font-bold uppercase tracking-widest bg-black/60 px-3 py-1 rounded-full">
                    Replace Image
                </span>
            </div>

            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
            />
        </div>
    );
};

export default ImageReplace;
