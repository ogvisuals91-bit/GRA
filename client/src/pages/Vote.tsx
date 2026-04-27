import { useState, useEffect } from "react";
import { useLocation, Link } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNominees } from "@/hooks/use-nominees";
import { useCreatePayment } from "@/hooks/use-payments";
import { useDownloadImage } from "@/hooks/use-download-image";
import { insertPaymentSchema } from "@shared/schema";
import type { InsertPayment } from "@shared/schema";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Upload, CheckCircle2, Download, Star } from "lucide-react";
import { motion } from "framer-motion";

const PACKAGES = [
  { name: "Standard", votes: 4, amount: 200 },
  { name: "Standard Plus", votes: 10, amount: 500 },
  { name: "Classic", votes: 50, amount: 1000 },
  { name: "Classic Plus", votes: 100, amount: 2000 },
  { name: "Premium", votes: 1000, amount: 50000 },
  { name: "Premium Plus", votes: 5000, amount: 250000 },
  { name: "Exclusive", votes: 10000, amount: 500000 },
  { name: "Exclusive Plus", votes: 20000, amount: 1000000 },
];

export default function Vote() {
  const [, setLocation] = useLocation();
  const [params] = useState(new URLSearchParams(window.location.search));
  const preSelectedNomineeId = params.get("nominee");

  const { data: nominees } = useNominees();
  const { mutateAsync: createPayment, isPending: isSubmitting } = useCreatePayment();
  const { toast } = useToast();

  const [success, setSuccess] = useState(false);
  const [submittedData, setSubmittedData] = useState<InsertPayment | null>(null);
  const { download, downloading } = useDownloadImage();

  const form = useForm<InsertPayment>({
    resolver: zodResolver(insertPaymentSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phoneNumber: "",
      nomineeId: preSelectedNomineeId ? parseInt(preSelectedNomineeId) : 0,
      packageName: "",
      votesAmount: 0,
      amountPaid: 0,
      proofImageUrl: "",
      reference: "",
    },
  });

  const selectedPackageName = form.watch("packageName");
  useEffect(() => {
    const pkg = PACKAGES.find(p => p.name === selectedPackageName);
    if (pkg) {
      form.setValue("votesAmount", pkg.votes);
      form.setValue("amountPaid", pkg.amount);
    }
  }, [selectedPackageName, form]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const MAX_SIZE = 10 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      toast({ title: "File Too Large", description: "Please upload a screenshot under 10MB", variant: "destructive" });
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      form.setValue("proofImageUrl", reader.result as string);
      toast({ title: "Uploaded", description: "Payment proof attached" });
    };
    reader.onerror = () => toast({ title: "Error", description: "Could not read file", variant: "destructive" });
    reader.readAsDataURL(file);
  };

  const onSubmit = async (data: InsertPayment) => {
    try {
      await createPayment(data);
      setSubmittedData(data);
      setSuccess(true);
      window.scrollTo(0, 0);
    } catch {
      toast({ title: "Error", description: "Submission failed", variant: "destructive" });
    }
  };

  if (success && submittedData) {
    const nominee = nominees?.find(n => n.id === submittedData.nomineeId);
    const pkg = PACKAGES.find(p => p.name === submittedData.packageName);
    const receiptDate = new Date().toLocaleString("en-GB", {
      day: "numeric", month: "long", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    });

    return (
      <div className="min-h-full bg-background flex items-center justify-center p-4 py-12">
        <div className="w-full max-w-md space-y-4">
          <motion.div
            id="vote-receipt"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-secondary/30 border border-primary/30 rounded-3xl overflow-hidden shadow-2xl backdrop-blur-xl"
          >
            <div className="bg-primary/90 px-8 py-6 text-center text-white">
              <CheckCircle2 className="w-10 h-10 mx-auto mb-2 opacity-90" />
              <h2 className="text-2xl font-serif font-bold uppercase tracking-tight">Vote Receipt</h2>
              <p className="text-xs opacity-70 mt-1 tracking-widest uppercase">Ghost Rave &amp; Awards 2026</p>
            </div>
            <div className="px-8 py-6 space-y-4">
              {[
                { label: "Voter Name", value: submittedData.fullName },
                { label: "Email", value: submittedData.email },
                { label: "Phone", value: submittedData.phoneNumber },
                { label: "Voted For", value: nominee?.name || `Nominee #${submittedData.nomineeId}` },
                { label: "Category", value: nominee?.categoryName || "—" },
                { label: "Package", value: submittedData.packageName },
                { label: "Votes", value: `${(pkg?.votes || submittedData.votesAmount).toLocaleString()} votes` },
                { label: "Amount Paid", value: `₦${(pkg?.amount || submittedData.amountPaid).toLocaleString()}` },
                { label: "Transaction Ref", value: submittedData.reference },
                { label: "Submitted", value: receiptDate },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between items-start gap-4 text-sm border-b border-border/20 pb-3 last:border-0 last:pb-0">
                  <span className="text-muted-foreground font-medium text-xs uppercase tracking-wider shrink-0">{label}</span>
                  <span className="font-bold text-foreground text-right">{value}</span>
                </div>
              ))}
            </div>
            <div className="px-8 py-4 bg-primary/5 border-t border-primary/10 text-center">
              <p className="text-[10px] text-muted-foreground uppercase tracking-widest">
                Votes processed after manual verification · Allow up to 1 hour
              </p>
            </div>
          </motion.div>
          <div className="flex gap-3">
            <Button
              onClick={() => download("vote-receipt", `ghost-awards-receipt-${submittedData.reference}`)}
              disabled={downloading}
              className="flex-1 h-12 rounded-full font-bold bg-primary text-white hover:bg-primary/80 gap-2"
              data-testid="button-download-receipt"
            >
              {downloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
              Download Receipt
            </Button>
            <Link href="/">
              <Button variant="outline" className="flex-1 h-12 rounded-full font-bold border-primary/20 hover:bg-primary/5">
                Home
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-background text-foreground">

      {/* ── VOTING PACKAGES + DOWNLOAD — shown at the very top ── */}
      <section className="relative pt-14 pb-8 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background" />
        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold tracking-widest uppercase mb-5">
              <Star className="w-3 h-3" />
              Voting Packages
            </div>
            <h1 className="font-serif text-4xl md:text-6xl font-bold mb-4 leading-tight">
              CAST YOUR <span className="text-gradient-gold">VOTE</span>
            </h1>
            <p className="text-muted-foreground font-light text-lg mb-8">
              Support your favorites and help them reach the top.
            </p>

            {/* BIG DOWNLOAD BUTTON */}
            <Button
              onClick={() => download("voting-packages-card", "ghost-awards-voting-packages")}
              disabled={downloading}
              size="lg"
              className="gold-gradient text-white font-bold rounded-full px-10 h-14 text-base gap-3 shadow-xl shadow-primary/30 mb-10"
              data-testid="button-download-voting"
            >
              {downloading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Download className="w-5 h-5" />}
              Download Voting Packages
            </Button>
          </motion.div>

          {/* Downloadable packages card */}
          <div
            id="voting-packages-card"
            className="bg-background rounded-3xl p-6 border border-primary/20 text-left"
          >
            <div className="text-center mb-6">
              <p className="text-xs font-bold text-primary/60 uppercase tracking-widest mb-2">Ghost Rave &amp; Awards 2026</p>
              <h2 className="text-xl font-serif font-bold text-white">Voting Packages</h2>
              <p className="text-muted-foreground text-sm mt-1">Support your favourite and vote them to victory</p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {PACKAGES.map((pkg, i) => (
                <div
                  key={pkg.name}
                  className={`rounded-2xl border p-4 text-center ${i === 4 ? "ring-1 ring-primary/50 border-primary/40 bg-primary/10" : "border-white/10 bg-white/5"}`}
                >
                  <div className="text-[10px] font-bold text-primary/60 uppercase tracking-widest mb-2">{pkg.name}</div>
                  <div className="text-xl font-mono font-bold text-white mb-0.5">{pkg.votes.toLocaleString()}</div>
                  <div className="text-[10px] text-muted-foreground uppercase tracking-wider mb-2">votes</div>
                  <div className="text-sm font-bold text-primary">₦{pkg.amount.toLocaleString()}</div>
                </div>
              ))}
            </div>

            <div className="mt-5 pt-4 border-t border-primary/10 text-center">
              <p className="text-[10px] text-muted-foreground font-bold tracking-widest uppercase">
                Pay: 8050588403 · OPAY · ghostawards2026@gmail.com · wa.me/2348050588403
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── VOTING FORM ── */}
      <div className="pb-12 max-w-4xl mx-auto px-4 sm:px-6">
        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-primary/50 to-primary/20 rounded-3xl blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
          <div className="relative bg-secondary/20 border border-border/40 rounded-3xl p-8 md:p-14 backdrop-blur-xl">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-serif font-bold text-white mb-3">Submit Your Vote</h2>
              <p className="text-muted-foreground font-light">Fill in your details and upload your payment proof below.</p>
            </div>

            <div className="bg-primary text-white rounded-2xl p-8 mb-12 text-center shadow-xl shadow-primary/10 relative overflow-hidden group/bank">
              <div className="absolute inset-0 bg-white/10 -translate-x-full group-hover/bank:translate-x-full transition-transform duration-1000"></div>
              <p className="font-bold text-xs tracking-[0.3em] mb-4 opacity-70">OFFICIAL PAYMENT ACCOUNT</p>
              <div className="text-4xl md:text-5xl font-mono font-bold mb-2 tracking-tighter">8050588403</div>
              <div className="text-lg font-bold">OPAY Digital Services</div>
              <div className="text-xs mt-4 font-bold opacity-60">*Use your full name as payment reference</div>
            </div>

            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <Label className="text-xs font-bold tracking-widest uppercase ml-1 opacity-70">Select Nominee</Label>
                  <Select
                    defaultValue={preSelectedNomineeId || ""}
                    onValueChange={(val) => form.setValue("nomineeId", parseInt(val))}
                  >
                    <SelectTrigger className="bg-background/50 border-border/40 h-14 rounded-xl focus:ring-primary/20">
                      <SelectValue placeholder="Choose a nominee..." />
                    </SelectTrigger>
                    <SelectContent className="bg-secondary border-border/40 text-white max-h-[300px]">
                      {nominees?.map((nominee) => (
                        <SelectItem key={nominee.id} value={nominee.id.toString()}>
                          {nominee.name} ({nominee.categoryName})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {form.formState.errors.nomineeId && <p className="text-red-500 text-[10px] font-bold uppercase ml-1">Nominee is required</p>}
                </div>

                <div className="space-y-3">
                  <Label className="text-xs font-bold tracking-widest uppercase ml-1 opacity-70">Vote Package</Label>
                  <Select onValueChange={(val) => form.setValue("packageName", val)}>
                    <SelectTrigger className="bg-background/50 border-border/40 h-14 rounded-xl focus:ring-primary/20">
                      <SelectValue placeholder="Select a package..." />
                    </SelectTrigger>
                    <SelectContent className="bg-secondary border-border/40 text-white">
                      {PACKAGES.map((pkg) => (
                        <SelectItem key={pkg.name} value={pkg.name}>
                          {pkg.name} — {pkg.votes.toLocaleString()} Votes (₦{pkg.amount.toLocaleString()})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {form.formState.errors.packageName && <p className="text-red-500 text-[10px] font-bold uppercase ml-1">Package is required</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <Label className="text-xs font-bold tracking-widest uppercase ml-1 opacity-70">Full Name</Label>
                  <Input {...form.register("fullName")} className="bg-background/50 border-border/40 h-14 rounded-xl focus:ring-primary/20" placeholder="Legal name used for payment" />
                  {form.formState.errors.fullName && <p className="text-red-500 text-[10px] font-bold uppercase ml-1">Name is required</p>}
                </div>
                <div className="space-y-3">
                  <Label className="text-xs font-bold tracking-widest uppercase ml-1 opacity-70">Phone Number</Label>
                  <Input {...form.register("phoneNumber")} className="bg-background/50 border-border/40 h-14 rounded-xl focus:ring-primary/20" placeholder="Active mobile number" />
                  {form.formState.errors.phoneNumber && <p className="text-red-500 text-[10px] font-bold uppercase ml-1">Phone is required</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <Label className="text-xs font-bold tracking-widest uppercase ml-1 opacity-70">Email Address</Label>
                  <Input type="email" {...form.register("email")} className="bg-background/50 border-border/40 h-14 rounded-xl focus:ring-primary/20" placeholder="For voting receipt" />
                  {form.formState.errors.email && <p className="text-red-500 text-[10px] font-bold uppercase ml-1">Email is required</p>}
                </div>
                <div className="space-y-3">
                  <Label className="text-xs font-bold tracking-widest uppercase ml-1 opacity-70">Transaction Reference</Label>
                  <Input {...form.register("reference")} className="bg-background/50 border-border/40 h-14 rounded-xl focus:ring-primary/20" placeholder="Bank transaction ID" />
                  {form.formState.errors.reference && <p className="text-red-500 text-[10px] font-bold uppercase ml-1">Reference is required</p>}
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-xs font-bold tracking-widest uppercase ml-1 opacity-70">Proof of Payment</Label>
                <div className="border-2 border-dashed border-border/40 rounded-2xl p-10 text-center hover:bg-primary/5 transition-all duration-300 cursor-pointer relative group/upload">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  {form.watch("proofImageUrl") ? (
                    <div className="text-primary font-bold flex flex-col items-center animate-in zoom-in-95">
                      <CheckCircle2 className="w-12 h-12 mb-3" />
                      <span className="tracking-widest uppercase text-xs">SCREENSHOT ATTACHED</span>
                    </div>
                  ) : (
                    <div className="text-muted-foreground flex flex-col items-center group-hover/upload:text-primary transition-colors">
                      <Upload className="w-10 h-10 mb-3" />
                      <span className="tracking-widest uppercase text-xs font-bold">Upload Payment Screenshot</span>
                      <span className="text-[10px] mt-2 opacity-60">Any image up to 10MB accepted</span>
                    </div>
                  )}
                </div>
                {form.formState.errors.proofImageUrl && <p className="text-red-500 text-[10px] font-bold uppercase ml-1">Proof is required</p>}
              </div>

              <Button
                type="submit"
                className="w-full h-16 text-xl font-bold gold-gradient text-white hover-elevate active-elevate-2 rounded-2xl shadow-xl shadow-primary/20"
                disabled={isSubmitting}
              >
                {isSubmitting ? <Loader2 className="mr-2 h-6 w-6 animate-spin" /> : "CONFIRM & SUBMIT"}
              </Button>

              <div className="flex items-center gap-4 py-4 px-6 bg-secondary/30 rounded-xl border border-border/40">
                <div className="w-2 h-2 bg-primary rounded-full animate-pulse flex-shrink-0"></div>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                  Votes are processed after manual verification. Please allow up to 1 hour.
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
