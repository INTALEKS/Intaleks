import { Router, Request, Response } from "express";
import { prisma } from "../config/db";
import { authenticateToken } from "../middleware/authMiddleware";
import { AffiliateReferral, AffiliateWithdrawal } from "@prisma/client";

const router = Router();

router.use(authenticateToken);

/**
 * Helper to generate a unique referral code
 */
async function generateUniqueReferralCode(base: string): Promise<string> {
  const prefix = base.replace(/[^a-zA-Z0-9]/g, "").toUpperCase().slice(0, 6) || "REF";
  let code = prefix;
  let attempts = 0;
  let isUnique = false;

  while (!isUnique && attempts < 10) {
    const existing = await prisma.affiliateProfile.findUnique({
      where: { code },
    });
    if (!existing) {
      isUnique = true;
    } else {
      const randomDigits = Math.floor(1000 + Math.random() * 9000);
      code = `${prefix.slice(0, 6)}${randomDigits}`;
      attempts++;
    }
  }

  if (!isUnique) {
    code = Math.random().toString(36).substring(2, 8).toUpperCase();
  }

  return code;
}

/**
 * POST /api/users/affiliate/activate - Instant Self-Activation (Disabled)
 */
router.post("/activate", async (req: Request, res: Response) => {
  return res.status(403).json({
    success: false,
    message: "Instant activation is disabled. Please submit an application request for manual admin review.",
  });
});

/**
 * POST /api/users/affiliate/apply - Submit Application Request to Admin
 */
router.post("/apply", async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const { company, website, paypal } = req.body;

    if (!paypal || !String(paypal).trim()) {
      return res.status(400).json({ success: false, message: "PayPal email is required" });
    }

    const userId = req.user.id;

    // Fetch full user details
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { affiliateProfile: true },
    });

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    if (user.affiliateProfile) {
      return res.status(400).json({
        success: false,
        message: "You already have an active affiliate profile",
      });
    }

    // Check for existing pending application
    const existingApp = await prisma.affiliateApplication.findFirst({
      where: { email: user.email.toLowerCase().trim() },
      orderBy: { createdAt: "desc" },
    });

    if (existingApp && existingApp.status === "PENDING") {
      return res.status(400).json({
        success: false,
        message: "You already have a pending application under review",
        application: existingApp,
      });
    }

    // Create a new application record
    const application = await prisma.affiliateApplication.create({
      data: {
        name: `${user.firstName || ""} ${user.lastName || ""}`.trim() || user.email.split("@")[0],
        email: user.email.toLowerCase().trim(),
        company: String(company || "").trim(),
        website: String(website || "").trim(),
        paypal: String(paypal).trim(),
        status: "PENDING",
      },
    });

    return res.status(201).json({
      success: true,
      message: "Affiliate application submitted successfully!",
      application: {
        id: application.id,
        status: "pending",
      },
    });
  } catch (error: any) {
    console.error("Affiliate application submit error:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while submitting your application",
    });
  }
});

/**
 * GET /api/users/affiliate/dashboard-summary - Dynamic metrics & balance calculations
 */
