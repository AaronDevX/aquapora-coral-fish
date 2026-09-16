'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Sparkles, Eye } from 'lucide-react';

interface ProductGalleryProps {
  name: string;
  imageUrl: string;
  additionalImages?: string[];
  isWysiwyg?: boolean;
}

export function ProductGallery({
  name,
  imageUrl,
  additionalImages = [],
  isWysiwyg = false,
}: ProductGalleryProps) {
  const allImages = [imageUrl, ...additionalImages.filter((img) => img && img !== imageUrl)];
  const [selectedImage, setSelectedImage] = useState(allImages[0] || imageUrl);
  const [spectrumMode, setSpectrumMode] = useState<'actinic' | 'white'>('actinic');

  return (
    <div className="space-y-4">
      {/* Main Image Frame */}
      <div className="relative aspect-square w-full rounded-3xl overflow-hidden bg-slate-950 border border-slate-800 shadow-2xl">
        <Image
          src={selectedImage}
          alt={name}
          fill
          priority
          sizes="(max-width: 768px) 100vw, 50vw"
          className={`object-cover transition-all duration-500 ${
            spectrumMode === 'actinic'
              ? 'brightness-105 saturate-125 hue-rotate-[-5deg]'
              : 'brightness-100 saturate-100'
          }`}
        />

        {/* WYSIWYG Badge */}
        {isWysiwyg && (
          <div className="absolute top-4 left-4 z-10">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-purple-950/90 text-purple-200 border border-purple-500/50 backdrop-blur-md shadow-xl shadow-purple-950/60">
              <Sparkles className="w-3.5 h-3.5 text-purple-300" />
              WYSIWYG · Ejemplar Único
            </span>
          </div>
        )}

        {/* Actinic Spectrum Selector Pill */}
        <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between pointer-events-auto">
          <div className="px-3 py-1.5 rounded-xl bg-slate-950/80 border border-slate-800 backdrop-blur-md flex items-center gap-2">
            <Eye className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-[11px] text-slate-300 font-medium">
              {spectrumMode === 'actinic'
                ? 'Visualización bajo espectro actínico azul'
                : 'Visualización bajo espectro blanco natural'}
            </span>
          </div>

          <div className="flex items-center bg-slate-950/90 border border-slate-800 rounded-xl p-0.5 backdrop-blur-md">
            <button
              onClick={() => setSpectrumMode('actinic')}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${
                spectrumMode === 'actinic'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Espectro azul actínico / fluorescente"
            >
              Actínico
            </button>
            <button
              onClick={() => setSpectrumMode('white')}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${
                spectrumMode === 'white'
                  ? 'bg-slate-700 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Espectro blanco equilibrado"
            >
              Blanco
            </button>
          </div>
        </div>
      </div>

      {/* Thumbnails (if multiple images) */}
      {allImages.length > 1 && (
        <div className="flex items-center gap-3 overflow-x-auto py-1">
          {allImages.map((img, index) => {
            const isSelected = selectedImage === img;
            return (
              <button
                key={index}
                onClick={() => setSelectedImage(img)}
                className={`relative w-20 h-20 rounded-xl overflow-hidden border-2 transition-all shrink-0 ${
                  isSelected
                    ? 'border-cyan-400 shadow-md shadow-cyan-500/30'
                    : 'border-slate-800 hover:border-slate-600 opacity-70 hover:opacity-100'
                }`}
              >
                <Image
                  src={img}
                  alt={`${name} - vista ${index + 1}`}
                  fill
                  sizes="80px"
                  className="object-cover"
                />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
