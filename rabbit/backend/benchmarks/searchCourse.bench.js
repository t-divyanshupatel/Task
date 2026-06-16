import { performance } from 'node:perf_hooks';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import {
  buildCourseSearchFilter,
  buildLegacyCourseSearchFilter,
} from '../utils/courseSearch.js';

const COURSE_COUNT = 3000;
const WARMUP_RUNS = 5;
const BENCHMARK_RUNS = 30;
const SEARCH_TERMS = ['python', 'react', 'design', 'javascript', 'data'];

const categories = ['Web Development', 'Design', 'Data Science', 'Mobile', 'DevOps'];
const titles = [
  'Complete Python Bootcamp',
  'React Masterclass',
  'UI/UX Design Fundamentals',
  'JavaScript Deep Dive',
  'Data Science with Python',
  'Node.js API Development',
  'Flutter Mobile Apps',
  'Docker and Kubernetes',
];

function createCourseSchema() {
  const courseSchema = new mongoose.Schema(
    {
      courseTitle: { type: String, required: true },
      subTitle: { type: String },
      description: { type: String },
      category: { type: String, required: true },
      coursePrice: { type: Number },
      isPublished: { type: Boolean, default: true },
      creator: { type: mongoose.Schema.Types.ObjectId },
    },
    { timestamps: true }
  );

  courseSchema.index({ courseTitle: 'text', subTitle: 'text', category: 'text' });
  courseSchema.index({ isPublished: 1 });

  return mongoose.model('BenchCourse', courseSchema);
}

function seedCourses(Course) {
  const docs = [];
  for (let i = 0; i < COURSE_COUNT; i++) {
    const title = titles[i % titles.length];
    docs.push({
      courseTitle: `${title} ${i}`,
      subTitle: `Learn ${title.split(' ')[0]} from scratch - edition ${i}`,
      category: categories[i % categories.length],
      coursePrice: 499 + (i % 50) * 100,
      isPublished: i % 17 !== 0,
    });
  }
  return Course.insertMany(docs);
}

async function runQuery(Course, filter, sort = {}) {
  return Course.find(filter).sort(sort).populate({ path: 'creator', select: 'name photoUrl' });
}

function summarize(label, timingsMs) {
  const sorted = [...timingsMs].sort((a, b) => a - b);
  const total = timingsMs.reduce((sum, value) => sum + value, 0);
  const mean = total / timingsMs.length;
  const p50 = sorted[Math.floor(sorted.length * 0.5)];
  const p95 = sorted[Math.floor(sorted.length * 0.95)];

  return { label, runs: timingsMs.length, mean, p50, p95, min: sorted[0], max: sorted.at(-1) };
}

async function benchmarkStrategy({ label, buildFilter, Course }) {
  const timings = [];

  for (let i = 0; i < WARMUP_RUNS + BENCHMARK_RUNS; i++) {
    const term = SEARCH_TERMS[i % SEARCH_TERMS.length];
    const filter = buildFilter({ query: term, categories: [] });
    const start = performance.now();
    await runQuery(Course, filter);
    const elapsed = performance.now() - start;

    if (i >= WARMUP_RUNS) {
      timings.push(elapsed);
    }
  }

  return summarize(label, timings);
}

async function benchmarkEmptyQuery({ label, buildFilter, Course }) {
  const timings = [];

  for (let i = 0; i < WARMUP_RUNS + BENCHMARK_RUNS; i++) {
    const filter = buildFilter({ query: '', categories: [] });
    const start = performance.now();
    await runQuery(Course, filter);
    const elapsed = performance.now() - start;

    if (i >= WARMUP_RUNS) {
      timings.push(elapsed);
    }
  }

  return summarize(label, timings);
}

async function profileLegacyExplain(Course) {
  const filter = buildLegacyCourseSearchFilter({ query: 'python', categories: [] });
  const explain = await Course.find(filter).explain('executionStats');
  const stats = explain.executionStats;

  return {
    totalDocsExamined: stats.totalDocsExamined,
    totalKeysExamined: stats.totalKeysExamined,
    executionTimeMillis: stats.executionTimeMillis,
    nReturned: stats.nReturned,
  };
}

async function profileOptimizedExplain(Course) {
  const filter = buildCourseSearchFilter({ query: 'python', categories: [] });
  const explain = await Course.find(filter).explain('executionStats');
  const stats = explain.executionStats;

  return {
    totalDocsExamined: stats.totalDocsExamined,
    totalKeysExamined: stats.totalKeysExamined,
    executionTimeMillis: stats.executionTimeMillis,
    nReturned: stats.nReturned,
  };
}

async function main() {
  const mongod = await MongoMemoryServer.create();
  await mongoose.connect(mongod.getUri());

  const Course = createCourseSchema();
  await seedCourses(Course);
  await Course.createIndexes();

  const legacyExplain = await profileLegacyExplain(Course);
  const optimizedExplain = await profileOptimizedExplain(Course);

  const legacy = await benchmarkStrategy({
    label: 'legacy-regex-$or',
    buildFilter: buildLegacyCourseSearchFilter,
    Course,
  });

  const optimized = await benchmarkStrategy({
    label: 'text-index-$text',
    buildFilter: buildCourseSearchFilter,
    Course,
  });

  const legacyEmpty = await benchmarkEmptyQuery({
    label: 'legacy-empty-query',
    buildFilter: buildLegacyCourseSearchFilter,
    Course,
  });

  const optimizedEmpty = await benchmarkEmptyQuery({
    label: 'optimized-empty-query',
    buildFilter: buildCourseSearchFilter,
    Course,
  });

  const speedup = legacy.mean / optimized.mean;
  const emptySpeedup = legacyEmpty.mean / optimizedEmpty.mean;

  console.log(JSON.stringify({
    dataset: { courses: COURSE_COUNT, publishedApprox: Math.floor(COURSE_COUNT * (16 / 17)) },
    benchmark: { warmupRuns: WARMUP_RUNS, measuredRuns: BENCHMARK_RUNS, searchTerms: SEARCH_TERMS },
    explain: { legacy: legacyExplain, optimized: optimizedExplain },
    results: { legacy, optimized, meanSpeedup: speedup },
    emptyQuery: { legacy: legacyEmpty, optimized: optimizedEmpty, meanSpeedup: emptySpeedup },
  }, null, 2));

  await mongoose.disconnect();
  await mongod.stop();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
