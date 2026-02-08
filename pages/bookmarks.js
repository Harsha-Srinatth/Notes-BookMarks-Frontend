import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Layout from '../components/Layout';
import { bookmarksAPI } from '../lib/api';
import { splitTags, isValidUrl } from '../utils/tagUtils';

export default function Bookmarks() {
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [favoriteFilter, setFavoriteFilter] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingBookmark, setEditingBookmark] = useState(null);
  const [formData, setFormData] = useState({ url: '', title: '', description: '', tags: '', isFavorite: false });
  const [tagInput, setTagInput] = useState('');

  useEffect(() => {
    fetchBookmarks();
  }, [searchTerm, selectedTags, favoriteFilter]);

  const fetchBookmarks = async () => {
    try {
      setLoading(true);
      const params = {};
      if (searchTerm) params.q = searchTerm;
      if (selectedTags.length > 0) {
        const validTags = selectedTags
          .map(tag => tag.trim())
          .filter(tag => tag.length > 0);
        if (validTags.length > 0) {
          params.tags = validTags.join(',');
        }
      }
      if (favoriteFilter) params.favorite = 'true';
      
      console.log('Fetching bookmarks with params:', params);
      const response = await bookmarksAPI.getAll(params);
      console.log('Bookmarks fetched successfully:', response.data.length, 'items');
      console.log('Sample bookmark tags:', response.data[0]?.tags);
      setBookmarks(response.data);
    } catch (error) {
      console.error('Error fetching bookmarks:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Client-side validation
    if (!formData.url || !formData.url.trim()) {
      alert('URL is required');
      console.error('Validation Error: URL is required');
      return;
    }

    if (!isValidUrl(formData.url.trim())) {
      alert('Please enter a valid URL (must start with http:// or https://)');
      console.error('Validation Error: Invalid URL format', formData.url);
      return;
    }

    try {
      // Split tags properly using utility function
      const tagsArray = splitTags(formData.tags);
      console.log('Splitting tags:', formData.tags, '→', tagsArray);
      
      const bookmarkData = {
        url: formData.url.trim(),
        title: formData.title.trim() || undefined, // Let backend auto-fetch if empty
        description: formData.description.trim() || '',
        tags: tagsArray,
        isFavorite: formData.isFavorite
      };

      console.log('Submitting bookmark:', bookmarkData);
      
      if (editingBookmark) {
        console.log('Updating bookmark:', editingBookmark._id);
        const response = await bookmarksAPI.update(editingBookmark._id, bookmarkData);
        console.log('Bookmark updated successfully:', response.data);
      } else {
        console.log('Creating new bookmark');
        const response = await bookmarksAPI.create(bookmarkData);
        console.log('Bookmark created successfully:', response.data);
      }
      
      resetForm();
      fetchBookmarks();
    } catch (error) {
      console.error('Error saving bookmark:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        statusText: error.response?.statusText
      });
      alert(error.response?.data?.error || 'Failed to save bookmark. Please try again.');
    }
  };

  const handleEdit = (bookmark) => {
    setEditingBookmark(bookmark);
    setFormData({
      url: bookmark.url,
      title: bookmark.title,
      description: bookmark.description || '',
      tags: bookmark.tags.join(', '),
      isFavorite: bookmark.isFavorite
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this bookmark?')) return;
    
    try {
      await bookmarksAPI.delete(id);
      fetchBookmarks();
    } catch (error) {
      console.error('Error deleting bookmark:', error);
      alert('Failed to delete bookmark');
    }
  };

  const toggleFavorite = async (bookmark) => {
    try {
      await bookmarksAPI.update(bookmark._id, { isFavorite: !bookmark.isFavorite });
      fetchBookmarks();
    } catch (error) {
      console.error('Error updating favorite:', error);
    }
  };

  const resetForm = () => {
    setFormData({ url: '', title: '', description: '', tags: '', isFavorite: false });
    setTagInput('');
    setEditingBookmark(null);
    setShowModal(false);
  };

  const allTags = [...new Set(bookmarks.flatMap(bookmark => bookmark.tags))];

  const handleTagToggle = (tag) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const clearTagFilters = () => {
    setSelectedTags([]);
  };

  const addTagToForm = (e) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      const newTags = splitTags(tagInput);
      const currentTags = formData.tags ? splitTags(formData.tags) : [];
      
      // Add new tags that don't already exist
      const uniqueNewTags = newTags.filter(tag => !currentTags.includes(tag));
      const allTags = [...currentTags, ...uniqueNewTags];
      
      console.log('Adding tags:', { input: tagInput, newTags, currentTags, allTags });
      setFormData({ ...formData, tags: allTags.join(', ') });
      setTagInput('');
    }
  };

  const removeTagFromForm = (tagToRemove) => {
    const currentTags = splitTags(formData.tags);
    const updatedTags = currentTags.filter(t => t !== tagToRemove);
    console.log('Removing tag:', tagToRemove, 'Updated tags:', updatedTags);
    setFormData({ ...formData, tags: updatedTags.join(', ') });
  };

  const formTags = formData.tags ? splitTags(formData.tags) : [];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const cardVariants = {
    hidden: { y: 20, opacity: 0, scale: 0.9 },
    visible: {
      y: 0,
      opacity: 1,
      scale: 1,
      transition: {
        type: 'spring',
        stiffness: 100,
        damping: 15
      }
    },
    exit: {
      y: -20,
      opacity: 0,
      scale: 0.9,
      transition: { duration: 0.2 }
    }
  };

  return (
    <Layout>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
      >
        <div>
          <h1 className="text-4xl font-bold text-gray-900 mb-1">My Bookmarks</h1>
          <p className="text-gray-500 text-sm">Save and organize your favorite links</p>
        </div>
        <motion.button
          onClick={() => setShowModal(true)}
          className="btn-primary flex items-center gap-2"
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.95 }}
        >
          <motion.span
            className="text-xl"
            animate={{ rotate: [0, 90, 0] }}
            transition={{ duration: 0.5 }}
          >
            +
          </motion.span>
          <span>New Bookmark</span>
        </motion.button>
      </motion.div>

      {/* Filters */}
      <motion.div
        className="card mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="relative">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Search</label>
            <div className="relative">
              <motion.input
                type="text"
                className="input-field pl-10"
                placeholder="Search bookmarks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                whileFocus={{ scale: 1.02 }}
              />
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">🔍</span>
            </div>
          </div>
          <div className="flex items-end">
            <motion.label
              className="flex items-center cursor-pointer p-3 rounded-xl hover:bg-gray-50 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <input
                type="checkbox"
                className="mr-3 h-5 w-5 text-primary-600 rounded focus:ring-2 focus:ring-primary-500"
                checked={favoriteFilter}
                onChange={(e) => setFavoriteFilter(e.target.checked)}
              />
              <span className="text-sm font-semibold text-gray-700">⭐ Favorites only</span>
            </motion.label>
          </div>
        </div>
        
        {/* Tags Filter - Only show when user searches or has selected tags */}
        {(searchTerm || selectedTags.length > 0 || favoriteFilter) && allTags.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-semibold text-gray-700">Filter by Tags</label>
              {selectedTags.length > 0 && (
                <motion.button
                  onClick={clearTagFilters}
                  className="text-xs text-primary-600 hover:text-primary-700 font-medium"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  Clear all ({selectedTags.length})
                </motion.button>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {allTags.map((tag, index) => (
                <motion.button
                  key={tag}
                  type="button"
                  onClick={() => handleTagToggle(tag)}
                  className={`tag-chip ${
                    selectedTags.includes(tag) ? 'tag-chip-active' : 'tag-chip-inactive'
                  }`}
                  whileHover={{ scale: 1.1, y: -2 }}
                  whileTap={{ scale: 0.9 }}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                >
                  {selectedTags.includes(tag) && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 500 }}
                    >
                      ✓
                    </motion.span>
                  )}
                  {tag}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* Bookmarks List */}
      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div
            key="loading"
            className="flex justify-center items-center py-20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="loading-spinner"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            />
            <motion.span
              className="ml-3 text-gray-600 font-medium"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              Loading bookmarks...
            </motion.span>
          </motion.div>
        ) : bookmarks.length === 0 ? (
          <motion.div
            key="empty"
            className="card empty-state"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.3 }}
          >
            <motion.div
              className="text-6xl mb-4"
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            >
              🔖
            </motion.div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No bookmarks found</h3>
            <p className="text-gray-500 mb-6">
              {searchTerm || selectedTags.length > 0 || favoriteFilter
                ? 'Try adjusting your filters'
                : 'Create your first bookmark to get started!'}
            </p>
            {!searchTerm && selectedTags.length === 0 && !favoriteFilter && (
              <motion.button
                onClick={() => setShowModal(true)}
                className="btn-primary"
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                Create Bookmark
              </motion.button>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="bookmarks"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {bookmarks.map((bookmark, index) => (
              <motion.div
                key={bookmark._id}
                className="card group"
                variants={cardVariants}
                whileHover={{ y: -5, scale: 1.02, rotateY: 2 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-xl font-bold text-gray-900 flex-1 pr-2 line-clamp-2">
                    <motion.a
                      href={bookmark.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-primary-600 transition-colors"
                      whileHover={{ scale: 1.05 }}
                    >
                      {bookmark.title}
                    </motion.a>
                  </h3>
                  <motion.button
                    onClick={() => toggleFavorite(bookmark)}
                    className={`btn-icon flex-shrink-0 ${bookmark.isFavorite ? 'text-yellow-500' : 'text-gray-300'}`}
                    title={bookmark.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                    whileHover={{ scale: 1.2, rotate: 15 }}
                    whileTap={{ scale: 0.9 }}
                    animate={bookmark.isFavorite ? { rotate: [0, -10, 10, 0] } : {}}
                    transition={{ duration: 0.5, repeat: bookmark.isFavorite ? Infinity : 0, repeatDelay: 2 }}
                  >
                    {bookmark.isFavorite ? '⭐' : '☆'}
                  </motion.button>
                </div>
                <motion.a
                  href={bookmark.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-primary-600 hover:text-primary-700 mb-3 flex items-center gap-1 truncate"
                  whileHover={{ x: 5 }}
                >
                  <span>🔗</span>
                  <span className="truncate">{bookmark.url}</span>
                </motion.a>
                {bookmark.description && (
                  <p className="text-gray-600 mb-4 line-clamp-2 text-sm leading-relaxed">{bookmark.description}</p>
                )}
                {bookmark.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {bookmark.tags.map((tag, idx) => (
                      <motion.button
                        key={idx}
                        type="button"
                        onClick={() => handleTagToggle(tag)}
                        className="tag-chip tag-chip-inactive text-xs"
                        whileHover={{ scale: 1.1, y: -2 }}
                        whileTap={{ scale: 0.9 }}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: idx * 0.05 }}
                      >
                        {tag}
                      </motion.button>
                    ))}
                  </div>
                )}
                <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                  <span className="text-xs text-gray-500">{new Date(bookmark.createdAt).toLocaleDateString()}</span>
                  <div className="flex gap-2">
                    <motion.button
                      onClick={() => handleEdit(bookmark)}
                      className="text-primary-600 hover:text-primary-700 font-medium text-sm px-3 py-1 rounded-lg hover:bg-primary-50 transition-colors"
                      whileHover={{ scale: 1.1, x: -2 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      Edit
                    </motion.button>
                    <motion.button
                      onClick={() => handleDelete(bookmark._id)}
                      className="text-red-600 hover:text-red-700 font-medium text-sm px-3 py-1 rounded-lg hover:bg-red-50 transition-colors"
                      whileHover={{ scale: 1.1, x: 2 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      Delete
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            className="modal-overlay"
            onClick={(e) => e.target === e.currentTarget && resetForm()}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="modal-content"
              onClick={(e) => e.stopPropagation()}
              initial={{ opacity: 0, scale: 0.8, y: 50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 50 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            >
              <div className="p-8">
                <div className="flex justify-between items-center mb-6">
                  <motion.h2
                    className="text-3xl font-bold text-gray-900"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                  >
                    {editingBookmark ? 'Edit Bookmark' : 'Create New Bookmark'}
                  </motion.h2>
                  <motion.button
                    onClick={resetForm}
                    className="btn-icon text-gray-400 hover:text-gray-600"
                    whileHover={{ scale: 1.2, rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    ✕
                  </motion.button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <label className="block text-sm font-semibold text-gray-700 mb-2">URL *</label>
                    <input
                      type="url"
                      required
                      className="input-field"
                      placeholder="https://example.com"
                      value={formData.url}
                      onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                    />
                    <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                      <span>💡</span>
                      <span>Title will be auto-fetched if left empty</span>
                    </p>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Title</label>
                    <input
                      type="text"
                      className="input-field"
                      placeholder="Leave empty to auto-fetch from URL"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    />
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                    <textarea
                      rows={3}
                      className="input-field resize-none"
                      placeholder="Add a description..."
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    />
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                  >
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Tags</label>
                    <div className="space-y-3">
                      <input
                        type="text"
                        className="input-field"
                        placeholder="Type a tag and press Enter"
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyDown={addTagToForm}
                      />
                      <AnimatePresence>
                        {formTags.length > 0 && (
                          <motion.div
                            className="flex flex-wrap gap-2"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                          >
                            {formTags.map((tag, idx) => (
                              <motion.span
                                key={idx}
                                className="tag-chip tag-chip-active flex items-center gap-2"
                                initial={{ opacity: 0, scale: 0 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0 }}
                                whileHover={{ scale: 1.1 }}
                              >
                                {tag}
                                <motion.button
                                  type="button"
                                  onClick={() => removeTagFromForm(tag)}
                                  className="hover:bg-white/20 rounded-full p-0.5"
                                  whileHover={{ scale: 1.2, rotate: 90 }}
                                  whileTap={{ scale: 0.9 }}
                                >
                                  ✕
                                </motion.button>
                              </motion.span>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </motion.div>
                  <motion.div
                    className="flex items-center p-4 bg-gray-50 rounded-xl"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                  >
                    <input
                      type="checkbox"
                      className="mr-3 h-5 w-5 text-primary-600 rounded focus:ring-2 focus:ring-primary-500"
                      checked={formData.isFavorite}
                      onChange={(e) => setFormData({ ...formData, isFavorite: e.target.checked })}
                    />
                    <label className="text-sm font-semibold text-gray-700 cursor-pointer">⭐ Mark as favorite</label>
                  </motion.div>
                  <motion.div
                    className="flex gap-3 justify-end pt-4 border-t border-gray-100"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 }}
                  >
                    <motion.button
                      type="button"
                      onClick={resetForm}
                      className="btn-secondary"
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Cancel
                    </motion.button>
                    <motion.button
                      type="submit"
                      className="btn-primary"
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {editingBookmark ? 'Update Bookmark' : 'Create Bookmark'}
                    </motion.button>
                  </motion.div>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </Layout>
  );
}
