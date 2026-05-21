import type {
  AdminAffiliate,
  AdminApplication,
  AdminProgramSettings,
  AdminReferral,
  AdminWithdrawal,
} from "@/lib/admin/types";

export const initialApplications: AdminApplication[] = [
  { id: 1, name: "Olivia Nguyen", email: "o.nguyen@capitalpartners.au", company: "Capital Partners AU", website: "capitalpartners.com.au", paypal: "o.nguyen@paypal.com", date: "1 May 2025", status: "pending" },
  { id: 2, name: "Daniel Osei", email: "dosei@businessgrowth.co.uk", company: "Business Growth UK", website: "businessgrowth.co.uk", paypal: "dosei@paypal.com", date: "29 Apr 2025", status: "pending" },
  { id: 3, name: "Sarah Whitmore", email: "s.whitmore@mbrokers.com.au", company: "Melbourne Brokers", website: "mbrokers.com.au", paypal: "s.whitmore@paypal.com", date: "27 Apr 2025", status: "pending" },
  { id: 4, name: "Aaron Tran", email: "aaron@nexusbiz.com.au", company: "Nexus Business Advisory", website: "nexusbiz.com.au", paypal: "aaron@paypal.com", date: "25 Apr 2025", status: "pending" },
  { id: 5, name: "Rachel Kim", email: "r.kim@brokerlink.au", company: "BrokerLink AU", website: "brokerlink.au", paypal: "r.kim@paypal.com", date: "20 Apr 2025", status: "approved" },
  { id: 6, name: "Marcus Webb", email: "m.webb@dealmakers.co.uk", company: "Dealmakers UK", website: "dealmakers.co.uk", paypal: "m.webb@paypal.com", date: "15 Apr 2025", status: "rejected" },
];

export const initialAffiliates: AdminAffiliate[] = [
  { id: 1, name: "James Mercer", email: "j.mercer@brokerfirm.au", company: "Mercer Business Brokers", code: "MERCER25", referrals: 19, converted: 12, earned: 4287, pending: 425, status: "active", joined: "Jan 2025" },
  { id: 2, name: "Rachel Kim", email: "r.kim@brokerlink.au", company: "BrokerLink AU", code: "RKIM25", referrals: 11, converted: 7, earned: 2100.5, pending: 174.75, status: "active", joined: "Apr 2025" },
  { id: 3, name: "Tom Callahan", email: "t.callahan@acquisitions.au", company: "Callahan Acquisitions", code: "TCALL25", referrals: 8, converted: 5, earned: 1243.75, pending: 0, status: "active", joined: "Feb 2025" },
  { id: 4, name: "Priya Sharma", email: "priya@sharmabrokers.com.au", company: "Sharma Brokers", code: "PSHARMA25", referrals: 6, converted: 2, earned: 498, pending: 249, status: "active", joined: "Mar 2025" },
  { id: 5, name: "Liam O'Brien", email: "l.obrien@obriencapital.au", company: "O'Brien Capital", code: "LOBR25", referrals: 14, converted: 9, earned: 3108.25, pending: 700, status: "suspended", joined: "Dec 2024" },
];

export const adminReferrals: AdminReferral[] = [
  { id: 1, affiliate: "James Mercer", client: "R.T. ••••", plan: "Professional", value: 699, commission: 174.75, date: "28 Mar 2025", status: "converted" },
  { id: 2, affiliate: "James Mercer", client: "B.C. ••••", plan: "Enterprise", value: 1000, commission: 250, date: "25 Mar 2025", status: "pending" },
  { id: 3, affiliate: "Rachel Kim", client: "A.F. ••••", plan: "Professional", value: 699, commission: 174.75, date: "24 Mar 2025", status: "converted" },
  { id: 4, affiliate: "Tom Callahan", client: "D.W. ••••", plan: "Enterprise", value: 1000, commission: 250, date: "22 Mar 2025", status: "converted" },
  { id: 5, affiliate: "James Mercer", client: "K.N. ••••", plan: "Starter", value: 299, commission: 74.75, date: "19 Mar 2025", status: "converted" },
  { id: 6, affiliate: "Priya Sharma", client: "M.T. ••••", plan: "Starter", value: 299, commission: 74.75, date: "17 Mar 2025", status: "pending" },
  { id: 7, affiliate: "Rachel Kim", client: "C.O. ••••", plan: "Enterprise", value: 1000, commission: 250, date: "14 Mar 2025", status: "converted" },
  { id: 8, affiliate: "Tom Callahan", client: "S.P. ••••", plan: "Professional", value: 699, commission: 174.75, date: "10 Mar 2025", status: "converted" },
  { id: 9, affiliate: "James Mercer", client: "A.P. ••••", plan: "Professional", value: 0, commission: 0, date: "12 Mar 2025", status: "lead" },
  { id: 10, affiliate: "Priya Sharma", client: "N.K. ••••", plan: "Starter", value: 299, commission: 74.75, date: "5 Mar 2025", status: "converted" },
];

export const initialWithdrawals: AdminWithdrawal[] = [
  { id: 1, affiliate: "James Mercer", amount: 1740, method: "PayPal", paypal: "j.mercer@paypal.com", requested: "2 May 2025", status: "requested" },
  { id: 2, affiliate: "Rachel Kim", amount: 500, method: "Stripe", paypal: "r.kim@stripe.com", requested: "1 May 2025", status: "requested" },
  { id: 3, affiliate: "Tom Callahan", amount: 993.75, method: "PayPal", paypal: "t.calla@paypal.com", requested: "28 Apr 2025", status: "requested" },
  { id: 4, affiliate: "Priya Sharma", amount: 250, method: "PayPal", paypal: "p.sharma@paypal.com", requested: "20 Apr 2025", status: "processed", ref: "PP-4421GX" },
  { id: 5, affiliate: "James Mercer", amount: 500, method: "PayPal", paypal: "j.mercer@paypal.com", requested: "14 Feb 2025", status: "processed", ref: "PP-9823HX" },
  { id: 6, affiliate: "Tom Callahan", amount: 250, method: "Stripe", paypal: "t.calla@stripe.com", requested: "9 Jan 2025", status: "processed", ref: "STR-7712AK" },
];

export const monthlyPayouts = [2410, 3180, 4220, 3760, 5140, 4980];
export const monthlyPayoutMonths = ["Nov", "Dec", "Jan", "Feb", "Mar", "Apr"];

export const initialProgramSettings: AdminProgramSettings = {
  commission: 25,
  minWithdrawal: 250,
  holdingDays: 3,
  attributionDays: 30,
  adminEmail: "aleks@intaleks.com",
  notifications: [
    { key: "app-received", label: "Affiliate application received", enabled: true },
    { key: "app-reviewed", label: "Application approved or rejected", enabled: true },
    { key: "withdrawal-requested", label: "Withdrawal request submitted", enabled: true },
    { key: "weekly-report", label: "Weekly affiliate report", enabled: false },
    { key: "monthly-summary", label: "Monthly program summary", enabled: true },
  ],
};
