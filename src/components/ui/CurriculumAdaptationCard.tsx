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
    <div className="w-72 h-[30rem] bg-white rounded-xl border-2 border-gray-300 shadow-md overflow-hidden flex flex-col">
      {/* Top Header (Green) */}
      <div className="bg-[#7FFF2A] px-4 py-3">
        <h2 className="text-white font-bold text-lg truncate">{title}</h2>
      </div>

      {/* Body Content */}
      <div className="p-4 flex flex-col gap-2 flex-grow">
        <div className="flex items-start gap-3">
          <div className="flex flex-col items-start flex-shrink-0">
            <div className="text-[#7FFF2A] font-bold text-sm">Option</div>
            <div className="text-[#7FFF2A] text-6xl font-bold leading-none">{optionNumber}</div>
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

      {/* Bottom Green Footer + Book Icon */}
      <div className="relative mt-auto">
        <div className="bg-[#7FFF2A] h-6 w-full rounded-b-xl"></div>

        <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 z-10">
          <div className="w-28 h-20 bg-[#7FFF2A] rounded-t-full flex items-center justify-center">
            {/* Book Icon */}
            <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M21 5c-1.11-.35-2.33-.5-3.5-.5-1.95 0-4.05.4-5.5 1.5-1.45-1.1-3.55-1.5-5.5-1.5S2.45 4.9 1 6v14.65c0 .25.25.5.5.5.1 0 .15-.05.25-.05C3.1 20.45 5.05 20 6.5 20c1.95 0 4.05.4 5.5 1.5 1.35-.85 3.8-1.5 5.5-1.5 1.65 0 3.35.3 4.75 1.05.1.05.15.05.25.05.25 0 .5-.25.5-.5V6c-.6-.45-1.25-.75-2-1zm0 13.5c-1.1-.35-2.3-.5-3.5-.5-1.7 0-4.15.65-5.5 1.5V8c1.35-.85 3.8-1.5 5.5-1.5 1.2 0 2.4.15 3.5.5v11.5z"/>
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CurriculumAdaptationCard;