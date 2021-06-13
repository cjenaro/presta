// let rsort = require("route-sort");
let toRegExp = require('regexparam')

// rsort = rsort.default || rsort;
toRegExp = toRegExp.default || toRegExp

/**
 * This is used *within* the generated dynamic entry file
 *
 * @see https://github.com/lukeed/regexparam#usage
 */
function createRouter (files, config) {
  // get route paths
  const routes = files
    .map(r => r.route)
    .sort(
      (a, b) =>
        b.split('/').length - a.split('/').length + (b.length - a.length)
    )

  // in order, create matcher and associate page
  const preparedRoutes = routes.map(route => [
    // Made loose to make "/hello" match "/" and "/hello"
    toRegExp(route, true),
    files.find(p => p.route === route)
  ])

  return url => {
    let pages = []
    for (const [{ pattern }, page] of preparedRoutes) {
      // /hello/:parameters is not matching for / and /hello
      console.log(page.route, pattern)
      const [withoutQuery] = url.split('?')
      // Check depth since now it is "loose"
      const depth = withoutQuery.split('/').length
      const pageDepth = page.route.split('/').length
      if (pattern.test(withoutQuery) && depth <= pageDepth) {
        pages.push(page)
      }
    }

    console.log('======= ROUTER FINISHED ======')
    return pages
  }
}

module.exports = { createRouter }
