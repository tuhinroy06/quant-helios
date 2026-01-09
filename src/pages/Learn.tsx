import { motion } from "framer-motion";
import { BookOpen, Video, FileText, Lightbulb, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";

const Learn = () => {
  const resources = [
    {
      icon: BookOpen,
      title: "Getting Started Guide",
      description: "Learn the basics of algorithmic trading and how to use AlgoTrade Pro",
      status: "Available",
    },
    {
      icon: Video,
      title: "Video Tutorials",
      description: "Step-by-step video guides on creating and backtesting strategies",
      status: "Coming Soon",
    },
    {
      icon: FileText,
      title: "Strategy Templates",
      description: "Pre-built strategy templates you can customize and learn from",
      status: "Coming Soon",
    },
    {
      icon: Lightbulb,
      title: "Trading Concepts",
      description: "Deep dives into indicators, risk management, and market analysis",
      status: "Coming Soon",
    },
  ];

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background gradients */}
      <div className="absolute inset-0 bg-gradient-to-b from-warm-500/[0.03] via-transparent to-transparent pointer-events-none" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-warm-500/[0.02] rounded-full blur-[120px] pointer-events-none" />
      
      <Navbar />

      {/* Hero Section */}
      <section className="pt-32 md:pt-40 pb-16 px-6 md:px-12 relative">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="max-w-3xl"
          >
            <span className="text-label text-warm-500 mb-4 block">EDUCATION</span>
            <h1 className="font-display text-display-xl text-foreground mb-6">
              Learn Algorithmic Trading
            </h1>
            <p className="text-body-lg text-muted-foreground max-w-2xl">
              Master the art and science of algorithmic trading with our comprehensive educational resources.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Resources Grid */}
      <section className="py-16 px-6 md:px-12">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-6">
            {resources.map((resource, index) => (
              <motion.div
                key={resource.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 + index * 0.1 }}
                className="group relative bg-card/50 border border-border rounded-2xl p-8 hover:border-warm-500/30 transition-all duration-300"
              >
                {/* Hover glow */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-warm-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                
                <div className="relative flex items-start gap-5">
                  <div className="p-4 bg-secondary rounded-xl group-hover:bg-warm-500/10 transition-colors">
                    <resource.icon className="w-6 h-6 text-foreground group-hover:text-warm-500 transition-colors" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <h3 className="text-foreground font-medium text-lg">{resource.title}</h3>
                      <span
                        className={`text-xs px-3 py-1 rounded-full ${
                          resource.status === "Available"
                            ? "bg-warm-500/20 text-warm-500"
                            : "bg-secondary text-muted-foreground"
                        }`}
                      >
                        {resource.status}
                      </span>
                    </div>
                    <p className="text-muted-foreground">{resource.description}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 md:px-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.8 }}
          className="max-w-6xl mx-auto text-center"
        >
          <div className="relative inline-block">
            <div className="absolute inset-0 bg-warm-500/20 blur-3xl rounded-full" />
            <div className="relative bg-card/80 backdrop-blur border border-border rounded-3xl p-12 md:p-16">
              <h2 className="font-display text-display-md text-foreground mb-4">
                Ready to start building?
              </h2>
              <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                Create your first strategy and see it come to life with paper trading.
              </p>
              <Link to="/auth">
                <button className="group inline-flex items-center gap-3 bg-foreground text-background px-8 py-4 rounded-full font-medium hover:bg-foreground/90 transition-all duration-300">
                  <span>Get Started Free</span>
                  <span className="flex items-center justify-center w-8 h-8 bg-background/10 rounded-full">
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                  </span>
                </button>
              </Link>
            </div>
          </div>
        </motion.div>
      </section>

      <Footer />
    </div>
  );
};

export default Learn;
