import React from 'react';
import { BiLike, BiDislike } from 'react-icons/bi';

interface LanguageInstructionCardProps {
  optionNumber: 1 | 2 | 3;
  title: string;
  description: string;
  advantage: string;
  disadvantage: string;
}

const LanguageInstructionCard: React.FC<LanguageInstructionCardProps> = ({
  optionNumber,
  title,
  description,
  advantage,
  disadvantage
}) => {
  return (
    <div className="w-full h-full bg-white rounded-xl border-2 border-gray-300 shadow-md overflow-hidden flex flex-col">
      {/* Top Header (Yellow) */}
      <div className="bg-[#FED64D] px-4 py-3">
        <h2 className="text-black font-bold text-lg">{title}</h2>
      </div>

      {/* Body Content */}
      <div className="p-4 flex flex-col gap-2 flex-grow">
        <div className="flex items-start gap-3">
          <div className="flex flex-col items-start">
            <div className="text-[#FED64D] font-bold text-sm">Option</div>
            <div className="text-[#FED64D] text-6xl font-bold leading-none">{optionNumber}</div>
          </div>
          <p className="text-black font-bold text-sm leading-snug">
            {description}
          </p>
        </div>

        <div className="flex items-start gap-2 mt-4">
          <BiLike className="w-10 h-10 text-gray-600" />
          <p className="text-sm text-gray-800">
            {advantage}
          </p>
        </div>

        <div className="flex items-start gap-2 mt-3">
          <BiDislike className="w-10 h-10 text-gray-600" />
          <p className="text-sm text-gray-800">
            {disadvantage}
          </p>
        </div>
      </div>

      {/* Bottom Yellow Footer + Language Icon */}
      <div className="relative">
        <div className="bg-[#FED64D] h-6 w-full rounded-b-xl"></div>

        <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 z-10">
          <div className="w-28 h-20 bg-[#FED64D] rounded-t-full flex items-center justify-center">
            {/* Language icon */}
            <svg className="w-14 h-14" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="6" y="14" width="36" height="20" rx="2" fill="black" />
              <text x="12" y="30" fontSize="14" fill="#FED64D" fontFamily="Arial, sans-serif" fontWeight="bold">A</text>
              <rect x="26" y="18" width="10" height="12" fill="#FED64D" />
              <path d="M28 22h6M31 20v6" stroke="black" strokeWidth="2" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LanguageInstructionCard;