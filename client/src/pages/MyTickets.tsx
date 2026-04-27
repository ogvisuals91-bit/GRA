import { useRef } from "react";
import { Link } from "wouter";
import { useUserAuth } from "@/hooks/use-user-auth";
import { useMyTickets, formatPrice } from "@/hooks/use-tickets";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Ticket, Download, Clock, CheckCircle, XCircle, LogIn, ArrowLeft, LogOut } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

function statusBadge(status: string) {
  if (status === "accepted") return <Badge className="bg-green-500/20 text-green-400 border-green-500/30"><CheckCircle className="w-3 h-3 mr-1" />Confirmed</Badge>;
  if (status === "declined") return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />Declined</Badge>;
  return <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30"><Clock className="w-3 h-3 mr-1" />Pending Review</Badge>;
}

function DownloadTicketButton({ url, ticketType }: { url: string; ticketType: string }) {
  function handleDownload() {
    const link = document.createElement("a");
    link.href = url;
    link.download = `ghost-awards-ticket-${ticketType.replace(/\s+/g, "-").toLowerCase()}.png`;
    link.click();
  }
  return (
    <Button
      onClick={handleDownload}
      data-testid="button-download-ticket"
      className="gap-2 bg-gradient-to-r from-yellow-500 to-amber-400 text-black font-bold hover:opacity-90"
      size="sm"
    >
      <Download className="w-4 h-4" /> Download Ticket
    </Button>
  );
}

export default function MyTickets() {
  const { user, isLoading, logoutMutation } = useUserAuth();
  const { data: tickets, isLoading: ticketsLoading } = useMyTickets();
  const { toast } = useToast();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!user?.loggedIn) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-4 text-center">
        <Ticket className="w-16 h-16 text-muted-foreground/30 mb-4" />
        <h2 className="text-2xl font-bold text-foreground mb-2">Sign in to view your tickets</h2>
        <p className="text-muted-foreground mb-6">You need an account to manage your ticket purchases</p>
        <div className="flex gap-3">
          <Link href="/login">
            <Button className="gap-2" data-testid="button-login-cta"><LogIn className="w-4 h-4" /> Sign In</Button>
          </Link>
          <Link href="/signup">
            <Button variant="outline" data-testid="button-signup-cta">Create Account</Button>
          </Link>
        </div>
      </div>
    );
  }

  async function handleLogout() {
    await logoutMutation.mutateAsync();
    toast({ title: "Signed out", description: "See you next time!" });
  }

  return (
    <div className="min-h-screen p-4 md:p-8 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <Link href="/tickets" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-3 transition-colors" data-testid="link-back-tickets">
            <ArrowLeft className="w-4 h-4" /> Back to Tickets
          </Link>
          <h1 className="text-3xl font-serif font-bold text-foreground">My Tickets</h1>
          <p className="text-muted-foreground mt-1">
            Signed in as <strong className="text-foreground">@{user.username}</strong> · {user.email}
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleLogout}
          disabled={logoutMutation.isPending}
          className="text-muted-foreground gap-2"
          data-testid="button-logout"
        >
          <LogOut className="w-4 h-4" /> Sign Out
        </Button>
      </div>

      {/* Tickets */}
      {ticketsLoading ? (
        <div className="space-y-4">
          {[1, 2].map(i => (
            <div key={i} className="h-32 rounded-2xl bg-card/40 animate-pulse border border-border/30" />
          ))}
        </div>
      ) : tickets && tickets.length > 0 ? (
        <div className="space-y-4">
          {tickets.map((ticket) => (
            <div
              key={ticket.id}
              data-testid={`card-my-ticket-${ticket.id}`}
              className="bg-card/60 border border-border/40 rounded-2xl overflow-hidden backdrop-blur-sm"
            >
              <div className="p-5">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div>
                    <h3 className="font-bold text-foreground text-lg">{ticket.ticketType}</h3>
                    <p className="text-muted-foreground text-sm">
                      {formatPrice(ticket.amountPaid)} · Ref: <span className="font-mono text-foreground/70">{ticket.reference}</span>
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Submitted {ticket.createdAt ? new Date(ticket.createdAt).toLocaleDateString() : ""}
                    </p>
                  </div>
                  <div className="flex-shrink-0">{statusBadge(ticket.status)}</div>
                </div>

                {ticket.status === "accepted" && ticket.virtualTicketUrl && (
                  <div className="mt-4 border border-green-500/20 rounded-xl overflow-hidden">
                    <div className="bg-green-500/10 px-4 py-2 flex items-center justify-between">
                      <span className="text-sm font-bold text-green-400 flex items-center gap-1.5">
                        <CheckCircle className="w-4 h-4" /> Your Virtual Ticket
                      </span>
                      <DownloadTicketButton url={ticket.virtualTicketUrl} ticketType={ticket.ticketType} />
                    </div>
                    <img
                      src={ticket.virtualTicketUrl}
                      alt="Virtual Ticket"
                      className="w-full max-h-80 object-contain bg-black"
                      data-testid={`img-virtual-ticket-${ticket.id}`}
                    />
                  </div>
                )}

                {ticket.status === "accepted" && !ticket.virtualTicketUrl && (
                  <div className="mt-3 bg-green-500/10 border border-green-500/20 rounded-xl px-4 py-3 text-sm text-green-400">
                    Payment confirmed! Your virtual ticket is being prepared and will appear here shortly.
                  </div>
                )}

                {ticket.status === "declined" && (
                  <div className="mt-3 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-sm text-red-400">
                    Payment was not confirmed. Please contact us on WhatsApp: wa.me/2348050588403
                  </div>
                )}

                {ticket.status === "pending" && (
                  <div className="mt-3 bg-amber-500/10 border border-amber-500/20 rounded-xl px-4 py-3 text-sm text-amber-400">
                    Your payment proof has been submitted and is under review. We'll confirm within 24 hours.
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <Ticket className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-foreground mb-2">No tickets yet</h3>
          <p className="text-muted-foreground mb-6">Head to the tickets page to purchase your spot</p>
          <Link href="/tickets">
            <Button data-testid="button-get-tickets">Get Tickets</Button>
          </Link>
        </div>
      )}
    </div>
  );
}
