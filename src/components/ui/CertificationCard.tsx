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
  return (
    <div className="w-80 h-[32rem] bg-white rounded-xl border-2 border-gray-300 shadow-md overflow-hidden flex flex-col">
      {/* Top Header (Brown) */}
      <div className="bg-[#A0522D] px-4 py-3">
        <h2 className="text-white font-bold text-sm">Certification/Accreditation of Previous Educational Experience</h2>
      </div>

      {/* Body Content */}
      <div className="p-4 flex flex-col flex-grow">
        <div className="flex items-start gap-3 mb-2">
          <div className="flex flex-col items-start flex-shrink-0">
            <div className="text-[#A0522D] font-bold text-xs">Option</div>
            <div className="text-[#A0522D] text-6xl font-bold leading-none">{optionNumber}</div>
          </div>
          <p className="text-black font-bold text-xs leading-tight">
            {description}
          </p>
        </div>

        <div className="flex items-start gap-2 mb-2">
          <BiLike className="w-8 h-8 text-gray-600 flex-shrink-0" />
          <p className="text-xs text-gray-800">
            {advantage}
          </p>
        </div>

        <div className="flex items-start gap-2 mb-12">
          <BiDislike className="w-8 h-8 text-gray-600 flex-shrink-0" />
          <p className="text-xs text-gray-800 overflow-y-auto max-h-24">
            {disadvantage}
          </p>
        </div>
      </div>

      {/* Bottom Brown Footer with Certificate Icon */}
      <div className="relative mt-auto">
        {/* Bottom brown footer */}
        <div className="bg-[#A0522D] h-12 w-full"></div>
        
        {/* Half Circle with Certificate Icon */}
        <div className="absolute -top-12 left-1/2 transform -translate-x-1/2">
          <div className="w-28 h-24 bg-[#A0522D] rounded-t-full flex items-center justify-center">
            {/* Certificate Icon */}
            <svg className="w-14 h-14 text-white" viewBox="0 0 24 24" fill="currentColor">
              <path d="M14 2H6C4.9 2 4 2.9 4 4V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V8L14 2Z" />
              <circle cx="12" cy="14" r="2" fill="white" />
              <path d="M10 17L9 19L12 18L15 19L14 17" fill="white" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CertificationCard;