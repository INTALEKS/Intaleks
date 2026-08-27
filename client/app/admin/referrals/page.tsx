"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Check, X, Loader2, ExternalLink, RefreshCw, Search } from "lucide-react";
import { ApiClient } from "@/app/services/api";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type PartnerApplication = {
  id: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  professionalType: string;
  companyName: string;
  website?: string | null;
  feedback?: string | null;
  createdAt: string;
  user?: { email?: string; firstName?: string | null; lastName?: string | null };
};

export default function ReferralsAdminPage() {
  const [applications, setApplications] = useState<PartnerApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"PENDING" | "APPROVED" | "REJECTED">("PENDING");
  const [searchQuery, setSearchQuery] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  // Rejection dialog state
  const [selectedApp, setSelectedApp] = useState<PartnerApplication | null>(null);
  const [feedback, setFeedback] = useState("");
  const [submittingFeedback, setSubmittingFeedback] = useState(false);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const res = await ApiClient.getReferralApplicationsAdmin(activeTab);
      if (res.success) {
        setApplications(res.data || []);
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to load applications");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, [activeTab]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchApplications();
  };

  const handleApprove = async (id: string) => {
    try {
      const res = await ApiClient.updateReferralApplicationAdmin(id, "APPROVED");
      if (res.success) {
        toast.success("Application approved successfully!");
        fetchApplications();
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to approve application");
    }
  };

  const handleOpenDeclineDialog = (app: PartnerApplication) => {
    setSelectedApp(app);
    setFeedback("");
  };

  const handleSetPending = async (id: string) => {
    try {
      const res = await ApiClient.updateReferralApplicationAdmin(id, "PENDING");
      if (res.success) {
        toast.success("Application moved back to pending. Partner access has been suspended.");
        fetchApplications();
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to update application status");
    }
  };

  const handleDeclineSubmit = async () => {
    if (!selectedApp) return;

    try {
      setSubmittingFeedback(true);
      const res = await ApiClient.updateReferralApplicationAdmin(selectedApp.id, "REJECTED", feedback.trim());
      if (res.success) {
        toast.success("Application declined and feedback sent");
        setSelectedApp(null);
        fetchApplications();
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to decline application");
    } finally {
      setSubmittingFeedback(false);
    }
  };

  const filteredApplications = applications.filter((app) => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return true;

    const email = app.user?.email || "";
    const name = `${app.user?.firstName || ""} ${app.user?.lastName || ""}`.toLowerCase();
    const company = app.companyName?.toLowerCase() || "";
    const type = app.professionalType?.toLowerCase() || "";

    return email.includes(query) || name.includes(query) || company.includes(query) || type.includes(query);
  });

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Partner Program Applications</h1>
          <p className="text-sm text-gray-500">Review professional firm applications before guided onboarding and manual plan activation.</p>
        </div>
        <Button variant="outline" size="sm" onClick={handleRefresh} disabled={refreshing} className="flex items-center gap-x-1">
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* Status Filter & Search */}
      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4">
        <Select value={activeTab} onValueChange={(value: "PENDING" | "APPROVED" | "REJECTED") => setActiveTab(value)}>
          <SelectTrigger className="w-[180px] bg-white border-gray-200">
            <SelectValue placeholder="Select Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="PENDING">Pending</SelectItem>
            <SelectItem value="APPROVED">Approved</SelectItem>
            <SelectItem value="REJECTED">Rejected</SelectItem>
          </SelectContent>
        </Select>

        <div className="relative max-w-sm w-full">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search email, name, company..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border rounded-lg text-sm bg-white outline-none focus:border-blue-500 transition-colors"
          />
        </div>
      </div>

      {/* Applications Table */}
      <div className="bg-white border rounded-xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          </div>
        ) : filteredApplications.length === 0 ? (
          <div className="p-16 text-center">
            <Search className="w-12 h-12 text-gray-300 mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-600">No applications found</p>
            <p className="text-xs text-gray-400 mt-1">There are no applications matching the current filters.</p>
          </div>
        ) : (
          <Table>
            <TableHeader className="bg-gray-50">
              <TableRow>
                <TableHead>Applicant</TableHead>
                <TableHead>Designation</TableHead>
                <TableHead>Practice Name</TableHead>
                <TableHead>Website</TableHead>
                <TableHead>Applied Date</TableHead>
                {activeTab === "REJECTED" && <TableHead>Feedback</TableHead>}
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredApplications.map((app) => (
                <TableRow key={app.id} className="hover:bg-gray-50/50 transition-colors">
                  <TableCell>
                    <div className="font-semibold text-gray-900">
                      {app.user?.firstName || app.user?.lastName
                        ? `${app.user.firstName || ""} ${app.user.lastName || ""}`.trim()
                        : "User"}
                    </div>
                    <div className="text-xs text-gray-400 font-mono mt-0.5">{app.user?.email}</div>
                  </TableCell>
                  <TableCell className="text-sm">{app.professionalType}</TableCell>
                  <TableCell className="text-sm font-medium">{app.companyName}</TableCell>
                  <TableCell>
                    {app.website ? (
                      <a
                        href={app.website}
                        target="_blank"
                        rel="noreferrer"
                        className="text-blue-500 hover:text-blue-600 inline-flex items-center gap-x-0.5 text-xs font-medium"
                      >
                        Visit <ExternalLink className="w-3 h-3" />
                      </a>
                    ) : (
                      <span className="text-xs text-gray-400 italic">None</span>
                    )}
                  </TableCell>
                  <TableCell className="text-xs">
                    {new Date(app.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </TableCell>
                  {activeTab === "REJECTED" && (
                    <TableCell className="max-w-xs truncate text-xs text-gray-500 italic" title={app.feedback ?? undefined}>
                      {app.feedback || "No feedback provided"}
                    </TableCell>
                  )}
                  <TableCell className="text-right">
                    {activeTab === "PENDING" ? (
                      <div className="flex justify-end gap-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleApprove(app.id)}
                          className="bg-green-50 text-green-700 hover:bg-green-100 hover:text-green-800 border-green-200 h-8 px-3"
                        >
                          <Check className="w-3.5 h-3.5 mr-1" /> Approve
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenDeclineDialog(app)}
                          className="bg-red-50 text-red-700 hover:bg-red-100 hover:text-red-800 border-red-200 h-8 px-3"
                        >
                          <X className="w-3.5 h-3.5 mr-1" /> Decline
                        </Button>
                      </div>
                    ) : activeTab === "APPROVED" ? (
                      <div className="flex justify-end gap-x-2">
                        <Button variant="outline" size="sm" onClick={() => handleSetPending(app.id)} className="h-8 px-3">Move to Pending</Button>
                        <Button variant="outline" size="sm" onClick={() => handleOpenDeclineDialog(app)} className="h-8 px-3 border-red-200 text-red-700 hover:bg-red-50">Decline</Button>
                      </div>
                    ) : (
                      <div className="flex justify-end gap-x-2">
                        <Button variant="outline" size="sm" onClick={() => handleApprove(app.id)} className="h-8 px-3 bg-green-50 text-green-700 hover:bg-green-100 border-green-200"><Check className="w-3.5 h-3.5 mr-1" />Approve</Button>
                        <Button variant="outline" size="sm" onClick={() => handleSetPending(app.id)} className="h-8 px-3">Move to Pending</Button>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Decline Feedback Dialog */}
      {selectedApp && (
        <Dialog open={!!selectedApp} onOpenChange={() => setSelectedApp(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Decline Application</DialogTitle>
              <DialogDescription>
                Provide feedback or a reason for declining the Partner Program application for{" "}
                <span className="font-semibold">{selectedApp.companyName}</span>.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 my-2">
              <div className="flex flex-col gap-y-1.5">
                <Label htmlFor="decline-reason">Declination Feedback</Label>
                <Textarea
                  id="decline-reason"
                  placeholder="e.g. Please provide a link to your active professional website or verification details."
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  className="min-h-[100px]"
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="ghost" onClick={() => setSelectedApp(null)} disabled={submittingFeedback}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleDeclineSubmit} disabled={submittingFeedback}>
                {submittingFeedback && <Loader2 className="w-4 h-4 animate-spin mr-1" />}
                Confirm Decline
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
