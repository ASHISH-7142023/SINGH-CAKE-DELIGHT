import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { rateLimit } from "express-rate-limit";
import { insertOrderSchema, insertUserSchema } from "@shared/schema";
import { hashPassword, comparePasswords } from "./auth";
import { sendEmailNotification } from "./email";

declare module "express-session" {
  interface SessionData {
    userId: number;
  }
}

const whatsappLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  limit: 5, // Limit each IP to 5 requests per minute
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: "Too many redirection requests. Please try again in a minute.",
});

// Helper function to escape HTML to prevent Stored XSS
function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// Helper function to format phone numbers to include country code (+91 by default if 10 digits)
function formatPhoneWithCountryCode(phoneStr: string): string {
  const trimmed = phoneStr.trim();
  const clean = trimmed.replace(/\D/g, "");
  
  if (clean.length === 10) {
    return `+91${clean}`;
  }
  if (clean.length === 12 && clean.startsWith("91")) {
    return `+${clean}`;
  }
  
  return trimmed.startsWith("+") ? trimmed : `+${clean}`;
}

// Helper to format 24h time to 12h format
function formatTimeTo12Hour(timeStr: string): string {
  if (!timeStr) return "N/A";
  const [hoursStr, minutesStr] = timeStr.split(":");
  const hours = parseInt(hoursStr, 10);
  const minutes = parseInt(minutesStr, 10);
  if (isNaN(hours) || isNaN(minutes)) return timeStr;
  const ampm = hours >= 12 ? "pm" : "am";
  const displayHours = hours % 12 === 0 ? 12 : hours % 12;
  const displayMinutes = String(minutes).padStart(2, "0");
  return `${displayHours}:${displayMinutes} ${ampm}`;
}

// Helper to format date YYYY-MM-DD to DD/MM/YYYY
function formatDateToDDMMYYYY(dateStr: string): string {
  if (!dateStr || !dateStr.includes("-")) return dateStr;
  const [y, m, d] = dateStr.split("-");
  if (y && m && d) {
    return `${d}/${m}/${y}`;
  }
  return dateStr;
}

// Helper to get current Indian Standard Time string in 12-hour format
function getIndianTimeString(): string {
  const dateObj = new Date();
  const datePart = dateObj.toLocaleDateString("en-IN", {
    timeZone: "Asia/Kolkata",
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  });
  const timePart = dateObj.toLocaleTimeString("en-IN", {
    timeZone: "Asia/Kolkata",
    hour12: true,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit"
  });
  return `${datePart.replace(/-/g, "/")}, ${timePart.toLowerCase()}`;
}

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "singh123";

