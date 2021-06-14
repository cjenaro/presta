const { debug } = require('./debug')
const { getRouteParams } = require('./getRouteParams')
const { default404 } = require('./default404')
const { createContext } = require('./createContext')
const { normalizeResponse } = require('./normalizeResponse')
const { loadCache } = require('./load')

/*
 * This function is initially called *within* a generated entry file
 */
function createHandler (router, config) {
  return async (event, context) => {
    debug('received event', event)

    /*
     * Match a file using router
     */
    const files = router(event.path)
    console.log('ROUTES FOUND ', files)

    /*
     * Exit early if no file was matched
     */
    if (!files) {
      debug('handler', 'fallback to default 404')

      return normalizeResponse({
        statusCode: 404,
        body: default404
      })
    }

    // we've got a file match...
    let lastMatch = files[files.length - 1]

    /*
     * Create presta context object
     */
    const ctx = createContext({
      path: event.path,
      method: event.httpMethod,
      headers: {
        ...event.headers,
        ...event.multiValueHeaders
      },
      body: event.body,
      params: getRouteParams(event.path, lastMatch.route),
      query: {
        ...event.queryStringParameters,
        ...event.multiValueQueryStringParameters
      },
      lambda: { event, context }
    })

    debug('presta serverless context', ctx)

    const res = await recursiveBuild(files, undefined, ctx)

    loadCache.clearAllMemory()

    return normalizeResponse(res)
  }
}

async function recursiveBuild (files, built, ctx) {
  if (files.length === 0) return built

  const lastChild = files.shift()
  const response = await lastChild.handler(ctx)
  let final
  if (typeof response === 'function') {
    final = response(built)
  } else {
    final = response
  }

  return recursiveBuild(files, final, ctx)
}

module.exports = { createHandler }
