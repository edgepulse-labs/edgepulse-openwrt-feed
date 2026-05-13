'use strict';
'require view';
'require fs';
'require poll';
'require ui';

function parseJson(data, fallback, message) {
	try {
		return JSON.parse(data || '{}');
	} catch (e) {
		fallback.error = message;
		return fallback;
	}
}

function sampleKey(sample) {
	return '%s|%s'.format(sample.metric || '', sample.labels || '');
}

function sampleValue(samples, metric, labels) {
	var sample = samples[sampleKey({ metric: metric, labels: labels || '' })];

	return sample && sample.value != null ? Number(sample.value) : null;
}

function renderNumber(value, digits, suffix) {
	if (value == null || isNaN(value))
		return '-';

	return Number(value).toFixed(digits == null ? 1 : digits) + (suffix ? ' ' + suffix : '');
}

function renderPercent(value) {
	if (value == null || isNaN(value))
		return '-';

	return Number(value * 100).toFixed(1) + '%';
}

function clampPercent(value) {
	if (value == null || isNaN(value))
		return 0;

	return Math.max(0, Math.min(100, Number(value)));
}

function healthClass(value, warn, critical) {
	if (value == null || isNaN(value))
		return 'is-muted';
	if (value >= critical)
		return 'is-critical';
	if (value >= warn)
		return 'is-warn';

	return 'is-good';
}

function statusClass(status) {
	status = (status || '').toLowerCase();

	if (!status || status === 'ok' || status === 'up' || status === 'running')
		return 'is-good';
	if (status === 'warn' || status === 'warning' || status === 'degraded')
		return 'is-warn';

	return 'is-critical';
}

function classifySamples(samples) {
	var index = {};
	var collectors = [];
	var network = [];
	var thermal = [];

	(samples || []).forEach(function(sample) {
		var metric = sample.metric || '';

		index[sampleKey(sample)] = sample;

		if (metric.indexOf('collector.') === 0) {
			collectors.push(sample);
		} else if (metric.indexOf('network.') === 0) {
			network.push(sample);
		} else if (metric.indexOf('thermal.') === 0) {
			thermal.push(sample);
		}
	});

	return {
		index: index,
		collectors: collectors,
		network: network,
		thermal: thermal
	};
}

function statCard(label, value, detail, state, percent) {
	var bar = percent != null ? E('div', { 'class': 'edgepulse-bar' }, [
		E('span', { 'style': 'width:%d%%'.format(clampPercent(percent)) })
	]) : '';

	return E('div', { 'class': 'edgepulse-stat %s'.format(state || 'is-muted') }, [
		E('div', { 'class': 'edgepulse-stat-label' }, label),
		E('div', { 'class': 'edgepulse-stat-value' }, value),
		bar,
		E('div', { 'class': 'edgepulse-stat-detail' }, detail || '')
	]);
}

function renderThermal(thermal) {
	var zones = (thermal || []).map(function(sample) {
		var value = sample.value != null ? Number(sample.value) : null;

		return E('div', { 'class': 'edgepulse-zone %s'.format(healthClass(value, 70, 85)) }, [
			E('span', { 'class': 'edgepulse-zone-name' }, sample.labels || _('Zone')),
			E('span', { 'class': 'edgepulse-zone-value' }, renderNumber(value, 1, 'C'))
		]);
	});

	if (!zones.length)
		zones.push(E('div', { 'class': 'edgepulse-empty' }, _('No thermal samples')));

	return zones;
}

function renderCollectorSummary(collectors) {
	var rows = (collectors || []).map(function(sample) {
		var name = (sample.metric || '').replace(/^collector\./, '') || _('Collector');
		var status = sample.status || 'ok';

		return E('div', { 'class': 'edgepulse-collector %s'.format(statusClass(status)) }, [
			E('span', {}, name),
			E('strong', {}, status)
		]);
	});

	if (!rows.length)
		rows.push(E('div', { 'class': 'edgepulse-empty' }, _('All collectors OK')));

	return rows;
}

