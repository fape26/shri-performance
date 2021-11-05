function quantile(arr, q) {
    const sorted = arr.sort((a, b) => a - b);
    const pos = (sorted.length - 1) * q;
    const base = Math.floor(pos);
    const rest = pos - base;

    if (sorted[base + 1] !== undefined) {
        return Math.floor(sorted[base] + rest * (sorted[base + 1] - sorted[base]));
    } else {
        return Math.floor(sorted[base]);
    }
};

function prepareData(result) {
	return result.data.map(item => {
		item.date = item.timestamp.split('T')[0];

		return item;
	});
}

// TODO: реализовать
// показать значение метрики за несколько день
function addMetricByPeriod(data, page, name, start, end) {
	let sampleData = data.filter(item => item.page == page && item.name == name && item.date >= start && item.date <= end)
	.map(item => item.value);

	let result = {};
	result.page = page;
	result.hits = sampleData.length;
	result.p25 = quantile(sampleData, 0.25);
	result.p50 = quantile(sampleData, 0.5);
	result.p75 = quantile(sampleData, 0.75);
	result.p95 = quantile(sampleData, 0.95);
	
	return result;
}

function showMetricByPeriod(data, page, start, end) {

	let table = {};
	table.connect = addMetricByPeriod(data, page, 'connect', start, end);
	table.ttfb = addMetricByPeriod(data, page, 'ttfb', start, end);
	table.color = addMetricByPeriod(data, page, 'color', start, end);
	table.videoLoad = addMetricByPeriod(data, page, 'videoLoaded', start, end);
	table.paused = addMetricByPeriod(data, page, 'paused', start, end);
	table.played = addMetricByPeriod(data, page, 'played', start, end);

	console.log(`значение метрики c ${start} по ${end}`);
	console.table(table);
}

// показать сессию пользователя
function showSession(data, page, reqId, date) {
	let sampleData = data.filter(item => item.requestId == reqId && item.date == date)
	.map((item) => item.value);

	let result = {};
	result.requestId = reqId;
	result.page = page;
	result.hits = sampleData.length;
	result.p25 = quantile(sampleData, 0.25);
	result.p50 = quantile(sampleData, 0.5);
	result.p75 = quantile(sampleData, 0.75);
	result.p95 = quantile(sampleData, 0.95);

	// return result;
	console.log(`Сессия пользователя`);
	console.table(result);
}

// сравнить метрику в разных срезах
function compareMetric(data, page, name, section) {
	let sectionValues = new Set();
	let arr = [];

	for (item of data) {
		sectionValues.add(item.additional[section])
	}

	for (value of sectionValues) {
		let sampleData = data.filter(
			(item) => item.page == page && item.name == name && item.additional[section] === value
		).map((item) => item.value);
		arr.push({
			name: name,
			page: page,
			hits: sampleData.length,
			p25: quantile(sampleData, 0.25),
			p50: quantile(sampleData, 0.5),
			p75: quantile(sampleData, 0.75),
			p95: quantile(sampleData, 0.95),
			[section]: value
		})
	}
	console.log(`Сравнение в срезе ${name}`);
	console.table(arr);
}



// Пример
// добавить метрику за выбранный день
function addMetricByDate(data, page, name, date) {
	let sampleData = data.filter(item => item.page == page && item.name == name && item.date == date)
					.map(item => item.value);

	let result = {};

	result.hits = sampleData.length;
	result.p25 = quantile(sampleData, 0.25);
	result.p50 = quantile(sampleData, 0.5);
	result.p75 = quantile(sampleData, 0.75);
	result.p95 = quantile(sampleData, 0.95);

	return result;
}
// рассчитывает все метрики за день
function calcMetricsByDate(data, page, date) {
	console.log(`All metrics for ${date}:`);

	let table = {};
	table.connect = addMetricByDate(data, page, 'connect', date);
	table.ttfb = addMetricByDate(data, page, 'ttfb', date);
	table.color = addMetricByDate(data, page, 'color', date);
	table.videoLoad = addMetricByDate(data, page, 'videoLoaded', date);
	table.paused = addMetricByDate(data, page, 'paused', date);
	table.played = addMetricByDate(data, page, 'played', date);

	// table.square = addMetricByDate(data, page, 'square', date);
	// table.load = addMetricByDate(data, page, 'load', date);
	// table.generate = addMetricByDate(data, page, 'generate', date);
	// table.draw = addMetricByDate(data, page, 'draw', date);
	console.log(`все метрики за день`);
	console.table(table);
};

fetch('https://shri.yandex/hw/stat/data?counterId=E66AC101-A7D2-48E4-A703-2D7260962B18')
	.then(res => res.json())
	.then(result => {
		let data = prepareData(result);
		//получаем метрику за определенную дату
		calcMetricsByDate(data, 'send test', '2021-10-28');
		
		compareMetric(data, 'send test', 'ttfb', 'platform');
		compareMetric(data, 'send test', 'videoLoaded', 'platform');
		compareMetric(data, 'send test', 'played', 'platform');
		showSession(data, 'send test', '330794325060', '2021-10-28')
		showMetricByPeriod(data, 'send test', '2021-10-28', '2021-11-05')
		// добавить свои сценарии, реализовать функции выше
	});
