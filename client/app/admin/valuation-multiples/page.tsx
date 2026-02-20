"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminValuationMultiplesAPI, type ValuationMultiple } from "@/lib/valuation-multiples-api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { Loader2, Plus, Pencil, Trash2, Download } from "lucide-react";

export default function ValuationMultiplesPage() {
  const queryClient = useQueryClient();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [editingMultiple, setEditingMultiple] = useState<ValuationMultiple | null>(null);
  const [deletingMultiple, setDeletingMultiple] = useState<ValuationMultiple | null>(null);
  const [formData, setFormData] = useState({ country: "", industry: "", scoreRange: "40-50", multiple: "" });

  const { data: multiples, isLoading } = useQuery({
    queryKey: ["admin-valuation-multiples"],
    queryFn: () => adminValuationMultiplesAPI.getAllMultiples(),
  });

  const createMutation = useMutation({
    mutationFn: adminValuationMultiplesAPI.createMultiple,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-valuation-multiples"] });
      queryClient.invalidateQueries({ queryKey: ["valuation-multiples"] });
      toast.success("Created successfully");
      setIsCreateOpen(false);
      setFormData({ country: "", industry: "", scoreRange: "40-50", multiple: "" });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<{ country: string; industry: string; multiple: number }> }) => adminValuationMultiplesAPI.updateMultiple(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-valuation-multiples"] });
      queryClient.invalidateQueries({ queryKey: ["valuation-multiples"] });
      toast.success("Updated successfully");
      setIsEditOpen(false);
      setEditingMultiple(null);
      setFormData({ country: "", industry: "", scoreRange: "40-50", multiple: "" });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const deleteMutation = useMutation({
    mutationFn: adminValuationMultiplesAPI.deleteMultiple,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-valuation-multiples"] });
      queryClient.invalidateQueries({ queryKey: ["valuation-multiples"] });
      toast.success("Deleted successfully");
      setIsDeleteOpen(false);
      setDeletingMultiple(null);
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const handleExportCSV = async () => {
    try {
      const blob = await adminValuationMultiplesAPI.exportCSV();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `valuation-multiples-${new Date().toISOString().split("T")[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success("CSV exported");
    } catch {
      toast.error("Export failed");
    }
  };

  const handleExportJSON = async () => {
    try {
      const data = await adminValuationMultiplesAPI.exportJSON();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `valuation-multiples-${new Date().toISOString().split("T")[0]}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success("JSON exported");
    } catch {
      toast.error("Export failed");
    }
  };

  const handleCreate = () => {
    if (!formData.country || !formData.industry || !formData.scoreRange || !formData.multiple) {
      toast.error("Fill all fields");
      return;
    }
    createMutation.mutate({
      country: formData.country.toLowerCase(),
      industry: formData.industry.toLowerCase(),
      scoreRange: formData.scoreRange,
      multiple: parseFloat(formData.multiple),
    });
  };

  const handleEdit = (multiple: ValuationMultiple) => {
    setEditingMultiple(multiple);
    setFormData({ country: multiple.country, industry: multiple.industry, scoreRange: multiple.scoreRange, multiple: String(multiple.multiple) });
    setIsEditOpen(true);
  };

  const handleUpdate = () => {
    if (!editingMultiple) return;
    const updates: Partial<{ country: string; industry: string; scoreRange: string; multiple: number }> = {};
    if (formData.country && formData.country !== editingMultiple.country) updates.country = formData.country.toLowerCase();
    if (formData.industry && formData.industry !== editingMultiple.industry) updates.industry = formData.industry.toLowerCase();
    if (formData.scoreRange && formData.scoreRange !== editingMultiple.scoreRange) updates.scoreRange = formData.scoreRange;
    if (formData.multiple && parseFloat(formData.multiple) !== editingMultiple.multiple) updates.multiple = parseFloat(formData.multiple);
    if (Object.keys(updates).length === 0) {
      toast.error("No changes");
      return;
    }
    updateMutation.mutate({ id: editingMultiple.id, data: updates });
  };

  const handleDeleteClick = (multiple: ValuationMultiple) => {
    setDeletingMultiple(multiple);
    setIsDeleteOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (deletingMultiple) {
      deleteMutation.mutate(deletingMultiple.id);
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Valuation Multiples</h1>
        <p className="text-gray-600 mt-2">Manage industry valuation multiples</p>
      </div>

      <div className="flex justify-between mb-6">
        <div className="flex gap-2">
          <Button onClick={handleExportCSV} variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            CSV
          </Button>
          <Button onClick={handleExportJSON} variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            JSON
          </Button>
        </div>

        <Dialog
          open={isCreateOpen}
          onOpenChange={(open) => {
            setIsCreateOpen(open);
            if (!open) setFormData({ country: "", industry: "", scoreRange: "40-50", multiple: "" });
          }}
        >
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Multiple
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Valuation Multiple</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label>Country</Label>
                <Input placeholder="australia, usa, uk" value={formData.country} onChange={(e) => setFormData({ ...formData, country: e.target.value })} />
              </div>
              <div>
                <Label>Industry</Label>
                <Input placeholder="retail, technology" value={formData.industry} onChange={(e) => setFormData({ ...formData, industry: e.target.value })} />
              </div>
              <div>
                <Label>Score Range</Label>
                <select value={formData.scoreRange} onChange={(e) => setFormData({ ...formData, scoreRange: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md">
                  <option value="40-50">40-50 (Excellent)</option>
                  <option value="30-39">30-39 (Good)</option>
                  <option value="20-29">20-29 (Average)</option>
                  <option value="<20">&lt;20 (Below Average)</option>
                </select>
              </div>
              <div>
                <Label>Multiple</Label>
                <Input type="number" step="0.1" placeholder="3.5" value={formData.multiple} onChange={(e) => setFormData({ ...formData, multiple: e.target.value })} />
              </div>
              <Button onClick={handleCreate} disabled={createMutation.isPending} className="w-full">
                {createMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Create
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Dialog
        open={isEditOpen}
        onOpenChange={(open) => {
          setIsEditOpen(open);
          if (!open) {
            setEditingMultiple(null);
            setFormData({ country: "", industry: "", scoreRange: "40-50", multiple: "" });
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Valuation Multiple</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>Country</Label>
              <Input value={formData.country} onChange={(e) => setFormData({ ...formData, country: e.target.value })} />
            </div>
            <div>
              <Label>Industry</Label>
              <Input value={formData.industry} onChange={(e) => setFormData({ ...formData, industry: e.target.value })} />
            </div>
            <div>
              <Label>Score Range</Label>
              <select value={formData.scoreRange} onChange={(e) => setFormData({ ...formData, scoreRange: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md">
                <option value="40-50">40-50 (Excellent)</option>
                <option value="30-39">30-39 (Good)</option>
                <option value="20-29">20-29 (Average)</option>
                <option value="<20">&lt;20 (Below Average)</option>
              </select>
            </div>
            <div>
              <Label>Multiple</Label>
              <Input type="number" step="0.1" value={formData.multiple} onChange={(e) => setFormData({ ...formData, multiple: e.target.value })} />
            </div>
            <Button onClick={handleUpdate} disabled={updateMutation.isPending} className="w-full">
              {updateMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Update
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={isDeleteOpen}
        onOpenChange={(open) => {
          setIsDeleteOpen(open);
          if (!open) setDeletingMultiple(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Valuation Multiple</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-gray-600 mb-4">
              Are you sure you want to delete the valuation multiple for <strong className="capitalize">{deletingMultiple?.country}</strong> / <strong className="capitalize">{deletingMultiple?.industry}</strong>?
            </p>
            <p className="text-sm text-gray-500 mb-6">This action cannot be undone.</p>
            <div className="flex gap-3 justify-end">
              <Button variant="outline" onClick={() => setIsDeleteOpen(false)} disabled={deleteMutation.isPending}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleDeleteConfirm} disabled={deleteMutation.isPending}>
                {deleteMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Delete
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <div className="border rounded-lg">
        {isLoading ? (
          <div className="flex items-center justify-center p-8">
            <Loader2 className="w-6 h-6 animate-spin" />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Country</TableHead>
                <TableHead>Industry</TableHead>
                <TableHead>Score Range</TableHead>
                <TableHead>Multiple</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {multiples && multiples.length > 0 ? (
                multiples.map((m) => (
                  <TableRow key={m.id}>
                    <TableCell className="uppercase">{m.country}</TableCell>
                    <TableCell className="capitalize">{m.industry}</TableCell>
                    <TableCell>{m.scoreRange}</TableCell>
                    <TableCell>{m.multiple}x</TableCell>
                    <TableCell>{new Date(m.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="sm" onClick={() => handleEdit(m)}>
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDeleteClick(m)}>
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-gray-500 py-8">
                    No multiples found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}
