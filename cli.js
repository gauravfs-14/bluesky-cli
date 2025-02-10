#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import inquirer from 'inquirer';
import axios from 'axios';
import { program } from 'commander';
import ora from 'ora';
import { parse } from 'json2csv';

const BLUESKY_AUTH_URL = 'https://bsky.social/xrpc/com.atproto.server.createSession';
const BLUESKY_API_URL = 'https://bsky.social/xrpc/app.bsky.feed.searchPosts';

async function authenticate(username, password) {
    const spinner = ora('Authenticating with Bluesky...').start();
    try {
        const response = await axios.post(BLUESKY_AUTH_URL, {
            identifier: username,
            password: password
        });
        spinner.succeed('Authenticated successfully!');
        return response.data.accessJwt;
    } catch (error) {
        spinner.fail('Authentication failed!');
        console.error('Error:', error.response?.data || error.message);
        process.exit(1);
    }
}

function convertUriToWebUrl(uri) {
    return uri.replace('at://', 'https://bsky.app/profile/').replace('/app.bsky.feed.post/', '/post/');
}

function flattenObject(obj, prefix = '') {
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

async function searchBlueskyPosts(params, accessToken) {
    const spinner = ora('Searching for posts...').start();
    try {
        const response = await axios.get(BLUESKY_API_URL, {
            headers: { Authorization: `Bearer ${accessToken}` },
            params
        });
        spinner.succeed('Posts fetched successfully!');
        return response.data.posts || [];
    } catch (error) {
        spinner.fail('Error fetching posts!');
        console.error('Error fetching posts:', error.response?.data || error.message);
        return [];
    }
}

async function main() {
    const { username, appPassword } = await inquirer.prompt([
        { type: 'input', name: 'username', message: 'Enter your Bluesky handle (e.g., yourname.bsky.social):' },
        { type: 'password', name: 'appPassword', message: 'Enter your Bluesky App Password:' }
    ]);
    
    const accessToken = await authenticate(username, appPassword);
    
    const { searchTerms } = await inquirer.prompt([
        { type: 'input', name: 'searchTerms', message: 'Enter search terms (comma-separated):' }
    ]);
    
    const { postLimit } = await inquirer.prompt([
        { 
            type: 'number', 
            name: 'postLimit', 
            message: 'How many posts do you want to fetch?', 
            default: 10,
            validate: input => input > 0 || 'Please enter a positive number.'
        }
    ]);
    
    const { startDate, endDate } = await inquirer.prompt([
        { type: 'input', name: 'startDate', message: 'Enter the start date (YYYY-MM-DD):', validate: input => /^\d{4}-\d{2}-\d{2}$/.test(input) || 'Enter a valid date (YYYY-MM-DD)' },
        { type: 'input', name: 'endDate', message: 'Enter the end date (YYYY-MM-DD):', validate: input => /^\d{4}-\d{2}-\d{2}$/.test(input) || 'Enter a valid date (YYYY-MM-DD)' }
    ]);
    
    const { sort } = await inquirer.prompt([
        { type: 'list', name: 'sort', message: 'Choose sorting order:', choices: ['latest', 'top'], default: 'latest' }
    ]);
    
    const { fileName } = await inquirer.prompt([
        { type: 'input', name: 'fileName', message: 'Enter the base file name (without extension):', default: 'posts' }
    ]);
    
    const formattedStartDate = `${startDate}T00:00:00Z`;
    const formattedEndDate = `${endDate}T23:59:59Z`;
    
    const params = {
        q: searchTerms.split(',').map(term => term.trim()).join(' '),
        limit: postLimit,
        since: formattedStartDate,
        until: formattedEndDate,
        sort
    };
    
    const posts = await searchBlueskyPosts(params, accessToken);
    
    if (posts.length === 0) {
        console.log('No posts found.');
        return;
    }
    
    fs.writeFileSync(path.join(process.cwd(), `${fileName}.json`), JSON.stringify(posts, null, 2));
    console.log(`JSON file saved at: ${path.join(process.cwd(), `${fileName}.json`)}`);
    
    const { generateCsv } = await inquirer.prompt([
        { type: 'confirm', name: 'generateCsv', message: 'Do you want a CSV output?', default: true }
    ]);
    
    if (generateCsv) {
        const flattenedPosts = posts.map(post => flattenObject(post));
        const csv = parse(flattenedPosts);
        fs.writeFileSync(path.join(process.cwd(), `${fileName}.csv`), csv);
        console.log(`CSV file saved at: ${path.join(process.cwd(), `${fileName}.csv`)}`);
    }
}

program.command('search')
    .description('Search for Bluesky posts and save them as JSON, CSV, and HTML')
    .action(main);

program.parse(process.argv);
