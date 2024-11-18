import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { json } from "stream/consumers";

export async function countVisitor(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
    context.log(`Http function processed request for url "${request.url}"`);

    // Log all headers
    const headers = request.headers || {};
    context.log("All Headers:", JSON.stringify(headers));

    // Try to extract the IP address
    const ip = request.headers["X-Forwarded-For"] || request.headers["x-client-ip"] || "Unknown IP";    context.log(`Client IP: ${ip}`);
    context.log(JSON.stringify(request.headers.keys()))
    return {
        body: `Hello, world! Your IP address is ${ip}. request: ${JSON.stringify(request)}`
    };
};

app.http('count-visitor', {
    methods: ['GET', 'POST'],
    authLevel: 'anonymous',
    handler: countVisitor
});
