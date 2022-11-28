/**
 * Copyright (c) 2014 github/ooxi
 *     https://github.com/ooxi/make-static
 *     violetland@mail.ru
 *
 * This software is provided 'as-is', without any express or implied warranty.
 * In no event will the authors be held liable for any damages arising from the
 * use of this software.
 *
 * Permission is granted to anyone to use this software for any purpose,
 * including commercial applications, and to alter it and redistribute it
 * freely, subject to the following restrictions:
 *
 *  1. The origin of this software must not be misrepresented; you must not
 *     claim that you wrote the original software. If you use this software in a
 *     product, an acknowledgment in the product documentation would be
 *     appreciated but is not required.
 *
 *  2. Altered source versions must be plainly marked as such, and must not be
 *     misrepresented as being the original software.
 *
 *  3. This notice may not be removed or altered from any source distribution.
 */
var argv = require('optimist')
	.argv;

var fs = require('fs-extra');
var path = require('path');
var mkdirp = require('mkdirp');
var tgz = require('tar.gz');
var tmp = require('tmp');
var URI = require('urijs');

var Asset = require('./src/Asset.js');
var MakeStatic = require('./src/MakeStatic.js');
var Path = require('./src/Path.js');



/* Minimal argument validation
 */
if (1 !== argv._.length) {
	console.error('Usage: make-static <url>');
	process.exit(1);
}
var base = new URI(argv._[0]);





/* First create temporary directory before preparing asset and os path helper
 * objects
 */
tmp.dir({prefix: 'make-static-'}, function(err, directory) {
	if (err) throw err;

	/* Make another directory inside `directory' which is named after the
	 * hostname (tgz will otherwise use the temporary name as base)
	 */
	directory = path.resolve(directory, base.hostname());
	mkdirp.sync(directory);


	/* Prepare export
	 */
	var make_static = new MakeStatic(
		base,
		new Asset(path.resolve(directory, 'assets')),
		new Path(base),
		directory
	);
	var limit = 1;


	/* Get progress notifications
	 */
	make_static.progress = function(uri, remaining) {
		console.log('[P] Exporting `'+ uri.toString() +'\' ('+ remaining +' remaining)');
	};


	/* Archive export and copy to current directory
	 */
	make_static.finished = function() {
		console.log('[F] Export finished, will archive files…');

		/* Add all files and directories to archive and remove temporary
		 * files afterwards
		 */
		var level = 9;
		var name = base.hostname() +'.tar.gz';

		new tgz(level).compress(directory, name, function(err) {
			if (err) throw err;
			fs.remove(directory);
			console.log('[F] Archived export written to `'+ name +'\'');
		});
	};


	/* Start export
	 */
	make_static.entry(base, limit, function(err, msg) {
		if (err) {
			console.warn('[W]', err);
		} else {
			console.log('[I]', msg);
		}
	});
});
