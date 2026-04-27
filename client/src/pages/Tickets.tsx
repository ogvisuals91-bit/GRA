import { useState, useRef } from "react";
import { Link } from "wouter";
import { useUserAuth } from "@/hooks/use-user-auth";
import { TICKET_TYPES, useTicketAvailability, usePurchaseTicket, formatPrice } from "@/hooks/use-tickets";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Ticket, LogIn, UserPlus, Upload, CheckCircle, Loader2, ChevronRight, LayoutDashboard, Star, Minus, Plus } from "lucide-react";

function compressImage(file: File): Promise<string> {
  return new Promise((resolve) => {
    const canvas = document.createElement("canvas");
    const img = new Image();
    const reader = new FileReader();
    reader.onload = (e) => {
      img.onload = () => {
        const max = 900;
        let { width, height } = img;
        if (width > max) { height = (height * max) / width; width = max; }
        if (height > max) { width = (width * max) / height; height = max; }
        canvas.width = width; canvas.height = height;
        canvas.getContext("2d")!.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", 0.82));
      };
      img.src = e.target!.result as string;
    };
    reader.readAsDataURL(file);
  });
}

export default function Tickets() {
  const { user } = useUserAuth();
  const { data: availability } = useTicketAvailability();
  const purchaseMutation = usePurchaseTicket();
  const { toast } = useToast();

  const [selectedType, setSelectedType] = useState<(typeof TICKET_TYPES)[number] | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [reference, setReference] = useState("");
  const [proofImage, setProofImage] = useState<string | null>(null);
  const [proofFileName, setProofFileName] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const earlyBirdRemaining = availability?.earlyBirdRemaining ?? 50;

  function openPurchase(type: (typeof TICKET_TYPES)[number]) {
    if (!user?.loggedIn) return;
    setSelectedType(type);
    setQuantity(1);
    setReference("");
    setProofImage(null);
    setProofFileName("");
    setDialogOpen(true);
  }

  const maxQty = selectedType?.name === "Early Bird" ? earlyBirdRemaining : 20;
  const totalPrice = selectedType ? selectedType.price * quantity : 0;

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setProofFileName(file.name);
    const compressed = await compressImage(file);
    setProofImage(compressed);
  }

  async function handleSubmit() {
    if (!selectedType || !reference.trim() || !proofImage) {
      toast({ title: "Missing details", description: "Please fill in all fields and upload proof of payment", variant: "destructive" });
      return;
    }
    try {
      await purchaseMutation.mutateAsync({
        ticketType: selectedType.name,
        quantity,
        amountPaid: totalPrice,
        proofImageUrl: proofImage,
        reference: reference.trim(),
      });
      setDialogOpen(false);
      toast({
        title: "Purchase submitted!",
        description: `${quantity} × ${selectedType.name} ticket${quantity > 1 ? "s" : ""} submitted. You'll see your ticket once confirmed.`,
      });
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Purchase failed", variant: "destructive" });
    }
  }

  return (
    <div className="min-h-screen p-4 md:p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-1.5 mb-4">
          <Ticket className="w-4 h-4 text-primary" />
          <span className="text-xs font-bold uppercase tracking-widest text-primary">Ghost Rave & Awards 2026</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-serif font-bold text-foreground mb-3">Get Your Tickets</h1>
        <p className="text-muted-foreground text-lg max-w-xl mx-auto">
          Secure your spot at the most exclusive rave and awards event of 2026
        </p>
        <div className="mt-4 inline-block bg-amber-500/10 border border-amber-500/30 rounded-xl px-5 py-3 text-sm text-amber-400">
          <p className="font-bold mb-0.5">Payment: Transfer to OPAY</p>
          <p>Account: <strong>8050588403</strong> · Name: <strong>ghostawards2026@gmail.com</strong></p>
          <p className="text-xs opacity-75 mt-1">After payment, upload your proof below. WhatsApp: wa.me/2348050588403</p>
        </div>
      </div>

      {/* Auth Banner */}
      {!user?.loggedIn && (
        <div className="bg-primary/10 border border-primary/20 rounded-2xl p-5 mb-8 flex flex-col sm:flex-row items-center gap-4 justify-between">
          <div>
            <p className="font-bold text-foreground">Sign in to purchase tickets</p>
            <p className="text-sm text-muted-foreground">Create a free account to buy and manage your tickets</p>
          </div>
          <div className="flex gap-3">
            <Link href="/signup">
              <Button variant="outline" size="sm" className="gap-2" data-testid="button-signup-banner">
                <UserPlus className="w-4 h-4" /> Sign Up Free
              </Button>
            </Link>
            <Link href="/login">
              <Button size="sm" className="gap-2" data-testid="button-login-banner">
                <LogIn className="w-4 h-4" /> Sign In
              </Button>
            </Link>
          </div>
        </div>
      )}

      {user?.loggedIn && (
        <div className="flex items-center justify-between bg-green-500/10 border border-green-500/20 rounded-2xl px-5 py-3 mb-8">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-400" />
            <span className="font-semibold text-foreground">Signed in as <strong>{user.username}</strong> — click any ticket to purchase</span>
          </div>
          <Link href="/my-tickets">
            <Button variant="outline" size="sm" className="gap-2" data-testid="button-my-tickets">
              <LayoutDashboard className="w-4 h-4" /> My Tickets
            </Button>
          </Link>
        </div>
      )}

      {/* Ticket Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {TICKET_TYPES.map((type) => {
          const isSoldOut = type.name === "Early Bird" && earlyBirdRemaining === 0;
          const remaining = type.name === "Early Bird" ? earlyBirdRemaining : null;

          return (
            <div
              key={type.name}
              data-testid={`card-ticket-${type.name.toLowerCase().replace(/\s+/g, "-")}`}
              className={`relative group rounded-2xl border transition-all duration-200 overflow-hidden
                ${isSoldOut ? "opacity-60 cursor-not-allowed border-border/30" : "cursor-pointer border-border/40 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/10"}
                ${!user?.loggedIn && !isSoldOut ? "cursor-default" : ""}
                bg-card/60 backdrop-blur-sm`}
              onClick={() => !isSoldOut && user?.loggedIn && openPurchase(type)}
            >
              <div className={`h-1.5 w-full bg-gradient-to-r ${type.color}`} />
              <div className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-bold text-foreground text-lg leading-tight">{type.name}</h3>
                    <p className="text-muted-foreground text-sm mt-0.5">{type.description}</p>
                  </div>
                  {type.name === "Early Bird" && (
                    <div className="flex-shrink-0 ml-2">
                      {isSoldOut ? (
                        <Badge variant="destructive" className="text-xs">Sold Out</Badge>
                      ) : (
                        <Badge className="text-xs bg-amber-500/20 text-amber-400 border-amber-500/30">{remaining} left</Badge>
                      )}
                    </div>
                  )}
                </div>
                <div className={`text-2xl font-bold bg-gradient-to-r ${type.color} bg-clip-text text-transparent mb-4`}>
                  {formatPrice(type.price)}
                  <span className="text-sm font-normal text-muted-foreground ml-1">/ ticket</span>
                </div>
                {isSoldOut ? (
                  <div className="w-full py-2.5 rounded-xl bg-muted/50 text-center text-sm text-muted-foreground font-semibold">Sold Out</div>
                ) : user?.loggedIn ? (
                  <div className="w-full py-2.5 rounded-xl bg-primary/10 border border-primary/20 text-center text-sm text-primary font-semibold group-hover:bg-primary/20 transition-colors flex items-center justify-center gap-1">
                    Purchase <ChevronRight className="w-4 h-4" />
                  </div>
                ) : (
                  <div className="w-full py-2.5 rounded-xl bg-muted/30 border border-border/30 text-center text-sm text-muted-foreground font-semibold">Sign in to purchase</div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Purchase Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Purchase: {selectedType?.name}</DialogTitle>
            <DialogDescription>
              Unit price: <strong className="text-foreground">{selectedType ? formatPrice(selectedType.price) : ""}</strong>
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-2">
            {/* Payment info */}
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 text-sm">
              <p className="font-bold text-amber-400 mb-1">How to pay:</p>
              <p className="text-foreground/80">Transfer to OPAY · <strong>8050588403</strong></p>
              <p className="text-xs text-muted-foreground mt-1">ghostawards2026@gmail.com</p>
            </div>

            {/* Quantity selector */}
            <div className="space-y-1.5">
              <Label>Number of Tickets</Label>
              <div className="flex items-center gap-3">
                <Button
                  type="button" variant="outline" size="icon" className="h-10 w-10 rounded-xl"
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  disabled={quantity <= 1}
                  data-testid="button-qty-minus"
                >
                  <Minus className="w-4 h-4" />
                </Button>
                <div className="flex-1 text-center">
                  <span className="text-2xl font-bold text-foreground" data-testid="text-quantity">{quantity}</span>
                  {selectedType?.name === "Early Bird" && (
                    <p className="text-xs text-muted-foreground mt-0.5">max {maxQty} remaining</p>
                  )}
                </div>
                <Button
                  type="button" variant="outline" size="icon" className="h-10 w-10 rounded-xl"
                  onClick={() => setQuantity(q => Math.min(maxQty, q + 1))}
                  disabled={quantity >= maxQty}
                  data-testid="button-qty-plus"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Total price */}
            <div className="bg-primary/10 border border-primary/20 rounded-xl p-3 flex items-center justify-between">
              <span className="text-sm font-medium text-foreground/70">Total to pay:</span>
              <span className="text-xl font-bold text-primary" data-testid="text-total-price">{formatPrice(totalPrice)}</span>
            </div>

            {/* Reference */}
            <div className="space-y-1.5">
              <Label htmlFor="reference">Payment Reference / Description</Label>
              <Input
                id="reference" data-testid="input-reference"
                placeholder="e.g. GHOST2026-TICKET or bank reference number"
                value={reference} onChange={(e) => setReference(e.target.value)}
              />
            </div>

            {/* Proof upload */}
            <div className="space-y-1.5">
              <Label>Proof of Payment (screenshot)</Label>
              <div
                className="border-2 border-dashed border-border/50 rounded-xl p-4 text-center cursor-pointer hover:border-primary/40 transition-colors"
                onClick={() => fileRef.current?.click()}
                data-testid="button-upload-proof"
              >
                {proofImage ? (
                  <div className="flex items-center justify-center gap-2 text-green-400">
                    <CheckCircle className="w-5 h-5" />
                    <span className="text-sm font-medium">{proofFileName}</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <Upload className="w-8 h-8" />
                    <span className="text-sm">Click to upload screenshot</span>
                  </div>
                )}
              </div>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
            </div>

            <Button
              data-testid="button-submit-purchase"
              className="w-full h-12 font-bold text-base"
              onClick={handleSubmit}
              disabled={purchaseMutation.isPending}
            >
              {purchaseMutation.isPending ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Submitting...</>
              ) : (
                <><Star className="w-4 h-4 mr-2" /> Submit Purchase · {formatPrice(totalPrice)}</>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
