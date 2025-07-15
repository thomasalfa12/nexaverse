// src/app/api/admin/requests/route.ts
const requests: unknown[] = [];

export async function GET() {
  return Response.json(requests);
}

export async function POST(req: Request) {
  const data = await req.json();
  requests.push(data);
  return Response.json(data);
}
