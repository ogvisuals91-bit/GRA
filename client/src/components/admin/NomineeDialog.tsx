import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCreateNominee } from "@/hooks/use-nominees";
import { useCategories } from "@/hooks/use-categories";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Plus, Trash2, ImageIcon, CheckCircle2 } from "lucide-react";

type NomineeRow = {
  id: string;
  name: string;
  categoryId: string;
  imageUrl: string;
  imagePreview: string;
};

const emptyRow = (): NomineeRow => ({
  id: Math.random().toString(36).slice(2),
  name: "",
  categoryId: "",
  imageUrl: "",
  imagePreview: "",
});

async function compressImage(file: File): Promise<string> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const img = new Image();
      img.onload = () => {
        const MAX = 900;
        let { width, height } = img;
        if (width > MAX || height > MAX) {
          if (width > height) {
            height = Math.round((height * MAX) / width);
            width = MAX;
          } else {
            width = Math.round((width * MAX) / height);
            height = MAX;
          }
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d")!;
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", 0.82));
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}

export function NomineeDialog() {
  const [open, setOpen] = useState(false);
  const [rows, setRows] = useState<NomineeRow[]>([emptyRow()]);
  const [submitting, setSubmitting] = useState(false);
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);
  const { toast } = useToast();
  const createNominee = useCreateNominee();
  const { data: categories } = useCategories();

  const addRow = () => setRows(prev => [...prev, emptyRow()]);

  const removeRow = (id: string) => {
    if (rows.length === 1) return;
    setRows(prev => prev.filter(r => r.id !== id));
  };

  const updateRow = (id: string, field: keyof NomineeRow, value: string) => {
    setRows(prev => prev.map(r => r.id === id ? { ...r, [field]: value } : r));
  };

  const handleImageChange = async (id: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const compressed = await compressImage(file);
    setRows(prev => prev.map(r => r.id === id ? { ...r, imageUrl: compressed, imagePreview: compressed } : r));
  };

  const isRowValid = (row: NomineeRow) =>
    row.name.trim().length > 0 && row.categoryId && row.imageUrl;

  const validRows = rows.filter(isRowValid);

  const handleSubmit = async () => {
    if (validRows.length === 0) {
      toast({ title: "Nothing to submit", description: "Fill in at least one complete nominee row.", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    setProgress({ done: 0, total: validRows.length });
    let saved = 0;
    let failed = 0;
    for (const row of validRows) {
      try {
        await createNominee.mutateAsync({
          name: row.name.trim(),
          categoryId: parseInt(row.categoryId),
          imageUrl: row.imageUrl,
        });
        saved++;
      } catch {
        failed++;
      }
      setProgress({ done: saved + failed, total: validRows.length });
    }
    setSubmitting(false);
    setProgress(null);
    if (failed === 0) {
      toast({ title: `${saved} nominee${saved > 1 ? "s" : ""} added successfully!` });
      setRows([emptyRow()]);
      setOpen(false);
    } else {
      toast({
        title: `${saved} saved, ${failed} failed`,
        description: "Some nominees could not be saved. Check your entries and try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={v => { if (!submitting) { setOpen(v); if (!v) setRows([emptyRow()]); } }}>
      <DialogTrigger asChild>
        <Button className="bg-primary text-white hover:bg-primary/90 font-bold rounded-xl">
          <Plus className="mr-2 h-4 w-4" /> Add Nominees
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-card border-white/10 text-white max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold uppercase tracking-widest text-primary">Add Multiple Nominees</DialogTitle>
          <p className="text-muted-foreground text-sm">Fill in as many nominees as you need, then submit all at once.</p>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          {rows.map((row, index) => (
            <div key={row.id} className="bg-black/30 border border-white/10 rounded-2xl p-4 space-y-3 relative">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-primary/60 uppercase tracking-widest">Nominee #{index + 1}</span>
                <div className="flex items-center gap-2">
                  {isRowValid(row) && <CheckCircle2 className="w-4 h-4 text-green-500" />}
                  {rows.length > 1 && (
                    <button
                      onClick={() => removeRow(row.id)}
                      className="text-red-500 hover:text-red-400 transition-colors p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Full Name *</Label>
                  <Input
                    data-testid={`input-nominee-name-${index}`}
                    placeholder="e.g. Shadow Walker"
                    value={row.name}
                    onChange={e => updateRow(row.id, "name", e.target.value)}
                    className="bg-black/50 border-white/10 h-11 rounded-xl"
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Category *</Label>
                  <Select value={row.categoryId} onValueChange={val => updateRow(row.id, "categoryId", val)}>
                    <SelectTrigger data-testid={`select-nominee-category-${index}`} className="bg-black/50 border-white/10 h-11 rounded-xl">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent className="bg-card border-white/10 text-white">
                      {categories?.map(cat => (
                        <SelectItem key={cat.id} value={cat.id.toString()}>{cat.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Photo *</Label>
                <div className="flex items-center gap-3">
                  <label
                    data-testid={`upload-nominee-image-${index}`}
                    className="flex items-center gap-2 cursor-pointer bg-primary/10 hover:bg-primary/20 border border-primary/30 text-primary text-sm font-bold px-4 py-2 rounded-xl transition-colors"
                  >
                    <ImageIcon className="w-4 h-4" />
                    {row.imagePreview ? "Change Photo" : "Choose Photo"}
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={e => handleImageChange(row.id, e)}
                    />
                  </label>
                  {row.imagePreview && (
                    <img
                      src={row.imagePreview}
                      alt="Preview"
                      className="w-12 h-12 rounded-xl object-cover border border-white/10"
                    />
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mt-4">
          <Button
            type="button"
            variant="outline"
            onClick={addRow}
            disabled={submitting}
            className="border-white/10 text-white hover:bg-white/5 rounded-xl flex-1"
          >
            <Plus className="mr-2 h-4 w-4" /> Add Another Nominee
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={submitting || validRows.length === 0}
            className="gold-gradient text-white font-bold rounded-xl flex-1"
          >
            {submitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {progress ? `Saving ${progress.done} of ${progress.total}...` : "Saving..."}
              </>
            ) : (
              `Submit ${validRows.length > 0 ? `${validRows.length} ` : ""}Nominee${validRows.length !== 1 ? "s" : ""}`
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
