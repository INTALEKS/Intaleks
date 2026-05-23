"use client";

import { useState } from "react";

import { AdminPanel } from "@/components/admin/primitives";
import { AdminErrorState, AdminLoadingState } from "@/components/admin/states";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useAdminProgramSettings } from "@/hooks/use-admin-data";
import { api } from "@/lib/api";

function AdminSettingsForm({ data, refetch }: { data: any; refetch: () => void }) {
  const [commission, setCommission] = useState(data.commission ?? 25);
  const [minWithdrawal, setMinWithdrawal] = useState(data.minWithdrawal ?? 250);
  const [holdingDays, setHoldingDays] = useState(data.holdingDays ?? 3);
  const [attributionDays, setAttributionDays] = useState(data.attributionDays ?? 30);
  const [notifications, setNotifications] = useState<any[]>(data.notifications ?? []);
  const [saved, setSaved] = useState(false);
  const [adminEmail, setAdminEmail] = useState(data.adminEmail ?? "");
  const [password, setPassword] = useState("");
  const [passwordUpdating, setPasswordUpdating] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState("");

  async function saveSettings() {
    try {
      await api.put(`/api/admin/affiliate/settings/${data.id}`, {
        commissionRate: commission,
        minWithdrawal,
        holdingDays,
        attributionDays,
        adminEmail,
        notifications: notifications.reduce<Record<string, boolean>>((acc, item) => {
          acc[item.key] = item.enabled;
          return acc;
        }, {}),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 1200);
      refetch();
    } catch (err) {
      console.error(err);
    }
  }

  async function updatePassword() {
    if (!password.trim()) return;
    setPasswordUpdating(true);
    setPasswordMessage("");
    try {
      const res = await api.put("/api/users/profile", {
        password: password.trim(),
      });
      if (res.data?.success) {
        setPasswordMessage("Password updated successfully!");
        setPassword("");
      } else {
        setPasswordMessage(res.data?.message || "Failed to update password");
      }
    } catch (err: any) {
      console.error(err);
      setPasswordMessage(err.response?.data?.message || "An error occurred");
    } finally {
      setPasswordUpdating(false);
      setTimeout(() => setPasswordMessage(""), 3000);
    }
  }

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <div className="flex flex-col gap-4">
        <AdminPanel title="Commission parameters">
          <div className="space-y-4">
            {[
              { label: "Commission rate (%)", value: commission, min: 5, max: 50, set: setCommission },
              { label: "Minimum withdrawal ($)", value: minWithdrawal, min: 50, max: 1000, set: setMinWithdrawal },
              { label: "Commission holding period (days)", value: holdingDays, min: 1, max: 14, set: setHoldingDays },
              { label: "Attribution window (days)", value: attributionDays, min: 7, max: 90, set: setAttributionDays },
            ].map((field) => (
              <label key={field.label} className="block">
                <div className="mb-2 flex items-center justify-between text-xs">
                  <span className="text-[var(--affiliate-muted)]">{field.label}</span>
                  <span className="font-mono text-[var(--affiliate-navy)]">{field.value}</span>
                </div>
                <input
                  type="range"
                  min={field.min}
                  max={field.max}
                  value={field.value}
                  onChange={(e) => field.set(Number(e.target.value))}
                  className="w-full accent-[var(--affiliate-blue)] cursor-pointer"
                />
              </label>
            ))}
          </div>
          <Button className="mt-4 w-full bg-[var(--affiliate-navy)] cursor-pointer" onClick={() => void saveSettings()}>
            {saved ? "Settings saved" : "Save program settings"}
          </Button>
        </AdminPanel>
      </div>

      <div className="flex flex-col gap-4">
        <AdminPanel title="Current program snapshot">
          <div className="space-y-2 rounded-md bg-[var(--affiliate-bg-accent)] p-3 text-sm">
            <div className="flex justify-between"><span>Commission rate</span><span className="font-mono">{commission}%</span></div>
            <div className="flex justify-between"><span>Min withdrawal</span><span className="font-mono">${minWithdrawal}</span></div>
            <div className="flex justify-between"><span>Holding period</span><span className="font-mono">{holdingDays} days</span></div>
            <div className="flex justify-between"><span>Attribution window</span><span className="font-mono">{attributionDays} days</span></div>
          </div>
        </AdminPanel>

        <AdminPanel title="Email notifications">
          <div className="space-y-2">
            {notifications.map((item) => (
              <div key={item.key} className="flex items-center justify-between border-b border-[var(--affiliate-border)] py-2 last:border-0">
                <span className="text-sm text-[var(--affiliate-navy)]">{item.label}</span>
                <Switch
                  checked={item.enabled}
                  onCheckedChange={(checked) =>
                    setNotifications((current) =>
                      current.map((row) => (row.key === item.key ? { ...row, enabled: checked } : row))
                    )
                  }
                />
              </div>
            ))}
          </div>
        </AdminPanel>

        <AdminPanel title="Admin account">
          <div className="space-y-3">
            <Input value={adminEmail} onChange={(e) => setAdminEmail(e.target.value)} placeholder="Admin Email" />
            <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="New password" />
            <Button
              className="w-fit bg-[var(--affiliate-navy)] cursor-pointer"
              disabled={passwordUpdating}
              onClick={() => void updatePassword()}
            >
              {passwordUpdating ? "Updating..." : "Update password"}
            </Button>
            {passwordMessage && (
              <p className="text-xs font-medium text-emerald-600 animate-pulse">{passwordMessage}</p>
            )}
          </div>
        </AdminPanel>
      </div>
    </div>
  );
}

export default function AdminSettingsPage() {
  const { data, isLoading, isError, refetch } = useAdminProgramSettings();

  if (isLoading) return <AdminLoadingState label="Loading settings..." />;
  if (isError) return <AdminErrorState title="Could not load settings" description="Please retry." retry={() => void refetch()} />;

  return <AdminSettingsForm data={data} refetch={refetch} />;
}
