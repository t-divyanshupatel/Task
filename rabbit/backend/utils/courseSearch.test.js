import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildCourseSearchFilter,
  buildCourseSortOptions,
} from './courseSearch.js';

test('buildCourseSearchFilter omits $text when query is empty', () => {
  const filter = buildCourseSearchFilter({ query: '' });

  assert.deepEqual(filter, { isPublished: true });
  assert.equal(filter.$text, undefined);
  assert.equal(filter.$or, undefined);
});

test('buildCourseSearchFilter uses $text for non-empty query', () => {
  const filter = buildCourseSearchFilter({ query: 'react' });

  assert.deepEqual(filter, {
    isPublished: true,
    $text: { $search: 'react' },
  });
});

test('buildCourseSearchFilter normalizes single category string', () => {
  const filter = buildCourseSearchFilter({
    query: 'python',
    categories: 'Data Science',
  });

  assert.deepEqual(filter.category, { $in: ['Data Science'] });
});

test('buildCourseSearchFilter accepts category array', () => {
  const filter = buildCourseSearchFilter({
    query: '',
    categories: ['Design', 'DevOps'],
  });

  assert.deepEqual(filter, {
    isPublished: true,
    category: { $in: ['Design', 'DevOps'] },
  });
});

test('buildCourseSortOptions maps price sort values', () => {
  assert.deepEqual(buildCourseSortOptions('low'), { coursePrice: 1 });
  assert.deepEqual(buildCourseSortOptions('high'), { coursePrice: -1 });
  assert.deepEqual(buildCourseSortOptions(''), {});
});
