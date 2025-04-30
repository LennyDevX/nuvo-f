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

const NFTDashboardSidebar = ({
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
  const useMobileLayout = isMobile || window.innerWidth < 768;

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
      className="bg-black/30 backdrop-blur-md p-5 rounded-xl border border-purple-500/20 shadow-lg"
    >
      {/* Search */}
      <form onSubmit={handleSearchSubmit} className="mb-6">
        <div className="relative">
          <input
            type="text"
            value={localSearchValue}
            onChange={(e) => setLocalSearchValue(e.target.value)}
            placeholder="Search NFTs..."
            className="w-full bg-gray-900/80 text-white py-2 pl-10 pr-4 rounded-lg border border-gray-700 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
          />
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <button
            type="submit"
            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-xs bg-purple-600 hover:bg-purple-700 text-white px-2 py-1 rounded"
          >
            Search
          </button>
        </div>
      </form>

      {/* Collection Stats Summary - Hide in mobile to avoid duplication with dashboard stats */}
      {!useMobileLayout && (
        <div className="mb-6 p-3 bg-purple-900/20 rounded-lg border border-purple-500/20">
          <h3 className="text-white text-sm font-medium mb-2">Collection Stats</h3>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-black/30 p-2 rounded">
              <p className="text-gray-400">Total NFTs</p>
              <p className="text-white font-medium">{totalNFTs}</p>
            </div>
            <div className="bg-black/30 p-2 rounded">
              <p className="text-gray-400">Listed For Sale</p>
              <p className="text-white font-medium">{listedNFTs}</p>
            </div>
            <div className="bg-black/30 p-2 rounded">
              <p className="text-gray-400">Total Value</p>
              <p className="text-white font-medium">{totalValue} MATIC</p>
            </div>
            <div className="bg-black/30 p-2 rounded">
              <p className="text-gray-400">Categories</p>
              <p className="text-white font-medium">{uniqueCategories}</p>
            </div>
          </div>
        </div>
      )}

      {/* View Options */}
      <div className="mb-4">
        <div className="flex rounded-lg overflow-hidden border border-gray-700">
          <button
            onClick={() => handleFilterChange('view', 'grid')}
            className={`flex-1 py-2 flex justify-center items-center text-xs ${
              activeView === 'grid'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            <FaThLarge className="mr-1" /> Grid
          </button>
          <button
            onClick={() => handleFilterChange('view', 'list')}
            className={`flex-1 py-2 flex justify-center items-center text-xs ${
              activeView === 'list'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            <FaListUl className="mr-1" /> List
          </button>
        </div>
      </div>

      {/* Sort Options */}
      <div className="mb-4">
        <div
          className="flex justify-between items-center p-3 bg-gray-800 rounded-lg cursor-pointer hover:bg-gray-700"
          onClick={toggleSort}
        >
          <div className="flex items-center">
            <FaSort className="mr-2 text-purple-400" />
            <span className="text-white text-sm font-medium">Sort By</span>
          </div>
          <span className="text-gray-400 text-xs">
            {sortExpanded ? '▲' : '▼'}
          </span>
        </div>

        {sortExpanded && (
          <div className="mt-2 ml-2 space-y-1">
            {['recent', 'name', 'price-high', 'price-low', 'likes'].map((option) => (
              <button
                key={option}
                onClick={() => {
                  if (onSortChange) onSortChange(option);
                  // Auto-close on mobile after selection
                  if (useMobileLayout) setSortExpanded(false);
                }}
                className="block w-full text-left py-1.5 px-3 text-xs text-gray-300 hover:bg-gray-700 hover:text-white rounded"
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
        <div className="mb-4">
          <div
            className="flex justify-between items-center p-3 bg-gray-800 rounded-lg cursor-pointer hover:bg-gray-700"
            onClick={toggleCategory}
          >
            <div className="flex items-center">
              <FaTag className="mr-2 text-purple-400" />
              <span className="text-white text-sm font-medium">Categories</span>
            </div>
            <span className="text-gray-400 text-xs">
              {categoryExpanded ? '▲' : '▼'}
            </span>
          </div>

          {categoryExpanded && (
            <div className="mt-2 space-y-1">
              {filters.categories.map((category) => (
                <div
                  key={category.value}
                  className="flex items-center space-x-2 p-2 hover:bg-gray-800 rounded"
                >
                  <input
                    type="checkbox"
                    id={`category-${category.value}`}
                    checked={category.selected}
                    onChange={() => handleFilterChange('category', category.value)}
                    className="rounded text-purple-600 focus:ring-purple-500 focus:ring-offset-0 bg-gray-700 border-gray-600"
                  />
                  <label
                    htmlFor={`category-${category.value}`}
                    className="text-gray-300 text-xs cursor-pointer flex-1"
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
        <div className="mb-4">
          <div
            className="flex justify-between items-center p-3 bg-gray-800 rounded-lg cursor-pointer hover:bg-gray-700"
            onClick={toggleStatus}
          >
            <div className="flex items-center">
              <FaStore className="mr-2 text-purple-400" />
              <span className="text-white text-sm font-medium">Status</span>
            </div>
            <span className="text-gray-400 text-xs">
              {statusExpanded ? '▲' : '▼'}
            </span>
          </div>

          {statusExpanded && (
            <div className="mt-2 space-y-1">
              {filters.statuses.map((status) => (
                <div
                  key={status.value}
                  className="flex items-center space-x-2 p-2 hover:bg-gray-800 rounded"
                >
                  <input
                    type="checkbox"
                    id={`status-${status.value}`}
                    checked={status.selected}
                    onChange={() => handleFilterChange('status', status.value)}
                    className="rounded text-purple-600 focus:ring-purple-500 focus:ring-offset-0 bg-gray-700 border-gray-600"
                  />
                  <label
                    htmlFor={`status-${status.value}`}
                    className="text-gray-300 text-xs cursor-pointer flex-1"
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
          // Reset all filters
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
          
          // Close mobile sidebar if applicable
          if (useMobileLayout && onSearchApply) onSearchApply();
        }}
        className="w-full py-2 text-xs text-center text-white bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
      >
        Reset Filters
      </button>
    </motion.div>
  );
};

export default NFTDashboardSidebar;
