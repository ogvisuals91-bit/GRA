import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { useEffect, useRef, useState } from "react";
import { usePayments, useUpdatePaymentStatus } from "@/hooks/use-payments";
import { useNominees, useDeleteNominee, useSetNomineeVotes } from "@/hooks/use-nominees";
import { useCategories, useCreateCategory, useDeleteCategory } from "@/hooks/use-categories";
import { useSponsors, useCreateSponsor, useDeleteSponsor } from "@/hooks/use-sponsors";
import { useAdminTicketPurchases, useAdminUsers, useUpdateTicketPurchase, formatPrice } from "@/hooks/use-tickets";
import { VirtualTicketCard, generateTicketCode } from "@/components/VirtualTicketCard";
import html2canvas from "html2canvas";
import { NomineeDialog } from "@/components/admin/NomineeDialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import {
  LogOut, Search, Check, X, Eye, Plus, Trash2, Trophy, Users, Star, ImageIcon,
  CheckCircle2, Pencil, Ticket, CheckCircle, Clock, XCircle, Send,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

function statusBadge(status: string) {
  if (status === "accepted") return <span className="px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-green-500/10 text-green-500 border border-green-500/20">Confirmed</span>;
  if (status === "declined") return <span className="px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-red-500/10 text-red-500 border border-red-500/20">Declined</span>;
  return <span className="px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-yellow-500/10 text-yellow-500 border border-yellow-500/20">Pending</span>;
}

