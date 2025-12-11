import { useState, useEffect } from "react"; // Added useEffect
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  User,
  Mail,
  Lock,
  Bot,
  Shield,
  Zap,
  Chrome,
  Eye,
  EyeOff,
  Loader2, // Import for loading spinner
} from "lucide-react";

import { useAuth } from "@/context/AuthContext"; // Import useAuth hook
import { useNavigate } from "react-router-dom"; // Import useNavigate hook
import { authAPI } from "@/services/api"; // Import authAPI for OTP verification
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp"; // Import OTP input component
import { toast } from "sonner"; // Import toast for notifications

const Auth = () => {
  // State for password visibility
  const [showSignInPassword, setShowSignInPassword] = useState(false);
  const [showSignUpPassword, setShowSignUpPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // State for Sign In form
  const [signInEmail, setSignInEmail] = useState("");
  const [signInPassword, setSignInPassword] = useState("");
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [signInError, setSignInError] = useState("");

  // State for Sign Up form
  const [signUpFirstName, setSignUpFirstName] = useState("");
  const [signUpLastName, setSignUpLastName] = useState("");
  const [signUpEmail, setSignUpEmail] = useState("");
  const [signUpPassword, setSignUpPassword] = useState("");
  const [signUpConfirmPassword, setSignUpConfirmPassword] = useState("");
  const [isSigningUp, setIsSigningUp] = useState(false);
  const [signUpError, setSignUpError] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);

  // State for OTP verification
  const [showOTPVerification, setShowOTPVerification] = useState(false);
  const [otp, setOtp] = useState("");
  const [isVerifyingOTP, setIsVerifyingOTP] = useState(false);
  const [otpError, setOtpError] = useState("");
  const [registeredEmail, setRegisteredEmail] = useState("");

  // Access authentication functions from context
  const { login, register, isAuthenticated, loading: authLoading } = useAuth();
  const navigate = useNavigate(); // Initialize useNavigate

  // Handle Google OAuth callback
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get("token");
    const error = urlParams.get("error");
    const message = urlParams.get("message");
    const googleAuth = urlParams.get("google_auth");

    if (error) {
      const errorMessages: Record<string, string> = {
        google_oauth_not_configured: "Google OAuth is not configured. Please contact support or use email/password authentication.",
        google_auth_failed: "Google authentication failed. Please try again.",
        google_token_exchange_failed: "Failed to complete Google authentication. Please try again.",
        google_userinfo_failed: "Failed to retrieve user information from Google. Please try again.",
        google_auth_error: "An error occurred during Google authentication. Please try again.",
        google_auth_init_error: "Failed to initiate Google authentication. Please try again.",
      };
      
      const errorMessage = message || errorMessages[error] || `Google authentication failed: ${error}`;
      toast.error(errorMessage);
      // Clean up URL
      window.history.replaceState({}, document.title, "/auth");
      return;
    }

    if (token && googleAuth === "success") {
      // Store token
      localStorage.setItem("auth_token", token);
      
      // Fetch user profile
      authAPI.getProfile()
        .then((response) => {
          if (response.data.success) {
            toast.success("Successfully signed in with Google!");
            // Clean up URL
            window.history.replaceState({}, document.title, "/auth");
            // Reload to update auth context
            window.location.href = "/";
          }
        })
        .catch((error) => {
          console.error("Failed to fetch profile after Google auth:", error);
          toast.error("Failed to complete Google authentication.");
          localStorage.removeItem("auth_token");
          window.history.replaceState({}, document.title, "/auth");
        });
    }
  }, []);

  // Redirect if already authenticated (e.g., user lands on /auth but is already logged in)
  // But don't redirect if we're showing OTP verification
  useEffect(() => {
    if (isAuthenticated && !authLoading && !showOTPVerification) {
      navigate("/"); // Redirect to home page
    }
  }, [isAuthenticated, authLoading, navigate, showOTPVerification]);


  // Features list (remains unchanged)
  const features = [
    {
      icon: Bot,
      title: "Robot Control Access",
      description: "Full access to our advanced robot controller interface",
    },
    {
      icon: Shield,
      title: "Secure Dashboard",
      description: "Encrypted data and secure cloud storage for your projects",
    },
    {
      icon: Zap,
      title: "Real-time Sync",
      description: "Instant synchronization across all your devices",
    },
  ];

  // Handle Sign In form submission
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation(); // Prevent event bubbling
    
    // Prevent any default form behavior
    if (e && e.preventDefault) {
      e.preventDefault();
    }
    
    setSignInError(""); // Clear previous errors
    setIsSigningIn(true);
    
    try {
      await login(signInEmail, signInPassword);
      console.log("Sign in successful!");
      navigate("/"); // Redirect to home page on successful login
    } catch (error: any) {
      console.error("Sign in failed:", error);
      const errorMessage = error.message || error.response?.data?.message || "An unexpected error occurred during sign in.";
      
      // If account is not activated, show OTP verification form IMMEDIATELY
      if (errorMessage.includes("not activated") || 
          errorMessage.includes("OTP") || 
          errorMessage.includes("activated") ||
          errorMessage.includes("verification")) {
        // Set state IMMEDIATELY and synchronously to prevent any navigation
        setRegisteredEmail(signInEmail);
        setShowOTPVerification(true);
        setOtp("");
        setOtpError("");
        setSignInError(""); // Clear sign in error since we're showing OTP form
        
        // Check if OTP was included in error response (dev mode)
        if (error.response?.data?.otp) {
          toast.info(`OTP sent! Check console or email. OTP: ${error.response.data.otp}`, { duration: 10000 });
        } else {
          toast.info("A new OTP has been sent to your email. Please verify your account.");
        }
      } else {
        setSignInError(errorMessage);
      }
    } finally {
      setIsSigningIn(false);
    }
  };

  // Handle Sign Up form submission
  const handleSignUp = async (e) => {
    e.preventDefault();
    setSignUpError(""); // Clear previous errors

    if (signUpPassword !== signUpConfirmPassword) {
      setSignUpError("Passwords do not match.");
      return;
    }

    if (!termsAccepted) {
        setSignUpError("You must agree to the Terms of Service and Privacy Policy.");
        return;
    }

    setIsSigningUp(true);
    try {
      const response: any = await register({
        firstName: signUpFirstName,
        lastName: signUpLastName,
        email: signUpEmail,
        password: signUpPassword,
      });
      
      // Check if OTP was included in response (development mode)
      if (response?.data?.otp) {
        toast.info(`OTP sent! Check console or email. OTP: ${response.data.otp}`, { duration: 10000 });
      } else if (response?.data?.data?.otp) {
        toast.info(`OTP sent! Check console or email. OTP: ${response.data.data.otp}`, { duration: 10000 });
      } else {
        toast.success("OTP sent to your email. Please check your inbox.");
      }
      
      // Show OTP verification form instead of redirecting
      setRegisteredEmail(signUpEmail);
      setShowOTPVerification(true);
      setOtp("");
      setOtpError("");
    } catch (error: any) {
      console.error("Sign up failed:", error);
      const errorMessage = error.response?.data?.message || error.message || "An unexpected error occurred during sign up.";
      setSignUpError(errorMessage);
      
      // If registration succeeded but we need OTP, show OTP form
      if (errorMessage.includes("OTP") || error.response?.status === 201) {
        setRegisteredEmail(signUpEmail);
        setShowOTPVerification(true);
        
        // Check if OTP is in error response (dev mode)
        if (error.response?.data?.otp) {
          toast.info(`OTP: ${error.response.data.otp}`, { duration: 10000 });
        }
      }
    } finally {
      setIsSigningUp(false);
    }
  };

  // Handle OTP verification
  const handleVerifyOTP = async (e?: React.FormEvent) => {
    // Always prevent default to avoid page refresh
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    // Only validate length if not already verifying
    if (!isVerifyingOTP && otp.length !== 6) {
      setOtpError("Please enter a 6-digit OTP code.");
      return;
    }

    // Prevent multiple submissions
    if (isVerifyingOTP) {
      return;
    }

    // Clear any previous errors before starting verification
    setOtpError("");
    setIsVerifyingOTP(true);
    
    try {
      const response = await authAPI.verifyOTP(registeredEmail, otp);
      
      if (response.data.success) {
        const { user: userData, token: authToken } = response.data.data;
        
        // Store token and user data
        localStorage.setItem("auth_token", authToken);
        
        toast.success("Email verified successfully! Welcome to Techligence.");
        
        // Use navigate instead of window.location to avoid full page refresh
        setTimeout(() => {
          navigate("/");
          // Force a page reload to update auth context
          window.location.reload();
        }, 500);
      } else {
        // Only set error if verification actually failed
        setOtpError(response.data.message || "Invalid or expired OTP.");
      }
    } catch (error: any) {
      console.error("OTP verification failed:", error);
      // Only show error after verification attempt fails
      const errorMessage = error.response?.data?.message || error.message || "Failed to verify OTP. Please try again.";
      setOtpError(errorMessage);
    } finally {
      setIsVerifyingOTP(false);
    }
  };

  // Handle resend OTP
  const handleResendOTP = async (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    try {
      const response = await authAPI.resendOTP(registeredEmail);
      if (response.data.success) {
        toast.success("OTP resent to your email.");
        setOtp("");
        setOtpError("");
        
        // Check if OTP was included in response (dev mode)
        if (response.data.data?.otp) {
          toast.info(`OTP: ${response.data.data.otp}`, { duration: 10000 });
        }
      } else {
        toast.error(response.data.message || "Failed to resend OTP.");
      }
    } catch (error: any) {
      console.error("Resend OTP failed:", error);
      const errorMessage = error.response?.data?.message || "Failed to resend OTP. Please try again.";
      toast.error(errorMessage);
      
      // In dev mode, check if OTP is in error response
      if (error.response?.data?.otp) {
        toast.info(`OTP: ${error.response.data.otp}`, { duration: 10000 });
      }
    }
  };

  // Handle Google authentication
  const handleGoogleAuth = async () => {
    try {
      // Redirect to backend Google OAuth endpoint
      const API_BASE_URL = import.meta.env.VITE_API_URL || "/api";
      window.location.href = `${API_BASE_URL}/auth/google`;
    } catch (error: any) {
      console.error("Google auth failed:", error);
      toast.error("Failed to initiate Google authentication. Please try again.");
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background font-inter"> {/* Added font-inter */}
      {/* Header */}
      <section className="py-16 bg-gradient-to-br from-background via-accent/20 to-secondary/10">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <Badge variant="outline" className="mb-4">
              <User className="w-3 h-3 mr-1" />
              Account Access
            </Badge>
            <h1 className="text-4xl lg:text-6xl font-display font-bold mb-6">
              Join the <span className="text-primary">Techligence</span> Community
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Create your account to access advanced robot control features,
              exclusive content, and connect with fellow robotics enthusiasts.
            </p>
          </div>
        </div>
      </section>

      {/* Auth Form */}
      <section className="py-16 flex-1">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-12 items-start">
            {/* Features */}
            <div className="space-y-8">
              <div>
                <h2 className="text-3xl font-display font-bold mb-6">
                  Unlock Premium Features
                </h2>
                <p className="text-muted-foreground text-lg leading-relaxed">
                  Join thousands of engineers, researchers, and robotics
                  enthusiasts who trust Techligence for their robotic automation
                  needs.
                </p>
              </div>

              <div className="space-y-6">
                {features.map((feature, index) => (
                  <div key={index} className="flex gap-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <feature.icon className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg mb-2">
                        {feature.title}
                      </h3>
                      <p className="text-muted-foreground">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-muted/30 rounded-lg p-6">
                <h3 className="font-semibold mb-4">What you'll get:</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <Bot className="w-4 h-4 text-primary" />
                    Access to all robot controllers
                  </li>
                  <li className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-primary" />
                    Priority customer support
                  </li>
                  <li className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-primary" />
                    Early access to new features
                  </li>
                </ul>
              </div>
            </div>

            {/* Auth Forms */}
            <div className="w-full">
              <Card className="border-0 shadow-xl rounded-xl"> {/* Added rounded-xl */}
                <CardHeader className="text-center">
                  <div className="flex items-center justify-center w-12 h-12 bg-primary/10 rounded-lg mx-auto mb-4">
                    <Bot className="w-6 h-6 text-primary" />
                  </div>
                  <CardTitle className="text-2xl font-display">
                    Welcome to Techligence
                  </CardTitle>
                  <CardDescription>
                    Sign in to your account or create a new one
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {showOTPVerification ? (
                    <div className="space-y-6">
                      <div className="text-center space-y-2">
                        <CardTitle className="text-2xl font-display">
                          Verify Your Email
                        </CardTitle>
                        <CardDescription>
                          We've sent a 6-digit code to {registeredEmail}
                        </CardDescription>
                      </div>

                      <form onSubmit={handleVerifyOTP} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="otp" className="text-center block">Enter OTP Code</Label>
                          <div className="flex justify-center">
                            <InputOTP
                              maxLength={6}
                              value={otp}
                              onChange={(value) => {
                                setOtp(value);
                                // Clear error when user types (only if not currently verifying)
                                if (!isVerifyingOTP) {
                                  setOtpError("");
                                }
                                // Don't auto-submit - let user click verify button
                              }}
                              disabled={isVerifyingOTP}
                            >
                              <InputOTPGroup>
                                <InputOTPSlot index={0} />
                                <InputOTPSlot index={1} />
                                <InputOTPSlot index={2} />
                                <InputOTPSlot index={3} />
                                <InputOTPSlot index={4} />
                                <InputOTPSlot index={5} />
                              </InputOTPGroup>
                            </InputOTP>
                          </div>
                          {otpError && (
                            <p className="text-red-500 text-sm text-center">{otpError}</p>
                          )}
                        </div>

                        <Button
                          type="submit"
                          className="w-full rounded-md"
                          size="lg"
                          disabled={isVerifyingOTP || otp.length !== 6}
                        >
                          {isVerifyingOTP ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Verifying...
                            </>
                          ) : (
                            "Verify OTP"
                          )}
                        </Button>

                        <div className="text-center space-y-2">
                          <p className="text-sm text-muted-foreground">
                            Didn't receive the code?
                          </p>
                        <Button
                          type="button"
                          variant="link"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleResendOTP(e);
                          }}
                          className="text-sm"
                        >
                          Resend OTP
                        </Button>
                        </div>

                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            setShowOTPVerification(false);
                            setOtp("");
                            setOtpError("");
                          }}
                          className="w-full"
                        >
                          Back to Sign Up
                        </Button>
                      </form>
                    </div>
                  ) : (
                    <Tabs defaultValue="signin" className="w-full">
                      <TabsList className="grid w-full grid-cols-2 mb-8">
                        <TabsTrigger value="signin">Sign In</TabsTrigger>
                        <TabsTrigger value="signup">Sign Up</TabsTrigger>
                      </TabsList>

                    {/* Sign In Form */}
                    <TabsContent value="signin" className="space-y-6">
                      <form 
                        onSubmit={handleSignIn} 
                        className="space-y-4"
                        noValidate
                      >
                        <div className="space-y-2">
                          <Label htmlFor="signin-email">Email</Label>
                          <div className="relative">
                            <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input
                              id="signin-email"
                              name="email"
                              type="email"
                              placeholder="your@email.com"
                              className="pl-10 rounded-md" // Added rounded-md
                              required
                              value={signInEmail}
                              onChange={(e) => setSignInEmail(e.target.value)}
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="signin-password">Password</Label>
                          <div className="relative">
                            <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input
                              id="signin-password"
                              name="password"
                              type={showSignInPassword ? "text" : "password"}
                              placeholder="••••••••"
                              className="pl-10 pr-10 rounded-md" // Added rounded-md
                              required
                              value={signInPassword}
                              onChange={(e) => setSignInPassword(e.target.value)}
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="absolute right-1 top-1 h-8 w-8 rounded-md" // Added rounded-md
                              onClick={() => setShowSignInPassword(!showSignInPassword)}
                            >
                              {showSignInPassword ? (
                                <EyeOff className="h-4 w-4" />
                              ) : (
                                <Eye className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        </div>

                        {signInError && (
                          <p className="text-red-500 text-sm">{signInError}</p>
                        )}

                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Checkbox id="remember" name="remember" className="rounded" /> {/* Added rounded */}
                            <Label htmlFor="remember" className="text-sm">
                              Remember me
                            </Label>
                          </div>
                          <Button
                            type="button"
                            variant="link"
                            className="px-0 text-sm text-primary"
                          >
                            Forgot password?
                          </Button>
                        </div>

                        <Button type="submit" className="w-full rounded-md" size="lg" disabled={isSigningIn}> {/* Added rounded-md */}
                          {isSigningIn ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          ) : (
                            "Sign In"
                          )}
                        </Button>
                      </form>

                      <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                          <Separator className="w-full rounded" /> {/* Added rounded */}
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                          <span className="bg-background px-2 text-muted-foreground">
                            Or continue with
                          </span>
                        </div>
                      </div>

                      <Button 
                        variant="outline" 
                        className="w-full gap-2 rounded-md"
                        onClick={handleGoogleAuth}
                      >
                        <Chrome className="h-4 w-4" />
                        Google
                      </Button>
                    </TabsContent>

                    {/* Sign Up Form */}
                    <TabsContent value="signup" className="space-y-6">
                      <form onSubmit={handleSignUp} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="first-name">First Name</Label>
                            <Input
                              id="first-name"
                              name="firstName"
                              type="text"
                              placeholder="John"
                              className="rounded-md" // Added rounded-md
                              required
                              value={signUpFirstName}
                              onChange={(e) => setSignUpFirstName(e.target.value)}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="last-name">Last Name</Label>
                            <Input
                              id="last-name"
                              name="lastName"
                              type="text"
                              placeholder="Doe"
                              className="rounded-md" // Added rounded-md
                              required
                              value={signUpLastName}
                              onChange={(e) => setSignUpLastName(e.target.value)}
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="signup-email">Email</Label>
                          <div className="relative">
                            <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input
                              id="signup-email"
                              name="email"
                              type="email"
                              placeholder="your@email.com"
                              className="pl-10 rounded-md" // Added rounded-md
                              required
                              value={signUpEmail}
                              onChange={(e) => setSignUpEmail(e.target.value)}
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="signup-password">Password</Label>
                          <div className="relative">
                            <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input
                              id="signup-password"
                              name="password"
                              type={showSignUpPassword ? "text" : "password"}
                              placeholder="••••••••"
                              className="pl-10 pr-10 rounded-md" // Added rounded-md
                              required
                              value={signUpPassword}
                              onChange={(e) => setSignUpPassword(e.target.value)}
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="absolute right-1 top-1 h-8 w-8 rounded-md" // Added rounded-md
                              onClick={() => setShowSignUpPassword(!showSignUpPassword)}
                            >
                              {showSignUpPassword ? (
                                <EyeOff className="h-4 w-4" />
                              ) : (
                                <Eye className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="confirm-password">
                            Confirm Password
                          </Label>
                          <div className="relative">
                            <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input
                              id="confirm-password"
                              name="confirmPassword"
                              type={showConfirmPassword ? "text" : "password"}
                              placeholder="••••••••"
                              className="pl-10 pr-10 rounded-md" // Added rounded-md
                              required
                              value={signUpConfirmPassword}
                              onChange={(e) => setSignUpConfirmPassword(e.target.value)}
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="absolute right-1 top-1 h-8 w-8 rounded-md" // Added rounded-md
                              onClick={() =>
                                setShowConfirmPassword(!showConfirmPassword)
                              }
                            >
                              {showConfirmPassword ? (
                                <EyeOff className="h-4 w-4" />
                              ) : (
                                <Eye className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        </div>

                        {signUpError && (
                          <p className="text-red-500 text-sm">{signUpError}</p>
                        )}

                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="terms"
                            name="terms"
                            required
                            checked={termsAccepted}
                            onCheckedChange={(checked) => setTermsAccepted(!!checked)} // Fixed: Cast to boolean
                            className="rounded" // Added rounded
                          />
                          <Label htmlFor="terms" className="text-sm">
                            I agree to the{" "}
                            <Button
                              type="button"
                              variant="link"
                              className="px-0 text-sm text-primary h-auto"
                            >
                              Terms of Service
                            </Button>{" "}
                            and{" "}
                            <Button
                              type="button"
                              variant="link"
                              className="px-0 text-sm text-primary h-auto"
                            >
                              Privacy Policy
                            </Button>
                          </Label>
                        </div>

                        <Button type="submit" className="w-full rounded-md" size="lg" disabled={isSigningUp}> {/* Added rounded-md */}
                          {isSigningUp ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          ) : (
                            "Create Account"
                          )}
                        </Button>
                      </form>

                      <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                          <Separator className="w-full rounded" /> {/* Added rounded */}
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                          <span className="bg-background px-2 text-muted-foreground">
                            Or continue with
                          </span>
                        </div>
                      </div>

                      <Button 
                        variant="outline" 
                        className="w-full gap-2 rounded-md"
                        onClick={handleGoogleAuth}
                      >
                        <Chrome className="h-4 w-4" />
                        Google
                      </Button>
                    </TabsContent>
                  </Tabs>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Auth;
