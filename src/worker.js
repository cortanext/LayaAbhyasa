export default {
    async fetch(request, env) {
        const url = new URL(request.url);
        if (url.pathname.startsWith('/api/')) {
            // TODO: Proxy to backend if needed, or handle API here
            return new Response("API not found", { status: 404 });
        }
        // Serve static assets
        return env.ASSETS.fetch(request);
    },
};
