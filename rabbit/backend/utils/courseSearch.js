/**
 * Build MongoDB filter for published course search.
 * Uses $text index when query is non-empty (fast); skips regex $or entirely.
 */
export function buildCourseSearchFilter({ query = '', categories = [] } = {}) {
  const normalizedCategories = Array.isArray(categories)
    ? categories
    : categories
      ? [categories]
      : [];

  const filter = { isPublished: true };

  if (query) {
    filter.$text = { $search: query };
  }

  if (normalizedCategories.length > 0) {
    filter.category = { $in: normalizedCategories };
  }

  return filter;
}

export function buildCourseSortOptions(sortByPrice = '') {
  if (sortByPrice === 'low') {
    return { coursePrice: 1 };
  }
  if (sortByPrice === 'high') {
    return { coursePrice: -1 };
  }
  return {};
}

/** Legacy implementation kept for benchmarks only. */
export function buildLegacyCourseSearchFilter({ query = '', categories = [] } = {}) {
  const normalizedCategories = Array.isArray(categories)
    ? categories
    : categories
      ? [categories]
      : [];

  const filter = {
    isPublished: true,
    $or: [
      { courseTitle: { $regex: query, $options: 'i' } },
      { subTitle: { $regex: query, $options: 'i' } },
      { category: { $regex: query, $options: 'i' } },
    ],
  };

  if (normalizedCategories.length > 0) {
    filter.category = { $in: normalizedCategories };
  }

  return filter;
}
