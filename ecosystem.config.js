module.exports = {
	apps : [{
		name   : 'sovbot',
		script : 'yarn',
		args   : 'start-prod',
		env_development : {
			args: 'start-dev',
		},
	}],
};
