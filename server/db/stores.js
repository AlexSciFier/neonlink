import fp from 'fastify-plugin';

function registerStorePlugin(fastify, plugin, options, storeName)
{
    let requiredOptions = Object.assign({}, options, { 
        link: (store) => {
            stores[storeName] = store;
            console.log(`Store ${storeName} assigned.`);
        }
    })
    fastify.register(plugin, requiredOptions);
}

export let stores = {};

export default fp((fastify, options, next) => {
    if (options.databasePlugin)
    {
        let requiredOptions = Object.assign(options.databaseOptions || {}, {
            loadAppSettings: (plugin, options) => registerStorePlugin(fastify, plugin, options, 'appSettings'),
            loadBackgroundImages: (plugin, options) => registerStorePlugin(fastify, plugin, options, 'backgroundImages'),
            loadBookmarks: (plugin, options) => registerStorePlugin(fastify, plugin, options, 'bookmarks'),
            loadCategories: (plugin, options) => registerStorePlugin(fastify, plugin, options, 'categories'),
            loadTags: (plugin, options) => registerStorePlugin(fastify, plugin, options, 'tags'),
            loadUsers: (plugin, options) => registerStorePlugin(fastify, plugin, options, 'users')
        });
        fastify.register(options.databasePlugin, requiredOptions);
    }

    next()
});