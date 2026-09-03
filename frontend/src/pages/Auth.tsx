import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff, Lock, Mail, Phone, User, ShieldAlert } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { GoogleLogin } from "@react-oauth/google";

export default function Auth() {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState("");

  // Form states
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");

  // Real Google Sign-In states
  const [isGoogleModalOpen, setIsGoogleModalOpen] = useState(false);
  const [googlePhone, setGooglePhone] = useState("");
  const [googleCredential, setGoogleCredential] = useState<string | null>(null);

  // Forgot Password state
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);
  const [forgotStep, setForgotStep] = useState(1); // 1 = enter email, 2 = enter OTP and new password
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotOtp, setForgotOtp] = useState("");
  const [forgotNewPassword, setForgotNewPassword] = useState("");
  const [forgotError, setForgotError] = useState("");
  const [forgotSuccess, setForgotSuccess] = useState("");
  const [isForgotLoading, setIsForgotLoading] = useState(false);

  const registerMutation = useMutation({
    mutationFn: async (userData: any) => {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to register account");
      }
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["/api/me"], data);
      setLocation("/");
    },
    onError: (err: any) => {
      setFormError(err.message);
    },
  });

  const loginMutation = useMutation({
    mutationFn: async (credentials: any) => {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to log in");
      }
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["/api/me"], data);
      setLocation("/");
    },
    onError: (err: any) => {
      setFormError(err.message);
    },
  });

  const googleMutation = useMutation({
    mutationFn: async (googleData: any) => {
      const res = await fetch("/api/login-google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(googleData),
      });
      if (res.status === 400) {
        const err = await res.json();
        if (err.requirePhone) {
          // Open the phone number modal
          setGoogleCredential(googleData.credential);
          setIsGoogleModalOpen(true);
          return;
        }
        throw new Error(err.message || "Failed to log in with Google");
      }
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to log in with Google");
      }
      return res.json();
    },
    onSuccess: (data) => {
      if (data) {
        queryClient.setQueryData(["/api/me"], data);
        setLocation("/");
        setIsGoogleModalOpen(false);
      }
    },
    onError: (err: any) => {
      setFormError(err.message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (isLogin) {
      loginMutation.mutate({ email, password });
    } else {
      const cleanPhone = phone.trim().replace(/\D/g, "");
      if (cleanPhone.length < 10) {
        setFormError("Phone number must be at least 10 digits");
        return;
      }
      const formattedPhone = cleanPhone.length === 10 ? `+91${cleanPhone}` : (phone.trim().startsWith("+") ? phone.trim() : `+${cleanPhone}`);
      registerMutation.mutate({ name, email, phone: formattedPhone, password });
    }
  };

  const handleGoogleSuccess = (credentialResponse: any) => {
    setFormError("");
    googleMutation.mutate({ credential: credentialResponse.credential });
  };

  const handleGoogleSubmit = () => {
    if (!googleCredential) return;
    const cleanPhone = googlePhone.trim().replace(/\D/g, "");
    if (cleanPhone.length < 10) {
      alert("Please enter a valid 10-digit WhatsApp number to continue");
      return;
    }
    const formattedPhone = cleanPhone.length === 10 ? `+91${cleanPhone}` : (googlePhone.trim().startsWith("+") ? googlePhone.trim() : `+${cleanPhone}`);
    googleMutation.mutate({
      credential: googleCredential,
      phone: formattedPhone,
    });
  };

  const handleForgotEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail) return;
    setIsForgotLoading(true);
    setForgotError("");
    setForgotSuccess("");
    try {
      const res = await fetch("/api/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: forgotEmail }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to send reset code.");
      }
      setForgotStep(2);
      setForgotSuccess("Verification OTP code has been sent to your email.");
    } catch (err: any) {
      setForgotError(err.message);
    } finally {
      setIsForgotLoading(false);
    }
  };

  const handleForgotResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail || !forgotOtp || !forgotNewPassword) return;
    if (forgotNewPassword.length < 8) {
      setForgotError("Password must be at least 8 characters long.");
      return;
    }
    setIsForgotLoading(true);
    setForgotError("");
    setForgotSuccess("");
    try {
      const res = await fetch("/api/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: forgotEmail,
          otp: forgotOtp,
          newPassword: forgotNewPassword
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to reset password.");
      }
      setForgotSuccess("Password reset successfully! You can now log in.");
      // Auto-populate the main email field for login convenience
      setEmail(forgotEmail);
      setPassword("");
      // Close the modal after a brief delay
      setTimeout(() => {
        setIsForgotModalOpen(false);
      }, 2000);
    } catch (err: any) {
      setForgotError(err.message);
    } finally {
      setIsForgotLoading(false);
    }
  };


  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 overflow-hidden selection:bg-primary/30">
      {/* Full screen Background Image */}
      <div className="absolute inset-0 z-0">
        <img
          src="/main-login-page.png"
          alt="Login Background"
          className="w-full h-full object-cover filter blur-[2px] brightness-[0.4]"
        />
        {/* Dark overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-tr from-black/85 via-black/40 to-transparent"></div>
      </div>

      {/* Glassmorphic Auth Box */}
      <div className="relative z-10 w-full max-w-md bg-black/45 backdrop-blur-lg border border-white/10 rounded-3xl p-8 shadow-2xl flex flex-col text-white">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-full overflow-hidden mx-auto mb-4 border-2 border-primary/40 flex items-center justify-center">
            <img src="/og_cake_og.png" alt="Logo" className="w-full h-full object-cover" />
          </div>
          <h2 className="font-display font-bold text-3xl tracking-wide text-primary">
            Singh Cake Delight
          </h2>
          <p className="text-white/60 text-xs mt-1 uppercase tracking-widest font-semibold">
            Pure Eggless Celebrations
          </p>
        </div>

        {formError && (
          <div className="p-3.5 bg-red-500/20 border border-red-500/30 text-red-300 rounded-xl mb-5 text-xs font-semibold flex items-center gap-2">
            <ShieldAlert className="w-4.5 h-4.5 shrink-0 text-red-400" />
            <span>{formError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <>
              {/* Full Name (Registration only) */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-white/70" htmlFor="auth-name">
                  Full Name
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/50">
                    <User className="w-4 h-4" />
                  </span>
                  <input
                    id="auth-name"
                    required
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your name"
                    className="w-full bg-white/5 border border-white/10 focus:border-primary/80 rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none transition-all text-white placeholder-white/30"
                  />
                </div>
              </div>

              {/* Phone Number (Registration only) */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-white/70" htmlFor="auth-phone">
                  WhatsApp Number
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/50">
                    <Phone className="w-4 h-4" />
                  </span>
                  <input
                    id="auth-phone"
                    required
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g. 9876543210"
                    className="w-full bg-white/5 border border-white/10 focus:border-primary/80 rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none transition-all text-white placeholder-white/30"
                  />
                </div>
              </div>
            </>
          )}

          {/* Email */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-white/70" htmlFor="auth-email">
              Email Address
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/50">
                <Mail className="w-4 h-4" />
              </span>
              <input
                id="auth-email"
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full bg-white/5 border border-white/10 focus:border-primary/80 rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none transition-all text-white placeholder-white/30"
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold text-white/70" htmlFor="auth-pass">
                Password
              </label>
              {isLogin && (
                <button
                  type="button"
                  onClick={() => {
                    setIsForgotModalOpen(true);
                    setForgotEmail("");
                    setForgotOtp("");
                    setForgotNewPassword("");
                    setForgotStep(1);
                    setForgotError("");
                    setForgotSuccess("");
                  }}
                  className="text-[11px] text-primary hover:underline font-semibold focus:outline-none"
                >
                  Forgot Password?
                </button>
              )}
            </div>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/50">
                <Lock className="w-4 h-4" />
              </span>
              <input
                id="auth-pass"
                required
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-white/5 border border-white/10 focus:border-primary/80 rounded-xl pl-10 pr-11 py-2.5 text-sm outline-none transition-all text-white placeholder-white/30"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-colors"
              >
                {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            disabled={loginMutation.isPending || registerMutation.isPending}
            className="w-full bg-primary hover:bg-primary/95 text-primary-foreground font-bold py-3.5 rounded-xl mt-3 transition-transform active:scale-95 shadow-lg shadow-primary/20"
          >
            {isLogin
              ? loginMutation.isPending ? "Logging in..." : "Login to Account"
              : registerMutation.isPending ? "Signing up..." : "Create Free Account"
            }
          </Button>
        </form>

        <div className="relative my-6 flex items-center justify-center text-xs text-white/40 uppercase font-semibold">
          <span className="absolute bg-black/45 px-3 z-10">Or connect with</span>
          <div className="w-full border-t border-white/10"></div>
        </div>

        {/* Google Sign-In Button */}
        <div className="flex justify-center w-full">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() => setFormError("Google Login Failed")}
            useOneTap
            shape="pill"
            theme="filled_black"
            size="large"
            text="continue_with"
            width="100%"
          />
        </div>

        {/* Auth Mode Toggle */}
        <p className="text-center text-sm text-white/65 mt-6 font-medium">
          {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
          <button
            onClick={() => {
              setIsLogin(!isLogin);
              setFormError("");
            }}
            className="text-primary hover:underline font-bold transition-all focus:outline-none"
          >
            {isLogin ? "Sign Up Free" : "Log In Now"}
          </button>
        </p>
      </div>

      {/* Simulated Google Sign-In Picker Modal */}
      <Dialog open={isGoogleModalOpen} onOpenChange={setIsGoogleModalOpen}>
        <DialogContent className="max-w-md w-full bg-card border border-border rounded-2xl p-6 text-foreground fancy-shadow">
          <DialogHeader className="text-center pb-2 border-b border-border">
            <DialogTitle className="font-display font-bold text-2xl flex items-center justify-center gap-2.5">
              <svg className="w-6 h-6" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v3.9h6.6c-.28 1.48-1.12 2.73-2.38 3.58v3h3.84c2.25-2.06 3.53-5.1 3.53-8.68z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.84-3c-1.07.72-2.44 1.15-4.09 1.15-3.15 0-5.82-2.13-6.78-5H1.28v3.1A11.94 11.94 0 0012 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.22 14.24A7.17 7.17 0 014.8 12c0-.79.13-1.57.38-2.3V6.6H1.28A11.94 11.94 0 000 12c0 2.27.63 4.4 1.28 5.4l3.94-3.16z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0A11.94 11.94 0 001.28 6.6l3.94 3.1c.96-2.87 3.63-5 6.78-5z"
                />
              </svg>
              Sign in with Google
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 pt-4">
            <div className="p-4 rounded-xl bg-secondary/35 border border-border/50 text-center relative flex flex-col items-center">
              <span className="w-12 h-12 rounded-full bg-primary/10 text-primary font-display font-bold text-lg flex items-center justify-center border border-primary/20 mb-2">
                <User className="w-6 h-6" />
              </span>
              <p className="font-bold text-sm text-foreground">Almost there!</p>
              <p className="text-xs text-muted-foreground mt-1">
                We need a WhatsApp number to complete your registration.
              </p>
            </div>

              {/* Enter Phone Number for Order Details */}
              <div className="space-y-1.5 text-left">
                <label htmlFor="google-phone" className="text-xs font-bold text-muted-foreground">
                  WhatsApp Phone Number *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/60">
                    <Phone className="w-4 h-4" />
                  </span>
                  <input
                    id="google-phone"
                    required
                    type="tel"
                    value={googlePhone}
                    onChange={(e) => setGooglePhone(e.target.value)}
                    placeholder="e.g. 9876543210"
                    className="w-full bg-background border border-border rounded-xl pl-9 pr-4 py-2.5 text-sm outline-none focus:border-primary transition-all text-foreground"
                  />
                </div>
                <p className="text-[10px] text-muted-foreground leading-normal mt-1">
                  We require your WhatsApp number so the owner can coordinate your pickup pre-orders securely.
                </p>
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsGoogleModalOpen(false);
                    setGoogleCredential(null);
                  }}
                  className="flex-1 rounded-xl"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleGoogleSubmit}
                  disabled={googleMutation.isPending}
                  className="flex-1 bg-primary hover:bg-primary/95 text-primary-foreground font-bold rounded-xl"
                >
                  {googleMutation.isPending ? "Signing In..." : "Complete Sign In"}
                </Button>
              </div>
            </div>
        </DialogContent>
      </Dialog>

      {/* Forgot Password Modal */}
      <Dialog open={isForgotModalOpen} onOpenChange={setIsForgotModalOpen}>
        <DialogContent className="max-w-md w-full bg-card border border-border rounded-2xl p-6 text-foreground fancy-shadow">
          <DialogHeader className="text-center pb-2 border-b border-border">
            <DialogTitle className="font-display font-bold text-2xl">
              Reset Your Password
            </DialogTitle>
          </DialogHeader>

          {forgotError && (
            <div className="mt-4 p-3 bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 rounded-xl text-xs font-semibold">
              {forgotError}
            </div>
          )}

          {forgotSuccess && (
            <div className="mt-4 p-3 bg-green-500/10 border border-green-500/30 text-green-600 dark:text-green-400 rounded-xl text-xs font-semibold">
              {forgotSuccess}
            </div>
          )}

          {forgotStep === 1 ? (
            <form onSubmit={handleForgotEmailSubmit} className="space-y-4 pt-4">
              <p className="text-xs text-muted-foreground font-medium text-center">
                Enter your registered email address below. We will send you a 6-digit OTP code to verify your identity.
              </p>
              <div className="space-y-1.5">
                <label htmlFor="forgot-email" className="text-xs font-bold text-muted-foreground">
                  Email Address
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/60">
                    <Mail className="w-4 h-4" />
                  </span>
                  <input
                    id="forgot-email"
                    required
                    type="email"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full bg-background border border-border rounded-xl pl-9 pr-4 py-2.5 text-sm outline-none focus:border-primary transition-all text-foreground"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsForgotModalOpen(false)}
                  className="flex-1 rounded-xl"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isForgotLoading}
                  className="flex-1 bg-primary hover:bg-primary/95 text-primary-foreground font-bold rounded-xl"
                >
                  {isForgotLoading ? "Sending OTP..." : "Send Reset Code"}
                </Button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleForgotResetSubmit} className="space-y-4 pt-4">
              <p className="text-xs text-muted-foreground font-medium text-center">
                OTP sent to <strong>{forgotEmail}</strong>. Please enter the OTP and your new password.
              </p>

              {/* OTP Input */}
              <div className="space-y-1.5">
                <label htmlFor="forgot-otp" className="text-xs font-bold text-muted-foreground">
                  Verification OTP Code
                </label>
                <input
                  id="forgot-otp"
                  required
                  type="text"
                  maxLength={6}
                  value={forgotOtp}
                  onChange={(e) => setForgotOtp(e.target.value)}
                  placeholder="Enter 6-digit OTP"
                  className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm font-semibold tracking-wider text-center outline-none focus:border-primary transition-all text-foreground"
                />
              </div>

              {/* New Password Input */}
              <div className="space-y-1.5">
                <label htmlFor="forgot-new-pass" className="text-xs font-bold text-muted-foreground">
                  New Password
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/60">
                    <Lock className="w-4 h-4" />
                  </span>
                  <input
                    id="forgot-new-pass"
                    required
                    type="password"
                    value={forgotNewPassword}
                    onChange={(e) => setForgotNewPassword(e.target.value)}
                    placeholder="Minimum 8 characters"
                    className="w-full bg-background border border-border rounded-xl pl-9 pr-4 py-2.5 text-sm outline-none focus:border-primary transition-all text-foreground"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setForgotStep(1)}
                  className="flex-1 rounded-xl"
                >
                  Back
                </Button>
                <Button
                  type="submit"
                  disabled={isForgotLoading}
                  className="flex-1 bg-primary hover:bg-primary/95 text-primary-foreground font-bold rounded-xl"
                >
                  {isForgotLoading ? "Resetting..." : "Confirm Reset"}
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
