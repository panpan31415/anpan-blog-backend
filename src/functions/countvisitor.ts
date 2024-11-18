import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";

export async function countVisitor(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
    context.log(`Http function processed request for url "${request.url}"`);

    // Log all headers
    const headers = request.headers || {};
    context.log("All Headers:", JSON.stringify(headers));

    // Try to extract the IP address
    const ip = request.headers["X-Forwarded-For"] || request.headers["x-client-ip"] || "Unknown IP";    context.log(`Client IP: ${ip}`);

    return {
        body: `Hello, world! Your IP address is ${ip}. entries: ${request.headers.entries()}`
    };
};

app.http('count-visitor', {
    methods: ['GET', 'POST'],
    authLevel: 'anonymous',
    handler: countVisitor
});
