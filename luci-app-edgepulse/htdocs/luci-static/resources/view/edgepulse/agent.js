'use strict';
'require view';
'require fs';
'require ui';

return view.extend({
	load: function() {
		return Promise.all([
			fs.exec_direct('/usr/libexec/edgepulse-luci', [ 'agent-status' ])
				.catch(function(err) {
					return JSON.stringify({ error: String(err) });
				}),
			fs.exec_direct('/usr/libexec/edgepulse-luci', [ 'agent-memory' ])
				.catch(function(err) {
					return JSON.stringify({ error: String(err), memory: [] });
				}),
			fs.exec_direct('/usr/libexec/edgepulse-luci', [ 'agent-models' ])
				.catch(function(err) {
					return JSON.stringify({ error: String(err), models: [] });
				}),
			fs.exec_direct('/usr/libexec/edgepulse-luci', [ 'agent-models-remote' ])
				.catch(function(err) {
					return JSON.stringify({ error: String(err), models: [] });
				}),
			fs.exec_direct('/usr/libexec/edgepulse-luci', [ 'agent-chat-list', 'default' ])
				.catch(function(err) {
					return JSON.stringify({ error: String(err), messages: [] });
				})
		]);
	},

	runDiagnostic: function(ev) {
		var textarea = document.querySelector('[data-edgepulse-agent-question]');
		var output = document.querySelector('[data-edgepulse-agent-output]');
		var transcript = document.querySelector('[data-edgepulse-agent-transcript]');
		var message = ev && ev.currentTarget && ev.currentTarget.getAttribute('data-edgepulse-agent-prompt') ||
			textarea && textarea.value ||
			'Run a local EdgePulse diagnostic.';

		if (output)
			output.textContent = _('Sending message...');

		return fs.exec_direct('/usr/libexec/edgepulse-luci', [ 'agent-chat-ask', 'default', message ])
			.then(function(result) {
				var parsed;

				try {
					parsed = JSON.parse(result || '{}');
					if (output)
						output.textContent = this.renderDiagnosticReport(parsed);
				} catch (e) {
					if (output)
						output.textContent = result || _('No output');
				}

				return fs.exec_direct('/usr/libexec/edgepulse-luci', [ 'agent-chat-list', 'default' ]);
			})
			.then(function(chatResult) {
				var parsed;

				try {
					parsed = JSON.parse(chatResult || '{}');
					if (transcript)
						transcript.textContent = this.renderTranscript(parsed.messages || []);
				} catch (e) {}
			}.bind(this))
			.catch(function(err) {
				ui.addNotification(null, E('p', {}, String(err)), 'danger');
				if (output)
					output.textContent = String(err);
			});
	},

	renderTranscript: function(messages) {
		if (!messages || !messages.length)
			return _('No shared conversation messages yet. CLI and LuCI messages will appear here.');

		return messages.map(function(item) {
			return '[' + (item.role || '-') + '] ' + (item.content || '');
		}).join('\n\n');
	},

	renderDiagnosticReport: function(result) {
		var lines = [];
		var snapshot = result.snapshot || {};
		var findings = result.findings || [];
		var tools = result.tools || [];
		var modelResponse = result.model_response || {};
		var failover = result.model_failover || {};

		lines.push(_('Diagnostic Report'));
		lines.push('=================');
		lines.push('');
		lines.push(_('Summary'));
		lines.push('- ' + (result.answer || _('No answer returned.')));
		lines.push('');
		lines.push(_('Request'));
		lines.push('- ' + _('Question') + ': ' + (result.question || '-'));
		lines.push('- ' + _('Request ID') + ': ' + (result.request_id || '-'));
		lines.push('- ' + _('Conversation') + ': ' + (result.conversation_id || 'default'));
		lines.push('- ' + _('Policy') + ': ' + (result.policy_profile || '-'));
		lines.push('');
		lines.push(_('Model'));
		lines.push('- ' + _('Status') + ': ' + (result.model_status || modelResponse.status || '-'));
		lines.push('- ' + _('HTTP status') + ': ' + (modelResponse.http_status || 0));
		lines.push('- ' + _('Finish reason') + ': ' + (modelResponse.finish_reason || '-'));
		lines.push('- ' + _('Failover attempts') + ': ' + (failover.attempts || '-'));
		lines.push('- ' + _('Selected provider') + ': ' + (failover.selected_provider || '-'));
		lines.push('');
		lines.push(_('Current Snapshot'));
		lines.push('- ' + _('Uptime') + ': ' + (snapshot.uptime_sec != null ? Math.round(snapshot.uptime_sec) + 's' : '-'));
		lines.push('- ' + _('Load') + ': ' + [ snapshot.load1, snapshot.load5, snapshot.load15 ].map(function(v) {
			return v != null ? Number(v).toFixed(2) : '-';
		}).join(' / '));
		lines.push('- ' + _('Memory used') + ': ' + (snapshot.memory_used_ratio != null ? (Number(snapshot.memory_used_ratio) * 100).toFixed(1) + '%' : '-'));
		lines.push('');
		lines.push(_('Findings'));
		if (findings.length) {
			findings.forEach(function(item) {
				lines.push('- [' + (item.severity || '-') + '] ' + (item.message || '-'));
			});
		} else {
			lines.push('- ' + _('No findings returned.'));
		}
		lines.push('');
		lines.push(_('Tool Evidence'));
		if (tools.length) {
			tools.forEach(function(tool) {
				var status = tool.status || '-';
				var exitCode = tool.exit_code != null ? ', exit=' + tool.exit_code : '';
				lines.push('- ' + (tool.name || '-') + ': ' + status + exitCode);
			});
		} else {
			lines.push('- ' + _('No tools were reported.'));
		}

		return lines.join('\n');
	},
	copyText: function(text) {
		if (navigator.clipboard && navigator.clipboard.writeText)
			return navigator.clipboard.writeText(text).then(function() {
				ui.addNotification(null, E('p', {}, _('Copied')), 'info');
			});

		ui.addNotification(null, E('p', {}, text), 'info');
		return Promise.resolve();
	},

	renderModelRows: function(models) {
		var rows = [];

		(models || []).forEach(function(model) {
			var snippet = [
				'config model ' + "'" + (model.name || 'remote_reasoner_copy') + "'",
				"\toption enabled '" + (model.enabled ? '1' : '0') + "'",
				"\toption priority '" + (model.priority || 100) + "'",
				"\toption role '" + (model.role || 'planner,analyzer,responder') + "'",
				"\toption base_url '" + (model.base_url || '') + "'",
				"\toption model '" + (model.model || '') + "'",
				"\toption api_key_env '" + (model.api_key_env || 'EDGEPULSE_AI_API_KEY') + "'",
				"\toption timeout_sec '" + (model.timeout_sec || 60) + "'",
				"\toption retry_count '" + (model.retry_count || 0) + "'",
				"\toption max_tokens '" + (model.max_tokens || 2048) + "'",
				"\toption no_think '" + (model.no_think ? '1' : '0') + "'"
			].join('\n');

			rows.push(E('div', { 'class': 'tr' }, [
				E('div', { 'class': 'td left' }, model.name || '-'),
				E('div', { 'class': 'td left' }, String(model.priority || '-')),
				E('div', { 'class': 'td left' }, model.enabled ? _('Yes') : _('No')),
				E('div', { 'class': 'td left' }, model.configured ? _('Yes') : _('No')),
				E('div', { 'class': 'td left' }, model.model || '-'),
				E('div', { 'class': 'td left' }, [
					E('button', {
						'class': 'btn cbi-button',
						'click': this.copyText.bind(this, snippet)
					}, [ _('Copy') ])
				])
			]));
		}, this);

		if (!rows.length)
			rows.push(E('div', { 'class': 'tr' }, [
				E('div', { 'class': 'td left', 'colspan': '6' }, _('No models configured'))
			]));

		return rows;
	},

	render: function(data) {
		var status = {};
		var agent = {};
		var model = {};
		var memory = {};
		var models = {};
		var remoteModels = {};
		var chat = {};

		try {
			status = JSON.parse((data && data[0]) || '{}');
		} catch (e) {
			status = { error: _('Unable to parse EdgePulse agent status output') };
		}

		try {
			memory = JSON.parse((data && data[1]) || '{}');
		} catch (e) {
			memory = { error: _('Unable to parse EdgePulse agent memory output'), memory: [] };
		}
		try {
			models = JSON.parse((data && data[2]) || '{}');
		} catch (e) {
			models = { error: _('Unable to parse EdgePulse model list output'), models: [] };
		}
		try {
			remoteModels = JSON.parse((data && data[3]) || '{}');
		} catch (e) {
			remoteModels = { error: _('Unable to parse remote model list output'), models: [] };
		}
		try {
			chat = JSON.parse((data && data[4]) || '{}');
		} catch (e) {
			chat = { error: _('Unable to parse shared conversation output'), messages: [] };
		}

		if (status.error)
			ui.addNotification(null, E('p', {}, status.error), 'danger');
		if (memory.error)
			ui.addNotification(null, E('p', {}, memory.error), 'danger');
		if (models.error)
			ui.addNotification(null, E('p', {}, models.error), 'danger');

		agent = status.agent || {};
		model = status.model || {};

		return E('div', { 'class': 'cbi-map' }, [
			E('h2', {}, _('EdgePulse AI Agent')),
			E('div', { 'class': 'table' }, [
				E('div', { 'class': 'tr' }, [
					E('div', { 'class': 'td left' }, _('Status')),
					E('div', { 'class': 'td left' }, status.status || '-')
				]),
				E('div', { 'class': 'tr' }, [
					E('div', { 'class': 'td left' }, _('Enabled')),
					E('div', { 'class': 'td left' }, agent.enabled ? _('Yes') : _('No'))
				]),
				E('div', { 'class': 'tr' }, [
					E('div', { 'class': 'td left' }, _('Policy')),
					E('div', { 'class': 'td left' }, agent.policy_profile || '-')
				]),
				E('div', { 'class': 'tr' }, [
					E('div', { 'class': 'td left' }, _('Local only')),
					E('div', { 'class': 'td left' }, agent.local_only ? _('Yes') : _('No'))
				]),
				E('div', { 'class': 'tr' }, [
					E('div', { 'class': 'td left' }, _('Model configured')),
					E('div', { 'class': 'td left' }, model.configured ? _('Yes') : _('No'))
				]),
				E('div', { 'class': 'tr' }, [
					E('div', { 'class': 'td left' }, _('Model')),
					E('div', { 'class': 'td left' }, model.model || '-')
				]),
				E('div', { 'class': 'tr' }, [
					E('div', { 'class': 'td left' }, _('Base URL')),
					E('div', { 'class': 'td left' }, model.base_url || '-')
				]),
				E('div', { 'class': 'tr' }, [
					E('div', { 'class': 'td left' }, _('Memory records')),
					E('div', { 'class': 'td left' }, String((memory.memory || []).length))
				])
			]),
			E('h3', {}, _('Model failover')),
			E('div', { 'class': 'table' }, [
				E('div', { 'class': 'tr table-titles' }, [
					E('div', { 'class': 'th left' }, _('Section')),
					E('div', { 'class': 'th left' }, _('Priority')),
					E('div', { 'class': 'th left' }, _('Enabled')),
					E('div', { 'class': 'th left' }, _('Configured')),
					E('div', { 'class': 'th left' }, _('Model')),
					E('div', { 'class': 'th left' }, _('Config'))
				])
			].concat(this.renderModelRows(models.models || status.models || []))),
			E('h3', {}, _('Remote models')),
			E('pre', { 'style': 'white-space:pre-wrap' },
				(remoteModels.models || []).map(function(item) {
					return item.id;
				}).join('\n') || (remoteModels.status ? _('Status: ') + remoteModels.status : _('No remote models loaded'))),
			E('h3', {}, _('Shared conversation')),
			E('pre', {
				'data-edgepulse-agent-transcript': '1',
				'style': 'white-space:pre-wrap; min-height:8em'
			}, this.renderTranscript(chat.messages || [])),
			E('h3', {}, _('Diagnostic')),
			E('div', { 'class': 'cbi-section' }, [
				E('textarea', {
					'data-edgepulse-agent-question': '1',
					'style': 'width:100%; min-height:6em'
				}, [ _('Check the router health with local read-only tools.') ]),
				E('div', { 'class': 'cbi-section-actions' }, [
					E('button', {
						'class': 'btn cbi-button',
						'data-edgepulse-agent-prompt': 'Diagnose WAN connectivity using local read-only status.',
						'click': this.runDiagnostic.bind(this)
					}, [ _('WAN') ]),
					' ',
					E('button', {
						'class': 'btn cbi-button',
						'data-edgepulse-agent-prompt': 'Diagnose DNS health using local read-only status.',
						'click': this.runDiagnostic.bind(this)
					}, [ _('DNS') ]),
					' ',
					E('button', {
						'class': 'btn cbi-button',
						'data-edgepulse-agent-prompt': 'Diagnose Wi-Fi instability using local read-only status.',
						'click': this.runDiagnostic.bind(this)
					}, [ _('Wi-Fi') ]),
					' ',
					E('button', {
						'class': 'btn cbi-button',
						'data-edgepulse-agent-prompt': 'Diagnose high CPU or high memory pressure using local read-only status.',
						'click': this.runDiagnostic.bind(this)
					}, [ _('Load') ]),
					' ',
					E('button', {
						'class': 'btn cbi-button',
						'data-edgepulse-agent-prompt': 'Diagnose package and service health using local read-only status.',
						'click': this.runDiagnostic.bind(this)
					}, [ _('Services') ])
				]),
				E('div', { 'class': 'right' }, [
					E('button', {
						'class': 'btn cbi-button cbi-button-action',
						'click': this.runDiagnostic.bind(this)
					}, [ _('Run') ])
				]),
				E('pre', {
					'data-edgepulse-agent-output': '1',
					'style': 'white-space:pre-wrap; margin-top:1em'
				}, '')
			])
		]);
	}
});
