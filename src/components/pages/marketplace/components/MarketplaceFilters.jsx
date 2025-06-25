import React from 'react';
import { FiSearch, FiFilter, FiDollarSign, FiTag } from 'react-icons/fi';
import { getAvailableCategories, getCategoryDisplayName } from '../../../../utils/blockchain/blockchainUtils';

const MarketplaceFilters = ({ filters, setFilters, categories = [], showMobileFilters, setShowMobileFilters }) => {
  // Use the standardized categories from utils
  const availableCategories = getAvailableCategories();

  const handleFilterChange = (key, value) => {
    console.log(`Filter changed: ${key} = ${value}`);
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handlePriceRangeChange = (type, value) => {
    setFilters(prev => ({
      ...prev,
      priceRange: {
        ...prev.priceRange,
        [type]: value
      }
    }));
  };

  const clearFilters = () => {
    setFilters({
      category: 'all',
      priceRange: { min: '', max: '' },
      sortBy: 'newest',
      searchTerm: ''
    });
  };

  return (
    <>
      {/* Mobile Filter Toggle Button - Clean implementation */}
      {setShowMobileFilters && (
        <div className="block md:hidden mb-4">
          <button
            onClick={() => setShowMobileFilters(!showMobileFilters)}
            className="btn-nuvo-base btn-nuvo-secondary w-full"
          >
            <FiFilter className="w-5 h-5" />
            {showMobileFilters ? 'Hide Filters' : 'Show Filters'}
          </button>
        </div>
      )}

      {/* Filters Panel - Show based on desktop or mobile state */}
      <div className={`nuvos-marketplace-filters ${
        typeof showMobileFilters !== 'undefined' 
          ? (showMobileFilters ? 'block' : 'hidden md:block')
          : 'block'
      }`}>
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <FiFilter className="w-5 h-5 text-purple-400" />
            <h3 className="text-lg font-semibold text-white">Filters</h3>
          </div>
          <button
            onClick={clearFilters}
            className="text-sm text-pink-400 hover:text-pink-300 transition-colors font-medium"
          >
            Clear All
          </button>
        </div>

        <div className="space-y-6">
          {/* Search */}
          <div className="nuvos-marketplace-filter-group">
            <label className="nuvos-marketplace-filter-label">
              Search NFTs
            </label>
            <div className="nuvos-marketplace-search-container">
              <FiSearch className="nuvos-marketplace-search-icon" />
              <input
                type="text"
                placeholder="Search by name or description..."
                value={filters.searchTerm}
                onChange={(e) => setFilters(prev => ({ ...prev, searchTerm: e.target.value }))}
                className="nuvos-marketplace-search-input"
              />
            </div>
          </div>

          {/* Category Filter */}
          <div className="nuvos-marketplace-filter-group">
            <label className="nuvos-marketplace-filter-label">
              Category
            </label>
            <select
              value={filters.category}
              onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
              className="nuvos-select"
            >
              {availableCategories.map(category => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </select>
          </div>

          {/* Price Range */}
          <div className="nuvos-marketplace-filter-group">
            <label className="nuvos-marketplace-filter-label">
              <FiDollarSign className="inline w-4 h-4 mr-1" />
              Price Range (POL)
            </label>
            <div className="grid grid-cols-2 gap-3">
              <input
                type="number"
                placeholder="Min"
                value={filters.priceRange.min}
                onChange={(e) => handlePriceRangeChange('min', e.target.value)}
                className="bg-black/30 border border-purple-500/30 rounded-lg px-3 py-2.5 text-white placeholder-gray-400 focus:border-purple-400 focus:outline-none focus:ring-0 transition-all duration-200"
              />
              <input
                type="number"
                placeholder="Max"
                value={filters.priceRange.max}
                onChange={(e) => handlePriceRangeChange('max', e.target.value)}
                className="bg-black/30 border border-purple-500/30 rounded-lg px-3 py-2.5 text-white placeholder-gray-400 focus:border-purple-400 focus:outline-none focus:ring-0 transition-all duration-200"
              />
            </div>
          </div>

          {/* Sort */}
          <div className="nuvos-marketplace-filter-group">
            <label className="nuvos-marketplace-filter-label">
              <FiTag className="inline w-4 h-4 mr-1" />
              Sort By
            </label>
            <select
              value={filters.sortBy}
              onChange={(e) => handleFilterChange('sortBy', e.target.value)}
              className="nuvos-marketplace-select"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
            </select>
          </div>
        </div>
      </div>
    </>
  );
};

export default MarketplaceFilters;
