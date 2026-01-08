import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, BookOpen, Video, FileText, Lightbulb } from "lucide-react";

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
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border">
        <div className="max-w-5xl mx-auto px-6 py-6 flex items-center justify-between">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground text-sm transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to home
          </Link>
          <Link
            to="/auth"
            className="text-sm text-foreground hover:text-muted-foreground transition-colors"
          >
            Sign In
          </Link>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-6 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="font-display text-4xl md:text-5xl font-light text-foreground mb-4">
            Learn Algorithmic Trading
          </h1>
          <p className="text-muted-foreground text-lg mb-12 max-w-2xl">
            Master the art and science of algorithmic trading with our comprehensive educational resources.
          </p>

          <div className="grid md:grid-cols-2 gap-6">
            {resources.map((resource, index) => (
              <motion.div
                key={resource.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-card/50 border border-border rounded-xl p-6 hover:border-muted-foreground/50 transition-colors"
              >
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-secondary rounded-lg">
                    <resource.icon className="w-6 h-6 text-foreground" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-foreground font-medium">{resource.title}</h3>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full ${
                          resource.status === "Available"
                            ? "bg-green-500/20 text-green-400"
                            : "bg-secondary text-muted-foreground"
                        }`}
                      >
                        {resource.status}
                      </span>
                    </div>
                    <p className="text-muted-foreground text-sm">{resource.description}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="mt-16 text-center"
          >
            <p className="text-muted-foreground mb-6">
              Ready to start building your first strategy?
            </p>
            <Link
              to="/auth"
              className="inline-flex items-center gap-2 bg-white text-black px-8 py-4 rounded-full font-medium hover:bg-white/90 transition-colors"
            >
              Get Started Free
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default Learn;
