"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { MoreVertical, UserPlus, Ban, Trash2, Filter, Play, Loader2, CreditCard, XCircle, Shield } from "lucide-react";
import { useUsers, useCreateUser, useDeleteUser, useSuspendUser, useReactivateUser, useChangeRole } from "@/app/hooks/useUsers";
import { useGrantSubscription, useRevokeSubscription } from "@/app/hooks/usePayments";
import { useSubscriptionPlans } from "@/app/hooks/useSubscriptions";
import type { UserFilters, User } from "@/app/services/users";

/**
 * Admin Users Page with Subscription Management
 * Requirements: 7.3, 7.4
 */
export default function UsersPage() {
  const [filters, setFilters] = useState<UserFilters>({ page: 1, limit: 10 });
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedPlan, setSelectedPlan] = useState("all");
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isGrantSubscriptionOpen, setIsGrantSubscriptionOpen] = useState(false);
  const [isRevokeSubscriptionOpen, setIsRevokeSubscriptionOpen] = useState(false);
  const [isChangeRoleOpen, setIsChangeRoleOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [newUser, setNewUser] = useState({ email: "", password: "", name: "" });
  const [selectedPlanId, setSelectedPlanId] = useState("");
  const [revokeReason, setRevokeReason] = useState("");
  const [selectedRole, setSelectedRole] = useState<"USER" | "ADMIN">("USER");

  const { data, isLoading, error } = useUsers(filters);
  const { data: plans } = useSubscriptionPlans();
  const createUser = useCreateUser();
  const deleteUser = useDeleteUser();
  const suspendUser = useSuspendUser();
  const reactivateUser = useReactivateUser();
  const grantSubscription = useGrantSubscription();
  const revokeSubscription = useRevokeSubscription();
  const changeRole = useChangeRole();

  const handleStatusFilter = (value: string) => {
    setSelectedStatus(value);
    setFilters((prev) => ({
      ...prev,
      status: value === "all" ? undefined : (value as "ACTIVE" | "SUSPENDED"),
      page: 1,
    }));
  };

  const handlePlanFilter = (value: string) => {
    setSelectedPlan(value);
    setFilters((prev) => ({
      ...prev,
      subscriptionPlanId: value === "all" ? undefined : value,
      page: 1,
    }));
  };

  const handleCreateUser = async () => {
    if (!newUser.email || !newUser.password) return;
    await createUser.mutateAsync(newUser);
    setIsAddUserOpen(false);
    setNewUser({ email: "", password: "", name: "" });
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;
    await deleteUser.mutateAsync(selectedUser.id);
    setIsDeleteOpen(false);
    setSelectedUser(null);
  };

  const handleSuspendUser = async (user: User) => {
    await suspendUser.mutateAsync(user.id);
  };

  const handleReactivateUser = async (user: User) => {
    await reactivateUser.mutateAsync(user.id);
  };

  /**
   * Grant subscription access to a user
   * Requirements: 7.4
   */
  const handleGrantSubscription = async () => {
    if (!selectedUser || !selectedPlanId) return;
    await grantSubscription.mutateAsync({ userId: selectedUser.id, planId: selectedPlanId });
    setIsGrantSubscriptionOpen(false);
    setSelectedUser(null);
    setSelectedPlanId("");
  };

  /**
   * Revoke subscription access from a user
   * Requirements: 7.4
   */
  const handleRevokeSubscription = async () => {
    if (!selectedUser) return;
    await revokeSubscription.mutateAsync({ userId: selectedUser.id, reason: revokeReason || undefined });
    setIsRevokeSubscriptionOpen(false);
    setSelectedUser(null);
    setRevokeReason("");
  };

  const handleChangeRole = async () => {
    if (!selectedUser) return;
    await changeRole.mutateAsync({ userId: selectedUser.id, role: selectedRole });
    setIsChangeRoleOpen(false);
    setSelectedUser(null);
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "bg-green-100 text-green-800 hover:bg-green-100";
      case "SUSPENDED":
        return "bg-red-100 text-red-800 hover:bg-red-100";
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-100";
    }
  };

  const getPlanBadgeColor = (planName?: string) => {
    if (!planName) return "bg-gray-100 text-gray-800 hover:bg-gray-100";
    return "bg-yellow-100 text-yellow-800 hover:bg-yellow-100";
  };

  /**
   * Get subscription status badge variant
   * Requirements: 7.3
   */
  const getSubscriptionStatusBadge = (user: User) => {
    // subscriptionStatus is directly on the user object from the server
    const status = user.subscriptionStatus;
    if (!status || status === "NONE") {
      return (
        <Badge variant="outline" className="bg-gray-50">
          No Subscription
        </Badge>
      );
    }

    switch (status) {
      case "ACTIVE":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Active</Badge>;
      case "PAST_DUE":
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Past Due</Badge>;
      case "CANCELED":
        return <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-100">Canceled</Badge>;
      case "INCOMPLETE":
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Incomplete</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const totalPages = data?.totalPages || 1;
  const currentPage = filters.page || 1;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
          <p className="text-muted-foreground mt-1">Manage and monitor all users in your system</p>
        </div>
        <Button className="gap-2" onClick={() => setIsAddUserOpen(true)}>
          <UserPlus className="h-4 w-4" />
          Add User
        </Button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3">
        <Button variant="outline" size="icon">
          <Filter className="h-4 w-4" />
        </Button>

        <Input placeholder="Search by name or email..." className="w-[250px]" onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value || undefined, page: 1 }))} />

        <div className="flex-1" />

        {/* Plan Filter */}
        <Select value={selectedPlan} onValueChange={handlePlanFilter}>
          <SelectTrigger className="w-[160px] bg-yellow-100 border-yellow-200">
            <SelectValue placeholder="All Plans" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Plans</SelectItem>
            {plans?.map((plan) => (
              <SelectItem key={plan.id} value={plan.id}>
                {plan.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Status Filter */}
        <Select value={selectedStatus} onValueChange={handleStatusFilter}>
          <SelectTrigger className="w-[140px] bg-green-100 border-green-200">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="ACTIVE">Active</SelectItem>
            <SelectItem value="SUSPENDED">Suspended</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Users Table */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Created At</TableHead>
              <TableHead>Plan</TableHead>
              <TableHead>Subscription Status</TableHead>
              <TableHead>Account Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                </TableCell>
              </TableRow>
            ) : error ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-red-500">
                  Failed to load users
                </TableCell>
              </TableRow>
            ) : data?.users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  No users found
                </TableCell>
              </TableRow>
            ) : (
              data?.users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.name || "—"}</TableCell>
                  <TableCell className="text-muted-foreground">{user.email}</TableCell>
                  <TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Badge className={getPlanBadgeColor(user.subscription?.name)}>{user.subscription?.name || "No Plan"}</Badge>
                  </TableCell>
                  <TableCell>{getSubscriptionStatusBadge(user)}</TableCell>
                  <TableCell>
                    <Badge className={getStatusBadgeColor(user.status)}>{user.status}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {/* Subscription Management - Requirements: 7.3, 7.4 */}
                        <DropdownMenuItem
                          onClick={() => {
                            setSelectedUser(user);
                            setIsGrantSubscriptionOpen(true);
                          }}
                        >
                          <CreditCard className="h-4 w-4 mr-2" />
                          Grant Subscription
                        </DropdownMenuItem>

                        {user.subscription && (
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedUser(user);
                              setIsRevokeSubscriptionOpen(true);
                            }}
                          >
                            <XCircle className="h-4 w-4 mr-2" />
                            Revoke Subscription
                          </DropdownMenuItem>
                        )}

                        <DropdownMenuSeparator />

                        <DropdownMenuItem
                          onClick={() => {
                            setSelectedUser(user);
                            setSelectedRole(user.role === "ADMIN" ? "USER" : "ADMIN");
                            setIsChangeRoleOpen(true);
                          }}
                        >
                          <Shield className="h-4 w-4 mr-2" />
                          Change Role to {user.role === "ADMIN" ? "User" : "Admin"}
                        </DropdownMenuItem>

                        <DropdownMenuSeparator />

                        {user.status === "ACTIVE" ? (
                          <DropdownMenuItem onClick={() => handleSuspendUser(user)}>
                            <Ban className="h-4 w-4 mr-2" />
                            Suspend User
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem onClick={() => handleReactivateUser(user)}>
                            <Play className="h-4 w-4 mr-2" />
                            Reactivate User
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => {
                            setSelectedUser(user);
                            setIsDeleteOpen(true);
                          }}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete User
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{data?.total || 0} items</p>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" disabled={currentPage <= 1} onClick={() => setFilters((prev) => ({ ...prev, page: currentPage - 1 }))}>
            Previous
          </Button>
          {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map((page) => (
            <Button key={page} variant="outline" size="sm" className={currentPage === page ? "bg-primary text-primary-foreground" : ""} onClick={() => setFilters((prev) => ({ ...prev, page }))}>
              {page}
            </Button>
          ))}
          <Button variant="outline" size="sm" disabled={currentPage >= totalPages} onClick={() => setFilters((prev) => ({ ...prev, page: currentPage + 1 }))}>
            Next
          </Button>
        </div>
      </div>

      {/* Add User Dialog */}
      <Dialog open={isAddUserOpen} onOpenChange={setIsAddUserOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New User</DialogTitle>
            <DialogDescription>Create a new user account.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" value={newUser.name} onChange={(e) => setNewUser((prev) => ({ ...prev, name: e.target.value }))} placeholder="Enter name" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={newUser.email} onChange={(e) => setNewUser((prev) => ({ ...prev, email: e.target.value }))} placeholder="Enter email" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" value={newUser.password} onChange={(e) => setNewUser((prev) => ({ ...prev, password: e.target.value }))} placeholder="Enter password" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddUserOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateUser} disabled={createUser.isPending}>
              {createUser.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Create User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete User</DialogTitle>
            <DialogDescription>Are you sure you want to delete {selectedUser?.name || selectedUser?.email}? This action cannot be undone.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteUser} disabled={deleteUser.isPending}>
              {deleteUser.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Grant Subscription Dialog - Requirements: 7.4 */}
      <Dialog open={isGrantSubscriptionOpen} onOpenChange={setIsGrantSubscriptionOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Grant Subscription Access</DialogTitle>
            <DialogDescription>Manually grant subscription access to {selectedUser?.name || selectedUser?.email}. This will bypass payment and immediately activate the subscription.</DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            {selectedUser?.subscription && (
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                <p className="text-sm text-yellow-800">
                  This user already has an active subscription to <strong>{selectedUser.subscription.name}</strong>. Granting a new subscription will replace the existing one.
                </p>
              </div>
            )}
            <div className="space-y-2">
              <Label>Select Subscription Plan</Label>
              <Select value={selectedPlanId} onValueChange={setSelectedPlanId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a plan" />
                </SelectTrigger>
                <SelectContent>
                  {plans?.map((plan) => (
                    <SelectItem key={plan.id} value={plan.id}>
                      {plan.name} - ${(plan.price / 100).toFixed(2)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsGrantSubscriptionOpen(false);
                setSelectedPlanId("");
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleGrantSubscription} disabled={grantSubscription.isPending || !selectedPlanId}>
              {grantSubscription.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Grant Access
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Revoke Subscription Dialog - Requirements: 7.4 */}
      <Dialog open={isRevokeSubscriptionOpen} onOpenChange={setIsRevokeSubscriptionOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Revoke Subscription Access</DialogTitle>
            <DialogDescription>Are you sure you want to revoke subscription access for {selectedUser?.name || selectedUser?.email}? This will immediately remove their access to premium features.</DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            {selectedUser?.subscription && (
              <div className="p-3 bg-muted rounded-md">
                <p className="text-sm">
                  <strong>Current Plan:</strong> {selectedUser.subscription.name}
                </p>
                <p className="text-sm">
                  <strong>Status:</strong> {selectedUser.subscriptionStatus}
                </p>
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="reason">Reason (optional)</Label>
              <Textarea id="reason" value={revokeReason} onChange={(e) => setRevokeReason(e.target.value)} placeholder="Enter reason for revoking subscription..." rows={3} />
              <p className="text-xs text-muted-foreground">This will be logged for audit purposes.</p>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsRevokeSubscriptionOpen(false);
                setRevokeReason("");
              }}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleRevokeSubscription} disabled={revokeSubscription.isPending}>
              {revokeSubscription.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Revoke Access
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Change Role Dialog */}
      <Dialog open={isChangeRoleOpen} onOpenChange={setIsChangeRoleOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change User Role</DialogTitle>
            <DialogDescription>Change the role for {selectedUser?.name || selectedUser?.email}. This will affect their permissions and access level.</DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="p-3 bg-muted rounded-md">
              <p className="text-sm">
                <strong>Current Role:</strong> {selectedUser?.role}
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">New Role</Label>
              <Select value={selectedRole} onValueChange={(value: "USER" | "ADMIN") => setSelectedRole(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USER">User</SelectItem>
                  <SelectItem value="ADMIN">Admin</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">{selectedRole === "ADMIN" ? "Admins have full access to the admin panel and can manage all users." : "Users have standard access without admin privileges."}</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsChangeRoleOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleChangeRole} disabled={changeRole.isPending}>
              {changeRole.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Change Role
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
