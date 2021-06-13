const { createRouter } = require('../lib/router')

module.exports = async (test, assert) => {
  const router = createRouter([
    { route: '*' },
    { route: '/:slug' },
    { route: '/:page/:slug' }
  ])

  test('router - match', async () => {
    assert(
      router('/a')
        .map(r => r.route)
        .includes('/:slug')
    )
    assert(
      router('/a')
        .map(r => r.route)
        .includes('*')
    )
    assert(
      router('/posts/a')
        .map(r => r.route)
        .includes('/:page/:slug')
    )
    assert(
      router('/posts/a')
        .map(r => r.route)
        .includes('*')
    )
  })

  test('router - no match', async () => {
    assert(router('/posts/a/b').pop().route === '*')
  })
}
