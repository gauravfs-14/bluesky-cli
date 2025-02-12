#!/usr/bin/env node

import { program } from 'commander';
import { searchMain } from './search/search.js';
import { firehoseMain } from './firehose/firehose.js';

program
	.command('firehose')
	.description('Continuously collect posts from Bluesky’s Firehose API and save them to CSV')
	.action(firehoseMain);

program
	.command('search')
	.description('Search for Bluesky posts and save them as JSON and CSV')
	.action(searchMain);

program.parse(process.argv);