router.get("/dashboard-summary", async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const profile = await prisma.affiliateProfile.findUnique({
      where: { userId: req.user.id },
    });

    if (!profile) {
      return res.status(404).json({ success: false, message: "No active affiliate profile found" });
    }

    // Query all referrals for this affiliate
    const referrals = await prisma.affiliateReferral.findMany({
      where: { affiliateName: profile.name },
    });

    // Query all withdrawals for this affiliate
    const withdrawals = await prisma.affiliateWithdrawal.findMany({
      where: { affiliateName: profile.name },
    });

    // Dynamic Calculations
    // 1. Total Converted Earnings
    const totalEarnings = referrals
      .filter((r: AffiliateReferral) => r.status === "CONVERTED")
      .reduce((sum: number, r: AffiliateReferral) => sum + r.commission, 0);

    // 2. Total Withdrawn (Processed)
    const totalWithdrawn = withdrawals
      .filter((w: AffiliateWithdrawal) => w.status === "PROCESSED")
      .reduce((sum: number, w: AffiliateWithdrawal) => sum + w.amount, 0);

    // 3. Total Requested Withdrawals (Pending approval)
    const totalPendingWithdrawals = withdrawals
      .filter((w: AffiliateWithdrawal) => w.status === "REQUESTED")
      .reduce((sum: number, w: AffiliateWithdrawal) => sum + w.amount, 0);

    // 4. Available Balance = Converted - Processed - Requested
    const availableBalance = Math.max(0, totalEarnings - totalWithdrawn - totalPendingWithdrawals);

    // 5. Pending under Hold (referrals marked as PENDING)
    const pendingHold = referrals
      .filter((r: AffiliateReferral) => r.status === "PENDING")
      .reduce((sum: number, r: AffiliateReferral) => sum + r.commission, 0);

    const totalReferralsCount = referrals.length;
    const convertedCount = referrals.filter((r: AffiliateReferral) => r.status === "CONVERTED").length;

    return res.status(200).json([
      {
        label: "Total Earnings",
        value: `$${totalEarnings.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        detail: "All-time referrals",
        tone: "info",
      },
      {
        label: "Available Balance",
        value: `$${availableBalance.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        detail: "Ready to withdraw",
        tone: "success",
      },
      {
        label: "Pending (3-day hold)",
        value: `$${pendingHold.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        detail: "Unlocking soon",
        tone: "warning",
      },
      {
        label: "Total Referrals",
        value: `${totalReferralsCount}`,
        detail: `${convertedCount} converted`,
        tone: "accent",
      },
    ]);
  } catch (error: any) {
    console.error("GET /dashboard-summary error:", error);
    return res.status(500).json({ success: false, message: "An error occurred fetching dashboard summary" });
  }
});

/**
 * GET /api/users/affiliate/referrals - Get detailed referral logs
 */
router.get("/referrals", async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const profile = await prisma.affiliateProfile.findUnique({
      where: { userId: req.user.id },
    });

    if (!profile) {
      return res.status(404).json({ success: false, message: "No active affiliate profile found" });
    }

    const referrals = await prisma.affiliateReferral.findMany({
      where: { affiliateName: profile.name },
      orderBy: { conversionDate: "desc" },
    });

    const mappedReferrals = referrals.map((r: AffiliateReferral) => {
      let statusLabel: string = "lead";
      let availableLabel: string = "—";

      if (r.status === "CONVERTED") {
        statusLabel = "converted";
        availableLabel = "Yes";
      } else if (r.status === "PENDING") {
        statusLabel = "pending";
        availableLabel = "Hold";
      }

      return {
        date: new Date(r.conversionDate).toLocaleDateString("en-US", {
          day: "numeric",
          month: "short",
          year: "numeric",
        }),
        client: r.clientMasked,
        plan: r.plan,
        planValue: r.value > 0 ? `$${r.value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : "—",
        commission: r.commission > 0 ? `$${r.commission.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : "—",
        available: availableLabel,
        status: statusLabel,
      };
    });

    return res.status(200).json(mappedReferrals);
  } catch (error: any) {
    console.error("GET /referrals error:", error);
    return res.status(500).json({ success: false, message: "An error occurred fetching referrals" });
  }
});

/**
 * GET /api/users/affiliate/commissions - Get commissions chart and breakdowns
 */
router.get("/commissions", async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const profile = await prisma.affiliateProfile.findUnique({
      where: { userId: req.user.id },
    });

    if (!profile) {
      return res.status(404).json({ success: false, message: "No active affiliate profile found" });
    }

    const referrals = await prisma.affiliateReferral.findMany({
      where: { affiliateName: profile.name },
      orderBy: { conversionDate: "desc" },
    });

    // 1. Commission Log Mappings
    const commissionLog = referrals
      .filter((r: AffiliateReferral) => r.status === "CONVERTED" || r.status === "PENDING")
      .map((r: AffiliateReferral) => ({
        date: new Date(r.conversionDate).toLocaleDateString("en-US", {
          day: "numeric",
          month: "short",
        }),
        client: r.clientMasked,
        plan: r.plan,
        planValue: `$${r.value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        rate: "25%",
        commission: `$${r.commission.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        status: r.status === "CONVERTED" ? "available" : "hold",
      }));

    // 2. Last 6 Months Earnings Chart Data
    const monthlyEarningsMap: Record<string, number> = {};
    const monthsOrder: string[] = [];

    // Initialize last 6 months
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const mLabel = d.toLocaleDateString("en-US", { month: "short" });
      monthlyEarningsMap[mLabel] = 0;
      monthsOrder.push(mLabel);
    }

    referrals.forEach((r: AffiliateReferral) => {
      if (r.status === "CONVERTED") {
        const mLabel = new Date(r.conversionDate).toLocaleDateString("en-US", { month: "short" });
        if (mLabel in monthlyEarningsMap) {
          monthlyEarningsMap[mLabel] += r.commission;
        }
      }
    });

    const monthlyEarnings = monthsOrder.map((m: string) => ({
      month: m,
      value: Math.round(monthlyEarningsMap[m]),
    }));

    // 3. Plan Breakdown Data
    const planMap: Record<string, number> = { Enterprise: 0, Professional: 0, Starter: 0 };
    referrals.forEach((r: AffiliateReferral) => {
      if (r.status === "CONVERTED" && r.plan in planMap) {
        planMap[r.plan] += r.commission;
      }
    });

    const colors: Record<string, string> = {
      Enterprise: "var(--affiliate-navy)",
      Professional: "var(--affiliate-blue)",
      Starter: "var(--affiliate-sky)",
    };

    const planBreakdown = Object.keys(planMap).map((plan: string) => ({
      plan,
      amount: planMap[plan],
      color: colors[plan] || "var(--affiliate-muted)",
    }));

    return res.status(200).json({
      commissionLog,
      monthlyEarnings,
      planBreakdown,
    });
  } catch (error: any) {
    console.error("GET /commissions error:", error);
    return res.status(500).json({ success: false, message: "An error occurred fetching commissions" });
  }
});

/**
 * GET /api/users/affiliate/withdrawals - History of withdrawals
 */
router.get("/withdrawals", async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const profile = await prisma.affiliateProfile.findUnique({
      where: { userId: req.user.id },
    });

    if (!profile) {
      return res.status(404).json({ success: false, message: "No active affiliate profile found" });
    }

    const withdrawals = await prisma.affiliateWithdrawal.findMany({
      where: { affiliateName: profile.name },
      orderBy: { requestedAt: "desc" },
    });

    const mappedWithdrawals = withdrawals.map((w: AffiliateWithdrawal) => ({
      date: new Date(w.requestedAt).toLocaleDateString("en-US", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }),
      amount: `$${w.amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      method: w.method,
      reference: w.reference || `REQ-${w.id.slice(-6).toUpperCase()}`,
      status: w.status.toLowerCase(), // "processed" or "requested"
    }));

    return res.status(200).json(mappedWithdrawals);
  } catch (error: any) {
    console.error("GET /withdrawals error:", error);
    return res.status(500).json({ success: false, message: "An error occurred fetching withdrawals" });
  }
});

/**
 * POST /api/users/affiliate/withdrawals - Submits a withdrawal request
 */
router.post("/withdrawals", async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const { amount, method, paypalEmail } = req.body;
    const requestAmount = parseFloat(amount);

    if (isNaN(requestAmount) || requestAmount < 250) {
      return res.status(400).json({ success: false, message: "Minimum withdrawal amount is $250.00" });
    }

    const profile = await prisma.affiliateProfile.findUnique({
      where: { userId: req.user.id },
    });

    if (!profile) {
      return res.status(404).json({ success: false, message: "No active affiliate profile found" });
    }

    // Dynamic balance check
    const referrals = await prisma.affiliateReferral.findMany({
      where: { affiliateName: profile.name },
    });

    const withdrawals = await prisma.affiliateWithdrawal.findMany({
      where: { affiliateName: profile.name },
    });

    const totalEarnings = referrals
      .filter((r: AffiliateReferral) => r.status === "CONVERTED")
      .reduce((sum: number, r: AffiliateReferral) => sum + r.commission, 0);

    const totalWithdrawn = withdrawals
      .filter((w: AffiliateWithdrawal) => w.status === "PROCESSED")
      .reduce((sum: number, w: AffiliateWithdrawal) => sum + w.amount, 0);

    const totalPendingWithdrawals = withdrawals
      .filter((w: AffiliateWithdrawal) => w.status === "REQUESTED")
      .reduce((sum: number, w: AffiliateWithdrawal) => sum + w.amount, 0);

    const availableBalance = Math.max(0, totalEarnings - totalWithdrawn - totalPendingWithdrawals);

    if (requestAmount > availableBalance) {
      return res.status(400).json({ success: false, message: "Insufficient balance for this withdrawal" });
    }

    // Create the withdrawal request
    const withdrawal = await prisma.affiliateWithdrawal.create({
      data: {
        affiliateName: profile.name,
        amount: requestAmount,
        method: method || "PayPal",
        payoutAccount: paypalEmail || profile.email,
        requestedAt: new Date(),
        status: "REQUESTED",
      },
    });

    return res.status(201).json({
      success: true,
      message: "Withdrawal request submitted successfully!",
      withdrawal,
    });
  } catch (error: any) {
    console.error("POST /withdrawals error:", error);
    return res.status(500).json({ success: false, message: "An error occurred submitting withdrawal request" });
  }
});

