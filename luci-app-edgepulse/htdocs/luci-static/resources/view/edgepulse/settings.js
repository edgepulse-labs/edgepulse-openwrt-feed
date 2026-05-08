'use strict';
'require view';
'require form';

return view.extend({
	render: function() {
		var m, s, o;

		m = new form.Map('edgepulse', _('EdgePulse'));
		s = m.section(form.NamedSection, 'main', 'edgepulse', _('Settings'));

		o = s.option(form.Flag, 'enabled', _('Enable daemon'));
		o.default = '0';

		o = s.option(form.Value, 'interval', _('Sampling interval'));
		o.datatype = 'uinteger';
		o.placeholder = '5';

		o = s.option(form.Value, 'database', _('Database path'));
		o.placeholder = '/tmp/edgepulse/edgepulse.db';

		o = s.option(form.Value, 'retention_hours', _('Retention hours'));
		o.datatype = 'uinteger';
		o.placeholder = '24';

		o = s.option(form.DynamicList, 'collectors', _('Collectors'));

		return m.render();
	}
});

