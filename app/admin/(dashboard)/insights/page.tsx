import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { db } from "@/lib/db";

function toDateLabel(value: Date) {
  return value.toLocaleString("vi-VN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default async function AdminInsightsPage() {
  const [totalVisits, todayVisits, totalLeads, latestLeads, topPaths] = await Promise.all([
    db.visitLog.count(),
    db.visitLog.count({
      where: {
        createdAt: {
          gte: new Date(new Date().setHours(0, 0, 0, 0)),
        },
      },
    }),
    db.leadCapture.count(),
    db.leadCapture.findMany({
      orderBy: { createdAt: "desc" },
      take: 12,
    }),
    db.visitLog.groupBy({
      by: ["path"],
      _count: {
        path: true,
      },
      orderBy: {
        _count: {
          path: "desc",
        },
      },
      take: 10,
    }),
  ]);

  return (
    <div className="space-y-5">
      <AdminPageHeader
        title="Insights"
        description="Track visitor activity and lead capture performance."
      />

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-1">
            <CardTitle className="text-sm text-stone-600">Total visits</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold text-stone-900">{totalVisits}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-1">
            <CardTitle className="text-sm text-stone-600">Today visits</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold text-stone-900">{todayVisits}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-1">
            <CardTitle className="text-sm text-stone-600">Total leads</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold text-stone-900">{totalLeads}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Top visited paths</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {topPaths.map((item) => (
              <div
                key={item.path}
                className="flex items-center justify-between rounded-lg border border-stone-200 bg-white px-3 py-2"
              >
                <p className="truncate text-sm text-stone-800">{item.path}</p>
                <Badge variant="outline">{item._count.path}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Latest leads</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {latestLeads.map((lead) => (
              <div
                key={lead.id}
                className="rounded-lg border border-stone-200 bg-white px-3 py-2"
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="font-medium text-stone-900">
                    {lead.name || lead.phone || lead.email || "Lead"}
                  </p>
                  <Badge variant="outline">{lead.status}</Badge>
                </div>
                <p className="text-xs text-stone-600">
                  {lead.phone || "No phone"} · {lead.email || "No email"}
                </p>
                <p className="text-xs text-stone-500">
                  {lead.sourcePath || "/"} · {toDateLabel(lead.createdAt)}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
