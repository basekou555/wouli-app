import React, { useEffect, useMemo, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Database } from "@/integrations/supabase/types";

type EventCategory = Database["public"]["Enums"]["event_category"];
type ProposeEventModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

type EventCategoryRow = { category: EventCategory | null };

const ProposeEventModal: React.FC<ProposeEventModalProps> = ({ open, onOpenChange }) => {
  const { toast } = useToast();

  // Form state
  const [title, setTitle] = useState("");
  const [datetime, setDatetime] = useState(""); // HTML datetime-local value
  const [location, setLocation] = useState("Lyon");
  const [address, setAddress] = useState("");
  const [category, setCategory] = useState<EventCategory | "">("");
  const [externalUrl, setExternalUrl] = useState("");
  const [email, setEmail] = useState("");
  const [description, setDescription] = useState("");

  // Categories fetched from existing events to ensure enum compatibility
  const [categories, setCategories] = useState<EventCategory[]>([]);
  const [loadingCats, setLoadingCats] = useState(false);

  useEffect(() => {
    if (!open) return;
    let isMounted = true;
    const loadCategories = async () => {
      setLoadingCats(true);
      try {
        console.log("[ProposeEventModal] Loading categories from events...");
        const { data, error } = await supabase
          .from("events")
          .select("category")
          .limit(200);
        if (error) {
          console.error("Failed to load categories:", error.message);
          return;
        }
        const unique = Array.from(
          new Set(
            ((data as EventCategoryRow[] | null)?.map((d) => d.category).filter((v): v is EventCategory => !!v)) ?? []
          )
        );
        if (!isMounted) return;
        if (unique.length === 0) {
          console.warn("No categories found in events; using fallback 'activites'");
          setCategories(["activites" as EventCategory]);
          setCategory("activites");
        } else {
          setCategories(unique);
          setCategory(unique[0]);
        }
      } finally {
        if (isMounted) setLoadingCats(false);
      }
    };
    loadCategories();
    return () => {
      isMounted = false;
    };
  }, [open]);

  const isSubmitDisabled = useMemo(() => {
    return (
      !title.trim() ||
      !datetime ||
      !location.trim() ||
      !category.trim()
    );
  }, [title, datetime, location, category]);

  const resetForm = () => {
    setTitle("");
    setDatetime("");
    setLocation("Lyon");
    setAddress("");
    setExternalUrl("");
    setEmail("");
    setDescription("");
    // keep category as-is so users can submit multiple faster
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("[ProposeEventModal] Submitting event proposal...");

    try {
      const isoDate = new Date(datetime).toISOString();
      const payload: Database["public"]["Tables"]["events_pending"]["Insert"] = {
        title: title.trim(),
        description: description.trim() || null,
        date: isoDate,
        location: location.trim(),
        address: address.trim() || null,
        category: category as EventCategory,
        price: 0,
        external_url: externalUrl.trim() || null,
        submitter_email: email.trim() || null,
        status: "pending",
      };

      const { error } = await supabase.from("events_pending").insert(payload);
      if (error) throw error;

      toast({
        title: "Merci !",
        description: "Votre événement a été soumis et sera vérifié par l’équipe.",
      });
      resetForm();
      onOpenChange(false);
    } catch (err: any) {
      console.error("[ProposeEventModal] Insert error:", err?.message || err);
      toast({
        title: "Erreur lors de l’envoi",
        description: err?.message || "Veuillez réessayer.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Proposer un événement</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Titre</Label>
            <Input id="title" placeholder="Soirée salsa, Brunch, Afterwork..." value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="datetime">Date et heure</Label>
            <Input id="datetime" type="datetime-local" value={datetime} onChange={(e) => setDatetime(e.target.value)} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Ville / Lieu</Label>
            <Input id="location" placeholder="Lyon, Villeurbanne..." value={location} onChange={(e) => setLocation(e.target.value)} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Adresse (optionnel)</Label>
            <Input id="address" placeholder="12 Rue de la République, 69002 Lyon" value={address} onChange={(e) => setAddress(e.target.value)} />
          </div>

          <div className="space-y-2">
            <Label>Catégorie</Label>
            <Select value={category} onValueChange={(v) => setCategory(v as EventCategory)} disabled={loadingCats || categories.length === 0}>
              <SelectTrigger>
                <SelectValue placeholder={loadingCats ? "Chargement..." : "Choisir une catégorie"} />
              </SelectTrigger>
              <SelectContent>
                {categories.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {categories.length === 0 && (
              <p className="text-xs text-muted-foreground">
                Aucune catégorie détectée, réessayez plus tard ou contactez le support.
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="url">Lien externe (optionnel)</Label>
            <Input id="url" placeholder="https://..." value={externalUrl} onChange={(e) => setExternalUrl(e.target.value)} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Votre e-mail (optionnel)</Label>
            <Input id="email" type="email" placeholder="pour vous recontacter si besoin" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (optionnel)</Label>
            <Textarea id="description" placeholder="Quelques détails utiles..." value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>

          <div className="pt-2 flex gap-2 justify-end">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
            <Button type="submit" disabled={isSubmitDisabled || categories.length === 0}>
              Envoyer
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ProposeEventModal;
