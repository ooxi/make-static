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
var async = require('async');
var cheerio = require('cheerio');
var fs = require('fs');
var mkdirp = require('mkdirp');
var path = require('path');
var request = require('request');
var URI = require('urijs');

var ReferencedAssets = require('./ReferencedAssets.js');
var ReferencedDocuments = require('./ReferencedDocuments.js');





/**
 * Will download one document into the local file system while changing
 * references to assets and other documents.
 *
 * @param {URI} _base Base URI below which assets and documents should be
 *     resolved
 * @param {Asset} _asset Used to get asset paths
 * @param {Path} _path Used to get document paths
 * @param {string} _directory Base directory where the document will be saved
 *     (exact path will be determined by a combination of `path' and
 *     `directory')
 */
module.exports = function(_base, _asset, _path, _directory) {

	/**
	 * Directory has to end with a slash and must exist
	 */
	_directory = '/' === _directory[_directory.length - 1]
		? _directory
		: (_directory + '/');
	mkdirp.sync(_directory);





	/**
	 * @param {URI} uri Location of document to download (basic checks
	 *     are already done
	 * @param {callback} cb Should lead to `modify'
	 */
	var download = function(uri, cb) {

		/* Request document
		 */
		request(uri.toString(), function(err, response) {
			var HTTP_OK = 200;

			if (err) {
				cb(err);
				return;
			}
			if (HTTP_OK !== response.statusCode) {
				cb(new Error('Unexpected response status code `'+ response.statusCode +'\' expected `'+ HTTP_OK +'\''));
				return;
			}

			cb(null, uri, response);
		});
	};



	/**
	 * Will resolve references to assets and save references to other
	 * documents
	 *
	 * @param {URI} uri Document's location
	 * @param {http.ServerResponse} response The document already
	 *     downloaded from the server
	 * @param {callback} cb Should point to save
	 */
	var modifyHtml = function(uri, response, cb) {
		var $ = cheerio.load(response.body);


		/* Collect assets
		 */
		var referenced_assets = new ReferencedAssets(
			_base, uri, _asset, _path, _directory
		);
		$('img[src]').each(new referenced_assets('src'));
		$('script').each(new referenced_assets('src'));
		$('link[rel="stylesheet"]').each(new referenced_assets('href'));


		/* Collect document references
		 */
		var reference_document = new ReferencedDocuments(
			_base, uri, _path
		);
		$('a[href]').each(new reference_document('href'));


		/* Download all assets
		 */
		async.parallelLimit(referenced_assets.callbacks, 10, function(err) {
			if (err) {
				cb(err);
				return;
			}

			/* Serialize DOM to HTML
			 */
			cb(null, uri, 'text/html', $.html(), reference_document.references);
		});
	};



	/**
	 * Will not perform any modifications on binary documents.
	 *
	 * @param {URI} uri Document's location
	 * @param {http.ServerResponse} response The document already
	 *     downloaded from the server
	 * @param {callback} cb Should point to save
	 */
	var modifyBlob = function(uri, response, cb) {
		const contentType = response.headers['content-type'] ? response.headers['content-type'] : 'application/octet-stream';
		cb(null, uri, contentType, response.body, []);
	};



	/**
	 * Will perform modifications on downloaded content depending on content
	 * type
	 *
	 * @param {URI} uri Document's location
	 * @param {http.ServerResponse} response The document already
	 *     downloaded from the server
	 * @param {callback} cb Should point to save
	 */
	var modify = function(uri, response, cb) {

		/* If not an HTML document, use {@code modifyBlob}. Otherwise
		 * discover further references
		 */
		if (!response.headers['content-type'] || !/^text\/html/i.test(response.headers['content-type']) || ('string' !== typeof(response.body))) {
			modifyBlob(uri, response, cb);
			return;
		}

		modifyHtml(uri, response, cb);
	};



	/**
	 * Will save the modified document in the filesystem
	 *
	 * @param {URI} uri Document's location
	 * @param {string} contentType Document's content type
	 * @param {string} content Document's content
	 * @param {array of URI} references Unresolved references to other
	 *     documents
	 * @param {callback} cb Will be informed of `references'
	 */
	var save = function(uri, contentType, content, references, cb) {
		var relative = _path(uri, contentType);
		var absolute = path.resolve(_directory, relative);
		var directory = path.dirname(absolute);

		mkdirp(directory, function(err) {
			if (err) {
				cb(err);
				return;
			}

			fs.writeFile(absolute, content, 'UTF-8', function(err) {
				if (err) {
					cb(err);
				} else {
					cb(null, references);
				}
			});
		});
	};





	/**
	 * Will download `uri' and invoke `cb' with the relevant information
	 *
	 * @param {URI} uri The document's location
	 * @param {callback(err, array of uri)} cb Callback function which will
	 *     be invoked as soon as the document is saved to the local
	 *     filesystem.
	 *
	 *     While references to assets will be resolved inside this function,
	 *     references to other document will not and are left in the
	 *     responsibility of the caller
	 */
	return function(uri, cb) {

		/* Check if uri is below base
		 */
		uri = uri.normalize();
		var base_s = _base.toString();
		var uri_s = uri.toString();

		if (0 !== uri_s.indexOf(base_s)) {
			cb(new Error('Document at `'+ uri_s +'\' is not below base URI `'+ base_s +'\''));
			return;
		}


		/* Download, modify and save document. After that notify the
		 * callback function
		 */
		async.waterfall([
			function(cb) {
				cb(null, uri);
			},
			download,
			modify,
			save
		], cb);
	};
};
