import React from 'react';
import { 
  FaFilter, 
  FaLayerGroup, 
  FaShoppingCart, 
  FaHistory, 
  FaStar,
  FaSearch,
  FaSortAmountDown
} from 'react-icons/fa';

const NFTDashboardSidebar = ({ 
  stats, 
  filters,
  onFilterChange, 
  onSearchChange,
  onSearchApply, // New prop for mobile search apply
  searchValue = '', // Current search value with default
  onSortChange,
  activeView,
  isMobile = false
}) => {
  const { totalNFTs, listedNFTs, totalValue } = stats;
  
  // Handle search input change
  const handleSearchChange = (e) => {
    const value = e.target.value;
    if (onSearchChange) {
      onSearchChange(value);
    }
  };
  
  return (
    <div className={`bg-black/40 backdrop-blur-md rounded-xl p-4 border border-purple-500/20 ${isMobile ? 'border-0 bg-transparent' : ''}`}>
      {/* Search - Modified for stability on mobile and working on desktop */}
      <div className="mb-6">
        <div className="relative">
          <input
            type="text"
            placeholder="Search NFTs..."
            value={searchValue}
            onChange={handleSearchChange}
            className="w-full bg-black/30 border border-purple-500/30 rounded-lg py-2 pl-9 pr-3 text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500"
          />
          <FaSearch className="absolute top-3 left-3 text-gray-400" />
          
          {/* Search button for mobile view */}
          {isMobile && onSearchApply && (
            <button
              onClick={onSearchApply}
              className="mt-2 w-full py-1.5 bg-purple-600 hover:bg-purple-700 rounded-md text-white text-sm flex items-center justify-center transition-colors"
            >
              <FaSearch className="mr-2 text-xs" /> Search
            </button>
          )}
        </div>
      </div>
      
      {/* Stats - More compact on mobile */}
      <div className={`mb-6 ${isMobile ? 'grid grid-cols-3 gap-2' : ''}`}>
        <h3 className={`text-white text-sm font-medium mb-2 flex items-center ${isMobile ? 'col-span-3' : ''}`}>
          <FaLayerGroup className="mr-2 text-purple-400" /> Collection Stats
        </h3>
        <div className={`${isMobile ? 'col-span-3 grid grid-cols-3 gap-2' : 'bg-black/20 rounded-lg p-3 text-xs space-y-2'}`}>
          <div className={`${isMobile ? 'bg-black/20 rounded-lg p-2' : ''} flex justify-between`}>
            <span className="text-gray-300">Total:</span>
            <span className="text-white font-medium">{totalNFTs}</span>
          </div>
          <div className={`${isMobile ? 'bg-black/20 rounded-lg p-2' : ''} flex justify-between`}>
            <span className="text-gray-300">Listed:</span>
            <span className="text-green-300 font-medium">{listedNFTs}</span>
          </div>
          <div className={`${isMobile ? 'bg-black/20 rounded-lg p-2' : ''} flex justify-between`}>
            <span className="text-gray-300">Value:</span>
            <span className="text-purple-300 font-medium">{totalValue} MATIC</span>
          </div>
        </div>
      </div>
      
      {/* Category Filter */}
      <div className="mb-6">
        <h3 className="text-white text-sm font-medium mb-2 flex items-center">
          <FaFilter className="mr-2 text-purple-400" /> Categories
        </h3>
        <div className={`space-y-1.5 ${isMobile ? 'grid grid-cols-2 gap-2 space-y-0' : ''}`}>
          {filters.categories.map(category => (
            <label key={category.value} className={`flex items-center text-xs cursor-pointer ${isMobile ? 'bg-black/20 p-2 rounded-lg' : ''}`}>
              <input
                type="checkbox"
                checked={category.selected}
                onChange={() => onFilterChange('category', category.value)}
                className="form-checkbox h-3.5 w-3.5 text-purple-500 rounded border-gray-500 bg-black/30"
              />
              <span className="ml-2 text-gray-300">{category.label}</span>
            </label>
          ))}
        </div>
      </div>
      
      {/* Status Filter */}
      <div className="mb-6">
        <h3 className="text-white text-sm font-medium mb-2 flex items-center">
          <FaShoppingCart className="mr-2 text-purple-400" /> Status
        </h3>
        <div className={`space-y-1.5 ${isMobile ? 'grid grid-cols-2 gap-2 space-y-0' : ''}`}>
          {filters.statuses.map(status => (
            <label key={status.value} className={`flex items-center text-xs cursor-pointer ${isMobile ? 'bg-black/20 p-2 rounded-lg' : ''}`}>
              <input
                type="checkbox"
                checked={status.selected}
                onChange={() => onFilterChange('status', status.value)}
                className="form-checkbox h-3.5 w-3.5 text-purple-500 rounded border-gray-500 bg-black/30"
              />
              <span className="ml-2 text-gray-300">{status.label}</span>
            </label>
          ))}
        </div>
      </div>
      
      {/* Sort */}
      <div className="mb-6">
        <h3 className="text-white text-sm font-medium mb-2 flex items-center">
          <FaSortAmountDown className="mr-2 text-purple-400" /> Sort By
        </h3>
        <select 
          onChange={(e) => onSortChange(e.target.value)}
          className="w-full bg-black/30 border border-purple-500/30 rounded-lg py-1.5 px-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500"
        >
          <option value="recent">Recently Added</option>
          <option value="name">Name (A-Z)</option>
          <option value="price-high">Price (High to Low)</option>
          <option value="price-low">Price (Low to High)</option>
          <option value="likes">Most Liked</option>
        </select>
      </div>
      
      {/* Display Modes */}
      <div>
        <h3 className="text-white text-sm font-medium mb-2 flex items-center">
          <FaStar className="mr-2 text-purple-400" /> View Mode
        </h3>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => onFilterChange('view', 'grid')}
            className={`py-1.5 px-2 text-xs rounded-lg flex items-center justify-center ${
              activeView === 'grid' ? 'bg-purple-500/50 text-white' : 'bg-black/30 text-gray-300'
            }`}
          >
            Grid View
          </button>
          <button
            onClick={() => onFilterChange('view', 'list')}
            className={`py-1.5 px-2 text-xs rounded-lg flex items-center justify-center ${
              activeView === 'list' ? 'bg-purple-500/50 text-white' : 'bg-black/30 text-gray-300'
            }`}
          >
            List View
          </button>
        </div>
      </div>
    </div>
  );
};

export default NFTDashboardSidebar;
