import { CosmosClient } from "@azure/cosmos";
import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";



interface VisitorResponse {
  message: string;
  clientIp?: string;
  totalCount?: number;
  visitorInfo?: {
      lastVisitAt: string;
      visitCount: number;
  };
  error?: string;
}


const endpoint = process.env.COSMOS_DB_ENDPOINT; 
const key = process.env.COSMOS_DB_KEY;         
const databaseId = "panpan_dk";        
const containerId = "visitors";      


const client = new CosmosClient({
  endpoint,key
});


async function connectToCosmosDB(){
  try {
    const db = client.database(databaseId)
    const container = db.container(containerId)
    return container;
  } catch (error) {
    console.error("Error connecting to Cosmos DB:", error.message);
  }
}


export async function countVisitor(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
    context.log(`Http function processed request for url "${request.url}"`);
    const ip = request.query.get("ip")
    const now = new Date().toISOString()
    const container = await connectToCosmosDB()
    try {
      const {resource:visitors} =await container.item("visitors","visitors").read();
      let newVisitors = visitors || { id: "visitors", totalCount: 0};
      newVisitors.totalCount += 1;
      const {resource:record} = await container.item(ip,ip).read();
      let newRecord = record
      if(!record){
        newRecord = {
          id:ip,
          lastVisitAt:now,
          visitCount:1
        }
      }else{
        newRecord.lastVisitAt=now;
        newRecord.visitCount+=1   
      }
      await Promise.all([
        container.items.upsert(newVisitors),
        container.items.upsert(newRecord),
    ]);

      const response: VisitorResponse = {
        message: "Visitor data updated successfully.",
        clientIp: ip,
        totalCount: visitors.totalCount,
        visitorInfo:newRecord,
    };
      return {
        status: 200,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(response)
    };
    } catch (error) {
      context.log(`Error updating visitor data: ${error.message}`);
      return {
          status: 500,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: "Failed to record your visit.",
            error: error.message,
        }),
      };
    }

};

app.http('count-visitor', {
    methods: ['GET', 'POST'],
    authLevel: 'anonymous',
    handler: countVisitor
});
