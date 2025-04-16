import React from 'react';
import { BiLike, BiDislike } from 'react-icons/bi';

interface TeacherTrainingCardProps {
  optionNumber: 1 | 2 | 3;
  title: string;
  description: string;
  advantage: string;
  disadvantage: string;
}

const TeacherTrainingCard: React.FC<TeacherTrainingCardProps> = ({
  optionNumber,
  title,
  description,
  advantage,
  disadvantage
}) => {
  return (
    <div className="w-72 h-[30rem] bg-white rounded-xl border-2 border-gray-300 shadow-md overflow-hidden flex flex-col">
      {/* Top Header (Pink) */}
      <div className="bg-[#EF5EFF] px-4 py-3">
        <h2 className="text-white font-bold text-lg truncate">{title}</h2>
      </div>

      {/* Body Content */}
      <div className="p-4 flex flex-col gap-2 flex-grow">
        <div className="flex items-start gap-3">
          <div className="flex flex-col items-start flex-shrink-0">
            <div className="text-[#EF5EFF] font-bold text-sm">Option</div>
            <div className="text-[#EF5EFF] text-6xl font-bold leading-none">{optionNumber}</div>
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

      {/* Bottom Pink Footer + Teacher Icon */}
      <div className="relative mt-auto">
        <div className="bg-[#EF5EFF] h-6 w-full rounded-b-xl"></div>

        <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 z-10">
          <div className="w-28 h-20 bg-[#EF5EFF] rounded-t-full flex items-center justify-center">
            {/* Custom Teacher Icon: Person + Screen */}
            <svg className="w-14 h-14 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M5 12c1.38 0 2.5-1.12 2.5-2.5S6.38 7 5 7 2.5 8.12 2.5 9.5 3.62 12 5 12zm0 2c-2.33 0-7 1.17-7 3.5V20h14v-2.5c0-2.33-4.67-3.5-7-3.5zm16-10h-8c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h8c.55 0 1-.45 1-1V5c0-.55-.45-1-1-1zm-1 10h-6V6h6v6z" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherTrainingCard;