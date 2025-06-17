import React from 'react';
import { FiSearch, FiFilter, FiDollarSign, FiTag } from 'react-icons/fi';

const MarketplaceFilters = ({ filters, setFilters, categories, showMobileFilters, setShowMobileFilters }) => {
  const handleFilterChange = (key, value) => {
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
                onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
                className="nuvos-marketplace-search-input"
              />
            </div>
          </div>

          {/* Category Filter */}
          <div className="nuvos-marketplace-filter-group">
            <label className="nuvos-marketplace-filter-label">
              Category
            </label>
            <div className="grid grid-cols-2 gap-2">
              {categories.map(category => (
                <button
                  key={category}
                  onClick={() => handleFilterChange('category', category)}
                  className={`nuvos-marketplace-filter-button ${
                    filters.category === category ? 'active' : ''
                  }`}
                >
                  {category === 'all' ? 'All' : category.charAt(0).toUpperCase() + category.slice(1)}
                </button>
              ))}
            </div>
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
                className="nuvos-marketplace-input"
              />
              <input
                type="number"
                placeholder="Max"
                value={filters.priceRange.max}
                onChange={(e) => handlePriceRangeChange('max', e.target.value)}
                className="nuvos-marketplace-input"
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
              