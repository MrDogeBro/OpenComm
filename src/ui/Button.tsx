import React, { DetailedHTMLProps, ButtonHTMLAttributes } from "react";

const colorClassnames = {
  primary: "bg-red-600 text-white hover:bg-red-700",
  secondary: "text-white bg-blue-600 hover:bg-blue-700",
};

export type ButtonProps = DetailedHTMLProps<
  ButtonHTMLAttributes<HTMLButtonElement>,
  HTMLButtonElement
> & {
  color?: keyof typeof colorClassnames;
  loading?: boolean;
};

export const Button: React.FC<ButtonProps> = ({
  children,
  color = "primary",
  disabled = false,
  loading = false,
  className = "",
  ...props
}) => {
  return (
    <button
      disabled={disabled || loading}
      className={`${colorClassnames[color]} font-bold flex items-center justify-center py-2 px-6 text-sm rounded-md transition duration-250 ease-in-out disabled:text-gray-400 disabled:bg-gray-600 disabled:cursor-not-allowed ${className}`}
      {...props}
    >
      <span className={loading ? "opacity-0" : "flex items-center"}>
        {children}
      </span>
    </button>
  );
};
