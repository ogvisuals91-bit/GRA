import { motion } from "framer-motion";
import { Check } from "lucide-react";

interface PackageProps {
  title: string;
  votes: string;
  price: string;
  features: string[];
  isPopular?: boolean;
}

export function PackageCard({ title, votes, price, features, isPopular }: PackageProps) {
  return (
    <motion.div 
      whileHover={{ y: -5 }}
      className={`relative p-8 rounded-2xl border ${
        isPopular 
          ? "border-primary bg-gradient-to-b from-primary/10 to-black" 
          : "border-white/10 bg-white/5"
      } flex flex-col items-center text-center`}
    >
      {isPopular && (
        <span className="absolute -top-3 px-4 py-1 bg-primary text-white text-xs font-bold rounded-full uppercase tracking-wider">
          Best Value
        </span>
      )}
      
      <h3 className="text-xl font-serif text-white mb-2">{title}</h3>
      <div className="text-4xl font-bold text-primary mb-1">{votes}</div>
      <p className="text-sm text-gray-400 mb-6">Votes</p>
      
      <div className="text-2xl font-bold text-white mb-6">
        {price} <span className="text-sm font-normal text-gray-400">NGN</span>
      </div>

      <div className="w-full space-y-3 mb-8">
        {features.map((feature, i) => (
          <div key={i} className="flex items-center justify-center space-x-2 text-sm text-gray-300">
            <Check className="h-4 w-4 text-primary" />
            <span>{feature}</span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
