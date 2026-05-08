'use strict';
'require view';
'require ui';

return view.extend({
	render: function() {
		return E('div', { 'class': 'cbi-section' }, [
			E('h2', {}, _('Features')),
			E('p', {}, _('Derived feature windows will appear here.'))
		]);
	}
});

