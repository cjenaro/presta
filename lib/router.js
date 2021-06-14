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
  // get route paths, sort by depth (/) and length (/hello before /)
  const routes = files.sort(
    (a, b) =>
      b.route.split('/').length -
      a.route.split('/').length +
      (b.route.length - a.route.length)
  )

  return url => {
    let pages = []
    for (const page of routes) {
      // /hello/:parameters is not matching for / and /hello
      const [withoutQuery] = url.split('?')
      // Check depth since now it is "loose"
      const urlParts = toURLParts(withoutQuery)
      const routeParts = toURLParts(page.route)
      const urlDepth = urlParts.length
      const routeDepth = routeParts.length
      let matches = true

      if (routeDepth > urlDepth) continue

      for (let index = 0; index < routeDepth && index < urlDepth; index++) {
        const urlPart = urlParts[index]
        const routePart = toRegExp(routeParts[index])
        matches = matches && routePart.pattern.test(`/${urlPart}`)
      }

      if (matches) {
        pages.push(page)
      }
    }

    return pages
  }
}

function toURLParts (url) {
  if (url === '/') return ['']

  return url.split('/')
}

module.exports = { createRouter }