function renderNetworkRows(network) {
	var rows = (network || []).slice(0, 8).map(function(sample) {
		var value = sample.value != null ? Number(sample.value) : null;

		return E('tr', {}, [
			E('td', {}, (sample.metric || '').replace(/^network\./, '') || '-'),
			E('td', {}, sample.labels || ''),
			E('td', { 'class': 'right' }, value != null ? renderNumber(value, value >= 100 ? 0 : 2) : '-')
		]);
	});

	if (!rows.length)
		rows.push(E('tr', {}, [ E('td', { 'colspan': 3 }, _('No network samples')) ]));

	return rows;
}

function telemetryView(parsed, latest) {
	var memory = parsed.memory || {};
	var load = parsed.load || {};
	var classified = classifySamples(latest.samples || []);
	var memPercent = memory.used_ratio != null ? Number(memory.used_ratio) * 100 : null;
	var conntrack = sampleValue(classified.index, 'network.conntrack_count', '');
	var cpuUser = sampleValue(classified.index, 'cpu.user_jiffies', '');
	var cpuSystem = sampleValue(classified.index, 'cpu.system_jiffies', '');
	var cpuIdle = sampleValue(classified.index, 'cpu.idle_jiffies', '');
	var cpuTotal = cpuUser != null && cpuSystem != null && cpuIdle != null ? cpuUser + cpuSystem + cpuIdle : null;
	var cpuBusy = cpuTotal ? ((cpuUser + cpuSystem) / cpuTotal) * 100 : null;
	var hottest = null;
	var load1 = load['1m'] != null ? Number(load['1m']) : null;
	var badCollectors = classified.collectors.filter(function(sample) {
		return statusClass(sample.status) !== 'is-good';
	}).length;

	classified.thermal.forEach(function(sample) {
		var value = sample.value != null ? Number(sample.value) : null;
		if (value != null && (hottest == null || value > hottest))
			hottest = value;
	});

	return E('div', { 'class': 'edgepulse-dashboard' }, [
		E('style', {}, [
			'.edgepulse-dashboard{display:grid;gap:16px}.edgepulse-title{display:flex;align-items:flex-end;justify-content:space-between;gap:12px;flex-wrap:wrap}.edgepulse-title small{color:#667085}.edgepulse-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:10px}.edgepulse-panel{border:1px solid #d8dde6;border-radius:6px;padding:12px;background:#fff}.edgepulse-panel h3{margin:0 0 10px 0;font-size:15px}.edgepulse-stat{border:1px solid #d8dde6;border-left-width:5px;border-radius:6px;padding:10px;background:#fff;min-height:92px}.edgepulse-stat-label{color:#667085;font-size:12px;text-transform:uppercase}.edgepulse-stat-value{font-size:24px;font-weight:700;line-height:1.2;margin-top:4px}.edgepulse-stat-detail{color:#667085;font-size:12px;margin-top:6px}.edgepulse-bar{height:7px;background:#edf1f7;border-radius:4px;overflow:hidden;margin-top:8px}.edgepulse-bar span{display:block;height:100%;background:currentColor}.edgepulse-zone,.edgepulse-collector{display:flex;justify-content:space-between;gap:10px;border:1px solid #e3e7ee;border-left-width:5px;border-radius:6px;padding:8px 10px;margin-top:6px}.edgepulse-zone-name{overflow-wrap:anywhere}.edgepulse-zone-value,.edgepulse-collector strong{white-space:nowrap}.edgepulse-empty{color:#667085;padding:8px 0}.is-good{color:#16823a;border-left-color:#16823a}.is-warn{color:#a05a00;border-left-color:#d98500}.is-critical{color:#b42318;border-left-color:#d92d20}.is-muted{color:#667085;border-left-color:#98a2b3}@media (min-width:900px){.edgepulse-wide{display:grid;grid-template-columns:minmax(0,1fr) minmax(280px,.7fr);gap:16px}}'
		]),
		E('div', { 'class': 'edgepulse-title' }, [
			E('div', {}, [
				E('h2', {}, _('EdgePulse Overview'))
			]),
			E('small', {}, _('Updated') + ': ' + (parsed.timestamp || latest.timestamp || '-'))
		]),
		E('div', { 'class': 'edgepulse-grid' }, [
			statCard(_('Service'), parsed.version ? _('Online') : _('Unknown'), parsed.version || '-', parsed.version ? 'is-good' : 'is-muted'),
			statCard(_('Load 1m'), renderNumber(load1, 2), _('5m / 15m') + ': %s / %s'.format(load['5m'] || '-', load['15m'] || '-'), healthClass(load1, 1.5, 3), load1 != null ? load1 * 25 : null),
			statCard(_('Memory'), renderPercent(memory.used_ratio), _('Used ratio'), healthClass(memPercent, 75, 90), memPercent),
			statCard(_('CPU Busy'), cpuBusy != null ? Number(cpuBusy).toFixed(1) + '%' : '-', _('User + system jiffies'), healthClass(cpuBusy, 70, 90), cpuBusy),
			statCard(_('Temperature'), renderNumber(hottest, 1, 'C'), _('Hottest thermal zone'), healthClass(hottest, 70, 85), hottest != null ? hottest : null),
			statCard(_('Conntrack'), conntrack != null ? renderNumber(conntrack, 0) : '-', _('Active tracked connections'), healthClass(conntrack, 4096, 12000), conntrack != null ? conntrack / 120 : null),
			statCard(_('Collectors'), badCollectors ? _('%d issue(s)').format(badCollectors) : _('OK'), _('%d collector sample(s)').format(classified.collectors.length), badCollectors ? 'is-warn' : 'is-good')
		]),
		E('div', { 'class': 'edgepulse-wide' }, [
			E('div', { 'class': 'edgepulse-panel' }, [
				E('h3', {}, _('Network')),
				E('table', { 'class': 'table' }, [
					E('tr', { 'class': 'tr table-titles' }, [
						E('th', { 'class': 'th' }, _('Metric')),
						E('th', { 'class': 'th' }, _('Labels')),
						E('th', { 'class': 'th right' }, _('Value'))
					])
				].concat(renderNetworkRows(classified.network)))
			]),
			E('div', {}, [
				E('div', { 'class': 'edgepulse-panel' }, [
					E('h3', {}, _('Thermal')),
					E('div', {}, renderThermal(classified.thermal))
				]),
				E('div', { 'class': 'edgepulse-panel', 'style': 'margin-top:16px' }, [
					E('h3', {}, _('Collectors')),
					E('div', {}, renderCollectorSummary(classified.collectors))
				])
			])
		])
	]);
}

