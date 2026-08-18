import { verifyDatabaseConnection } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await verifyDatabaseConnection();

    return Response.json({
      status: "ok",
      database: "connected",
    });
    
  } catch (error) {
    console.error("CognoDB health check failed:", error);

    return Response.json(
      {
        status: "error",
        database: "unavailable",
      },
      { status: 503 },
    );
  }
}
