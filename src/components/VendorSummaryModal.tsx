import React from 'react';
import { Vendor, Booking } from '@/lib/types';
import { X, Building2, Phone, Mail, Globe, Star, Calendar, Receipt } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface VendorSummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  vendors: Vendor[];
  bookings: Booking[];
}

export const VendorSummaryModal: React.FC<VendorSummaryModalProps> = ({
  isOpen,
  onClose,
  vendors,
  bookings,
}) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 dark:bg-black/80 backdrop-blur-md p-4 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-surface-card border border-surface-border rounded-2xl p-6 w-full max-w-2xl shadow-2xl relative text-ink-primary max-h-[85vh] flex flex-col"
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-ink-muted hover:text-ink-primary rounded-full hover:bg-surface-elevated transition"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3 mb-4 shrink-0">
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold">Multi-Vendor Management</h3>
              <p className="text-sm text-ink-muted">Track merchant spend, bookings & vendor details</p>
            </div>
          </div>

          {/* Vendors Directory */}
          <div className="overflow-y-auto space-y-4 pr-1 flex-1">
            {vendors.length === 0 ? (
              <p className="text-center py-8 text-ink-muted text-sm">No vendors registered for this trip.</p>
            ) : (
              vendors.map((vendor) => {
                const vendorBookings = bookings.filter(
                  (b) => b.vendorId === vendor.id || b.vendor.toLowerCase() === vendor.name.toLowerCase()
                );
                const totalVendorSpent = vendorBookings.reduce((sum, b) => sum + b.actualCost, 0);

                return (
                  <div
                    key={vendor.id}
                    className="bg-surface-elevated border border-surface-border rounded-xl p-4 transition hover:border-accent-cyan/40"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-base text-ink-primary">{vendor.name}</h4>
                          <span className="px-2 py-0.5 text-[10px] uppercase font-bold rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                            {vendor.category}
                          </span>
                          {vendor.rating && (
                            <span className="flex items-center gap-0.5 text-xs text-amber-400 font-semibold">
                              <Star className="w-3.5 h-3.5 fill-amber-400" /> {vendor.rating}
                            </span>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-4 text-xs text-ink-muted mt-1.5">
                          {vendor.contactPhone && (
                            <span className="flex items-center gap-1">
                              <Phone className="w-3.5 h-3.5 text-accent-cyan" /> {vendor.contactPhone}
                            </span>
                          )}
                          {vendor.email && (
                            <span className="flex items-center gap-1">
                              <Mail className="w-3.5 h-3.5 text-accent-cyan" /> {vendor.email}
                            </span>
                          )}
                          {vendor.website && (
                            <a
                              href={vendor.website}
                              target="_blank"
                              rel="noreferrer"
                              className="flex items-center gap-1 text-accent-cyan hover:underline"
                            >
                              <Globe className="w-3.5 h-3.5" /> Website
                            </a>
                          )}
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-xs text-ink-muted">Total Spent</div>
                        <div className="text-base font-bold text-accent-cyan">₹{totalVendorSpent.toLocaleString('en-IN')}</div>
                      </div>
                    </div>

                    {/* Vendor Linked Bookings */}
                    {vendorBookings.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-surface-border/60">
                        <div className="text-[11px] font-semibold text-ink-muted uppercase tracking-wider mb-1 flex items-center gap-1">
                          <Receipt className="w-3.5 h-3.5" /> Linked Itinerary Bookings ({vendorBookings.length})
                        </div>
                        <div className="space-y-1">
                          {vendorBookings.map((b) => (
                            <div
                              key={b.id}
                              className="flex justify-between text-xs p-1.5 rounded-lg bg-surface-card/60"
                            >
                              <span className="truncate max-w-[280px] text-ink-primary font-medium">{b.title}</span>
                              <span className="font-semibold text-ink-primary">₹{b.actualCost.toLocaleString('en-IN')}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