const authAdmin = (req: any, res: any, next: any) => {
  const token = req.headers["x-admin-password"];
  if (token !== ADMIN_PASSWORD) {
    return res.status(401).json({ message: "Unauthorized: Invalid password" });
  }
  next();
};

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  // --- Authentication Routes ---

  app.post("/api/register", async (req, res) => {
    try {
      const parsedBody = insertUserSchema.parse(req.body);
      
      const existingUser = await storage.getUserByEmail(parsedBody.email.toLowerCase().trim());
      if (existingUser) {
        return res.status(400).json({ message: "Email is already registered" });
      }

      let hashedPassword = null;
      if (parsedBody.password) {
        hashedPassword = await hashPassword(parsedBody.password);
      }

      const user = await storage.createUser({
        name: parsedBody.name.trim(),
        email: parsedBody.email.toLowerCase().trim(),
        phone: formatPhoneWithCountryCode(parsedBody.phone),
        password: hashedPassword,
      });

      req.session.userId = user.id;

      // Send signup email
      const emailSubject = "🍰 Welcome to Singh Cake Delight!";
      const emailHtml = `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #2D1E17; max-width: 600px; margin: 0 auto; border: 1px solid #e6c5a3; border-radius: 12px; padding: 24px;">
          <div style="text-align: center; border-bottom: 1px solid #e6c5a3; padding-bottom: 16px; margin-bottom: 20px;">
            <h1 style="color: #d946ef; margin: 0; font-family: Georgia, serif;">Singh Cake Delight</h1>
            <p style="margin: 4px 0 0; text-transform: uppercase; font-size: 11px; tracking-wide; color: #8a634e; font-weight: bold;">Pure Eggless Handcrafted Cakes</p>
          </div>
          <h2>Welcome to Singh Cake Delight, ${user.name}!</h2>
          <p>We are absolutely thrilled to welcome you to our family. Your account has been registered successfully.</p>
          <p>You can now browse our signature delights, place pre-orders at least 6 days in advance, and check your booking statuses and history directly from your profile drawer in the navbar.</p>
          
          <div style="background-color: #fcf9f5; border: 1px solid #eedecf; border-radius: 8px; padding: 14px; margin: 20px 0; font-size: 14px;">
            <strong>Registered Account Details:</strong>
            <ul style="margin: 8px 0 0; padding-left: 20px;">
              <li>Name: ${user.name}</li>
              <li>Email: ${user.email}</li>
              <li>Phone: ${user.phone}</li>
            </ul>
          </div>
          
          <p>Best regards,<br/>Singh Cake Delight Team</p>
        </div>
      `;
      sendEmailNotification(user.email, emailSubject, emailHtml).catch(console.error);

      // Return user omitting password hash
      const { password: _, ...safeUser } = user;
      res.status(201).json(safeUser);
    } catch (err: any) {
      if (err.name === "ZodError") {
        return res.status(400).json({ message: "Validation failed", errors: err.errors });
      }
      console.error(err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
      }

      const user = await storage.getUserByEmail(email.toLowerCase().trim());
      if (!user || !user.password) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      const isMatch = await comparePasswords(password, user.password);
      if (!isMatch) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      req.session.userId = user.id;

      // Send login email notification
      const emailSubject = "🔒 Singh Cake Delight - Successful Login Notification";
      const emailHtml = `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #2D1E17; max-width: 600px; margin: 0 auto; border: 1px solid #e6c5a3; border-radius: 12px; padding: 24px;">
          <div style="text-align: center; border-bottom: 1px solid #e6c5a3; padding-bottom: 16px; margin-bottom: 20px;">
            <h1 style="color: #d946ef; margin: 0; font-family: Georgia, serif;">Singh Cake Delight</h1>
          </div>
          <h2>Successful Login Alert</h2>
          <p>Dear ${user.name},</p>
          <p>You have successfully logged into your account at Singh Cake Delight on ${getIndianTimeString()}.</p>
          <p>If this was not you, please secure your account or reach out to us immediately.</p>
          <br/>
          <p>Best regards,<br/>Singh Cake Delight Team</p>
        </div>
      `;
      sendEmailNotification(user.email, emailSubject, emailHtml).catch(console.error);

      const { password: _, ...safeUser } = user;
      res.json(safeUser);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/login-google", async (req, res) => {
    try {
      const { name, email, phone } = req.body;
      if (!email || !name || !phone) {
        return res.status(400).json({ message: "Name, email, and phone are required for Google registration" });
      }

      let user = await storage.getUserByEmail(email.toLowerCase().trim());
      if (!user) {
        // Create user with null password (meaning Google OAuth)
        user = await storage.createUser({
          name: name.trim(),
          email: email.toLowerCase().trim(),
          phone: formatPhoneWithCountryCode(phone),
          password: null,
        });

        // Send welcome email
        const emailSubject = "🍰 Welcome to Singh Cake Delight!";
        const emailHtml = `
          <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #2D1E17; max-width: 600px; margin: 0 auto; border: 1px solid #e6c5a3; border-radius: 12px; padding: 24px;">
            <div style="text-align: center; border-bottom: 1px solid #e6c5a3; padding-bottom: 16px; margin-bottom: 20px;">
              <h1 style="color: #d946ef; margin: 0; font-family: Georgia, serif;">Singh Cake Delight</h1>
              <p style="margin: 4px 0 0; text-transform: uppercase; font-size: 11px; tracking-wide; color: #8a634e; font-weight: bold;">Pure Eggless Handcrafted Cakes</p>
            </div>
            <h2>Welcome to Singh Cake Delight, ${user.name}!</h2>
            <p>You registered successfully via Google Sign-In.</p>
            <p>You can now browse our menu, place pre-orders, and view your order history directly in your profile.</p>
            <br/>
            <p>Best regards,<br/>Singh Cake Delight Team</p>
          </div>
        `;
        sendEmailNotification(user.email, emailSubject, emailHtml).catch(console.error);
      } else {
        // Send login alert
        const emailSubject = "🔒 Login Alert";
        const emailHtml = `
          <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #2D1E17; max-width: 600px; margin: 0 auto; border: 1px solid #e6c5a3; border-radius: 12px; padding: 24px;">
            <h2>Successful Google Login Alert</h2>
            <p>Dear ${user.name},</p>
            <p>You successfully logged into your account at Singh Cake Delight via Google Sign-in on ${getIndianTimeString()}.</p>
            <br/>
            <p>Best regards,<br/>Singh Cake Delight Team</p>
          </div>
        `;
        sendEmailNotification(user.email, emailSubject, emailHtml).catch(console.error);
      }

      req.session.userId = user.id;

      const { password: _, ...safeUser } = user;
      res.json(safeUser);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: "Failed to logout" });
      }
      res.clearCookie("connect.sid");
      res.sendStatus(204);
    });
  });

  app.get("/api/me", async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    try {
      const user = await storage.getUser(req.session.userId);
      if (!user) {
        req.session.destroy(() => {});
        return res.status(401).json({ message: "User not found" });
      }
      const { password: _, ...safeUser } = user;
      res.json(safeUser);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/me/orders", async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    try {
      const orders = await storage.getOrdersByUserId(req.session.userId);
      res.json(orders);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Public order submission
  app.post("/api/orders", whatsappLimiter, async (req, res) => {
    try {
      const parsedBody = insertOrderSchema.parse(req.body);
      
      // Parse pickupDate manually to avoid timezone offset shifts
      const [year, month, day] = parsedBody.pickupDate.split("-").map(Number);
      if (isNaN(year) || isNaN(month) || isNaN(day)) {
        return res.status(400).json({ message: "Invalid date format. Expected YYYY-MM-DD." });
      }
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const minDate = new Date(today);
      minDate.setDate(today.getDate() + 6); // Today + 6 days
      
      const pickupDateObj = new Date(year, month - 1, day);
      pickupDateObj.setHours(0, 0, 0, 0);
      
      if (pickupDateObj.getTime() < minDate.getTime()) {
        return res.status(400).json({
          message: "Orders must be placed at least 6 days in advance of the pickup date."
        });
      }
      
      // Get associated user if logged in
      const userId = req.session.userId || null;
      
      // Validate pickup time range (7:00 AM to 8:00 PM)
      const [pickupHour, pickupMinute] = parsedBody.pickupTime.split(":").map(Number);
      if (isNaN(pickupHour) || isNaN(pickupMinute)) {
        return res.status(400).json({ message: "Invalid time format. Expected HH:MM." });
      }
      
      const pickupTimeMinutes = pickupHour * 60 + pickupMinute;
      const startLimitMinutes = 7 * 60; // 7:00 AM
      const endLimitMinutes = 20 * 60; // 8:00 PM
      
      if (pickupTimeMinutes < startLimitMinutes || pickupTimeMinutes > endLimitMinutes) {
        return res.status(400).json({
          message: "Pickup orders can only be scheduled between 7:00 AM and 8:00 PM."
        });
      }

      // Sanitization to prevent Stored XSS
      const sanitizedOrder = {
        userId: userId,
        customerName: escapeHtml(parsedBody.customerName.trim()),
        customerPhone: formatPhoneWithCountryCode(parsedBody.customerPhone),
        cakeName: parsedBody.cakeName ? escapeHtml(parsedBody.cakeName.trim()) : null,
        cakeImage: parsedBody.cakeImage ? escapeHtml(parsedBody.cakeImage.trim()) : null,
        notes: parsedBody.notes ? escapeHtml(parsedBody.notes.trim()) : null,
        pickupDate: escapeHtml(parsedBody.pickupDate.trim()),
        pickupTime: escapeHtml(parsedBody.pickupTime.trim()),
      };
      
      const newOrder = await storage.createOrder(sanitizedOrder);

      // Fetch user email for order confirmation
      let customerEmail: string | null = null;
      if (userId) {
        const user = await storage.getUser(userId);
        if (user) {
          customerEmail = user.email;
        }
      }

      // Send email notification to official business mail
      const businessEmail = "singhcakedelight1981.official@gmail.com";
      const businessSubject = `🔔 New Order Received! (#${newOrder.id}) - ${newOrder.customerName}`;
      const businessHtml = `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #2D1E17; max-width: 600px; margin: 0 auto; border: 1px solid #d946ef; border-radius: 12px; padding: 24px;">
          <div style="text-align: center; border-bottom: 1px solid #d946ef; padding-bottom: 16px; margin-bottom: 20px;">
            <h1 style="color: #d946ef; margin: 0; font-family: Georgia, serif;">Singh Cake Delight</h1>
            <p style="margin: 4px 0 0; text-transform: uppercase; font-size: 11px; tracking-wide; color: #8a634e; font-weight: bold;">New Order Notification</p>
          </div>
          <h2 style="color: #2D1E17; margin-top: 0;">New Order Details</h2>
          <p>A new order has been submitted through the portal. Here are the details:</p>
          
          <div style="background-color: #fcf9f5; border: 1px solid #eedecf; border-radius: 8px; padding: 16px; margin: 20px 0;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 6px 0; font-weight: bold; width: 160px; border-bottom: 1px solid #eee;">Order ID:</td>
                <td style="padding: 6px 0; border-bottom: 1px solid #eee;">#${newOrder.id}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; font-weight: bold; border-bottom: 1px solid #eee;">Customer Name:</td>
                <td style="padding: 6px 0; border-bottom: 1px solid #eee;">${newOrder.customerName}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; font-weight: bold; border-bottom: 1px solid #eee;">WhatsApp/Phone:</td>
                <td style="padding: 6px 0; border-bottom: 1px solid #eee;">
                  <a href="https://wa.me/${newOrder.customerPhone.replace(/[^0-9]/g, "")}" style="color: #25D366; font-weight: bold; text-decoration: none;">
                    ${newOrder.customerPhone} (Chat on WhatsApp)
                  </a>
                </td>
              </tr>
              <tr>
                <td style="padding: 6px 0; font-weight: bold; border-bottom: 1px solid #eee;">Customer Email:</td>
                <td style="padding: 6px 0; border-bottom: 1px solid #eee;">${customerEmail || "Guest Order"}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; font-weight: bold; border-bottom: 1px solid #eee;">Order Item (Cake):</td>
                <td style="padding: 6px 0; border-bottom: 1px solid #eee; font-weight: bold; color: #d946ef;">${newOrder.cakeName || "Custom Inquiry"}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; font-weight: bold; border-bottom: 1px solid #eee;">Pickup Date:</td>
                <td style="padding: 6px 0; border-bottom: 1px solid #eee; font-weight: bold;">${formatDateToDDMMYYYY(newOrder.pickupDate)}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; font-weight: bold; border-bottom: 1px solid #eee;">Pickup Time:</td>
                <td style="padding: 6px 0; border-bottom: 1px solid #eee;">${formatTimeTo12Hour(newOrder.pickupTime)}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; font-weight: bold; vertical-align: top;">Customisation details:</td>
                <td style="padding: 6px 0; white-space: pre-wrap;">${newOrder.notes || "None"}</td>
              </tr>
            </table>
          </div>
          
          <p style="font-size: 13px; color: #666; text-align: center; margin-top: 24px; border-top: 1px solid #eee; padding-top: 16px;">
            To manage this and other orders, please log in to the <a href="http://localhost:3000/admin" style="color: #d946ef; font-weight: bold; text-decoration: none;">Admin Dashboard</a>.
          </p>
        </div>
      `;
      sendEmailNotification(businessEmail, businessSubject, businessHtml).catch(console.error);

      if (customerEmail) {
        const emailSubject = `🍰 Singh Cake Delight - Order Request Submitted! (#${newOrder.id})`;
        const emailHtml = `
          <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #2D1E17; max-width: 600px; margin: 0 auto; border: 1px solid #e6c5a3; border-radius: 12px; padding: 24px;">
            <div style="text-align: center; border-bottom: 1px solid #e6c5a3; padding-bottom: 16px; margin-bottom: 20px;">
              <h1 style="color: #d946ef; margin: 0; font-family: Georgia, serif;">Singh Cake Delight</h1>
              <p style="margin: 4px 0 0; text-transform: uppercase; font-size: 11px; tracking-wide; color: #8a634e; font-weight: bold;">Pure Eggless Handcrafted Cakes</p>
            </div>
            <h2 style="color: #2D1E17; margin-top: 0;">Order Request Submitted Successfully!</h2>
            <p>Dear <strong>${newOrder.customerName}</strong>,</p>
            <p>Thank you for submitting your order request. We have safely recorded your booking in our system. Here are the details:</p>
            
            <div style="background-color: #fcf9f5; border: 1px solid #eedecf; border-radius: 8px; padding: 16px; margin: 20px 0;">
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 6px 0; font-weight: bold; width: 140px;">Order ID:</td>
                  <td style="padding: 6px 0;">#${newOrder.id}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; font-weight: bold;">Cake Requested:</td>
                  <td style="padding: 6px 0;">${newOrder.cakeName || "Custom Inquiry"}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; font-weight: bold;">Pickup Date:</td>
                  <td style="padding: 6px 0; color: #d946ef; font-weight: bold;">${formatDateToDDMMYYYY(newOrder.pickupDate)}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; font-weight: bold;">Pickup Time:</td>
                  <td style="padding: 6px 0;">${formatTimeTo12Hour(newOrder.pickupTime)}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; font-weight: bold; vertical-align: top;">Notes/Requests:</td>
                  <td style="padding: 6px 0;">${newOrder.notes || "None"}</td>
                </tr>
              </table>
            </div>

            <div style="border-left: 4px solid #f59e0b; padding-left: 12px; margin: 20px 0;">
              <p style="margin: 0; font-size: 13px; color: #b45309; font-weight: bold;">⚠️ TAKEAWAY ONLY</p>
              <p style="margin: 4px 0 0; font-size: 13px; color: #78350f;">
                We are a home bakery located at <strong>Q/R No. - 8/5, South Colony Road, Kansbahal</strong>. We do NOT provide delivery. Please remember to collect your cake on the scheduled date and time.
              </p>
            </div>

            <p><strong>Next Steps:</strong> We will reach out to you on WhatsApp (<strong>${newOrder.customerPhone}</strong>) shortly to finalize details and confirm pricing.</p>
            
            <div style="border-top: 1px solid #e6c5a3; padding-top: 16px; margin-top: 24px; font-size: 12px; text-align: center; color: #8a634e;">
              © ${new Date().getFullYear()} Singh Cake Delight. All rights reserved.<br/>
              Kansbahal, Sundargarh, Odisha - 770034
            </div>
          </div>
        `;
        sendEmailNotification(customerEmail, emailSubject, emailHtml).catch(console.error);
      }
      
      res.status(201).json(newOrder);
    } catch (err: any) {
      if (err.name === "ZodError") {
        return res.status(400).json({ message: "Validation failed", errors: err.errors });
      }
      console.error(err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Secure admin dashboard routes
  app.get("/api/admin/orders", authAdmin, async (req, res) => {
    try {
      const allOrders = await storage.getOrders();
      res.json(allOrders);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.patch("/api/admin/orders/:id", authAdmin, async (req, res) => {
    try {
      const orderId = parseInt(req.params.id);
      const { status } = req.body;
      if (!status || typeof status !== "string") {
        return res.status(400).json({ message: "Status is required and must be a string." });
      }
      const updated = await storage.updateOrderStatus(orderId, status);
      
      if (status === "completed" && updated.userId) {
        try {
          const customer = await storage.getUser(updated.userId);
          if (customer && customer.email) {
            const emailSubject = `🍰 Singh Cake Delight - Order Completed! (#${updated.id})`;
            const emailHtml = `
              <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #2D1E17; max-width: 600px; margin: 0 auto; border: 1px solid #e6c5a3; border-radius: 12px; padding: 24px;">
                <div style="text-align: center; border-bottom: 1px solid #e6c5a3; padding-bottom: 16px; margin-bottom: 20px;">
                  <h1 style="color: #d946ef; margin: 0; font-family: Georgia, serif;">Singh Cake Delight</h1>
                  <p style="margin: 4px 0 0; text-transform: uppercase; font-size: 11px; tracking-wide; color: #8a634e; font-weight: bold;">Pure Eggless Handcrafted Cakes</p>
                </div>
                <h2 style="color: #2D1E17; margin-top: 0;">Your Order is Ready!</h2>
                <p>Dear <strong>${customer.name}</strong>,</p>
                <p>We are delighted to inform you that your cake order has been completed and is ready for pickup! Here are the pickup details:</p>
                
                <div style="background-color: #fcf9f5; border: 1px solid #eedecf; border-radius: 8px; padding: 16px; margin: 20px 0;">
                  <table style="width: 100%; border-collapse: collapse;">
                    <tr>
                      <td style="padding: 6px 0; font-weight: bold; width: 140px;">Order ID:</td>
                      <td style="padding: 6px 0;">#${updated.id}</td>
                    </tr>
                    <tr>
                      <td style="padding: 6px 0; font-weight: bold;">Cake:</td>
                      <td style="padding: 6px 0;">${updated.cakeName || "Custom Inquiry"}</td>
                    </tr>
                    <tr>
                      <td style="padding: 6px 0; font-weight: bold;">Pickup Date:</td>
                      <td style="padding: 6px 0; color: #d946ef; font-weight: bold;">${formatDateToDDMMYYYY(updated.pickupDate)}</td>
                    </tr>
                    <tr>
                      <td style="padding: 6px 0; font-weight: bold;">Pickup Time:</td>
                      <td style="padding: 6px 0;">${formatTimeTo12Hour(updated.pickupTime)}</td>
                    </tr>
                  </table>
                </div>

                <div style="border-left: 4px solid #f59e0b; padding-left: 12px; margin: 20px 0;">
                  <p style="margin: 0; font-size: 13px; color: #b45309; font-weight: bold;">⚠️ TAKEAWAY ONLY</p>
                  <p style="margin: 4px 0 0; font-size: 13px; color: #78350f;">
                    Please collect your cake from our home bakery at: <strong>Q/R No. - 8/5, South Colony Road, Kansbahal</strong>.
                  </p>
                </div>

                <p>If you have any questions or need directions, feel free to contact us on WhatsApp at <strong>+919438131576</strong>.</p>
                
                <div style="border-top: 1px solid #e6c5a3; padding-top: 16px; margin-top: 24px; font-size: 12px; text-align: center; color: #8a634e;">
                  © 2026 Singh Cake Delight. All rights reserved.<br/>
                  Kansbahal, Sundargarh, Odisha - 770034
                </div>
              </div>
            `;
            sendEmailNotification(customer.email, emailSubject, emailHtml).catch(console.error);
          }
        } catch (emailErr) {
          console.error("Failed to send order completion email:", emailErr);
        }
      }
      
      res.json(updated);
    } catch (err: any) {
      console.error(err);
      res.status(500).json({ message: err.message || "Internal server error" });
    }
  });

  app.delete("/api/admin/orders/:id", authAdmin, async (req, res) => {
    try {
      const orderId = parseInt(req.params.id);
      await storage.deleteOrder(orderId);
      res.sendStatus(204);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/order-whatsapp", whatsappLimiter, async (req, res) => {
    try {
      const { name, image } = req.query;
      const WHATSAPP_NUMBER = process.env.WHATSAPP_NUMBER || "919438131576";
      
      let text = "Hi! I'd like to place an order for a cake.";
      
      if (name) {
        const targetName = String(name).trim();
        
        // Fetch all products and gallery images to validate the name input
        const prods = await storage.getProducts();
        const gallery = await storage.getGalleryImages();
        
        const isValidProduct = prods.some(
          (p) => p.name.toLowerCase() === targetName.toLowerCase()
        );
        const isValidGallery = gallery.some(
          (g) => g.altText.toLowerCase() === targetName.toLowerCase()
        );
        
        if (isValidProduct || isValidGallery) {
          const lower = targetName.toLowerCase();
          const needsCakeSuffix = !lower.includes("cake") && 
                                  !lower.includes("cupcake") && 
                                  !lower.includes("muffin") && 
                                  !lower.includes("bites") && 
                                  !lower.includes("platter") && 
                                  !lower.includes("brownies");
          text = `Hi! I'd like to inquire about ordering the ${targetName}${needsCakeSuffix ? " cake" : ""}.`;
          
          if (image) {
            const targetImage = String(image).trim();
            // Verify the image URL matches the database product image or gallery image
            const matchedProductImage = prods.find(
              (p) => p.name.toLowerCase() === targetName.toLowerCase()
            )?.imageUrl;
            const matchedGalleryImage = gallery.find(
              (g) => g.altText.toLowerCase() === targetName.toLowerCase()
            )?.imageUrl;
            
            if (targetImage === matchedProductImage || targetImage === matchedGalleryImage) {
              const fullImageUrl = targetImage.startsWith("http")
                ? targetImage
                : `${req.protocol}://${req.get("host")}/${targetImage}`;
              text += `\n\nImage reference: ${fullImageUrl}`;
            }
          }
        }
      }
      
      res.redirect(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`);
    } catch (err) {
      console.error(err);
      res.status(500).send("Internal server error");
    }
  });

  app.get(api.products.list.path, async (req, res) => {
    try {
      const prods = await storage.getProducts();
      res.json(prods);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get(api.gallery.list.path, async (req, res) => {
    try {
      const images = await storage.getGalleryImages();
      res.json(images);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Seed data function
  async function seedDatabase() {
    try {
      const existingProducts = await storage.getProducts();
      if (existingProducts.length === 0) {
        // Row 1
        await storage.createProduct({ name: "Butterscotch Cake", description: "Smooth butterscotch flavored sponge with crunchy praline topping and creamy frosting.", imageUrl: "Butterscotch-og-cake.jpeg", category: "Butterscotch Cake" });
        await storage.createProduct({ name: "Vanilla Cake", description: "Classic soft and fluffy eggless vanilla sponge with rich cream frosting.", imageUrl: "Vanilla-Cake.jpeg", category: "Vanilla Cake" });
        await storage.createProduct({ name: "Chocolate Cake", description: "Decadent eggless chocolate cake with layers of rich chocolate ganache.", imageUrl: "Chocolate-Crunch-Overload-Cake.jpg", category: "Chocolate Cake" });
        await storage.createProduct({ name: "Black Forest Cake", description: "Layers of chocolate sponge, cherry filling, whipped cream, and chocolate shavings.", imageUrl: "Black-forest-Cake.jpeg", category: "Black Forest Cake" });
        await storage.createProduct({ name: "Strawberry Cake", description: "Fresh strawberry sponge cake with real strawberry compote and whipped cream.", imageUrl: "Strawberry Cake.jpeg", category: "Strawberry Cake" });
        await storage.createProduct({ name: "Rasmalai Cake", description: "Unique fusion cake inspired by the classic Rasmalai, topped with pistachios and saffron cream.", imageUrl: "Rasmalai-Cake.jpeg", category: "Rasmalai Cake" });
        // Row 2
        await storage.createProduct({ name: "Truffle Cake", description: "Ultimate chocolate indulgence with premium dark chocolate ganache and truffle finish.", imageUrl: "Truffle_Cake.jpeg", category: "Truffle Cake" });
        await storage.createProduct({ name: "Cupcakes", description: "Soft eggless cupcakes in 6 flavors: Chocolate, Vanilla, and Strawberry Frostings. Perfect for parties!", imageUrl: "cup-cake2.jpeg", category: "Cupcake" });
        // Row 3 - Specialty
        await storage.createProduct({ name: "Glass Cake", description: "Elegant layered cake served in a glass — a beautiful and delicious treat.", imageUrl: "Glass_cake.jpg", category: "Specialty" });
        await storage.createProduct({ name: "Candy Bites", description: "Irresistible chocolate candy bites — perfect for gifting and snacking.", imageUrl: "Chocolate Candy Bites.jpeg", category: "Specialty" });
        await storage.createProduct({ name: "Muffins", description: "Soft and fluffy eggless muffins bursting with real mango flavor.", imageUrl: "Muffins.jpg", category: "Specialty" });
      }


      const existingGallery = await storage.getGalleryImages();
      if (existingGallery.length === 0) {
        await storage.createGalleryImage({ imageUrl: "ButterScotch-cake (2).jpeg", altText: "Chocolate Drip Cake" });
        await storage.createGalleryImage({ imageUrl: "Ring-Ceremony-Cake.jpg", altText: "Ring Ceremony Cake" });
        await storage.createGalleryImage({ imageUrl: "cup-cake2.jpeg", altText: "Cup Cake" });
        await storage.createGalleryImage({ imageUrl: "golden-cake.jpeg", altText: "Golden Cake" });
        await storage.createGalleryImage({ imageUrl: "Rasmalai-Cake.jpeg", altText: "Rasmalai Cake" });
        await storage.createGalleryImage({ imageUrl: "Double-Chocolate-Candy-Bites.jpeg", altText: "Double Chocolate Candy Bites" });
        await storage.createGalleryImage({ imageUrl: "Vanilla-Cake.jpeg", altText: "Vanilla Cake" });
        await storage.createGalleryImage({ imageUrl: "2-small-cupcake.jpeg", altText: "2 Small Cupcake" });
        await storage.createGalleryImage({ imageUrl: "Anniversary_bento-cake.jpeg", altText: "Anniversary Bento Cake" });
        await storage.createGalleryImage({ imageUrl: "Anniversary-cake.jpeg", altText: "Anniversary Cake" });
        await storage.createGalleryImage({ imageUrl: "bento-1.jpeg", altText: "Bento Cake" });
        await storage.createGalleryImage({ imageUrl: "Rasmalai-cake-1.jpg", altText: "Rasmalai Cake" });
        await storage.createGalleryImage({ imageUrl: "Fruits_Cake.jpeg", altText: "Fruits Cake" });
        await storage.createGalleryImage({ imageUrl: "Romantic-Rose-Anniversary-Cake.jpg", altText: "Romantic Rose Anniversary Cake" });
        await storage.createGalleryImage({ imageUrl: "bento-2.jpeg", altText: "Bento Cake" });
        await storage.createGalleryImage({ imageUrl: "Black-forest-Cake.jpeg", altText: "Black Forest Cake" });
        await storage.createGalleryImage({ imageUrl: "Butterfly-cake.jpeg", altText: "Butterfly Cake" });
        await storage.createGalleryImage({ imageUrl: "Pink-Velvet-Starry-Cake.jpg", altText: "Pink Velvet Starry Cake" });
        await storage.createGalleryImage({ imageUrl: "Butterscotch-Cake.jpeg", altText: "Butterscotch Cake" });
        await storage.createGalleryImage({ imageUrl: "Butterscotch-og-cake.jpeg", altText: "Butterscotch Cake" });
        await storage.createGalleryImage({ imageUrl: "Choco-Vanilla.png", altText: "Chocolate Vanilla Cake" });
        await storage.createGalleryImage({ imageUrl: "Chocolate_Cake_main.jpeg", altText: "Chocolate Cake" });
        await storage.createGalleryImage({ imageUrl: "Chocolate Candy Bites.jpeg", altText: "Chocolate Candy Bites" });
        await storage.createGalleryImage({ imageUrl: "Chocolate_cake_2.png", altText: "Chocolate Cake" });
        await storage.createGalleryImage({ imageUrl: "Chocolate_Cake.png", altText: "Chocolate Cake" });
        await storage.createGalleryImage({ imageUrl: "Mom_Bday.jpeg", altText: "Mom's Birthday Cake" });
        await storage.createGalleryImage({ imageUrl: "Pink-Rose-Cake.jpg", altText: "Pink Rose Cake" });
        await storage.createGalleryImage({ imageUrl: "Chocolate-jar-cake-Open.jpeg", altText: "Chocolate Jar Cake" });
        await storage.createGalleryImage({ imageUrl: "Chocolate-jar-cake.jpeg", altText: "Chocolate Open Jar Cake " });
        await storage.createGalleryImage({ imageUrl: "Assorted-Chocolate-High-Tea-Platter.jpg", altText: "Assorted Chocolate High Tea Platter" });
        await storage.createGalleryImage({ imageUrl: "Chocolate-chocochips.jpeg", altText: "Chocolate Choco-Chips Cake" });
        await storage.createGalleryImage({ imageUrl: "Chocolate-Crunch-Overload-Cake.jpg", altText: "Chocolate Crunch Overload Cake" });
        await storage.createGalleryImage({ imageUrl: "Strawberry Cake.jpeg", altText: "Strawberry Cake" });
        await storage.createGalleryImage({ imageUrl: "Vanilla_Black.jpeg", altText: "Vanilla Black Cake" });
        await storage.createGalleryImage({ imageUrl: "Teachers_Day.jpeg", altText: "Teacher's Day Cake" });
        await storage.createGalleryImage({ imageUrl: "Chocolate-Fruits-Cake.jpeg", altText: "Chocolate Fruits Cake" });
        await storage.createGalleryImage({ imageUrl: "cup-cake-3.jpeg", altText: "Cup Cake" });
        await storage.createGalleryImage({ imageUrl: "Chocolate-Rose-Bouquet-Cake.jpg", altText: "Chocolate Rose Bouquet Cake" });
        await storage.createGalleryImage({ imageUrl: "Cupcake-Match.jpeg", altText: "Cupcake Match" });
        await storage.createGalleryImage({ imageUrl: "Chocolate_Drip_Cake.jpeg", altText: "Chocolate Drip Cake" });
        await storage.createGalleryImage({ imageUrl: "Pineapple_Cake.jpeg", altText: "Pineapple Cake" });
        await storage.createGalleryImage({ imageUrl: "Strawberry_cake_2.jpeg", altText: "Strawberry Cake" });
        await storage.createGalleryImage({ imageUrl: "KitKat-Premium-Bday-Cake.jpg", altText: "Kit Kat Premium Bday Cake" });
        await storage.createGalleryImage({ imageUrl: "Glass_cake.jpg", altText: "Glass Cake" });
        await storage.createGalleryImage({ imageUrl: "Maggie_Cake.jpg", altText: "Maggie's Cake" });
        await storage.createGalleryImage({ imageUrl: "Elegant-Butterfly-Drip-Cake.jpg", altText: "Elegant Butterfly Drip Cake" });
        await storage.createGalleryImage({ imageUrl: "cup-cake1.jpeg", altText: "Cup Cake" });
        await storage.createGalleryImage({ imageUrl: "Choco_Drip_Black_Forest_Cake.webp", altText: "Choco Drip Black Forest Cake" });
        await storage.createGalleryImage({ imageUrl: "Rainbow_Confetti_Cake.jpg", altText: "Rainbow Confetti Cake" });
        await storage.createGalleryImage({ imageUrl: "Love-Anniversary-Cake.jpeg", altText: "Love Anniversary Cake" });
        await storage.createGalleryImage({ imageUrl: "Glass-Cake.jpeg", altText: "Glass Cake" });
        await storage.createGalleryImage({ imageUrl: "Chocolate_Bento_Drip_Cake.jpg", altText: "Chocolate Bento Drip Cake" });
        await storage.createGalleryImage({ imageUrl: "1yr-Anniversary-Bento-Cake.jpg", altText: "1st Year Anniversary Bento Cake" });
        await storage.createGalleryImage({ imageUrl: "18th_B'day_Chocolate_Bento_Cake_Upper.jpg", altText: "18th Birthday Chocolate Bento Cake" });
        await storage.createGalleryImage({ imageUrl: "18th_B'day_Chocolate_Bento_Cake_Close_Shot.jpg", altText: "18th Birthday Chocolate Bento Cake Close Shot" });
        await storage.createGalleryImage({ imageUrl: "Yellow_Rose_B'day_Cake.jpg", altText: "Yellow Rose Birthday Cake" });
        await storage.createGalleryImage({ imageUrl: "Vanilla-Cake-2.jpeg", altText: "Vanilla Cake" });
        await storage.createGalleryImage({ imageUrl: "Grass-cake.jpeg", altText: "Grass Cake" });
        await storage.createGalleryImage({ imageUrl: "Light_Chocolate_Birthday_Cake.jpg", altText: "Light Chocolate Birthday Cake" });
        await storage.createGalleryImage({ imageUrl: "Floral_Purple_Bento_Cake.jpg", altText: "Floral Purple Bento Cake" });
        await storage.createGalleryImage({ imageUrl: "Minimalist_Sage_Green_Bento_Cake.jpg", altText: "Minimalist Sage Green Bento Cake" });
        await storage.createGalleryImage({ imageUrl: "Chocolate_Chip_Chocolate_Bento_Cake.jpg", altText: "Chocolate Chip Chocolate Bento Cake" });
        await storage.createGalleryImage({ imageUrl: "Floral_Wreath_Bento_Cake.jpg", altText: "Floral Wreath Bento Cake" });
        await storage.createGalleryImage({ imageUrl: "Fresh_Cream_Pineapple_B'day_Cake.jpg", altText: "Fresh Cream Pineapple Birthday Cake" });


        //await storage.createGalleryImage({ imageUrl: "", altText: "" });

      }
    } catch (e) {
      console.error("Failed to seed database:", e);
    }
  }

  // Seed on startup
  seedDatabase();

  return httpServer;
}