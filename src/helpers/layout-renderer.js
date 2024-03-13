const warn = require('debug')('app:WARN');

/**
 * Improves developer experience by bringing react-like nesting of templates to EJS. Allows for a
 * small number of global templates to be used, with the `<%- include(children) %>` tag indicating
 * where nested views should appear.
 *
 * @example
 * // Renders the 'index.ejs' view in the default layout with the title 'test'
 * renderLayout(res, 'index', { title: 'test' });
 *
 * @example
 * // Renders the 'index.ejs' view with script '/public/myscript.js' in the
 * // 'other' layout
 * renderLayout(res, 'index', { scripts: ['myscript'] }, 'other');
 *
 * @param res - the express response, accepted by e.g. `router.get`
 * @param view {string} - the view to insert in place of `<%- include(children) %>` in the layout's
 * .ejs file
 * @param {Record<string, any> | undefined} [options] - options to pass forward to the view
 * @param {string | undefined} [layout] - if included, the layout to use instead of `main`
 */
module.exports = function renderLayout(res, view, options, layout) {
  const opts = typeof options === 'undefined' ? {} : options;
  const pageLayout = typeof layout === 'undefined' ? 'main' : layout;

  // Assign title (needed by layouts)
  if (!('title' in opts)) {
    opts.title = process.env.WEBSITE_TITLE || 'Template Website';
  }

  // Assign scripts (needed by layouts)
  if (!('scripts' in opts) || !Array.isArray(opts.scripts)) {
    if ('scripts' in opts) {
      // Must be that scripts is not an array, warn developer
      warn('in layout-renderer.js: opts.scripts must be an array');
    }

    opts.scripts = [];
  }

  opts.scripts.push('global');

  if (!('dataset' in opts) || typeof opts.dataset !== 'object') {
    if ('dataset' in opts) {
      // Must be that dataset is not an object, warn developer
      warn('in layout-renderer.js: opts.dataset must be an object');
    }

    opts.dataset = {};
  }

  const dataset = [];

  // Construct HTML dataset attribute for each entry in dataset object

  Object.keys(opts.dataset).forEach((key) => {
    if (opts.dataset[key].length > 0) {
      // Replace double quotes with single to stop breaking data attributes
      const val = opts.dataset[key].replace('"', "'");
      dataset.push(`data-${key}="${val}"`);
    }
  });
  opts.dataset = dataset.join(' '); // Join with spaces to be in HTML dataset format

  // Add global scripts to requested ones
  opts.scripts.push('themeToggle');
  opts.scripts.push('navButton');

  // Add main view to options
  opts.children = `../views/${view}.ejs`;

  res.render(pageLayout, opts);
};
