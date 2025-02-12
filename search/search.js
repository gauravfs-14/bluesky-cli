import fs from 'fs';
import path from 'path';
import inquirer from 'inquirer';
import ora from 'ora';
import axios from 'axios';
import { parse } from 'json2csv';
import { flattenObject } from '../utils/utils.js';
import { authenticate } from '../auth/auth.js';

const BLUESKY_API_URL = 'https://bsky.social/xrpc/app.bsky.feed.searchPosts';

export async function searchMain() {
	// Prompt for authentication
	const { username, appPassword } = await inquirer.prompt([
		{ type: 'input', name: 'username', message: 'Enter your Bluesky handle (e.g., yourname.bsky.social):' },
		{ type: 'password', name: 'appPassword', message: 'Enter your Bluesky App Password:', mask: '*' }
	]);
	const accessToken = await authenticate(username, appPassword);

	// Prompt for search inputs
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

	const params = { q: searchTerms.split(',').map(term => term.trim()).join(' '), limit: postLimit };
	const spinner = ora('Searching for posts...').start();
	try {
		const response = await axios.get(BLUESKY_API_URL, {
			headers: { Authorization: `Bearer ${accessToken}` },
			params
		});
		spinner.succeed('Posts fetched successfully!');
		const posts = response.data.posts || [];
		if (posts.length === 0) {
			console.log('No posts found.');
			return;
		}
		const fileName = 'posts';
		fs.writeFileSync(path.join(process.cwd(), `${fileName}.json`), JSON.stringify(posts, null, 2));
		console.log(`JSON file saved at: ${path.join(process.cwd(), `${fileName}.json`)}`);

		const flattenedPosts = posts.map(post => flattenObject(post));
		const csv = parse(flattenedPosts);
		fs.writeFileSync(path.join(process.cwd(), `${fileName}.csv`), csv);
		console.log(`CSV file saved at: ${path.join(process.cwd(), `${fileName}.csv`)}`);
	} catch (error) {
		spinner.fail('Error fetching posts!');
		console.error('Error:', error.response?.data || error.message);
	}
}
