import React from 'react';
import { BiLike, BiDislike } from 'react-icons/bi';

interface CurriculumAdaptationCardProps {
  optionNumber: 1 | 2 | 3;
  title: string;
  description: string;
  advantage: string;
  disadvantage: string;
}

const CurriculumAdaptationCard: React.FC<CurriculumAdaptationCardProps> = ({
  optionNumber,
  title,
  description,
  advantage,
  disadvantage
}) => {
  return (
    <div className="w-full h-full bg-white rounded-xl border-2 border-gray-300 shadow-md overflow-hidden flex flex-col">
      {/* Top Header (Green) */}
      <div className="bg-[#7FFF2A] px-4 py-3">
        <h2 className="text-white font-bold text-lg">{title}</h2>
      </div>

      {/* Body Content */}
      <div className="p-4 flex flex-col gap-2 flex-grow">
        <div className="flex items-start gap-3">
          <div className="flex flex-col items-start">
            <div className="text-[#7FFF2A] font-bold text-sm">Option</div>
            <div className="text-[#7FFF2A] text-6xl font-bold leading-none">{optionNumber}</div>
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

      {/* Bottom Green Footer + Book Icon */}
      <div className="relative">
        <div className="bg-[#7FFF2A] h-6 w-full rounded-b-xl"></div>

        <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 z-10">
          <div className="w-28 h-20 bg-[#7FFF2A] rounded-t-full flex items-center justify-center">
            {/* Book Icon */}
            <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M18 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c.55 0 1-.45 1-1s-.45-1-1-1H7c-.55 0-1-.45-1-1s.45-1 1-1h11c.55 0 1-.45 1-1s-.45-1-1-1H7c-.55 0-1-.45-1-1s.45-1 1-1h11c.55 0 1-.45 1-1s-.45-1-1-1H7c-.55 0-1-.45-1-1s.45-1 1-1h11c.55 0 1-.45 1-1s-.45-1-1-1z" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CurriculumAdaptationCard;
