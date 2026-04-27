import { useNominees } from "@/hooks/use-nominees";
import { useCategories } from "@/hooks/use-categories";
import { useDownloadImage } from "@/hooks/use-download-image";
import { motion } from "framer-motion";
import { Trophy, Medal, Star, Download, Loader2 } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export default function Leaderboard() {
  const { data: nominees, isLoading } = useNominees();
  const { data: categories } = useCategories();
  const [activeCategory, setActiveCategory] = useState<number | "all">("all");
  const { download, downloading } = useDownloadImage();

  const categoryList = categories || [];

  const displayCategories = activeCategory === "all"
    ? categoryList
    : categoryList.filter(c => c.id === activeCategory);

  const nomineesByCategory = (catId: number) =>
    (nominees || [])
      .filter(n => n.categoryId === catId)
      .sort((a, b) => b.votes - a.votes);

  const totalNominees = nominees?.length || 0;

  return (
    <div className="min-h-full bg-background selection:bg-primary/30">
      <div className="py-16 max-w-5xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold tracking-widest uppercase mb-6">
              <Trophy className="w-3 h-3" />
              Real-time Standings
            </div>
            <h1 className="text-4xl md:text-6xl font-serif font-bold text-foreground mb-4">LEADERBOARD</h1>
            <p className="text-muted-foreground font-light max-w-lg mx-auto">
              Tracking the frontrunners in every category.
            </p>
          </motion.div>
        </div>

        {/* Category Filter + Download */}
        <div className="flex flex-wrap items-center gap-2 justify-center mb-12">
          {categoryList.length > 0 && (
            <>
              <button
                onClick={() => setActiveCategory("all")}
                className={`px-5 py-2 rounded-full text-xs font-bold uppercase tracking-wider border transition-all duration-200 ${
                  activeCategory === "all"
                    ? "bg-primary text-white border-primary"
                    : "border-border/40 text-muted-foreground hover:border-primary/40 hover:text-primary"
                }`}
                data-testid="filter-all"
              >
                All Categories
              </button>
              {categoryList.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`px-5 py-2 rounded-full text-xs font-bold uppercase tracking-wider border transition-all duration-200 ${
                    activeCategory === cat.id
                      ? "bg-primary text-white border-primary"
                      : "border-border/40 text-muted-foreground hover:border-primary/40 hover:text-primary"
                  }`}
                  data-testid={`filter-cat-${cat.id}`}
                >
                  {cat.name}
                </button>
              ))}
            </>
          )}

          <Button
            onClick={() => download("leaderboard-capture", "ghost-awards-leaderboard")}
            disabled={downloading || isLoading}
            size="sm"
            variant="outline"
            className="ml-2 rounded-full border-primary/30 text-primary hover:bg-primary hover:text-white font-bold text-xs gap-2"
            data-testid="button-download-leaderboard"
          >
            {downloading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Download className="w-3 h-3" />}
            Download
          </Button>
        </div>

        {isLoading && (
          <div className="text-center py-20 text-muted-foreground">Loading standings…</div>
        )}

        {/* Capture area */}
        <div id="leaderboard-capture" className="space-y-14 bg-background p-4 rounded-2xl">
          {/* Hidden header shown only in download */}
          <div className="text-center pb-2 border-b border-primary/20 mb-4">
            <p className="text-xs font-bold tracking-[0.3em] text-primary uppercase opacity-80">Ghost Rave & Awards 2026</p>
            <p className="text-[10px] text-muted-foreground mt-1">Official Leaderboard · {new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}</p>
          </div>

          {displayCategories.map((category, catIndex) => {
            const catNominees = nomineesByCategory(category.id);
            return (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: catIndex * 0.07 }}
              >
                <div className="flex items-center gap-4 mb-6">
                  <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                    <Trophy className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-xl md:text-2xl font-serif font-bold text-foreground uppercase tracking-tight">
                      {category.name}
                    </h2>
                    <p className="text-xs text-muted-foreground font-medium">
                      {catNominees.length} contender{catNominees.length !== 1 ? "s" : ""}
                    </p>
                  </div>
                </div>

                {catNominees.length === 0 ? (
                  <div className="text-center py-12 rounded-2xl border border-dashed border-border/40 bg-secondary/10">
                    <Star className="w-8 h-8 text-muted-foreground/20 mx-auto mb-3" />
                    <p className="text-muted-foreground text-sm font-light">No votes yet in this category.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {catNominees.map((nominee, index) => {
                      let RankIcon = Star;
                      let rankColor = "text-muted-foreground/40";
                      let borderColor = "border-border/40";
                      let bgColor = "bg-secondary/20";

                      if (index === 0) {
                        RankIcon = Trophy;
                        rankColor = "text-yellow-500";
                        borderColor = "border-primary/40";
                        bgColor = "bg-primary/5";
                      } else if (index === 1) {
                        RankIcon = Medal;
                        rankColor = "text-zinc-300";
                        borderColor = "border-zinc-500/30";
                        bgColor = "bg-zinc-500/5";
                      } else if (index === 2) {
                        RankIcon = Medal;
                        rankColor = "text-amber-600";
                        borderColor = "border-amber-600/30";
                        bgColor = "bg-amber-600/5";
                      }

                      return (
                        <motion.div
                          key={nominee.id}
                          initial={{ opacity: 0, x: -16 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.04 }}
                          className={`flex items-center gap-4 p-4 rounded-2xl border transition-all duration-300 hover:scale-[1.01] hover:shadow-xl ${bgColor} ${borderColor}`}
                        >
                          <div className={`w-10 h-10 flex items-center justify-center font-serif font-bold text-2xl flex-shrink-0 ${rankColor}`}>
                            {index + 1}
                          </div>

                          <div className="w-14 h-14 rounded-xl overflow-hidden border border-border/40 flex-shrink-0 shadow-lg bg-zinc-900">
                            <img
                              src={nominee.imageUrl || "/placeholder-nominee.png"}
                              alt={nominee.name}
                              className="w-full h-full object-cover"
                              crossOrigin="anonymous"
                            />
                          </div>

                          <div className="flex-1 min-w-0 ml-1">
                            <h3 className="font-bold text-lg text-foreground truncate leading-tight">{nominee.name}</h3>
                            <p className="text-xs text-primary/70 font-medium tracking-wide uppercase">{category.name}</p>
                          </div>

                          <div className="text-right px-3 flex-shrink-0">
                            <div className="font-mono font-bold text-xl text-foreground tracking-tighter">{nominee.votes.toLocaleString()}</div>
                            <div className="text-[9px] font-bold text-muted-foreground tracking-widest uppercase">votes</div>
                          </div>

                          <div className="hidden sm:block ml-1 flex-shrink-0">
                            <Link href={`/vote?nominee=${nominee.id}`}>
                              <Button size="sm" variant="outline" className="border-primary/30 text-primary hover:bg-primary hover:text-white rounded-full px-5 font-bold text-xs">
                                VOTE
                              </Button>
                            </Link>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </motion.div>
            );
          })}

          {!isLoading && totalNominees === 0 && (
            <div className="text-center py-32 rounded-3xl border border-dashed border-border/40 bg-secondary/10">
              <Star className="w-12 h-12 text-muted-foreground/20 mx-auto mb-4" />
              <p className="text-muted-foreground font-light">The competition is just beginning. No votes yet.</p>
            </div>
          )}

          <p className="text-center text-[10px] text-muted-foreground/40 tracking-widest uppercase pt-4 border-t border-border/20">
            ghostraveandawards2026.com
          </p>
        </div>
      </div>
    </div>
  );
}
