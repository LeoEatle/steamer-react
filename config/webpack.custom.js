

function getOutput(env) {
	return {};
}

function getLoaders(env) {
	return {

	};
}

function getPlugins(env) {

}

function getResolve(env) {

	if (env === _DEV_) {
		return {

		};
	}
	else {
		return {

		}
	}
}

function getExternals(env) {
	return {

	};
}


module.exports = {
	getOutput,
	getModule,
	getResolve,
	getExternals,
	getPlugins,
};