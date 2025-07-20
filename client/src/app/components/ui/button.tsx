import React from 'react';

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  children?: React.ReactNode;
};

const Button: React.FC<ButtonProps> = ({ onClick, children, ...props }) => {
  return (
    <div>
      <button className='border p-2 py-1 rounded-[7px] cursor-pointer' onClick={onClick} {...props}>
        {children || 'Load More!'}
      </button>
    </div>
  );
};

export default Button;