export default function Dashboard() {
  const { user, logout, isLoading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const { data: payments } = usePayments();
  const { data: nominees } = useNominees();
  const { data: categories } = useCategories();
  const updateStatus = useUpdatePaymentStatus();
  const createCategory = useCreateCategory();
  const deleteCategory = useDeleteCategory();
  const deleteNominee = useDeleteNominee();
  const setNomineeVotes = useSetNomineeVotes();
  const { toast } = useToast();
  const { data: sponsors } = useSponsors();
  const createSponsor = useCreateSponsor();
  const deleteSponsor = useDeleteSponsor();

  // Ticket state
  const { data: ticketPurchases } = useAdminTicketPurchases();
  const { data: allUsers } = useAdminUsers();
  const updateTicket = useUpdateTicketPurchase();
  const [ticketSearch, setTicketSearch] = useState("");
  const [ticketDialogId, setTicketDialogId] = useState<number | null>(null);
  const [editUsername, setEditUsername] = useState("");
  const [editCode, setEditCode] = useState("");
  const [editTicketType, setEditTicketType] = useState("");
  const [editQuantity, setEditQuantity] = useState(1);
  const [sendDialogOpen, setSendDialogOpen] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const ticketPreviewRef = useRef<HTMLDivElement>(null);

  const [search, setSearch] = useState("");
  const [catNames, setCatNames] = useState<string[]>([""]);
  const [newSponsorName, setNewSponsorName] = useState("");
  const [newSponsorImageUrl, setNewSponsorImageUrl] = useState("");
  const [newSponsorPreview, setNewSponsorPreview] = useState("");
  const [editingVotesId, setEditingVotesId] = useState<number | null>(null);
  const [editingVotesValue, setEditingVotesValue] = useState("");

  useEffect(() => {
    if (!authLoading && !user?.loggedIn) setLocation("/admin/login");
  }, [user, authLoading, setLocation]);

  if (authLoading || !user?.loggedIn) return null;

  const handleCreateCategories = async () => {
    const valid = catNames.map(n => n.trim()).filter(Boolean);
    if (valid.length === 0) return;
    await Promise.all(valid.map(name => createCategory.mutateAsync({ name })));
    setCatNames([""]);
    toast({ title: `${valid.length} categor${valid.length > 1 ? "ies" : "y"} created!` });
  };

  const handleSponsorImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      setNewSponsorImageUrl(base64);
      setNewSponsorPreview(base64);
    };
    reader.readAsDataURL(file);
  };

  const handleCreateSponsor = async () => {
    if (!newSponsorName || !newSponsorImageUrl) return;
    await createSponsor.mutateAsync({ name: newSponsorName, imageUrl: newSponsorImageUrl, isActive: "true" });
    setNewSponsorName(""); setNewSponsorImageUrl(""); setNewSponsorPreview("");
    toast({ title: "Sponsor Added", description: `${newSponsorName} added to the slideshow.` });
  };

  const handleSaveVotes = async (nomineeId: number) => {
    const votes = parseInt(editingVotesValue);
    if (isNaN(votes) || votes < 0) { toast({ title: "Invalid votes", variant: "destructive" }); return; }
    await setNomineeVotes.mutateAsync({ id: nomineeId, votes });
    toast({ title: "Votes updated!" });
    setEditingVotesId(null); setEditingVotesValue("");
  };

  const openSendTicketDialog = (id: number) => {
    const ticket = ticketPurchases?.find(t => t.id === id);
    if (!ticket) return;
    setTicketDialogId(id);
    setEditUsername(ticket.username || "guest");
    setEditCode(ticket.ticketCode || generateTicketCode(id, ticket.username || "GHOST"));
    setEditTicketType(ticket.ticketType);
    setEditQuantity(ticket.quantity || 1);
    setSendDialogOpen(true);
  };

  const handleAcceptTicket = async (id: number) => {
    await updateTicket.mutateAsync({ id, status: "accepted" });
    toast({ title: "Payment confirmed!", description: "User has been notified. You can now send them a virtual ticket." });
  };

  const handleDeclineTicket = async (id: number) => {
    await updateTicket.mutateAsync({ id, status: "declined" });
    toast({ title: "Payment declined" });
  };

  const handleSendVirtualTicket = async () => {
    if (!ticketDialogId || !ticketPreviewRef.current) return;
    if (!editUsername.trim() || !editCode.trim()) {
      toast({ title: "Username and code are required", variant: "destructive" }); return;
    }
    setIsSending(true);
    try {
      // Capture the live VirtualTicketCard preview
      const canvas = await html2canvas(ticketPreviewRef.current, {
        backgroundColor: null,
        scale: 2,
        logging: false,
        useCORS: true,
      });
      const dataUrl = canvas.toDataURL("image/png", 0.95);
      await updateTicket.mutateAsync({
        id: ticketDialogId,
        status: "accepted",
        virtualTicketUrl: dataUrl,
        ticketCode: editCode.trim(),
      });
      setSendDialogOpen(false);
      toast({ title: "Virtual ticket sent!", description: "The user can now view and download their ticket." });
    } catch (err: any) {
      toast({ title: "Capture failed", description: err.message || "Could not generate ticket image", variant: "destructive" });
    } finally {
      setIsSending(false);
    }
  };

  const filteredPayments = payments?.filter(p =>
    p.fullName.toLowerCase().includes(search.toLowerCase()) ||
    p.reference.toLowerCase().includes(search.toLowerCase())
  );

  const filteredTickets = ticketPurchases?.filter(t =>
    (t.username || "").toLowerCase().includes(ticketSearch.toLowerCase()) ||
    (t.userEmail || "").toLowerCase().includes(ticketSearch.toLowerCase()) ||
    t.reference.toLowerCase().includes(ticketSearch.toLowerCase()) ||
    t.ticketType.toLowerCase().includes(ticketSearch.toLowerCase())
  );

  const totalVoteRevenue = payments?.filter(p => p.status === "accepted").reduce((s, p) => s + p.amountPaid, 0) || 0;
  const totalTicketRevenue = ticketPurchases?.filter(t => t.status === "accepted").reduce((s, t) => s + t.amountPaid, 0) || 0;
  const totalRevenue = totalVoteRevenue + totalTicketRevenue;

  return (
    <div className="min-h-full bg-background selection:bg-primary/30">
      <main className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-serif font-bold text-white uppercase tracking-tight">Management Dashboard</h1>
            <p className="text-muted-foreground font-light">Overview of votes, tickets, payments, and award categories.</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <div className="bg-secondary/20 border border-border/40 p-6 rounded-2xl backdrop-blur-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <Trophy className="w-10 h-10 text-primary" />
            </div>
            <h3 className="text-muted-foreground text-xs font-bold uppercase tracking-[0.2em] mb-3">Total Revenue</h3>
            <div className="text-3xl font-mono font-bold text-primary">₦{totalRevenue.toLocaleString()}</div>
          </div>
          <div className="bg-secondary/20 border border-border/40 p-6 rounded-2xl backdrop-blur-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <Ticket className="w-10 h-10 text-green-400" />
            </div>
            <h3 className="text-muted-foreground text-xs font-bold uppercase tracking-[0.2em] mb-3">Ticket Revenue</h3>
            <div className="text-3xl font-mono font-bold text-green-400">₦{totalTicketRevenue.toLocaleString()}</div>
          </div>
          <div className="bg-secondary/20 border border-border/40 p-6 rounded-2xl backdrop-blur-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <Clock className="w-10 h-10 text-yellow-500" />
            </div>
            <h3 className="text-muted-foreground text-xs font-bold uppercase tracking-[0.2em] mb-3">Pending Tickets</h3>
            <div className="text-3xl font-mono font-bold text-yellow-500">
              {ticketPurchases?.filter(t => t.status === "pending").length || 0}
            </div>
          </div>
          <div className="bg-secondary/20 border border-border/40 p-6 rounded-2xl backdrop-blur-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <Users className="w-10 h-10 text-white" />
            </div>
            <h3 className="text-muted-foreground text-xs font-bold uppercase tracking-[0.2em] mb-3">Registered Users</h3>
            <div className="text-3xl font-mono font-bold text-white">{allUsers?.length || 0}</div>
          </div>
        </div>

        <Tabs defaultValue="tickets" className="space-y-8">
          <TabsList className="bg-secondary/30 border border-border/40 p-1 rounded-full flex-wrap h-auto gap-1">
            <TabsTrigger value="tickets" className="rounded-full px-5 data-[state=active]:bg-primary data-[state=active]:text-white font-bold">Tickets</TabsTrigger>
            <TabsTrigger value="users" className="rounded-full px-5 data-[state=active]:bg-primary data-[state=active]:text-white font-bold">Users</TabsTrigger>
            <TabsTrigger value="payments" className="rounded-full px-5 data-[state=active]:bg-primary data-[state=active]:text-white font-bold">Vote Payments</TabsTrigger>
            <TabsTrigger value="nominees" className="rounded-full px-5 data-[state=active]:bg-primary data-[state=active]:text-white font-bold">Nominees</TabsTrigger>
            <TabsTrigger value="categories" className="rounded-full px-5 data-[state=active]:bg-primary data-[state=active]:text-white font-bold">Categories</TabsTrigger>
            <TabsTrigger value="sponsors" className="rounded-full px-5 data-[state=active]:bg-primary data-[state=active]:text-white font-bold">Sponsors</TabsTrigger>
          </TabsList>

          {/* TICKETS TAB */}
          <TabsContent value="tickets" className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-secondary/10 p-4 rounded-2xl border border-border/40">
              <div className="relative w-full max-w-sm">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by user, ticket type, reference..."
                  value={ticketSearch}
                  onChange={(e) => setTicketSearch(e.target.value)}
                  className="pl-12 bg-background/50 border-border/40 h-12 rounded-xl"
                  data-testid="input-ticket-search"
                />
              </div>
              <div className="text-sm text-muted-foreground whitespace-nowrap">
                {ticketPurchases?.length || 0} total · {ticketPurchases?.filter(t => t.status === "accepted").length || 0} confirmed
              </div>
            </div>

            <div className="border border-border/40 rounded-2xl overflow-hidden bg-secondary/10 shadow-2xl backdrop-blur-sm">
              <Table>
                <TableHeader className="bg-secondary/30">
                  <TableRow className="hover:bg-transparent border-border/40">
                    <TableHead className="py-5 font-bold uppercase text-[10px] tracking-widest opacity-60">User</TableHead>
                    <TableHead className="py-5 font-bold uppercase text-[10px] tracking-widest opacity-60">Ticket Type</TableHead>
                    <TableHead className="py-5 font-bold uppercase text-[10px] tracking-widest opacity-60">Amount</TableHead>
                    <TableHead className="py-5 font-bold uppercase text-[10px] tracking-widest opacity-60">Reference</TableHead>
                    <TableHead className="py-5 font-bold uppercase text-[10px] tracking-widest opacity-60">Date</TableHead>
                    <TableHead className="py-5 font-bold uppercase text-[10px] tracking-widest opacity-60">Status</TableHead>
                    <TableHead className="py-5 font-bold uppercase text-[10px] tracking-widest opacity-60 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTickets?.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-16 text-muted-foreground">
                        <Ticket className="w-10 h-10 mx-auto mb-3 opacity-20" />
                        No ticket purchases yet
                      </TableCell>
                    </TableRow>
                  )}
                  {filteredTickets?.map((ticket) => (
                    <TableRow key={ticket.id} data-testid={`row-ticket-${ticket.id}`} className="border-border/40 hover:bg-white/5 transition-colors">
                      <TableCell className="py-5">
                        <div className="font-bold text-white">@{ticket.username}</div>
                        <div className="text-[10px] text-muted-foreground">{ticket.userEmail}</div>
                      </TableCell>
                      <TableCell className="py-5 font-medium text-foreground">{ticket.ticketType}</TableCell>
                      <TableCell className="py-5 font-mono font-bold text-white text-lg">{formatPrice(ticket.amountPaid)}</TableCell>
                      <TableCell className="py-5 font-mono text-xs text-muted-foreground">{ticket.reference}</TableCell>
                      <TableCell className="py-5 text-xs text-muted-foreground">
                        {ticket.createdAt ? new Date(ticket.createdAt).toLocaleDateString() : "—"}
                      </TableCell>
                      <TableCell className="py-5">{statusBadge(ticket.status)}</TableCell>
                      <TableCell className="py-5 text-right">
                        <div className="flex gap-2 justify-end flex-wrap">
                          {/* View Proof */}
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="outline" size="sm" className="rounded-xl border-border/40 hover:bg-primary hover:text-white transition-all" data-testid={`button-view-proof-${ticket.id}`}>
                                <Eye className="h-4 w-4 mr-1" /> Proof
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl bg-background border-border/40 p-2 rounded-3xl">
                              <img src={ticket.proofImageUrl} alt="Payment Proof" className="w-full h-auto rounded-2xl" />
                            </DialogContent>
                          </Dialog>

                          {/* Accept / Decline */}
                          {ticket.status === "pending" && (
                            <>
                              <Button
                                size="sm"
                                className="bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl px-3"
                                onClick={() => handleAcceptTicket(ticket.id)}
                                disabled={updateTicket.isPending}
                                data-testid={`button-accept-ticket-${ticket.id}`}
                              >
                                <Check className="h-4 w-4 mr-1" /> Accept
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                className="font-bold rounded-xl px-3"
                                onClick={() => handleDeclineTicket(ticket.id)}
                                disabled={updateTicket.isPending}
                                data-testid={`button-decline-ticket-${ticket.id}`}
                              >
                                <X className="h-4 w-4 mr-1" /> Decline
                              </Button>
                            </>
                          )}

                          {/* Send / Update Virtual Ticket */}
                          {ticket.status === "accepted" && (
                            <Button
                              size="sm"
                              className="bg-primary/20 text-primary border border-primary/30 hover:bg-primary hover:text-white font-bold rounded-xl px-3 transition-all"
                              onClick={() => openSendTicketDialog(ticket.id)}
                              data-testid={`button-send-ticket-${ticket.id}`}
                            >
                              <Send className="h-4 w-4 mr-1" />
                              {ticket.virtualTicketUrl ? "Update Ticket" : "Send Ticket"}
                            </Button>
                          )}

                          {/* View virtual ticket if sent */}
                          {ticket.virtualTicketUrl && (
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button variant="outline" size="sm" className="rounded-xl border-green-500/30 text-green-400 hover:bg-green-500/10" data-testid={`button-view-virtual-ticket-${ticket.id}`}>
                                  <Ticket className="h-4 w-4 mr-1" /> View Ticket
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-2xl bg-background border-border/40 p-2 rounded-3xl">
                                <img src={ticket.virtualTicketUrl} alt="Virtual Ticket" className="w-full h-auto rounded-2xl" />
                              </DialogContent>
                            </Dialog>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          {/* USERS TAB */}
          <TabsContent value="users" className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
            <div className="bg-secondary/10 border border-border/40 p-4 rounded-2xl flex items-center justify-between">
              <h3 className="font-bold uppercase tracking-widest text-primary">All Registered Users</h3>
              <span className="text-sm text-muted-foreground">{allUsers?.length || 0} users</span>
            </div>
            <div className="border border-border/40 rounded-2xl overflow-hidden bg-secondary/10 shadow-2xl backdrop-blur-sm">
              <Table>
                <TableHeader className="bg-secondary/30">
                  <TableRow className="hover:bg-transparent border-border/40">
                    <TableHead className="py-5 font-bold uppercase text-[10px] tracking-widest opacity-60">#</TableHead>
                    <TableHead className="py-5 font-bold uppercase text-[10px] tracking-widest opacity-60">Username</TableHead>
                    <TableHead className="py-5 font-bold uppercase text-[10px] tracking-widest opacity-60">Email</TableHead>
                    <TableHead className="py-5 font-bold uppercase text-[10px] tracking-widest opacity-60">Phone</TableHead>
                    <TableHead className="py-5 font-bold uppercase text-[10px] tracking-widest opacity-60">Joined</TableHead>
                    <TableHead className="py-5 font-bold uppercase text-[10px] tracking-widest opacity-60">Tickets</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(!allUsers || allUsers.length === 0) && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-16 text-muted-foreground">
                        <Users className="w-10 h-10 mx-auto mb-3 opacity-20" />
                        No users registered yet
                      </TableCell>
                    </TableRow>
                  )}
                  {allUsers?.map((u, i) => {
                    const userTickets = ticketPurchases?.filter(t => t.userId === u.id) || [];
                    return (
                      <TableRow key={u.id} data-testid={`row-user-${u.id}`} className="border-border/40 hover:bg-white/5 transition-colors">
                        <TableCell className="py-5 text-muted-foreground font-mono text-sm">{i + 1}</TableCell>
                        <TableCell className="py-5 font-bold text-white">@{u.username}</TableCell>
                        <TableCell className="py-5 text-muted-foreground">{u.email}</TableCell>
                        <TableCell className="py-5 text-muted-foreground font-mono text-sm">{u.phoneNumber}</TableCell>
                        <TableCell className="py-5 text-xs text-muted-foreground">
                          {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "—"}
                        </TableCell>
                        <TableCell className="py-5">
                          <div className="flex gap-1 flex-wrap">
                            {userTickets.length === 0 && <span className="text-xs text-muted-foreground">No tickets</span>}
                            {userTickets.map(t => (
                              <span key={t.id} className={`text-[10px] px-2 py-0.5 rounded-full font-bold border
                                ${t.status === "accepted" ? "bg-green-500/10 text-green-400 border-green-500/20" :
                                  t.status === "declined" ? "bg-red-500/10 text-red-400 border-red-500/20" :
                                  "bg-yellow-500/10 text-yellow-400 border-yellow-500/20"}`}>
                                {t.ticketType}
                              </span>
                            ))}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          {/* PAYMENTS TAB (votes) */}
          <TabsContent value="payments" className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-secondary/10 p-4 rounded-2xl border border-border/40">
              <div className="relative w-full max-w-sm">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name or reference..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-12 bg-background/50 border-border/40 h-12 rounded-xl"
                />
              </div>
            </div>
            <div className="border border-border/40 rounded-2xl overflow-hidden bg-secondary/10 shadow-2xl backdrop-blur-sm">
              <Table>
                <TableHeader className="bg-secondary/30">
                  <TableRow className="hover:bg-transparent border-border/40">
                    <TableHead className="py-5 font-bold uppercase text-[10px] tracking-widest opacity-60">Voter</TableHead>
                    <TableHead className="py-5 font-bold uppercase text-[10px] tracking-widest opacity-60">Reference</TableHead>
                    <TableHead className="py-5 font-bold uppercase text-[10px] tracking-widest opacity-60">Package</TableHead>
                    <TableHead className="py-5 font-bold uppercase text-[10px] tracking-widest opacity-60">Amount</TableHead>
                    <TableHead className="py-5 font-bold uppercase text-[10px] tracking-widest opacity-60">Nominee</TableHead>
                    <TableHead className="py-5 font-bold uppercase text-[10px] tracking-widest opacity-60">Status</TableHead>
                    <TableHead className="py-5 font-bold uppercase text-[10px] tracking-widest opacity-60 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPayments?.map((payment) => (
                    <TableRow key={payment.id} className="border-border/40 hover:bg-white/5 transition-colors group">
                      <TableCell className="py-6">
                        <div className="font-bold text-white">{payment.fullName}</div>
                        <div className="text-[10px] text-muted-foreground">{new Date(payment.createdAt!).toLocaleString()}</div>
                      </TableCell>
                      <TableCell className="py-6 font-mono text-xs text-muted-foreground">{payment.reference}</TableCell>
                      <TableCell className="py-6 font-medium text-muted-foreground">
                        {payment.packageName} <span className="text-primary/60 ml-1">({payment.votesAmount} votes)</span>
                      </TableCell>
                      <TableCell className="py-6 font-mono font-bold text-white text-lg">₦{payment.amountPaid.toLocaleString()}</TableCell>
                      <TableCell className="py-6 font-medium text-muted-foreground">{payment.nomineeName}</TableCell>
                      <TableCell className="py-6">
                        <span className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          payment.status === "accepted" ? "bg-green-500/10 text-green-500 border border-green-500/20" :
                          payment.status === "declined" ? "bg-red-500/10 text-red-500 border border-red-500/20" :
                          "bg-yellow-500/10 text-yellow-500 border border-yellow-500/20"}`}>
                          {payment.status}
                        </span>
                      </TableCell>
                      <TableCell className="py-6 text-right">
                        <div className="flex gap-2 justify-end flex-wrap">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="outline" size="sm" className="rounded-xl border-border/40 hover:bg-primary hover:text-white transition-all">
                                <Eye className="h-4 w-4 mr-1" /> View Proof
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-3xl bg-background border-border/40 p-2 rounded-3xl overflow-hidden shadow-2xl">
                              <img src={payment.proofImageUrl} alt="Payment Proof" className="w-full h-auto rounded-2xl shadow-inner" />
                            </DialogContent>
                          </Dialog>
                          {payment.status === "pending" && (
                            <>
                              <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl px-4"
                                onClick={() => updateStatus.mutate({ id: payment.id, status: "accepted" })} disabled={updateStatus.isPending}>
                                <Check className="h-4 w-4 mr-1" /> Accept
                              </Button>
                              <Button size="sm" variant="destructive" className="font-bold rounded-xl px-4"
                                onClick={() => updateStatus.mutate({ id: payment.id, status: "declined" })} disabled={updateStatus.isPending}>
                                <X className="h-4 w-4 mr-1" /> Decline
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          {/* NOMINEES TAB */}
          <TabsContent value="nominees" className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
            <div className="flex justify-between items-center bg-secondary/10 p-6 rounded-2xl border border-border/40">
              <h3 className="text-xl font-bold uppercase tracking-widest text-primary">Manage Nominees</h3>
              <NomineeDialog />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {nominees?.map(nominee => (
                <div key={nominee.id} className="bg-secondary/10 border border-border/40 rounded-2xl p-6 flex flex-col items-center text-center group hover:bg-secondary/20 transition-all relative">
                  <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="text-red-500 hover:bg-red-500/10 rounded-xl">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="bg-background border-border/40">
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Nominee?</AlertDialogTitle>
                          <AlertDialogDescription>Are you sure? This cannot be undone.</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
                          <AlertDialogAction className="bg-red-600 hover:bg-red-700 text-white rounded-xl" onClick={() => deleteNominee.mutate(nominee.id)}>Delete</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                  <div className="relative mb-6">
                    <img src={nominee.imageUrl} alt={nominee.name} className="w-24 h-24 rounded-full object-cover border-4 border-background shadow-xl" />
                    <div className="absolute -bottom-2 right-0 bg-primary text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-lg">{nominee.votes} VOTES</div>
                  </div>
                  <h4 className="font-bold text-xl mb-1 truncate w-full">{nominee.name}</h4>
                  <p className="text-xs text-primary/60 font-bold uppercase tracking-widest mb-4">{nominee.categoryName}</p>
                  {editingVotesId === nominee.id ? (
                    <div className="flex items-center gap-2 mt-1 w-full">
                      <Input data-testid={`input-votes-${nominee.id}`} type="number" min={0} value={editingVotesValue}
                        onChange={e => setEditingVotesValue(e.target.value)}
                        onKeyDown={e => { if (e.key === "Enter") handleSaveVotes(nominee.id); if (e.key === "Escape") { setEditingVotesId(null); setEditingVotesValue(""); } }}
                        className="bg-black/50 border-white/10 h-9 rounded-xl text-center font-mono text-sm flex-1" placeholder="Set votes" autoFocus />
                      <Button size="sm" className="h-9 px-3 bg-green-600 hover:bg-green-700 text-white rounded-xl" onClick={() => handleSaveVotes(nominee.id)} disabled={setNomineeVotes.isPending} data-testid={`button-save-votes-${nominee.id}`}>
                        <Check className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="ghost" className="h-9 px-3 rounded-xl" onClick={() => { setEditingVotesId(null); setEditingVotesValue(""); }}>
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ) : (
                    <Button data-testid={`button-edit-votes-${nominee.id}`} variant="outline" size="sm"
                      className="border-white/10 hover:bg-white/5 text-muted-foreground hover:text-white rounded-xl text-xs gap-1.5 w-full"
                      onClick={() => { setEditingVotesId(nominee.id); setEditingVotesValue(String(nominee.votes)); }}>
                      <Pencil className="w-3 h-3" /> Edit Votes
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </TabsContent>

          {/* CATEGORIES TAB */}
          <TabsContent value="categories" className="space-y-8 animate-in fade-in slide-in-from-bottom-2">
            <div className="bg-secondary/10 border border-border/40 p-8 rounded-2xl">
              <h3 className="text-xl font-bold uppercase tracking-widest text-primary mb-2">Add Categories</h3>
              <p className="text-muted-foreground text-sm mb-6">Add one or many categories at once.</p>
              <div className="space-y-3 max-w-lg">
                {catNames.map((name, idx) => (
                  <div key={idx} className="flex gap-3 items-center">
                    <Input data-testid={`input-category-${idx}`} placeholder="e.g. Best Digital Artist" value={name}
                      onChange={e => { const u = [...catNames]; u[idx] = e.target.value; setCatNames(u); }}
                      className="bg-background/50 border-border/40 h-12 rounded-xl flex-1" />
                    {catNames.length > 1 && (
                      <button onClick={() => setCatNames(prev => prev.filter((_, i) => i !== idx))} className="text-red-500 hover:text-red-400 p-2">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
                <div className="flex gap-3 pt-1">
                  <Button type="button" variant="outline" onClick={() => setCatNames(prev => [...prev, ""])} className="border-border/40 text-white hover:bg-white/5 rounded-xl">
                    <Plus className="h-4 w-4 mr-2" /> Add Another
                  </Button>
                  <Button onClick={handleCreateCategories} disabled={catNames.every(n => !n.trim()) || createCategory.isPending} className="h-12 px-8 font-bold rounded-xl gold-gradient text-white">
                    Save {catNames.filter(n => n.trim()).length > 0 ? catNames.filter(n => n.trim()).length : ""} Categor{catNames.filter(n => n.trim()).length === 1 ? "y" : "ies"}
                  </Button>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categories?.map((cat, index) => (
                <div key={cat.id} className="bg-secondary/10 border border-border/40 p-6 rounded-2xl flex justify-between items-center group hover:bg-secondary/20 transition-all">
                  <div className="flex items-center gap-4">
                    <span className="text-primary/20 font-serif text-2xl font-bold">{index + 1}</span>
                    <span className="font-bold text-lg">{cat.name}</span>
                  </div>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon" className="text-red-500 hover:bg-red-500/10 rounded-xl">
                        <Trash2 className="h-5 w-5" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="bg-background border-border/40">
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Category?</AlertDialogTitle>
                        <AlertDialogDescription>This will also remove all nominees and votes under it.</AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
                        <AlertDialogAction className="bg-red-600 hover:bg-red-700 text-white rounded-xl" onClick={() => deleteCategory.mutate(cat.id)}>Delete</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              ))}
            </div>
          </TabsContent>

          {/* SPONSORS TAB */}
          <TabsContent value="sponsors" className="space-y-8 animate-in fade-in slide-in-from-bottom-2">
            <div className="bg-secondary/10 border border-border/40 p-8 rounded-2xl">
              <h3 className="text-xl font-bold uppercase tracking-widest text-primary mb-2">Add Sponsor to Slideshow</h3>
              <p className="text-muted-foreground text-sm mb-6">Pick a brand image and give it a name. It will appear in the home page slideshow.</p>
              <div className="flex flex-col gap-4 max-w-md">
                <Input data-testid="input-sponsor-name" placeholder="Sponsor / Brand Name" value={newSponsorName}
                  onChange={e => setNewSponsorName(e.target.value)} className="bg-background/50 border-border/40 h-14 rounded-xl" />
                <div className="flex items-center gap-4">
                  <label data-testid="upload-sponsor-image" className="flex items-center gap-2 cursor-pointer bg-primary/10 hover:bg-primary/20 border border-primary/30 text-primary text-sm font-bold px-5 py-3 rounded-xl transition-colors">
                    <ImageIcon className="w-5 h-5" />
                    {newSponsorPreview ? "Change Image" : "Choose Image from Device"}
                    <input type="file" accept="image/*" className="hidden" onChange={handleSponsorImageChange} />
                  </label>
                  {newSponsorPreview && (
                    <div className="relative">
                      <img src={newSponsorPreview} alt="preview" className="w-16 h-16 object-cover rounded-xl border border-white/10" />
                      <CheckCircle2 className="absolute -top-2 -right-2 w-5 h-5 text-green-500 bg-background rounded-full" />
                    </div>
                  )}
                </div>
                <Button data-testid="button-add-sponsor" onClick={handleCreateSponsor}
                  disabled={!newSponsorName || !newSponsorImageUrl || createSponsor.isPending} className="h-14 px-8 font-bold rounded-xl gold-gradient text-white">
                  <Plus className="h-5 w-5 mr-2" /> Add to Slideshow
                </Button>
              </div>
            </div>
            <div className="bg-secondary/10 border border-border/40 p-6 rounded-2xl">
              <h3 className="text-xl font-bold uppercase tracking-widest text-primary mb-6">Added Sponsors</h3>
              {(!sponsors || sponsors.length === 0) ? (
                <div className="text-center py-16 text-muted-foreground">
                  <Star className="w-10 h-10 mx-auto mb-4 opacity-20" />
                  <p className="font-medium">No extra sponsors added yet.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {sponsors.map((sponsor: { id: number; name: string; imageUrl: string }) => (
                    <div key={sponsor.id} data-testid={`card-sponsor-${sponsor.id}`} className="bg-secondary/20 border border-border/40 rounded-2xl overflow-hidden group hover:bg-secondary/30 transition-all">
                      <div className="aspect-video relative overflow-hidden bg-black/30">
                        <img src={sponsor.imageUrl} alt={sponsor.name} className="w-full h-full object-contain p-2" onError={(e) => { (e.target as HTMLImageElement).src = "/placeholder-nominee.png"; }} />
                      </div>
                      <div className="p-4 flex items-center justify-between">
                        <span className="font-bold text-white truncate">{sponsor.name}</span>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button data-testid={`button-delete-sponsor-${sponsor.id}`} variant="ghost" size="icon" className="text-red-500 hover:bg-red-500/10 rounded-xl flex-shrink-0">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent className="bg-background border-border/40">
                            <AlertDialogHeader>
                              <AlertDialogTitle>Remove Sponsor?</AlertDialogTitle>
                              <AlertDialogDescription>Remove {sponsor.name} from the slideshow?</AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
                              <AlertDialogAction className="bg-red-600 hover:bg-red-700 text-white rounded-xl" onClick={() => deleteSponsor.mutate(sponsor.id)}>Remove</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </main>

      {/* Send Virtual Ticket Dialog — live editor */}
      <Dialog open={sendDialogOpen} onOpenChange={setSendDialogOpen}>
        <DialogContent className="max-w-2xl bg-background border-border/40 max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Ticket className="w-5 h-5 text-primary" /> Generate & Send Virtual Ticket
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 mt-2">
            <p className="text-sm text-muted-foreground">
              Edit the attendee name and ticket code below — the preview updates live. When you're happy, click Capture &amp; Send to deliver it to the user.
            </p>

            {/* Live Preview */}
            <div className="bg-black/40 rounded-2xl p-4 flex items-center justify-center overflow-x-auto">
              <div ref={ticketPreviewRef}>
                <VirtualTicketCard
                  data={{
                    username: editUsername || "guest",
                    ticketType: editTicketType,
                    code: editCode || "GRA26-XXXX-XXXXXX",
                    quantity: editQuantity,
                  }}
                />
              </div>
            </div>

            {/* Editable fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="edit-username">Attendee Username</Label>
                <Input
                  id="edit-username" data-testid="input-edit-username"
                  value={editUsername}
                  onChange={(e) => setEditUsername(e.target.value)}
                  placeholder="username"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="edit-code">Ticket Code</Label>
                <div className="flex gap-2">
                  <Input
                    id="edit-code" data-testid="input-edit-code"
                    value={editCode}
                    onChange={(e) => setEditCode(e.target.value.toUpperCase())}
                    placeholder="GRA26-XXXX-XXXXXX"
                    className="font-mono"
                  />
                  <Button
                    type="button" variant="outline" size="sm" className="shrink-0"
                    onClick={() => setEditCode(generateTicketCode(ticketDialogId || 0, editUsername || "GHOST"))}
                    data-testid="button-regenerate-code"
                  >
                    Re-gen
                  </Button>
                </div>
              </div>
            </div>

            <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 text-xs text-amber-300">
              <strong>Tip:</strong> The captured ticket image is saved to the user's account. They can download it from their My Tickets page.
            </div>

            <Button
              data-testid="button-confirm-send-ticket"
              className="w-full h-12 font-bold text-base"
              onClick={handleSendVirtualTicket}
              disabled={isSending || updateTicket.isPending}
            >
              {isSending || updateTicket.isPending ? (
                <>Capturing & Sending...</>
              ) : (
                <><Send className="w-4 h-4 mr-2" /> Capture & Send Ticket to User</>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