/**
 * PUT /api/users/affiliate/profile - Updates profile details (company name)
 */
router.put("/profile", async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const { company } = req.body;

    const profile = await prisma.affiliateProfile.findUnique({
      where: { userId: req.user.id },
    });

    if (!profile) {
      return res.status(404).json({ success: false, message: "No active affiliate profile found" });
    }

    const updatedProfile = await prisma.affiliateProfile.update({
      where: { id: profile.id },
      data: {
        company: String(company || "").trim(),
      },
    });

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully!",
      profile: updatedProfile,
    });
  } catch (error: any) {
    console.error("PUT /profile error:", error);
    return res.status(500).json({ success: false, message: "An error occurred updating profile" });
  }
});

/**
 * GET /api/users/affiliate/notification-prefs - Returns notification preferences
 */
router.get("/notification-prefs", async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const profile = await prisma.affiliateProfile.findUnique({
      where: { userId: req.user.id },
    });

    if (!profile) {
      return res.status(404).json({ success: false, message: "No active affiliate profile found" });
    }

    // Default preferences
    const defaultPrefs = [
      { key: "new_referral", label: "Email me when a new referral signs up", enabled: true },
      { key: "payout_processed", label: "Email me when a payout is processed", enabled: true },
      { key: "newsletter", label: "Receive monthly program updates & tips", enabled: false },
    ];

    if (!profile.notificationPrefs) {
      // Save default preferences
      await prisma.affiliateProfile.update({
        where: { id: profile.id },
        data: { notificationPrefs: defaultPrefs },
      });
      return res.status(200).json(defaultPrefs);
    }

    return res.status(200).json(profile.notificationPrefs);
  } catch (error: any) {
    console.error("GET /notification-prefs error:", error);
    return res.status(500).json({ success: false, message: "An error occurred fetching notification preferences" });
  }
});

