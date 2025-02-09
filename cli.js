#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import inquirer from 'inquirer';
import axios from 'axios';
import { program } from 'commander';
import ora from 'ora';

const BLUESKY_API_URL = 'https://public.api.bsky.app/xrpc/app.bsky.feed.searchPosts';

async function searchBlueskyPosts(searchTerms, limit) {
    const spinner = ora('Searching for posts...').start();
    try {
        const response = await axios.get(BLUESKY_API_URL, {
            params: { q: searchTerms.join(' '), limit }
        });
        spinner.succeed('Posts fetched successfully!');
        return response.data.posts || [];
    } catch (error) {
        spinner.fail('Error fetching posts!');
        console.error('Error fetching posts:', error.message);
        return [];
    }
}

function saveJsonFile(posts, outputDir) {
    const filePath = path.join(outputDir, 'posts.json');
    fs.writeFileSync(filePath, JSON.stringify(posts, null, 2));
    console.log(`JSON file saved at: ${filePath}`);
}

function saveHtmlFile(posts, outputDir) {
    const spinner = ora('Generating HTML file...').start();
    const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bluesky Search Results</title>
</head>
<body>
    <h1>Bluesky Search Results</h1>
    <ul>
        ${posts.map(post => `<li><strong>${post.author?.displayName || 'Unknown Author'}</strong>: ${post.text || ''}</li>`).join('')}
    </ul>
</body>
</html>`;
    
    const filePath = path.join(outputDir, 'index.html');
    fs.writeFileSync(filePath, htmlContent);
    spinner.succeed('HTML file saved successfully!');
    console.log(`HTML file saved at: ${filePath}`);
}

async function main() {
    const { searchTerms } = await inquirer.prompt([
        { type: 'input', name: 'searchTerms', message: 'Enter search terms (comma-separated):' }
    ]);
    
    const { postLimit } = await inquirer.prompt([
        { type: 'number', name: 'postLimit', message: 'How many posts do you want to fetch?', default: 10 }
    ]);
    
    const termsArray = searchTerms.split(',').map(term => term.trim());
    const posts = await searchBlueskyPosts(termsArray, postLimit);
    
    if (posts.length === 0) {
        console.log('No posts found.');
        return;
    }
    
    saveJsonFile(posts, process.cwd());
    
    const { generateHtml } = await inquirer.prompt([
        { type: 'confirm', name: 'generateHtml', message: 'Do you want an HTML output?', default: true }
    ]);
    
    if (generateHtml) {
        saveHtmlFile(posts, process.cwd());
    }
}

program.command('search')
    .description('Search for Bluesky posts and save them as JSON and HTML')
    .action(main);

program.parse(process.argv);
