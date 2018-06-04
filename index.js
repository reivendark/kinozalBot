const TelegramBot = require('node-telegram-bot-api');
const request = require("request");
const iconv = require('iconv-lite');
const cheerio = require("cheerio");
const fs = require('fs');

// replace the value below with the Telegram token you receive from @BotFather
const token = '607906404:AAFQIbx5VOIMencvhVgyMLd8Q1JGHbdGO28';

// Create a bot that uses 'polling' to fetch new updates
const bot = new TelegramBot(token, {polling: true});

let _jsonData;
let _watchedModeOn = true;

function readWatched() {
	let data = fs.readFileSync('watched.json');
	let jsonData;
	try {
		jsonData = JSON.parse(data);
		console.dir(jsonData);
	}
	catch (err) {
		console.log('There has been an error parsing your JSON.')
		console.log(err);
	}
	return jsonData;
}

function writeWatched(jsonData) {
	// jsonData = {
	// 	watched: [
	// 		'111231131',
	// 		'123124121'
	// 	]
	// };
	
	var data = JSON.stringify(jsonData);
	
	fs.writeFile('watched.json', data, function (err) {
		if (err) {
		  	console.log('There has been an error saving your configuration data.');
			console.log(err.message);
			return;
		}
		console.log('Configuration saved successfully.')
	});
}

function getPageBody(uri, callback) {
	request({
		uri: uri,
		encoding: null
	}, function(error, response, body) {
		if (error) return (error, null);

		body = iconv.decode(body, "win1251");
		let $ = cheerio.load(body);
		let children = $('.bx1 a');
		let arr = [];
		children.each(function (i, child) {
			let data = {
				url: $(child).attr("href"),
				title: $(child).attr("title"),
				imgUri: $(child).children('img').attr("src")
			};

			let alreadyWatched = false;
			if (_watchedModeOn) {
				for (let i = 0; i < _jsonData.watched.length; i++) {
					if (data.url.includes(_jsonData.watched[i])) {
						alreadyWatched = true;
						break;
					}
				}
			}
			
			if (!alreadyWatched)
				arr.push(data);
		});
		callback(null, arr);
	});
}

function _filter(attr, kind, include, data) {
	var filteredData = data.filter(chunk => chunk[attr].includes(kind) === include);
	return filteredData;
};

bot.onText(/\/get/, (msg, match) => {
	const chatId = msg.chat.id;
	const resp = match[1];
	// TODO (reiven): learn fucking regEx
	_watchedModeOn = !match.input.includes('all');

	_jsonData = readWatched();
	getPageBody('http://kinozal.tv/top.php?w=1', function(err, results) {
			if (err) throw new Error(err);
		
			results = _filter('title', 'РУ', false, results);
			results = _filter('title', '/ 2018 /', true, results);
			results = _filter('title', ' MP3', false, results);

			results.forEach(result => {
				bot.sendMessage(chatId, 'http://kinozal.tv/' + result.url)
				_jsonData.watched.push(result.url.replace('/details.php?id=', ''));
			});

			if (results.length === 0) {
				bot.sendMessage(chatId, 'Вождя уже все смотреть!\nВождя ууумный!\nВождя есть мнооооого булка!')
				return;
			}

			if (_watchedModeOn)
				writeWatched(_jsonData);
		});
});



