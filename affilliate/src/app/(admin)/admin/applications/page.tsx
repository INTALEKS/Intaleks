"use client";

import { Fragment, useEffect, useMemo, useState } from "react";

import { AdminFilterPills, AdminPanel, AdminStatusTag } from "@/components/admin/primitives";
import { AdminEmptyState, AdminErrorState, AdminLoadingState } from "@/components/admin/states";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAdminApplications } from "@/hooks/use-admin-data";
import { api } from "@/lib/api";
import type { AdminApplication, AdminApplicationStatus } from "@/lib/admin/types";

export default function AdminApplicationsPage() {
  const { data, isLoading, isError, refetch } = useAdminApplications();
  const [filter, setFilter] = useState<"all" | AdminApplicationStatus>("pending");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [apps, setApps] = useState<AdminApplication[]>([]);

  useEffect(() => {
    if (data) {
      setApps(data);
    }
  }, [data]);

  const filtered = useMemo(
    () => apps.filter((item) => (filter === "all" ? true : item.status === filter)),
    [apps, filter]
  );

  async function applyStatus(id: string, status: AdminApplicationStatus) {
    await api.patch(`/api/admin/affiliate/applications/${id}/status`, {
      status: status.toUpperCase(),
    });
    setApps((current) => current.map((item) => (item.id === id ? { ...item, status } : item)));
    setExpanded(null);
  }

  if (isLoading) return <AdminLoadingState label="Loading applications..." />;
  if (isError) return <AdminErrorState title="Could not load applications" description="Please retry." retry={() => void refetch()} />;

  return (
    <div className="admin-page">
      <AdminFilterPills
        value={filter}
        onChange={(value) => setFilter(value as "all" | AdminApplicationStatus)}
        options={[
          { value: "pending", label: `Pending (${apps.filter((item) => item.status === "pending").length})` },
          { value: "approved", label: `Approved (${apps.filter((item) => item.status === "approved").length})` },
          { value: "rejected", label: `Rejected (${apps.filter((item) => item.status === "rejected").length})` },
          { value: "all", label: `All (${apps.length})` },
        ]}
      />

      {filtered.length === 0 ? (
        <AdminEmptyState title="No applications found" description="Try a different filter or wait for new submissions." />
      ) : (
      <AdminPanel title="Affiliate applications" action={<span className="text-xs text-[var(--affiliate-muted)]">{filtered.length} results</span>}>
        <Table>
          <TableHeader>
            <TableRow><TableHead>Applicant</TableHead><TableHead>Company</TableHead><TableHead>Website</TableHead><TableHead>PayPal email</TableHead><TableHead>Date</TableHead><TableHead>Status</TableHead><TableHead>Action</TableHead></TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((app) => (
              <Fragment key={app.id}>
                <TableRow onClick={() => setExpanded(expanded === String(app.id) ? null : String(app.id))} className="cursor-pointer">
                  <TableCell><p className="font-medium text-[var(--affiliate-navy)]">{app.name}</p><p className="text-xs text-[var(--affiliate-muted)]">{app.email}</p></TableCell>
                  <TableCell>{app.company}</TableCell>
                  <TableCell className="font-mono text-xs text-[var(--affiliate-blue)]">{app.website}</TableCell>
                  <TableCell className="font-mono text-xs">{app.paypal}</TableCell>
                  <TableCell className="text-xs text-[var(--affiliate-muted)]">{app.date}</TableCell>
                  <TableCell><AdminStatusTag tone={app.status}>{app.status}</AdminStatusTag></TableCell>
                  <TableCell>
                    {app.status === "pending" ? (
                      <div className="flex gap-2" onClick={(event) => event.stopPropagation()}>
                        <Button size="sm" variant="outline" onClick={() => void applyStatus(String(app.id), "approved")}>Approve</Button>
                        <Button size="sm" variant="outline" onClick={() => void applyStatus(String(app.id), "rejected")}>Reject</Button>
                      </div>
                    ) : (
                      <span className="text-xs text-[var(--affiliate-muted)]">Done</span>
                    )}
                  </TableCell>
                </TableRow>
                {expanded === String(app.id) ? (
                  <TableRow>
                    <TableCell colSpan={7} className="bg-[var(--affiliate-bg-accent)] text-xs text-[var(--affiliate-muted)]">
                      Application details for <strong>{app.name}</strong> from <strong>{app.company}</strong>. Site: {app.website}. PayPal: {app.paypal}.
                    </TableCell>
                  </TableRow>
                ) : null}
              </Fragment>
            ))}
          </TableBody>
        </Table>
      </AdminPanel>
      )}
    </div>
  );
}
