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
var path = require('path');
var URI = require('URIjs');





/**
 * Quite similar to `ReferencedDocuments' this object creates callbacks for
 * $.each which themself create callbacks to download the referenced asset (sup
 * dawg i heard you like callbacks...)
 *
 * @param {URI} _base Only assets below base will be resolved
 * @param {URI} _document URI of the document referencing the assets, will be
 *     used to resolve relative URIs
 * @param {Asset} _asset Will do the dirty work of downloading the assets
 * @param {Path} _path Necessary for resolving the document's path
 * @param {string} _directory Root directory where documents will be found,
 *     required for resolving relative path references
 */
module.exports = function(_base, _document, _asset, _path, _directory) {



	var constructor = function(_attribute) {
		return function() {

			/* If tag does not have the required attribute we can
			 * skip this step
			 */
			var value = this.attr(_attribute);
			if ('undefined' === typeof(value)) {
				return;
			}
			var relative = new URI(value);

			/* Do not try to change data or mailto URNs
			 */
			if (('data' === relative.protocol()) || ('mailto' === relative.protocol())) {
				return;
			}
			var absolute = relative.absoluteTo(_document);


			/* Don't fiddle with the URI if it's not below base
			 */
			var base_s = _base.toString();
			var absolute_s = absolute.toString();

			if (0 !== absolute_s.indexOf(base_s)) {
				return;
			}


			/* Callback time!
			 */
			var tag = this;

			constructor.callbacks.push(function(cb) {
				_asset(absolute, function(err, absolute_asset_path) {
					if (err) {
						cb(err);
						return;
					}

					var absolute_document_path = path.resolve(
						_directory, _path(_document)
					);
					var relative_asset_path = path.relative(
						path.dirname(absolute_document_path),
						absolute_asset_path
					);

					tag.attr(_attribute, relative_asset_path);
					cb(null);
				});
			});
		};
	};



	/**
	 * All these callbacks should be invoked using async.parallelLimit to
	 * download the assets and change references inside the DOM
	 */
	constructor.callbacks = [];
	return constructor;
};
