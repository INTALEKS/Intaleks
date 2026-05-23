"use client";

import { useState, useEffect } from "react";

import { useUser } from "@/components/auth/access-guard";
import { Panel } from "@/components/affiliate/primitives";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useNotificationPrefs, useSaveNotificationPrefs, useUpdateProfile } from "@/hooks/use-affiliate-data";

export default function SettingsPage() {
  const { data } = useNotificationPrefs();
  const savePrefs = useSaveNotificationPrefs();
  const user = useUser();
  const updateProfile = useUpdateProfile();

  const [saved, setSaved] = useState(false);
  const [company, setCompany] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  function handleTogglePref(key: string, enabled: boolean) {
    if (!data) return;
    const updated = data.map((pref) =>
      pref.key === key ? { ...pref, enabled } : pref
    );
    savePrefs.mutate(updated);
  }

  const fullName = [user?.firstName, user?.lastName].filter(Boolean).join(" ") || "";
  const email = user?.email ?? "";
  const referralCode = user?.affiliateProfile?.code ?? "";

  // Initialize company from user data
  useEffect(() => {
    if (user?.affiliateProfile?.company) {
      setCompany(user.affiliateProfile.company);
    }
  }, [user]);

  function handleSaveProfile() {
    setErrorMsg(null);
    setSaved(false);

    updateProfile.mutate(
      { company },
      {
        onSuccess: () => {
          setSaved(true);
          setTimeout(() => setSaved(false), 2000);
        },
        onError: (err: any) => {
          setErrorMsg(err.response?.data?.message || "An error occurred updating profile.");
        },
      }
    );
  }

  return (
    <div className="grid gap-4 xl:grid-cols-2">
      <div className="flex flex-col gap-4">
        <Panel title="Profile">
          <div className="flex flex-col gap-3">
            <Input defaultValue={fullName} aria-label="Full name" placeholder="Full name" readOnly className="text-[var(--affiliate-muted)]" />
            <Input defaultValue={email} aria-label="Email" readOnly className="text-[var(--affiliate-muted)]" />
            <Input value={company} onChange={(e) => setCompany(e.target.value)} aria-label="Company" placeholder="Company (optional)" />
            <Input defaultValue={referralCode} aria-label="Referral code" readOnly className="font-mono text-[var(--affiliate-blue)]" placeholder="Referral code" />
            <Button
              className="w-fit bg-[var(--affiliate-navy)]"
              onClick={handleSaveProfile}
              disabled={updateProfile.isPending}
            >
              {updateProfile.isPending ? "Saving..." : saved ? "Saved!" : "Save changes"}
            </Button>
            {errorMsg && <p className="text-xs font-medium text-red-600">{errorMsg}</p>}
          </div>
        </Panel>
      </div>

      <div className="flex flex-col gap-4">
        <Panel title="Notifications">
          <div className="space-y-2">
            {data?.map((pref) => (
              <div key={pref.key} className="flex items-center justify-between border-b border-[var(--affiliate-border)] py-2 last:border-0">
                <span className="text-sm text-[var(--affiliate-navy)]">{pref.label}</span>
                <Switch 
                  checked={pref.enabled} 
                  onCheckedChange={(checked) => handleTogglePref(pref.key, checked)}
                  disabled={savePrefs.isPending}
                  aria-label={pref.label} 
                />
              </div>
            ))}
          </div>
        </Panel>

        <Panel title="Security">
          <div className="space-y-3">
            <Input type="password" placeholder="Current password" />
            <Input type="password" placeholder="New password" />
            <Button className="w-fit bg-[var(--affiliate-navy)]">Update password</Button>
          </div>
        </Panel>
      </div>
    </div>
  );
}
