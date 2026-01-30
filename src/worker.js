export default {
    async fetch(request, env) {
        const url = new URL(request.url);
        if (url.pathname.startsWith('/api/')) {
            return new Response("API not found", { status: 404 });
        }
        // Serve static assets
        let response = await env.ASSETS.fetch(request);

        // SPA Fallback: If asset not found (404) and it's not a file request (no extension), serve index.html
        if (response.status === 404 && !url.pathname.split('/').pop().includes('.')) {
            return env.ASSETS.fetch(new URL("/", request.url));
        }

        return response;
    },
};
