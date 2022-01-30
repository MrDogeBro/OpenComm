import React from 'react';

export type FooterProps = {
  className?: string;
  id?: string;
};

export const Footer: React.FC<FooterProps> = (props) => {
  return (
    <footer
      className={`bg-brand-black text-white px-4 md:px-20 py-6 ${props.className}`}
      id={props.id}
    >
      <div className="block md:flex w-full md:items-center md:justify-start">
        <div className="justify-center flex-grow">
          <p className="font-sans text-md text-center">
            Copyright (©) {new Date().getFullYear()}{' '}
            {process.env.NEXT_PUBLIC_INFO_COPYRIGHT}
          </p>
        </div>
      </div>
    </footer>
  );
};
