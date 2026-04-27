import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ShoppingBag, Utensils, Palette, Music, CheckCircle2, Download, Loader2 } from "lucide-react";
import { useDownloadImage } from "@/hooks/use-download-image";

const VENDOR_PACKAGES = [
  {
    name: "Mini Space",
    amount: 50000,
    size: "3m × 3m",
    icon: ShoppingBag,
    color: "from-violet-800/20 to-violet-900/10 border-violet-700/30",
    iconColor: "text-violet-400",
    perks: [
      "3m × 3m booth space",
      "1 table & 2 chairs provided",
      "Standard event listing",
      "Branded vendor badge",
    ],
  },
  {
    name: "Standard Space",
    amount: 100000,
    size: "5m × 5m",
    icon: Utensils,
    color: "from-primary/20 to-primary/5 border-primary/40",
    iconColor: "text-primary",
    featured: true,
    perks: [
      "5m × 5m booth space",
      "2 tables & 4 chairs provided",
      "Feature in event program",
      "Social media mention",
      "Branded vendor badge",
      "Priority placement",
    ],
  },
  {
    name: "Premium Space",
    amount: 150000,
    size: "8m × 8m",
    icon: Palette,
    color: "from-cyan-700/20 to-cyan-900/10 border-cyan-600/30",
    iconColor: "text-cyan-400",
    perks: [
      "8m × 8m premium booth space",
      "Full furniture setup included",
      "Dedicated social media campaign",
      "Logo on event signage",
      "VIP guest passes (2)",
      "Priority corner placement",
      "Branded vendor badge",
    ],
  },
];

const vendorTypes = [
  { icon: ShoppingBag, label: "Fashion & Retail" },
  { icon: Utensils, label: "Food & Drinks" },
  { icon: Palette, label: "Art & Crafts" },
  { icon: Music, label: "Entertainment" },
];