/**
 * PUT /api/users/affiliate/notification-prefs - Save notification preferences
 */
router.put("/notification-prefs", async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const { preferences } = req.body;
    if (!preferences || !Array.isArray(preferences)) {
      return res.status(400).json({ success: false, message: "Preferences array is required" });
    }

    const profile = await prisma.affiliateProfile.findUnique({
      where: { userId: req.user.id },
    });

    if (!profile) {
      return res.status(404).json({ success: false, message: "No active affiliate profile found" });
    }

    const updatedProfile = await prisma.affiliateProfile.update({
      where: { id: profile.id },
      data: { notificationPrefs: preferences },
    });

    return res.status(200).json({
      success: true,
      message: "Notification preferences updated successfully!",
      preferences: updatedProfile.notificationPrefs,
    });
  } catch (error: any) {
    console.error("PUT /notification-prefs error:", error);
    return res.status(500).json({ success: false, message: "An error occurred updating notification preferences" });
  }
});

/**
 * GET /api/users/affiliate/chat - Get chat messages
 */
router.get("/chat", async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const profile = await prisma.affiliateProfile.findUnique({
      where: { userId: req.user.id },
    });

    if (!profile) {
      return res.status(404).json({ success: false, message: "No active affiliate profile found" });
    }

    let messages = await prisma.affiliateChatMessage.findMany({
      where: { affiliateName: profile.name },
      orderBy: { createdAt: "asc" },
    });

    // Seed welcome messages if empty
    if (messages.length === 0) {
      const welcomeMessages = [
        {
          affiliateName: profile.name,
          from: "support",
          content: `Hi ${profile.name.split(" ")[0]}! Welcome to the Intaleks affiliate programme. Feel free to ask us anything — commissions, payouts, how to promote Intaleks, or anything else.`,
          timeLabel: "Aleks · 12 Jan, 9:02 am",
        },
      ];

      await prisma.affiliateChatMessage.createMany({
        data: welcomeMessages,
      });

      messages = await prisma.affiliateChatMessage.findMany({
        where: { affiliateName: profile.name },
        orderBy: { createdAt: "asc" },
      });
    }

    return res.status(200).json(messages);
  } catch (error: any) {
    console.error("GET /chat error:", error);
    return res.status(500).json({ success: false, message: "An error occurred fetching chat messages" });
  }
});

