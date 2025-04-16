import React from 'react';
import { BiLike, BiDislike } from 'react-icons/bi';

interface EducationPolicyCardProps {
  optionNumber: 1 | 2 | 3;
  title: string;
  description: string;
  advantage: string;
  disadvantage: string;
}

const EducationPolicyCard: React.FC<EducationPolicyCardProps> = ({
  optionNumber,
  title,
  description,
  advantage,
  disadvantage
}) => {
  return (
    <div className="w-72 h-[30rem] bg-white rounded-xl border-2 border-gray-300 shadow-md overflow-hidden flex flex-col">
      {/* Top Header (Cyan Blue) */}
      <div className="bg-[#A0F6DA] px-4 py-3">
        <h2 className="text-black font-bold text-lg truncate">{title}</h2>
      </div>

      {/* Body Content */}
      <div className="p-4 flex flex-col gap-2 flex-grow">
        <div className="flex items-start gap-3">
          <div className="flex flex-col items-start flex-shrink-0">
            <div className="text-[#A0F6DA] font-bold text-sm">Option</div>
            <div className="text-[#A0F6DA] text-6xl font-bold leading-none">{optionNumber}</div>
          </div>
          <p className="text-black font-bold text-sm leading-snug">
            {description}
          </p>
        </div>

        <div className="flex items-start gap-2 mt-4">
          <BiLike className="w-10 h-10 text-gray-600 flex-shrink-0" />
          <p className="text-sm text-gray-800">
            {advantage}
          </p>
        </div>

        <div className="flex items-start gap-2 mt-3">
          <BiDislike className="w-10 h-10 text-gray-600 flex-shrink-0" />
          <p className="text-sm text-gray-800">
            {disadvantage}
          </p>
        </div>
      </div>

      {/* Bottom Cyan Footer + Graduation Cap Icon */}
      <div className="relative mt-auto">
        <div className="bg-[#A0F6DA] h-6 w-full rounded-b-xl"></div>

        <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 z-10">
          <div className="w-28 h-20 bg-[#A0F6DA] rounded-t-full flex items-center justify-center">
            {/* Graduation cap icon */}
            <svg className="w-12 h-12 text-black" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 3L1 9l11 6 9-5-9-5zm0 10.5l-7-4v3l7 4 7-4v-3l-7 4zm-5 1.5v3c0 1.38 3.58 2.5 5 2.5s5-1.12 5-2.5v-3l-5 2.5-5-2.5z"/>
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EducationPolicyCard;