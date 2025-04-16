import React from 'react';
import { BiLike, BiDislike } from 'react-icons/bi';

interface FinancialSupportCardProps {
  optionNumber: 1 | 2 | 3;
  title: string;
  description: string;
  advantage: string;
  disadvantage: string;
}

const FinancialSupportCard: React.FC<FinancialSupportCardProps> = ({
  optionNumber,
  title,
  description,
  advantage,
  disadvantage
}) => {
  return (
    <div className="w-72 h-[32rem] bg-white rounded-xl border-2 border-gray-300 shadow-md overflow-visible flex flex-col pb-8">
      {/* Top Header (Orange) */}
      <div className="bg-[#F46A1F] px-4 py-3">
        <h2 className="text-lg font-bold text-white truncate">{title}</h2>
      </div>

      {/* Body Content */}
      <div className="p-4 flex flex-col gap-2 flex-grow">
        <div className="flex items-start gap-3">
          <div className="flex flex-col items-start flex-shrink-0">
            <div className="text-sm font-bold text-[#F46A1F]">Option</div>
            <div className="text-6xl leading-none font-bold text-[#F46A1F]">{optionNumber}</div>
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

        <div className="mt-2 flex items-start gap-2">
          <BiDislike className="w-10 h-10 text-gray-600 flex-shrink-0" />
          <p className="text-sm text-gray-800">
            {disadvantage}
          </p>
        </div>
      </div>

      {/* Bottom Orange Footer + Dollar Icon + Bottom Bar */}
      <div className="relative mt-auto">
        {/* Rounded bottom of card */}
        <div className="h-6 w-full rounded-b-xl bg-[#F46A1F]"></div>
        
        {/* Full width orange bar below the semicircle */}
        <div className="absolute -bottom-8 w-full h-8 bg-[#F46A1F] z-0"></div>
        
        {/* Half circle with dollar icon */}
        <div className="absolute bottom-0 left-1/2 z-10 -translate-x-1/2 transform">
          <div className="flex h-20 w-28 items-center justify-center rounded-t-full bg-[#F46A1F]">
            {/* Dollar Icon */}
            <svg className="h-12 w-12 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z"/>
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinancialSupportCard;