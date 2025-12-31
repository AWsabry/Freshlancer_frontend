/**
 * Extract university name from university data
 * Handles both populated object format and legacy string/ID format
 * 
 * @param {Object|string|null|undefined} university - University data (can be object with name, string ID, or null)
 * @param {string} fallback - Fallback text to return if university is not available (default: 'N/A')
 * @returns {string} University name or fallback
 * 
 * @example
 * // Populated object format
 * getUniversityName({ _id: '...', name: 'Harvard University', status: 'approved' }) // 'Harvard University'
 * 
 * // Legacy string format
 * getUniversityName('Harvard University') // 'Harvard University'
 * 
 * // ID only (legacy)
 * getUniversityName('69550056b92bf3af4a866fd3') // 'N/A' (ID without name)
 * 
 * // Null/undefined
 * getUniversityName(null) // 'N/A'
 * getUniversityName(undefined, 'Not specified') // 'Not specified'
 */
export const getUniversityName = (university, fallback = 'N/A') => {
  console.log('university', university);
  if (!university) {
    return fallback;
  }

  // Handle populated object format: { _id, name, status, countryCode }
  if (typeof university === 'object' && university !== null) {
    // Check if it has a name property (populated university object)
    if (university.name && typeof university.name === 'string') {
      return university.name;
    }
    // If it's an object but no name, it might be an ID object or malformed data
    // Return fallback
    return fallback;
  }

  // Handle string format (legacy: could be name or ID)
  if (typeof university === 'string' && university.trim()) {
    // Check if it looks like a MongoDB ObjectId (24 hex characters)
    const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(university.trim());
    if (isValidObjectId) {
      // It's an ID, not a name - return fallback
      return fallback;
    }
    // It's a name string
    return university.trim();
  }

  // Unknown format
  return fallback;
};

/**
 * Extract university ID from university data
 * Handles both populated object format and legacy string/ID format
 * 
 * @param {Object|string|null|undefined} university - University data
 * @returns {string|null} University ID or null
 */
export const getUniversityId = (university) => {
  if (!university) {
    return null;
  }

  // Handle populated object format: { _id, name, status, countryCode }
  if (typeof university === 'object' && university !== null) {
    if (university._id) {
      return typeof university._id === 'string' ? university._id : String(university._id);
    }
    return null;
  }

  // Handle string format
  if (typeof university === 'string' && university.trim()) {
    // Check if it looks like a MongoDB ObjectId
    const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(university.trim());
    if (isValidObjectId) {
      return university.trim();
    }
    // It's a name, not an ID
    return null;
  }

  return null;
};

/**
 * Check if university data is in populated object format
 * 
 * @param {Object|string|null|undefined} university - University data
 * @returns {boolean} True if university is a populated object with name
 */
export const isUniversityPopulated = (university) => {
  return (
    university &&
    typeof university === 'object' &&
    university !== null &&
    typeof university.name === 'string'
  );
};

