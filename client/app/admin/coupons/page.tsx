"use client";

import { useState } from "react";
import { Loader2, Plus, Trash2, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-picker";
import { useAdminCoupons, useCreateCoupon, useDeleteCoupon } from "@/app/hooks/useCoupons";
import { useAuthState } from "@/app/hooks/useAuthState";
import { isSuperAdmin } from "@/lib/role-utils";
import type { CreateCouponInput } from "@/app/services/coupons";

export default function CouponsPage() {
  const { user } = useAuthState();
  const [filter, setFilter] = useState<"all" | "used" | "unused">("all");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [form, setForm] = useState<{ code: string; expiresAt: Date | undefined; count: string }>({
    code: "",
    expiresAt: undefined,
    count: "1",
  });

  const used = filter === "all" ? undefined : filter === "used";
  const { data: coupons, isLoading, error } = useAdminCoupons(used);
  const createCoupon = useCreateCoupon();
  const deleteCoupon = useDeleteCoupon();

  const canCreate = isSuperAdmin(user?.role);

  const handleCopy = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleCreate = async () => {
    const input: CreateCouponInput = {};
    if (form.code.trim()) input.code = form.code.trim().toUpperCase();
    if (form.expiresAt) input.expiresAt = form.expiresAt.toISOString();
    const count = parseInt(form.count, 10);
    if (count > 1) input.count = count;

    await createCoupon.mutateAsync(input);
    setIsCreateOpen(false);
    setForm({ code: "", expiresAt: undefined, count: "1" });
  };

  if (isLoading) {
    return (
      <div className="py-6 flex justify-center items-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-6 flex justify-center items-center min-h-[400px]">
        <p className="text-red-500">Failed to load coupon codes</p>
      </div>
    );
  }

  return (
    <div className="py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Coupon Codes</h1>
          <p className="text-muted-foreground mt-1">One-time codes that grant users full calculator access</p>
        </div>
        {canCreate && (
          <Button onClick={() => setIsCreateOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Generate Codes
          </Button>
        )}
      </div>

      {/* Filter */}
      <div className="mb-4 flex items-center gap-3">
        <span className="text-sm text-muted-foreground">Show:</span>
        <Select value={filter} onValueChange={(v) => setFilter(v as typeof filter)}>
          <SelectTrigger className="w-36">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="unused">Unused</SelectItem>
            <SelectItem value="used">Used</SelectItem>
          </SelectContent>
        </Select>
        <span className="text-sm text-muted-foreground ml-auto">{coupons?.length ?? 0} codes</span>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Code</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Used By</TableHead>
              <TableHead>Used At</TableHead>
              <TableHead>Expires</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="w-20" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {coupons?.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground py-10">
                  No coupon codes found
                </TableCell>
              </TableRow>
            )}
            {coupons?.map((coupon) => (
              <TableRow key={coupon.id}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-medium tracking-widest">{coupon.code}</span>
                    <button onClick={() => handleCopy(coupon.code, coupon.id)} className="text-gray-400 hover:text-gray-600 transition-colors" title="Copy code">
                      {copiedId === coupon.id ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </TableCell>
                <TableCell>{coupon.usedBy ? <Badge variant="secondary">Used</Badge> : coupon.expiresAt && new Date(coupon.expiresAt) < new Date() ? <Badge variant="destructive">Expired</Badge> : <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Available</Badge>}</TableCell>
                <TableCell>{coupon.user ? <span className="text-sm">{coupon.user.email}</span> : <span className="text-muted-foreground text-sm">—</span>}</TableCell>
                <TableCell>{coupon.usedAt ? <span className="text-sm">{new Date(coupon.usedAt).toLocaleDateString()}</span> : <span className="text-muted-foreground text-sm">—</span>}</TableCell>
                <TableCell>{coupon.expiresAt ? <span className="text-sm">{new Date(coupon.expiresAt).toLocaleDateString()}</span> : <span className="text-muted-foreground text-sm">Never</span>}</TableCell>
                <TableCell>
                  <span className="text-sm">{new Date(coupon.createdAt).toLocaleDateString()}</span>
                </TableCell>
                <TableCell>
                  {canCreate && !coupon.usedBy && (
                    <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-700 hover:bg-red-50" onClick={() => deleteCoupon.mutate(coupon.id)} disabled={deleteCoupon.isPending}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Create Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Generate Coupon Codes</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="count">Number of codes</Label>
              <Input id="count" type="number" min={1} max={100} value={form.count} onChange={(e) => setForm((p) => ({ ...p, count: e.target.value, code: parseInt(e.target.value, 10) > 1 ? "" : p.code }))} />
              <p className="text-xs text-muted-foreground">Generate up to 100 codes at once</p>
            </div>
            {parseInt(form.count, 10) === 1 && (
              <div className="space-y-1.5">
                <Label htmlFor="code">Custom code (optional)</Label>
                <Input id="code" value={form.code} onChange={(e) => setForm((p) => ({ ...p, code: e.target.value.toUpperCase() }))} placeholder="Leave blank to auto-generate" className="font-mono uppercase tracking-widest" maxLength={32} />
              </div>
            )}
            <div className="space-y-1.5">
              <Label>Expiry date (optional)</Label>
              <DatePicker date={form.expiresAt} onSelect={(d) => setForm((p) => ({ ...p, expiresAt: d }))} placeholder="No expiry" className="w-full" disabled={{ before: new Date() }} />
              <p className="text-xs text-muted-foreground">Leave blank for codes that never expire</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={createCoupon.isPending}>
              {createCoupon.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Plus className="w-4 h-4 mr-2" />}
              Generate
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