return view.extend({
	handleSaveApply: null,
	handleSave: null,
	handleReset: null,

	loadTelemetry: function() {
		return Promise.all([
			fs.exec_direct('/usr/libexec/edgepulse-luci', [ 'status' ])
				.catch(function(err) {
					return JSON.stringify({ error: String(err) });
				}),
			fs.exec_direct('/usr/libexec/edgepulse-luci', [ 'latest' ])
				.catch(function(err) {
					return JSON.stringify({ error: String(err), samples: [] });
				})
		]);
	},

	load: function() {
		return this.loadTelemetry();
	},

	renderTelemetry: function(data) {
		var parsed = parseJson((data && data[0]) || '{}', {}, _('Unable to parse EdgePulse status output'));
		var latest = parseJson((data && data[1]) || '{}', { samples: [] }, _('Unable to parse EdgePulse latest metrics output'));

		if (parsed.error)
			ui.addNotification(null, E('p', {}, parsed.error), 'danger');
		if (latest.error)
			ui.addNotification(null, E('p', {}, latest.error), 'danger');

		return telemetryView(parsed, latest);
	},

	render: function(data) {
		var root = E('div', { 'class': 'cbi-map', 'data-edgepulse-overview': '1' }, [
			this.renderTelemetry(data)
		]);

		poll.add(function() {
			return this.loadTelemetry().then(function(updated) {
				var target = document.querySelector('[data-edgepulse-overview]');

				if (target) {
					target.textContent = '';
					target.appendChild(this.renderTelemetry(updated));
				}
			}.bind(this));
		}.bind(this), 5);

		return root;
	}
});
