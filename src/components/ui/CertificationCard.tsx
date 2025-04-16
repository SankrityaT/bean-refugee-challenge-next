import React from 'react';
import { BiLike, BiDislike } from 'react-icons/bi';

interface CertificationCardProps {
  optionNumber: 1 | 2 | 3;
  title: string;
  description: string;
  advantage: string;
  disadvantage: string;
}

const CertificationCard: React.FC<CertificationCardProps> = ({
  optionNumber,
  title,
  description,
  advantage,
  disadvantage
}) => {
  // Special handling for Option 2 to ensure bottom content is visible
  const isOption2 = optionNumber === 2;
  
  return (
    <div className="w-72 h-[38rem] bg-white rounded-xl border-2 border-gray-300 shadow-md overflow-visible flex flex-col">
      {/* Top Header (Brown) */}
      <div className="bg-[#A0522D] px-4 py-3">
        <h2 className="text-lg font-bold text-white truncate">{title}</h2>
      </div>

      {/* Body Content */}
      <div className="p-4 flex flex-col gap-2 flex-grow">
        <div className="flex items-start gap-3">
          <div className="flex flex-col items-start flex-shrink-0">
            <div className="text-sm font-bold text-[#A0522D]">Option</div>
            <div className="text-6xl leading-none font-bold text-[#A0522D]">{optionNumber}</div>
          </div>
          <p className="text-sm leading-snug font-bold text-black">
            {description}
          </p>
        </div>

        <div className="mt-3 flex items-start gap-2">
          <BiLike className="w-10 h-10 text-gray-600 flex-shrink-0" />
          <p className="text-sm text-gray-800">
            {advantage}
          </p>
        </div>

        <div className="mt-2 flex items-start gap-2 mb-8">
          <BiDislike className="w-10 h-10 text-gray-600 flex-shrink-0" />
          <p className="text-sm text-gray-800">
            {disadvantage}
          </p>
        </div>
      </div>

      {/* Bottom Brown Footer + Certificate Icon */}
      <div className="relative mt-auto">
        {/* Rounded bottom of card */}
        <div className="h-6 w-full rounded-b-xl bg-[#A0522D]"></div>
        
        {isOption2 ? (
          <div className="absolute -bottom-6 left-0 w-full">
            <div className="h-6 bg-[#A0522D]"></div>
            <div className="absolute -top-10 left-1/2 -translate-x-1/2">
              <div className="h-20 w-28 bg-[#A0522D] rounded-t-full flex items-center justify-center">
                <svg className="h-12 w-12 text-white" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
                  <path d="M26 10c0-1.1.9-2 2-2h18l6 6v30c0 1.1-.9 2-2 2H28c-1.1 0-2-.9-2-2V10zm20 0v6h6l-6-6z" fill="currentColor" />
                  <circle cx="24" cy="44" r="5" fill="white" />
                  <path d="M21.5 49l1.5-2.5 1.5.7 1.5-.7 1.5 2.5-2.5.8z" fill="white" />
                </svg>
              </div>
            </div>
          </div>
        ) : (
          <div className="absolute -top-12 left-1/2 z-10 -translate-x-1/2 transform">
            <div className="flex h-20 w-28 items-center justify-center rounded-t-full bg-[#A0522D]">
              <svg className="h-12 w-12 text-white" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
                <path d="M26 10c0-1.1.9-2 2-2h18l6 6v30c0 1.1-.9 2-2 2H28c-1.1 0-2-.9-2-2V10zm20 0v6h6l-6-6z" fill="currentColor" />
                <circle cx="24" cy="44" r="5" fill="white" />
                <path d="M21.5 49l1.5-2.5 1.5.7 1.5-.7 1.5 2.5-2.5.8z" fill="white" />
              </svg>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CertificationCard;