const Tooltip = ({ text, children }) => {
  return (
    <div className="group relative inline-block">
      {children}
      <div className="pointer-events-none absolute -top-12 left-1/2 -translate-x-1/2 opacity-0 transition-opacity group-hover:opacity-100 z-50">
        <div className="bg-gray-900 text-white px-3 py-1.5 rounded-lg text-sm whitespace-nowrap">
          {text}
          <div className="absolute left-1/2 top-full -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
        </div>
      </div>
    </div>
  );
};

export default Tooltip;
