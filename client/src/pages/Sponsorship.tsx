import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Star, Sparkles, Crown, Zap, Globe, Award, Download, Loader2 } from "lucide-react";
import { useDownloadImage } from "@/hooks/use-download-image";

const SPONSOR_PACKAGES = [
  {
    name: "Bronze Partner",
    amount: 300000,
    icon: Award,
    color: "from-amber-700/20 to-amber-900/10 border-amber-700/30",
    iconColor: "text-amber-600",
    perks: [
      "Logo placement on event banners",
      "Social media mention (1 post)",
      "Acknowledgment during the event",
      "Certificate of sponsorship",
    ],
  },
  {
    name: "Silver Partner",
    amount: 500000,
    icon: Star,
    color: "from-slate-400/20 to-slate-600/10 border-slate-400/30",
    iconColor: "text-slate-300",
    perks: [
      "Logo on all digital promotions",
      "Social media mentions (3 posts)",
      "Brand feature in event program",
      "2 complimentary VIP seats",
      "Certificate of sponsorship",
    ],
  },
  {
    name: "Gold Partner",
    amount: 700000,
    icon: Crown,
    color: "from-primary/20 to-primary/5 border-primary/40",
    iconColor: "text-primary",
    featured: true,
    perks: [
      "Premium logo placement (all media)",
      "Dedicated social media campaign",
      "30-second brand spotlight during event",
      "5 complimentary VIP seats",
      "Exclusive meet & greet access",
      "Certificate of sponsorship",
    ],
  },
  {
    name: "Diamond Partner",
    amount: 1000000,
    icon: Sparkles,
    color: "from-cyan-400/20 to-blue-600/10 border-cyan-400/30",
    iconColor: "text-cyan-400",
    perks: [
      "Title sponsorship rights",
      "Logo on all platforms & merchandise",
      "Full brand integration in event broadcast",
      "10 complimentary VIP seats",
      "Exclusive backstage & host access",
      "Dedicated press feature",
      "Certificate of sponsorship",
    ],
  },
];

