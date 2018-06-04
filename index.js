const TelegramBot = require('node-telegram-bot-api');
const request = require("request");
const iconv = require('iconv-lite');
const cheerio = require("cheerio");
const fs = require('fs');

// replace the value below with the Telegram token you receive from @BotFather
const token = '607906404:AAFQIbx5VOIMencvhVgyMLd8Q1JGHbdGO28';

// Create a bot that uses 'polling' to fetch new updates
const bot = new TelegramBot(token, {polling: true});

let _manualSearch = false;

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

function getPageBody(uri, watchedModeOn, callback) {
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
			if (watchedModeOn) {
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

function filter(attr, kind, include, data) {
	var filteredData = data.filter(chunk => chunk[attr].includes(kind) === include);
	return filteredData;
};

function getResult(chatId, watchedModeOn, manualSearch) {
	if (!chatId) return;
	_jsonData = readWatched();
	getPageBody('http://kinozal.tv/top.php?w=1', watchedModeOn, function(err, results) {
			if (err) throw new Error(err);
		
			results = filter('title', 'РУ', false, results);
			results = filter('title', '/ 2018 /', true, results);
			results = filter('title', ' MP3', false, results);

			results.forEach(result => {
				bot.sendMessage(chatId, 'http://kinozal.tv/' + result.url)
				_jsonData.watched.push(result.url.replace('/details.php?id=', ''));
			});

			if (manualSearch)
				bot.sendMessage(chatId, 'Пока все, Вождя');
			
			if (results.length === 0)
				return;

			if (watchedModeOn)
				writeWatched(_jsonData);
		});
}

bot.onText(/\/get/, (msg, match) => {
	var chatId = msg.chat.id;
	// TODO (reiven): learn fucking regEx

	if (match.input.includes('alive')) {
		bot.sendMessage(chatId, 'Я тут, Вождя');
		return;
	}
	
	bot.sendMessage(chatId, 'Моя смотреть, Вождя. Твоя ждать...');
	let watchedModeOn = !match.input.includes('all');
	let manualSearch = true;
	getResult(chatId, watchedModeOn, manualSearch);
});

bot.onText(/\/start/, (msg, match) => {
	var chatId = msg.chat.id;
	if (match.input.includes('interval')) {
		bot.sendMessage(chatId, 'Запускать интервал, Вождя');
		intervalSearch(chatId);
		return;
	}
});

function intervalSearch(chatId) {
	setInterval(function () {
		let myTimeZone = 2;
		let offset = (new Date().getTimezoneOffset() / 60) * myTimeZone;
		let current_hour = (new Date(new Date().getTime() + offset)).getHours();
		if (current_hour >= 9 && current_hour <= 22) {
			let watchedModeOn = true;
			let manualSearch = false;
			getResult(chatId, watchedModeOn, manualSearch);
			// bot.sendMessage(chatId, 'Провека по времени, Вождя. Сам просить!');
		}
	}, 1000 * 60 * 10); // 10 minutes
}

// TODO (reiven): customize timezone ???
// TODO (reiven): add interval stop
// TODO (reiven): add interval settings???

