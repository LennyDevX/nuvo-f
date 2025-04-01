import React from 'react';
import { Link, useLocation } from 'react-router-dom';

/**
 * Enhanced NavLink component with React Router's native prefetching
 */
const NavLink = ({
  to,
  prefetchStrategy = "intent", // Options: "intent" (hover), "render" (immediate), or "none"
  children,
  className = "",
  activeClassName = "active",
  ...rest
}) => {
  const location = useLocation();
  const isActive = location.pathname === to;
  
  // Determine final CSS classes
  const finalClassName = `${className} ${isActive ? activeClassName : ""}`.trim();
  
  return (
    <Link
      to={to}
      prefetch={prefetchStrategy}
      className={finalClassName}
      {...rest}
    >
      {children}
    </Link>
  );
};

export default NavLink;
