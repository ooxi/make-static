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
var TraceError = require('trace-error');
var URI = require('urijs');





/**
 * @param {URI} _base Only references below `_base' should be changed
 * @param {URI} _document The document's location for resolving relative URLs
 * @param {Path} _path Helps resolving paths of other documents
 */
module.exports = function(_base, _document, _path) {

	/**
	 * @param {string} _attribute Attribute which contains a reference URI
	 *     (may be relative)
	 * @return {function} Should be given to $.each
	 */
	var constructor = function(_attribute) {
		return function() {

			/* No operation necessary iff tag is missing attribute
			 * of interest
			 */
			var value = this.attr(_attribute);

			if ('undefined' === typeof(value)) {
				return;
			}
			var relative = new URI(value);

			/* We are not interested in certain protocols
			 */
			if (['callto', 'data', 'mailto', 'tel'].includes(relative.protocol())) {
				return;
			}

			let absolute = null;
			try {
				absolute = relative.absoluteTo(_document);
			} catch (e) {
				throw new TraceError('Cannot resolve `' + relative + '\' absolute to `' + _document + '\'', e);
			}


			/* Do not change URI iff it's not below base
			 */
			var base_s = _base.toString();
			var absolute_s = absolute.toString();

			if (0 !== absolute_s.indexOf(base_s)) {
				return;
			}


			/* Save original reference
			 */
			constructor.references.push(absolute);


			/* Change reference to local file (will most likely be a
			 * relative path)
			 *
			 * @warning It's easier to make all references absolute
			 *     otherwise we would have to change the documents'
			 *     base URL
			 */
			var path = '/' + _path(absolute);


			/* Keep anchor for JavaScript actions
			 */
			var anchor = absolute.hash();

			if ('' !== anchor) {
				path += anchor;
			}


			/* Change tag's attribute to new reference
			 */
			this.attr(_attribute, path);
		};
	};



	/**
	 * Can be used to obtain URIs of all referenced documents
	 */
	constructor.references = [];
	return constructor;
};
