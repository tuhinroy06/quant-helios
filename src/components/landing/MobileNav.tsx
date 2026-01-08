import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ArrowRight } from "lucide-react";

const MobileNav = () => {
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    { label: "Learn", href: "/learn" },
    { label: "Pricing", href: "/pricing" },
  ];

  return (
    <div className="md:hidden">
      {/* Menu Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-6 right-6 z-50 w-12 h-12 flex items-center justify-center bg-secondary/80 backdrop-blur-sm rounded-full border border-border"
        aria-label={isOpen ? "Close menu" : "Open menu"}
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ opacity: 0, rotate: -90 }}
              animate={{ opacity: 1, rotate: 0 }}
              exit={{ opacity: 0, rotate: 90 }}
              transition={{ duration: 0.2 }}
            >
              <X className="w-5 h-5 text-foreground" />
            </motion.div>
          ) : (
            <motion.div
              key="menu"
              initial={{ opacity: 0, rotate: 90 }}
              animate={{ opacity: 1, rotate: 0 }}
              exit={{ opacity: 0, rotate: -90 }}
              transition={{ duration: 0.2 }}
            >
              <Menu className="w-5 h-5 text-foreground" />
            </motion.div>
          )}
        </AnimatePresence>
      </button>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-40 bg-background"
          >
            <div className="flex flex-col items-center justify-center h-full px-6">
              {/* Logo */}
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="mb-12"
              >
                <Link
                  to="/"
                  onClick={() => setIsOpen(false)}
                  className="font-display text-2xl text-foreground"
                >
                  AlgoTrade Pro
                </Link>
              </motion.div>

              {/* Menu Items */}
              <nav className="flex flex-col items-center gap-6 mb-12">
                {menuItems.map((item, index) => (
                  <motion.div
                    key={item.href}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 + index * 0.05 }}
                  >
                    <Link
                      to={item.href}
                      onClick={() => setIsOpen(false)}
                      className="text-3xl font-display font-light text-foreground/70 hover:text-foreground transition-colors"
                    >
                      {item.label}
                    </Link>
                  </motion.div>
                ))}
              </nav>

              {/* CTA */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Link to="/auth" onClick={() => setIsOpen(false)}>
                  <button className="group flex items-center gap-3 bg-primary text-primary-foreground px-8 py-4 rounded-full text-base font-medium">
                    <span>Get Started</span>
                    <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                  </button>
                </Link>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MobileNav;
