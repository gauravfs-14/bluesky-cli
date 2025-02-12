import fs from 'fs';
import path from 'path';
import { parse } from 'json2csv';

export function flattenObject(obj, prefix = '') {
    return Object.keys(obj).reduce((acc, key) => {
        const propName = prefix ? `${prefix}.${key}` : key;
        if (typeof obj[key] === 'object' && obj[key] !== null) {
            Object.assign(acc, flattenObject(obj[key], propName));
        } else {
            acc[propName] = obj[key];
        }
        return acc;
    }, {});
}

const SAVED_POSTS_FILE = path.join(process.cwd(), 'collected_posts.json');
export function loadCollectedPostIds() {
    if (fs.existsSync(SAVED_POSTS_FILE)) {
        const data = fs.readFileSync(SAVED_POSTS_FILE, 'utf-8');
        return new Set(JSON.parse(data));
    }
    return new Set();
}

export function saveCollectedPostIds(postIds) {
    fs.writeFileSync(SAVED_POSTS_FILE, JSON.stringify([...postIds], null, 2));
}

export function saveDataToCSV(posts, fileName = 'firehose_posts.csv') {
    if (posts.length === 0) return;
    const csv = parse(posts);
    const filePath = path.join(process.cwd(), fileName);
    fs.writeFileSync(filePath, csv);
    console.log(`CSV file saved at: ${filePath}`);
}

export function bigIntReplacer(key, value) {
    return typeof value === 'bigint' ? value.toString() : value;
}
