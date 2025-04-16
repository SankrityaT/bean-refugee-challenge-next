import React from 'react';
import { BiLike, BiDislike } from 'react-icons/bi';

interface PsychosocialSupportCardProps {
  optionNumber: 1 | 2 | 3;
  title: string;
  description: string;
  advantage: string;
  disadvantage: string;
}

const PsychosocialSupportCard: React.FC<PsychosocialSupportCardProps> = ({
  optionNumber,
  title,
  description,
  advantage,
  disadvantage
}) => {
  return (
    <div className="w-full h-full bg-white rounded-xl border-2 border-gray-300 shadow-md overflow-hidden flex flex-col">
      {/* Top Header (Blue) */}
      <div className="bg-[#5CCBFF] px-4 py-3">
        <h2 className="text-white font-bold text-lg">{title}</h2>
      </div>

      {/* Body Content */}
      <div className="p-4 flex flex-col gap-2 flex-grow">
        <div className="flex items-start gap-3">
          <div className="flex flex-col items-start">
            <div className="text-[#5CCBFF] font-bold text-sm">Option</div>
            <div className="text-[#5CCBFF] text-6xl font-bold leading-none">{optionNumber}</div>
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

      {/* Bottom Blue Footer + Brain Icon */}
      <div className="relative">
        <div className="bg-[#5CCBFF] h-6 w-full rounded-b-xl"></div>

        <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 z-10">
          <div className="w-28 h-20 bg-[#5CCBFF] rounded-t-full flex items-center justify-center">
            {/* Brain Icon - Different for each option */}
            {optionNumber === 1 && (
              <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm2.25 14.5h-4.5c-.41 0-.75-.34-.75-.75S9.34 15 9.75 15h4.5c.41 0 .75.34.75.75s-.34.75-.75.75zm0-3h-4.5c-.41 0-.75-.34-.75-.75s.34-.75.75-.75h4.5c.41 0 .75.34.75.75s-.34.75-.75.75zm0-3h-4.5C9.34 10.5 9 10.16 9 9.75s.34-.75.75-.75h4.5c.41 0 .75.34.75.75s-.34.75-.75.75z"/>
              </svg>
            )}
            {optionNumber === 2 && (
              <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm3 11c0 .83-.34 1.58-.88 2.12.06.21.09.43.09.66 0 1.1-.9 2-2 2s-2-.9-2-2c0-.11.01-.21.03-.31a2.995 2.995 0 01-1.58-5.08C8.4 7.87 10.1 7 12 7s3.6.87 4.34 2.39C16.79 10.17 17 10.57 17 11z" />
              </svg>
            )}
            {optionNumber === 3 && (
              <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2a10 10 0 100 20 10 10 0 000-20zm3 11c0 .83-.34 1.58-.88 2.12.06.21.09.43.09.66 0 1.1-.9 2-2 2s-2-.9-2-2c0-.11.01-.21.03-.31a2.995 2.995 0 01-1.58-5.08C8.4 7.87 10.1 7 12 7s3.6.87 4.34 2.39C16.79 10.17 17 10.57 17 11z" />
              </svg>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PsychosocialSupportCard;