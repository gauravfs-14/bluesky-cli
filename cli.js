#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import inquirer from 'inquirer';
import axios from 'axios';
import { program } from 'commander';
import ora from 'ora';

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
        { type: 'number', name: 'postLimit', message: 'How many posts do you want to fetch?', default: 10 }
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
        q: searchTerms,
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
    
    const { generateHtml } = await inquirer.prompt([
        { type: 'confirm', name: 'generateHtml', message: 'Do you want an HTML output?', default: true }
    ]);
    
    if (generateHtml) {
        const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bluesky Search Results</title>
    <style>
        body { font-family: Arial, sans-serif; padding: 20px; }
        .post { border: 1px solid #ccc; padding: 10px; margin: 10px 0; }
        .post strong { color: #007bff; }
        .metadata { font-size: 12px; color: gray; }
        .post img, .post video { max-width: 100%; height: auto; margin-top: 10px; }
    </style>
</head>
<body>
    <h1>Bluesky Search Results</h1>
    ${posts.map(post => {
        const postUrl = convertUriToWebUrl(post.uri);
        return `
        <div class="post">
            <strong>${post.author?.displayName || 'Unknown Author'}</strong> (@${post.author?.handle || 'Unknown'})
            <p>${post.record?.text || 'No content'}</p>
            <div class="metadata">
                <p>Created At: ${post.createdAt || 'N/A'}</p>
                <p>Likes: ${post.likeCount || 0} | Replies: ${post.replyCount || 0} | Reposts: ${post.repostCount || 0}</p>
                <p><a href="${postUrl}" target="_blank">View Post</a></p>
            </div>
        </div>`;
    }).join('')}
</body>
</html>`;
        fs.writeFileSync(path.join(process.cwd(), `${fileName}.html`), htmlContent);
        console.log(`HTML file saved at: ${path.join(process.cwd(), `${fileName}.html`)}`);
    }
}

program.command('search')
    .description('Search for Bluesky posts and save them as JSON and HTML')
    .action(main);

program.parse(process.argv);
