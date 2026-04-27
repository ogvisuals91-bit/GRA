import { useCategories } from "@/hooks/use-categories";
import { useNominees } from "@/hooks/use-nominees";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, ChevronDown } from "lucide-react";

export default function Categories() {
  const { data: categories } = useCategories();
  const { data: nominees } = useNominees();
  const [expandedCat, setExpandedCat] = useState<number | null>(null);

  return (
    <div className="min-h-full bg-background selection:bg-primary/30">
      <div className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-4xl md:text-7xl font-serif font-bold text-gradient-gold mb-6">AWARD CATEGORIES</h1>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg font-light">
              Discover excellence across our curated selection of digital categories.
            </p>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 gap-6">
          {categories?.map((category, index) => {
            const categoryNominees = nominees?.filter(n => n.categoryId === category.id) || [];
            const isExpanded = expandedCat === category.id;

            return (
              <motion.div 
                key={category.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`group rounded-2xl overflow-hidden transition-all duration-500 border border-border/40 ${isExpanded ? 'bg-secondary/50 ring-1 ring-primary/20' : 'bg-secondary/20 hover:bg-secondary/40'}`}
              >
                <div 
                  className="p-8 cursor-pointer flex items-center justify-between"
                  onClick={() => setExpandedCat(isExpanded ? null : category.id)}
                >
                  <div className="flex items-center gap-6">
                    <span className="text-primary/40 font-serif text-3xl font-bold">0{index + 1}</span>
                    <h2 className="text-2xl md:text-4xl font-serif font-bold group-hover:text-primary transition-colors">
                      {category.name}
                    </h2>
                  </div>
                  <div className={`w-10 h-10 rounded-full border border-primary/20 flex items-center justify-center transition-all duration-300 ${isExpanded ? 'bg-primary text-white rotate-180' : 'bg-transparent text-primary'}`}>
                    <ChevronDown className="w-5 h-5" />
                  </div>
                </div>

                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="px-8 pb-8"
                    >
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 pt-8 border-t border-border/40">
                        {categoryNominees.map(nominee => (
                          <motion.div 
                            key={nominee.id} 
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="group/nominee relative"
                          >
                            <div className="aspect-[4/5] overflow-hidden rounded-2xl mb-4 bg-zinc-900 border border-border/40">
                              <img 
                                src={nominee.imageUrl || "/placeholder-nominee.png"} 
                                alt={nominee.name}
                                className="w-full h-full object-cover transition-transform duration-700 group-hover/nominee:scale-110 grayscale group-hover/nominee:grayscale-0"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover/nominee:opacity-100 transition-opacity duration-300" />
                            </div>
                            <h3 className="font-bold text-xl mb-1">{nominee.name}</h3>
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-muted-foreground font-medium uppercase tracking-wider">{nominee.votes} votes</span>
                              <Link href={`/vote?nominee=${nominee.id}`}>
                                <Button size="sm" variant="ghost" className="text-primary hover:text-primary hover:bg-primary/10 -mr-2">
                                  Vote <ArrowRight className="ml-1 w-4 h-4" />
                                </Button>
                              </Link>
                            </div>
                          </motion.div>
                        ))}
                        {categoryNominees.length === 0 && (
                          <div className="col-span-full py-12 text-center text-muted-foreground bg-background/50 rounded-xl border border-dashed border-border/40">
                            <p className="italic">Nominations are being finalized for this category.</p>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
