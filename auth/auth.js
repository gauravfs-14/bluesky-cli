import ora from 'ora';
import axios from 'axios';

const BLUESKY_AUTH_URL = 'https://bsky.social/xrpc/com.atproto.server.createSession';

export async function authenticate(username, password) {
    const spinner = ora('Authenticating with Bluesky...').start();
    try {
        const response = await axios.post(BLUESKY_AUTH_URL, { identifier: username, password });
        spinner.succeed('Authenticated successfully!');
        return response.data.accessJwt;
    } catch (error) {
        spinner.fail('Authentication failed!');
        console.error('Error:', error.response?.data || error.message);
        process.exit(1);
    }
}
