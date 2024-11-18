import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";

export async function countVisitor(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
    context.log(`Http function processed request for url "${request.url}"`);
    const name = request.query.get('name') || await request.text() || 'world';
    const ip = request.headers["x-forwarded-for"] || request.headers["x-client-ip"] || "Unknown IP";
    context.log(`Client IP: ${ip}`, JSON.stringify(request.headers));
    return { body: `Hello, ${name}! Your IP address is ${ip}.`};


};

app.http('count-visitor', {
    methods: ['GET', 'POST'],
    authLevel: 'anonymous',
    handler: countVisitor
});
