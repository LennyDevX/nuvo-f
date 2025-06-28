import React, { useState } from 'react';
import { FaSearch, FaListUl, FaThLarge, FaSort, FaFilter, FaTag, FaStore } from 'react-icons/fa';
import { motion } from 'framer-motion';

// Define default empty stats object
const defaultStats = {
  totalNFTs: 0,
  listedNFTs: 0,
  totalValue: "0.0000",
  topNFTValue: "0.00",
  recentActivity: 0,
  uniqueCategories: 0
};

const NFTDashboardFilters = ({
  filters = {},
  onFilterChange,
  onSearchChange,
  onSearchApply,
  searchValue = '',
  onSortChange,
  activeView = 'grid',
  isMobile = false,
  stats = defaultStats
}) => {
  const [localSearchValue, setLocalSearchValue] = useState(searchValue);
  const [sortExpanded, setSortExpanded] = useState(false);
  const [categoryExpanded, setCategoryExpanded] = useState(true);
  const [statusExpanded, setStatusExpanded] = useState(true);

  // Use mobile layout on smaller screens regardless of prop
  const useMobileLayout = isMobile || (typeof window !== 'undefined' && window.innerWidth < 768);

  // Safely destructure stats with fallback to default values
  const {
    totalNFTs = 0,
    listedNFTs = 0,
    totalValue = "0.0000",
    uniqueCategories = 0
  } = stats || defaultStats;

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    onSearchChange(localSearchValue);
    if (onSearchApply) onSearchApply();
  };

  const handleFilterChange = (type, value) => {
    if (onFilterChange) {
      onFilterChange(type, value);
    }
  };

  const toggleSort = () => setSortExpanded(!sortExpanded);
  const toggleCategory = () => setCategoryExpanded(!categoryExpanded);
  const toggleStatus = () => setStatusExpanded(!statusExpanded);

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="nuvos-marketplace-filters"
    >
      {/* Search */}
      <form onSubmit={handleSearchSubmit} className="mb-6">
        <div className="nuvos-marketplace-filter-group">
          <label className="nuvos-marketplace-filter-label">
            Search NFTs
          </label>
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={localSearchValue}
              onChange={(e) => setLocalSearchValue(e.target.value)}
              placeholder="Search NFTs..."
              className="bg-black/40 border border-purple-500/30 rounded-lg px-10 py-2.5 text-white placeholder-gray-400 focus:border-purple-400 focus:outline-none focus:ring-0 transition-all duration-200 w-full"
            />
            <button
              type="submit"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-xs bg-black/60 hover:bg-black/80 text-white px-3 py-1.5 rounded border border-purple-500/30 hover:border-purple-400 transition-all duration-200"
            >
              Search
            </button>
          </div>
        </div>
      </form>

      {/* Collection Stats Summary - Hide in mobile to avoid duplication with dashboard stats */}
      {!useMobileLayout && (
        <div className="mb-6 p-3 bg-black/40 rounded-lg border border-purple-500/30">
          <h3 className="text-white text-sm font-medium mb-2">Collection Stats</h3>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-black/40 border border-purple-500/20 p-2 rounded">
              <p className="text-gray-400">Total NFTs</p>
              <p className="text-white font-medium">{totalNFTs}</p>
            </div>
            <div className="bg-black/40 border border-purple-500/20 p-2 rounded">
              <p className="text-gray-400">Listed For Sale</p>
              <p className="text-white font-medium">{listedNFTs}</p>
            </div>
            <div className="bg-black/40 border border-purple-500/20 p-2 rounded">
              <p className="text-gray-400">Total Value</p>
              <p className="text-white font-medium">{totalValue} POL</p>
            </div>
            <div className="bg-black/40 border border-purple-500/20 p-2 rounded">
              <p className="text-gray-400">Categories</p>
              <p className="text-white font-medium">{uniqueCategories}</p>
            </div>
          </div>
        </div>
      )}

      {/* View Options */}
      <div className="nuvos-marketplace-filter-group">
        <label className="nuvos-marketplace-filter-label">
          View Mode
        </label>
        <div className="flex rounded-lg overflow-hidden border border-purple-500/30">
          <button
            onClick={() => handleFilterChange('view', 'grid')}
            className={`flex-1 py-2.5 flex justify-center items-center text-sm transition-all duration-200 ${
              activeView === 'grid'
                ? 'bg-black/60 text-white border-purple-400'
                : 'bg-black/40 text-gray-300 hover:bg-black/50 hover:text-white'
            }`}
          >
            <FaThLarge className="mr-2 w-4 h-4" /> Grid
          </button>
          <button
            onClick={() => handleFilterChange('view', 'list')}
            className={`flex-1 py-2.5 flex justify-center items-center text-sm transition-all duration-200 border-l border-purple-500/30 ${
              activeView === 'list'
                ? 'bg-black/60 text-white border-purple-400'
                : 'bg-black/40 text-gray-300 hover:bg-black/50 hover:text-white'
            }`}
          >
            <FaListUl className="mr-2 w-4 h-4" /> List
          </button>
        </div>
      </div>

      {/* Sort Options */}
      <div className="nuvos-marketplace-filter-group">
        <div
          className="flex justify-between items-center p-3 bg-black/40 border border-purple-500/30 rounded-lg cursor-pointer hover:bg-black/50 hover:border-purple-400 transition-all duration-200"
          onClick={toggleSort}
        >
          <div className="flex items-center">
            <FaSort className="mr-2 text-purple-400 w-4 h-4" />
            <span className="text-white text-sm font-medium">Sort By</span>
          </div>
          <span className="text-gray-400 text-xs">
            {sortExpanded ? '▲' : '▼'}
          </span>
        </div>

        {sortExpanded && (
          <div className="mt-2 space-y-1 bg-black/40 border border-purple-500/30 rounded-lg p-2">
            {['recent', 'name', 'price-high', 'price-low', 'likes'].map((option) => (
              <button
                key={option}
                onClick={() => {
                  if (onSortChange) onSortChange(option);
                  if (useMobileLayout) setSortExpanded(false);
                }}
                className="block w-full text-left py-2 px-3 text-sm text-gray-300 hover:bg-black/50 hover:text-white rounded transition-all duration-200"
              >
                {option === 'recent' && 'Recently Added'}
                {option === 'name' && 'Name (A-Z)'}
                {option === 'price-high' && 'Price (High to Low)'}
                {option === 'price-low' && 'Price (Low to High)'}
                {option === 'likes' && 'Most Liked'}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Category Filter */}
      {filters.categories && (
        <div className="nuvos-marketplace-filter-group">
          <div
            className="flex justify-between items-center p-3 bg-black/40 border border-purple-500/30 rounded-lg cursor-pointer hover:bg-black/50 hover:border-purple-400 transition-all duration-200"
            onClick={toggleCategory}
          >
            <div className="flex items-center">
              <FaTag className="mr-2 text-purple-400 w-4 h-4" />
              <span className="text-white text-sm font-medium">Categories</span>
              {/* Show active filter count */}
              {filters.categories.filter(cat => cat.selected).length > 0 && (
                <span className="ml-2 bg-purple-500 text-white text-xs px-2 py-0.5 rounded-full">
                  {filters.categories.filter(cat => cat.selected).length}
                </span>
              )}
            </div>
            <span className="text-gray-400 text-xs">
              {categoryExpanded ? '▲' : '▼'}
            </span>
          </div>

          {categoryExpanded && (
            <div className="mt-2 space-y-1 bg-black/40 border border-purple-500/30 rounded-lg p-2">
              {filters.categories.map((category) => (
                <div
                  key={category.value}
                  className="flex items-center space-x-2 p-2 hover:bg-black/50 rounded transition-all duration-200"
                >
                  <input
                    type="checkbox"
                    id={`category-${category.value}`}
                    checked={category.selected}
                    onChange={() => {
                      console.log(`Category filter changed: ${category.value}, was ${category.selected}, now ${!category.selected}`);
                      handleFilterChange('category', category.value);
                    }}
                    className="rounded text-purple-400 focus:ring-purple-500 focus:ring-offset-0 bg-black/40 border-purple-500/30"
                  />
                  <label
                    htmlFor={`category-${category.value}`}
                    className="text-gray-300 text-sm cursor-pointer flex-1"
                  >
                    {category.label}
                  </label>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Status Filter */}
      {filters.statuses && (
        <div className="nuvos-marketplace-filter-group">
          <div
            className="flex justify-between items-center p-3 bg-black/40 border border-purple-500/30 rounded-lg cursor-pointer hover:bg-black/50 hover:border-purple-400 transition-all duration-200"
            onClick={toggleStatus}
          >
            <div className="flex items-center">
              <FaStore className="mr-2 text-purple-400 w-4 h-4" />
              <span className="text-white text-sm font-medium">Status</span>
              {/* Show active filter count */}
              {filters.statuses.filter(status => status.selected).length > 0 && (
                <span className="ml-2 bg-purple-500 text-white text-xs px-2 py-0.5 rounded-full">
                  {filters.statuses.filter(status => status.selected).length}
                </span>
              )}
            </div>
            <span className="text-gray-400 text-xs">
              {statusExpanded ? '▲' : '▼'}
            </span>
          </div>

          {statusExpanded && (
            <div className="mt-2 space-y-1 bg-black/40 border border-purple-500/30 rounded-lg p-2">
              {filters.statuses.map((status) => (
                <div
                  key={status.value}
                  className="flex items-center space-x-2 p-2 hover:bg-black/50 rounded transition-all duration-200"
                >
                  <input
                    type="checkbox"
                    id={`status-${status.value}`}
                    checked={status.selected}
                    onChange={() => {
                      console.log(`Status filter changed: ${status.value}, was ${status.selected}, now ${!status.selected}`);
                      handleFilterChange('status', status.value);
                    }}
                    className="rounded text-purple-400 focus:ring-purple-500 focus:ring-offset-0 bg-black/40 border-purple-500/30"
                  />
                  <label
                    htmlFor={`status-${status.value}`}
                    className="text-gray-300 text-sm cursor-pointer flex-1"
                  >
                    {status.label}
                  </label>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Reset Filters Button */}
      <button
        onClick={() => {
          if (filters.categories) {
            filters.categories.forEach(cat => {
              if (cat.selected) handleFilterChange('category', cat.value);
            });
          }
          if (filters.statuses) {
            filters.statuses.forEach(status => {
              if (status.selected) handleFilterChange('status', status.value);
            });
          }
          setLocalSearchValue('');
          onSearchChange('');
          
          if (useMobileLayout && onSearchApply) onSearchApply();
        }}
        className="w-full py-2.5 text-sm text-center text-white bg-black/40 hover:bg-black/60 border border-purple-500/30 hover:border-purple-400 rounded-lg transition-all duration-200"
      >
        Reset Filters
      </button>
    </motion.div>
  );
};

export default NFTDashboardFilters;
