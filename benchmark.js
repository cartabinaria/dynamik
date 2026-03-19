
import fs from 'node:fs';
const DEGREES = JSON.parse(fs.readFileSync('src/config/degrees.json', 'utf8'));
const teachingsArray = JSON.parse(fs.readFileSync('src/config/teachings.json', 'utf8'));

// Mock SvelteMap and SvelteSet since they are for the browser/runtime
class MockMap extends Map {}
class MockSet extends Set {}

function getDegreesForCourseBaseline(courseUrl) {
    return DEGREES.filter((degree) =>
        degree.teachings?.some((teaching) => teaching.name === courseUrl)
    );
}

const degreesByCourse = DEGREES.reduce((acc, degree) => {
    if (degree.teachings) {
        const processedTeachings = new MockSet();
        for (const teaching of degree.teachings) {
            if (!processedTeachings.has(teaching.name)) {
                if (!acc.has(teaching.name)) {
                    acc.set(teaching.name, []);
                }
                acc.get(teaching.name).push(degree);
                processedTeachings.add(teaching.name);
            }
        }
    }
    return acc;
}, new MockMap());

function getDegreesForCourseOptimized(courseUrl) {
    return degreesByCourse.get(courseUrl) || [];
}

const teachings = teachingsArray;

console.time('Baseline');
for (let i = 0; i < 100; i++) {
    for (const teaching of teachings) {
        getDegreesForCourseBaseline(teaching.url);
    }
}
console.timeEnd('Baseline');

console.time('Optimized');
for (let i = 0; i < 100; i++) {
    for (const teaching of teachings) {
        getDegreesForCourseOptimized(teaching.url);
    }
}
console.timeEnd('Optimized');
