'use strict';
'require view';
'require ui';

return view.extend({
	render: function() {
		return E('div', { 'class': 'cbi-section' }, [
			E('h2', {}, _('Metrics')),
			E('p', {}, _('Raw telemetry metrics will appear here.'))
		]);
	}
});

