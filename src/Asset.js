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
var fs = require('fs');
var md5 = require('MD5');
var mime = require('mime');
var mkdirp = require('mkdirp');
var path = require('path');
var request = require('request');
var URI = require('urijs');





/**
 * Since assets have a radically different behaviour than documents, they are
 * handeled by this class. While documents are queried one after another, all
 * assets are downloaded in parallel.
 *
 * Moreover it is assumend that assets with the same location contain the same
 * content thus reducing the amount of data to be transfered.
 *
 * @param {string} _directory Directory in which assets should be written to
 */
module.exports = function(_directory) {

	/**
	 * Directory has to end with a slash and must exist
	 */
	_directory = '/' === _directory[_directory.length - 1]
		? _directory
		: (_directory + '/');
	mkdirp.sync(_directory);

	/**
	 * URL -> Path to asset relative to directory
	 */
	var _cache = {};





	/**
	 * @param {object} response HTTP response
	 * @return {string} Best file extension for HTTP response
	 */
	var get_extension = function(response) {
		var DEFAULT_EXTENSION = 'bin';

		/* No HTTP headers?
		 */
		if (!response.headers) {
			return DEFAULT_EXTENSION;
		}

		/* Missing Content-Type header
		 */
		if (!response.headers['content-type']) {
			return DEFAULT_EXTENSION;
		}
		var content_type = response.headers['content-type'];

		/* Get MIME type
		 */
		var mime_type = content_type.split(';')[0];

		/* Get extension by mime type
		 */
		return mime.extension(mime_type);
	};





	/**
	 * Will download an asset from `url' to the local file system
	 *
	 * @param {string} url The asset's location
	 * @param {callback} cb Will be invoked with absolute path where asset
	 *     was written to, as soon as it is written to disk
	 */
	return function(url, cb) {

		/* Check whether asset is already downloaded
		 *
		 * @warning Won't catch parallel downloads but that doesn't
		 *     matter since each asset will be downloaded at max a
		 *     couple times instead of several hundret times
		 */
		url = new URI(url).normalize().toString();

		if (_cache.hasOwnProperty(url)) {
			cb(null, _cache[url]);
			return;
		}


		/* Download file
		 */
		var settings = {
			url:		url,
			encoding:	null
		};
		request(settings, function(err, response) {

			/* Abort if error or unexpected status code
			 */
			if (err || 200 !== response.statusCode) {
				cb(new Error('Cannot download asset from url `'+ url +'\': `'+ err +'\', `'+ response.statusCode +'\''));
				return;
			}

			/* Get file extension by content type
			 */
			var extension = get_extension(response);

			/* For now a flat asset structure is sufficient as long
			 * as asset directory is separated from the document
			 * storage
			 */
			var relative = md5(response.body) +'.'+ extension;
			var absolute = path.resolve(_directory, relative);

			/* Write asset to disk
			 */
			fs.writeFile(absolute, response.body, function(err) {
				if (err) {
					cb(err);
				} else {
					_cache[url] = absolute;
					cb(null, absolute);
				}
			});
		});
	};
};
