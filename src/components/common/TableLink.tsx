import React from "react";
import { useRouter } from "next/router";

interface LinkProps {
  href: string;
  text: string;
}

const TableLink = ({ href, text }: LinkProps) => {
  const router = useRouter();

  const handleNavigation = async (e: React.MouseEvent) => {
    e.preventDefault();
    await router.push(href);
  };

  return (
    <a
      href={href}
      onClick={handleNavigation}
      className="cursor-pointer text-blue-600 hover:text-blue-800"
    >
      {text}
    </a>
  );
};

export default TableLink;