export default function Sponsorship() {
  const { download, downloading } = useDownloadImage();

  return (
    <div className="min-h-full bg-background text-foreground">
      {/* Hero */}
      <section className="relative py-16 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/15 via-background to-background" />
        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold tracking-widest uppercase mb-6">
              <Globe className="w-3 h-3" />
              Partner With Us
            </div>
            <h1 className="font-serif text-5xl md:text-7xl font-bold mb-6 leading-tight">
              BE PART OF <br />
              <span className="text-gradient-gold">OUR GROWTH</span>
            </h1>
            <p className="text-lg text-muted-foreground font-light leading-relaxed max-w-2xl mx-auto mb-8">
              Sponsor Ghost Rave and Awards 2026 and position your brand at the heart of culture, music, art, and digital excellence in Nigeria.
            </p>

            {/* DOWNLOAD BUTTON — prominent, in hero */}
            <Button
              onClick={() => download("sponsorship-plans-card", "ghost-awards-sponsorship-packages")}
              disabled={downloading}
              size="lg"
              className="gold-gradient text-white font-bold rounded-full px-10 h-14 text-base gap-3 shadow-xl shadow-primary/30"
              data-testid="button-download-sponsorship"
            >
              {downloading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Download className="w-5 h-5" />}
              Download Sponsorship Plans
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Packages — this whole section is captured as the download image */}
      <section className="pb-24 px-4">
        <div className="max-w-6xl mx-auto">
          <div
            id="sponsorship-plans-card"
            className="bg-background rounded-3xl p-8 border border-primary/20"
          >
            {/* Branding header inside the captured card */}
            <div className="text-center mb-10">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold tracking-widest uppercase mb-4">
                <Globe className="w-3 h-3" />
                Ghost Rave &amp; Awards 2026
              </div>
              <h2 className="text-3xl md:text-4xl font-serif font-bold text-white mb-2">Sponsorship Packages</h2>
              <p className="text-muted-foreground">Choose the partnership tier that matches your brand's vision</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {SPONSOR_PACKAGES.map((pkg, i) => (
                <motion.div
                  key={pkg.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className={`relative rounded-3xl border bg-gradient-to-br p-8 ${pkg.color} ${pkg.featured ? "ring-2 ring-primary/50 shadow-[0_0_40px_rgba(168,85,247,0.2)]" : ""}`}
                >
                  {pkg.featured && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <span className="bg-primary text-white text-[10px] font-black tracking-widest uppercase px-4 py-1.5 rounded-full">Most Popular</span>
                    </div>
                  )}
                  <div className="flex items-start justify-between mb-6">
                    <div>
                      <div className="w-12 h-12 rounded-2xl bg-black/20 flex items-center justify-center mb-4">
                        <pkg.icon className={`w-6 h-6 ${pkg.iconColor}`} />
                      </div>
                      <h3 className={`text-xl font-bold ${pkg.iconColor}`}>{pkg.name}</h3>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-muted-foreground font-bold uppercase tracking-widest mb-1">Investment</div>
                      <div className="text-2xl md:text-3xl font-mono font-bold text-white">₦{pkg.amount.toLocaleString()}</div>
                    </div>
                  </div>
                  <ul className="space-y-3 mb-8">
                    {pkg.perks.map((perk) => (
                      <li key={perk} className="flex items-start gap-3 text-sm text-muted-foreground">
                        <Zap className={`w-4 h-4 mt-0.5 flex-shrink-0 ${pkg.iconColor}`} />
                        {perk}
                      </li>
                    ))}
                  </ul>
                  <a href="https://wa.me/2348050588403?text=I%20want%20to%20sponsor%20Ghost%20Awards%202026" target="_blank" rel="noopener noreferrer">
                    <Button
                      className={`w-full h-12 font-bold rounded-xl tracking-wider ${pkg.featured ? "gold-gradient text-white" : "border border-current bg-transparent hover:bg-white/5"}`}
                      variant={pkg.featured ? "default" : "outline"}
                      data-testid={`button-sponsor-${pkg.name.toLowerCase().replace(/\s/g, "-")}`}
                    >
                      Become a {pkg.name}
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

      {/* Payment Details */}
      <section className="py-16 px-4 border-t border-border/40">
        <div className="max-w-2xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="text-2xl md:text-3xl font-serif font-bold text-white mb-6">Ready to Partner?</h2>
            <p className="text-muted-foreground mb-8 font-light leading-relaxed">
              Make payment to the account below and contact us with your receipt to get started immediately.
            </p>
            <div className="bg-primary text-white rounded-2xl p-8 mb-8 shadow-xl shadow-primary/10 relative overflow-hidden group">
              <div className="absolute inset-0 bg-white/10 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
              <p className="font-bold text-xs tracking-[0.3em] mb-4 opacity-70">OFFICIAL PAYMENT ACCOUNT</p>
              <div className="text-4xl md:text-5xl font-mono font-bold mb-2 tracking-tighter">8050588403</div>
              <div className="text-lg font-bold">OPAY Digital Services</div>
              <div className="text-xs mt-4 font-bold opacity-60">*Use your company name as payment reference</div>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="https://wa.me/2348050588403?text=I%20want%20to%20sponsor%20Ghost%20Awards%202026" target="_blank" rel="noopener noreferrer">
                <Button className="gold-gradient text-white font-bold px-8 h-12 rounded-full w-full sm:w-auto" data-testid="button-whatsapp-sponsor">
                  Contact via WhatsApp
                </Button>
              </a>
              <a href="mailto:ghostawards2026@gmail.com">
                <Button variant="outline" className="border-primary/30 text-primary font-bold px-8 h-12 rounded-full w-full sm:w-auto" data-testid="button-email-sponsor">
                  Send Email Inquiry
                </Button>
              </a>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