export default function VendorSpace() {
  const { download, downloading } = useDownloadImage();

  return (
    <div className="min-h-full bg-background text-foreground">
      {/* Hero */}
      <section className="relative py-16 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background" />
        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold tracking-widest uppercase mb-6">
              <ShoppingBag className="w-3 h-3" />
              Vendor Registration
            </div>
            <h1 className="font-serif text-5xl md:text-7xl font-bold mb-6 leading-tight">
              BOOK YOUR <br />
              <span className="text-gradient-gold">VENDOR SPACE</span>
            </h1>
            <p className="text-lg text-muted-foreground font-light leading-relaxed max-w-2xl mx-auto mb-8">
              Showcase your brand at Ghost Rave and Awards 2026. Get in front of thousands of music lovers, creatives, and trendsetters.
            </p>

            {/* DOWNLOAD BUTTON — prominent, in hero */}
            <Button
              onClick={() => download("vendor-plans-card", "ghost-awards-vendor-registration-plans")}
              disabled={downloading}
              size="lg"
              className="gold-gradient text-white font-bold rounded-full px-10 h-14 text-base gap-3 shadow-xl shadow-primary/30"
              data-testid="button-download-vendor"
            >
              {downloading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Download className="w-5 h-5" />}
              Download Vendor Plans
            </Button>
          </motion.div>

          {/* Vendor types */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="flex flex-wrap gap-3 justify-center mt-8"
          >
            {vendorTypes.map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-2 px-4 py-2 rounded-full border border-border/40 bg-secondary/20 text-sm text-muted-foreground">
                <Icon className="w-3.5 h-3.5 text-primary" />
                {label}
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Packages — captured for download */}
      <section className="pb-20 px-4">
        <div className="max-w-5xl mx-auto">
          <div
            id="vendor-plans-card"
            className="bg-background rounded-3xl p-8 border border-primary/20"
          >
            {/* Branding header inside the captured card */}
            <div className="text-center mb-10">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold tracking-widest uppercase mb-4">
                <ShoppingBag className="w-3 h-3" />
                Ghost Rave &amp; Awards 2026
              </div>
              <h2 className="text-3xl md:text-4xl font-serif font-bold text-white mb-2">Vendor Registration Plans</h2>
              <p className="text-muted-foreground">Book your booth and showcase your brand to thousands</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {VENDOR_PACKAGES.map((pkg, i) => (
                <motion.div
                  key={pkg.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className={`relative rounded-3xl border bg-gradient-to-br p-8 ${pkg.color} ${pkg.featured ? "ring-2 ring-primary/50 shadow-[0_0_40px_rgba(168,85,247,0.15)]" : ""}`}
                >
                  {pkg.featured && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <span className="bg-primary text-white text-[10px] font-black tracking-widest uppercase px-4 py-1.5 rounded-full">Best Value</span>
                    </div>
                  )}
                  <div className="flex items-start justify-between mb-6">
                    <div>
                      <div className="w-11 h-11 rounded-xl bg-black/20 flex items-center justify-center mb-4">
                        <pkg.icon className={`w-5 h-5 ${pkg.iconColor}`} />
                      </div>
                      <h3 className={`text-lg font-bold ${pkg.iconColor}`}>{pkg.name}</h3>
                      <p className="text-xs text-muted-foreground font-medium mt-1">{pkg.size} booth</p>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-muted-foreground font-bold uppercase tracking-widest mb-1">Fee</div>
                      <div className="text-2xl font-mono font-bold text-white">₦{pkg.amount.toLocaleString()}</div>
                    </div>
                  </div>
                  <ul className="space-y-2.5 mb-8">
                    {pkg.perks.map(perk => (
                      <li key={perk} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                        <CheckCircle2 className={`w-4 h-4 mt-0.5 flex-shrink-0 ${pkg.iconColor}`} />
                        {perk}
                      </li>
                    ))}
                  </ul>
                  <a
                    href={`https://wa.me/2348050588403?text=I%20want%20to%20register%20for%20${encodeURIComponent(pkg.name)}%20vendor%20space%20at%20Ghost%20Awards%202026`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button
                      className={`w-full h-12 font-bold rounded-xl tracking-wider ${pkg.featured ? "gold-gradient text-white" : "border border-current bg-transparent hover:bg-white/5"}`}
                      variant={pkg.featured ? "default" : "outline"}
                      data-testid={`button-vendor-${pkg.name.toLowerCase().replace(/\s/g, "-")}`}
                    >
                      Book {pkg.name}
                    </Button>
                  </a>
                </motion.div>
              ))}
            </div>

            {/* Footer inside captured card */}
            <div className="mt-8 pt-6 border-t border-primary/10 text-center">
              <p className="text-xs text-muted-foreground font-bold tracking-widest uppercase">
                Pay: 8050588403 · OPAY · ghostawards2026@gmail.com · wa.me/2348050588403
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Payment & Contact */}
      <section className="py-16 px-4 border-t border-border/40">
        <div className="max-w-2xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="text-2xl md:text-3xl font-serif font-bold text-white mb-6">How to Register</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10 text-left">
              {[
                { step: "1", title: "Choose Package", desc: "Pick the booth size that fits your business" },
                { step: "2", title: "Make Payment", desc: "Transfer to our Opay account below" },
                { step: "3", title: "Send Proof", desc: "WhatsApp your receipt to confirm your spot" },
              ].map(({ step, title, desc }) => (
                <div key={step} className="bg-secondary/20 border border-border/40 rounded-2xl p-5">
                  <div className="text-3xl font-serif font-bold text-primary/30 mb-2">{step}</div>
                  <h4 className="font-bold text-white text-sm mb-1">{title}</h4>
                  <p className="text-xs text-muted-foreground">{desc}</p>
                </div>
              ))}
            </div>
            <div className="bg-primary text-white rounded-2xl p-8 mb-8 shadow-xl shadow-primary/10 relative overflow-hidden group">
              <div className="absolute inset-0 bg-white/10 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
              <p className="font-bold text-xs tracking-[0.3em] mb-4 opacity-70">PAYMENT ACCOUNT</p>
              <div className="text-4xl md:text-5xl font-mono font-bold mb-2 tracking-tighter">8050588403</div>
              <div className="text-lg font-bold">OPAY Digital Services</div>
              <div className="text-xs mt-4 font-bold opacity-60">*Use your business name as payment reference</div>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="https://wa.me/2348050588403?text=I%20want%20to%20register%20for%20vendor%20space%20at%20Ghost%20Awards%202026" target="_blank" rel="noopener noreferrer">
                <Button className="gold-gradient text-white font-bold px-8 h-12 rounded-full w-full sm:w-auto" data-testid="button-vendor-whatsapp">
                  Register via WhatsApp
                </Button>
              </a>
              <a href="mailto:ghostawards2026@gmail.com">
                <Button variant="outline" className="border-primary/30 text-primary font-bold px-8 h-12 rounded-full w-full sm:w-auto" data-testid="button-vendor-email">
                  Email Us
                </Button>
              </a>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