/**
 * POST /api/users/affiliate/chat - Send a new chat message
 */
router.post("/chat", async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const { content } = req.body;
    if (!content || !String(content).trim()) {
      return res.status(400).json({ success: false, message: "Message content is required" });
    }

    const profile = await prisma.affiliateProfile.findUnique({
      where: { userId: req.user.id },
    });

    if (!profile) {
      return res.status(404).json({ success: false, message: "No active affiliate profile found" });
    }

    const now = new Date();
    const timeLabel = `You · Today, ${now.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}`;

    // Save user message
    const userMessage = await prisma.affiliateChatMessage.create({
      data: {
        affiliateName: profile.name,
        from: "you",
        content: String(content).trim(),
        timeLabel,
      },
    });

    // Auto-reply
    const replyTimeLabel = `Intaleks Support · Today, ${now.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}`;
    await prisma.affiliateChatMessage.create({
      data: {
        affiliateName: profile.name,
        from: "support",
        content: "Thanks for your message! A member of the Intaleks team will get back to you shortly during AEST business hours.",
        timeLabel: replyTimeLabel,
      },
    });

    return res.status(201).json(userMessage);
  } catch (error: any) {
    console.error("POST /chat error:", error);
    return res.status(500).json({ success: false, message: "An error occurred sending message" });
  }
});

/**
 * POST /api/users/affiliate/chat/read - Mark all support messages as read
 */
router.post("/chat/read", async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const profile = await prisma.affiliateProfile.findUnique({
      where: { userId: req.user.id },
    });

    if (!profile) {
      return res.status(404).json({ success: false, message: "No active affiliate profile found" });
    }

    // Mark all support messages as read
    await prisma.affiliateChatMessage.updateMany({
      where: {
        affiliateName: profile.name,
        from: "support",
        read: false,
      },
      data: {
        read: true,
      },
    });

    return res.status(200).json({ success: true });
  } catch (error: any) {
    console.error("POST /chat/read error:", error);
    return res.status(500).json({ success: false, message: "An error occurred marking messages as read" });
  }
});

export default router;



