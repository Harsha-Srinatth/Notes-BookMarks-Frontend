/**
 * Splits tags from various formats into an array
 * Handles: comma-separated, space-separated, hashtag-separated, and mixed formats
 * @param {string} tagString - The tag string to split
 * @returns {Array<string>} - Array of cleaned tags
 */
export const splitTags = (tagString) => {
  if (!tagString || typeof tagString !== 'string') {
    return [];
  }

  // Remove leading/trailing whitespace
  let cleaned = tagString.trim();
  
  if (!cleaned) {
    return [];
  }

  // Split by comma first, then process each part
  const parts = cleaned.split(',');
  
  const tags = [];
  
  parts.forEach(part => {
    // Remove hashtags and split by spaces
    const withoutHash = part.replace(/#/g, '').trim();
    
    // Split by spaces if there are multiple words
    if (withoutHash.includes(' ')) {
      const spaceSplit = withoutHash.split(/\s+/);
      spaceSplit.forEach(tag => {
        const trimmed = tag.trim();
        if (trimmed && trimmed.length > 0) {
          tags.push(trimmed);
        }
      });
    } else {
      // Single tag (could have been after a comma or hashtag)
      if (withoutHash && withoutHash.length > 0) {
        tags.push(withoutHash);
      }
    }
  });

  // Remove duplicates and empty strings
  return [...new Set(tags.filter(tag => tag.length > 0))];
};

/**
 * Validates URL format
 * @param {string} url - URL to validate
 * @returns {boolean} - True if valid URL
 */
export const isValidUrl = (url) => {
  if (!url || typeof url !== 'string') {
    return false;
  }
  
  try {
    const urlObj = new URL(url);
    return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
  } catch {
    return false;
  }
};

