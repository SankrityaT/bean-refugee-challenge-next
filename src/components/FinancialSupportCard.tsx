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
    <div className="w-full h-full bg-white rounded-xl border-2 border-gray-300 shadow-md overflow-hidden flex flex-col">
      {/* Top Header (Orange) */}
      <div className="bg-[#F46A1F] px-4 py-3">
        <h2 className="text-lg font-bold text-white">{title}</h2>
      </div>

      {/* Body Content */}
      <div className="flex flex-grow flex-col gap-2 p-4">
        <div className="flex items-start gap-3">
          <div className="flex flex-col items-start">
            <div className="text-sm font-bold text-[#F46A1F]">Option</div>
            <div className="text-6xl leading-none font-bold text-[#F46A1F]">{optionNumber}</div>
          </div>
          <p className="text-sm leading-snug font-bold text-black">
            {description}
          </p>
        </div>

        <div className="mt-4 flex items-start gap-2">
          <BiLike className="w-10 h-10 text-gray-600" />
          <p className="text-sm text-gray-800">
            {advantage}
          </p>
        </div>

        <div className="mt-3 flex items-start gap-2">
          <BiDislike className="w-10 h-10 text-gray-600" />
          <p className="text-sm text-gray-800">
            {disadvantage}
          </p>
        </div>
      </div>

      {/* Bottom Orange Footer + Dollar Icon */}
      <div className="relative">
        <div className="h-6 w-full rounded-b-xl bg-[#F46A1F]"></div>

        <div className="absolute -top-12 left-1/2 z-10 -translate-x-1/2 transform">
          <div className="flex h-20 w-28 items-center justify-center rounded-t-full bg-[#F46A1F]">
            {/* Dollar Icon */}
            <svg className="h-12 w-12 text-black" fill="currentColor" viewBox="0 0 24 24">
              <path d="M4 4h16v16H4V4zm8 2c-.55 0-1 .45-1 1s.45 1 1 1c1.66 0 3 1.34 3 3s-1.34 3-3 3c-.55 0-1 .45-1 1s.45 1 1 1c2.21 0 4-1.79 4-4s-1.79-4-4-4zm0 10c-.55 0-1 .45-1 1s.45 1 1 1c3.31 0 6-2.69 6-6s-2.69-6-6-6z" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinancialSupportCard;
