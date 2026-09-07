import React from "react";
import type { Control, UseFormSetValue } from "react-hook-form";
import { useWatch } from "react-hook-form";
import { motion, AnimatePresence } from "framer-motion";
import type { SalonProfileForm } from "../../schema/my-profile.schema";
import TextField from "../../../../components/form/textfield";
import Select from "../../../../components/form/select";
import { TypeOfSalon } from "../constants/salon.constants";
import { uploadImages } from "../../../../features/upload-images/upload-images.service";
import { VALIDATE_PATTERN } from "../../../../common/validate-pattern";
import { Store, Sparkles, X, Image as ImageIcon, Loader2 } from "lucide-react";
import { Button } from "../../../../components/ui/button";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../../../components/ui/dialog";
import { callSnack } from "../../../../components/snackbar";
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";

interface PhotoType {
  url: string;
  filename: string;
}

interface BrandingSectionProps {
  control: Control<SalonProfileForm>;
  setValue: UseFormSetValue<SalonProfileForm>;
  isSaving: boolean;
}

export const BrandingSection: React.FC<BrandingSectionProps> = ({
  control,
  setValue,
  isSaving,
}) => {
  const logo = useWatch({ control, name: "logo" }) as PhotoType | null;
  const photos = (useWatch({ control, name: "photos" }) || []) as PhotoType[];

  const [logoUploading, setLogoUploading] = React.useState(false);
  const [photosUploading, setPhotosUploading] = React.useState(false);
  const [isGalleryOpen, setIsGalleryOpen] = React.useState(false);
  const [isLogoPreviewOpen, setIsLogoPreviewOpen] = React.useState(false);
  const logoInputRef = React.useRef<HTMLInputElement | null>(null);
  const photoInputRef = React.useRef<HTMLInputElement | null>(null);

  const handleAddPhotoClick = () => {
    if (photos.length >= 4) {
      callSnack("Maximum 4 photos can be uploaded", "warning");
      return;
    }
    photoInputRef.current?.click();
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;

    const currentCount = photos.length;
    if (currentCount >= 4) {
      callSnack("Maximum 4 photos can be uploaded", "warning");
      e.target.value = "";
      return;
    }

    const allowedCount = 4 - currentCount;
    const filesToUpload = Array.from(files).slice(0, allowedCount);

    if (files.length > allowedCount) {
      callSnack(
        `Maximum 4 photos allowed. Only ${allowedCount} photo(s) will be uploaded.`,
        "warning"
      );
    }

    setPhotosUploading(true);
    try {
      const uploadedData: Array<{ url: string; filename: string }> = [];
      for (const file of filesToUpload) {
        const result = await uploadImages(file);
        uploadedData.push(result);
      }
      setValue("photos", [...photos, ...uploadedData], { shouldDirty: true });
    } catch {
      callSnack("Photos upload failed", "error");
    } finally {
      setPhotosUploading(false);
      e.target.value = "";
    }
  };

  return (
    <div className="bg-card/60 backdrop-blur-md border border-border/50 rounded-3xl p-6 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-50 pointer-events-none" />

      <div className="flex items-center gap-2 mb-5 relative z-10">
        <Sparkles className="w-4 h-4 text-primary" />
        <span className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">Salon Branding & Media</span>
        <div className="flex-1 h-px bg-border/50" />
      </div>

      <div className="space-y-6 relative z-10">
        <div className="flex items-center gap-6">
          <div 
            onClick={() => logo?.url && setIsLogoPreviewOpen(true)}
            className="relative w-20 h-20 rounded-2xl overflow-hidden border border-border/50 bg-background/40 flex items-center justify-center shadow-md hover:border-primary/20 transition-all duration-300 group shrink-0 cursor-pointer"
          >
            {logo?.url ? (
              <img src={logo.url} className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105" alt="Logo Preview" />
            ) : (
              <Store className="w-7 h-7 text-muted-foreground/30" />
            )}
            {logoUploading && (
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                <Loader2 className="w-5 h-5 animate-spin text-white" />
              </div>
            )}
          </div>
          <div className="space-y-1.5">
            <div className="flex gap-2">
              <Button 
                type="button" 
                variant="outline" 
                size="sm"
                className="text-xs font-semibold cursor-pointer rounded-xl border border-border/60 hover:bg-card/85 transition-all shadow-xs h-8 px-3"
                disabled={logoUploading || isSaving}
                onClick={() => logoInputRef.current?.click()}
              >
                {logo?.url ? "Replace logo" : "Upload logo"}
              </Button>
            </div>
            <p className="text-[10px] text-muted-foreground leading-normal max-w-[200px]">
              Max 5MB. Clean square logo recommended.
            </p>
            <input 
              ref={logoInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                setLogoUploading(true);
                try {
                  const res = await uploadImages(file);
                  setValue("logo", res, { shouldDirty: true });
                } catch {
                  console.error("Logo upload failed");
                } finally {
                  setLogoUploading(false);
                }
              }}
            />
          </div>
        </div>

        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <p className="text-xs font-bold text-foreground">Gallery & Cover Photos</p>
              <p className="text-[10px] text-muted-foreground/80 leading-relaxed">
                These images will be displayed on client-facing booking pages.
              </p>
            </div>
            {photos.length > 0 && (
              <button
                type="button"
                onClick={() => setIsGalleryOpen(true)}
                className="text-[11px] font-bold text-primary hover:underline cursor-pointer"
              >
                View all ({photos.length})
              </button>
            )}
          </div>

          <div className="grid grid-cols-3 gap-3">
            <button
              type="button"
              onClick={handleAddPhotoClick}
              disabled={photosUploading || isSaving}
              className="aspect-[4/3] rounded-2xl border-2 border-dashed border-border/60 hover:border-primary/50 bg-background/30 hover:bg-background/60 flex flex-col items-center justify-center text-muted-foreground hover:text-primary gap-1 transition-all duration-250 cursor-pointer p-2"
            >
              {photosUploading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <ImageIcon className="w-5 h-5" />
                  <span className="text-[10px] font-bold">Add Photo</span>
                </>
              )}
            </button>

            {photos.length > 0 ? (
              <div 
                className="group relative rounded-2xl overflow-hidden border border-border/50 bg-background/40 shadow-sm hover:border-primary/30 transition-all duration-300 flex flex-col aspect-[4/3] cursor-pointer"
                onClick={() => setIsGalleryOpen(true)}
              >
                <img 
                  src={photos[0].url} 
                  alt={photos[0].filename || "Cover 1"} 
                  className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
                />
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    const updated = photos.filter((_, i) => i !== 0);
                    setValue("photos", updated, { shouldDirty: true });
                  }}
                  className="absolute top-1.5 right-1.5 p-1 rounded-full bg-black/60 hover:bg-destructive hover:scale-110 text-white opacity-0 group-hover:opacity-100 transition-all duration-200 cursor-pointer z-10"
                >
                  <X className="w-3 h-3" />
                </button>
                <div className="absolute inset-x-0 bottom-0 bg-black/50 backdrop-blur-xs px-2 py-1 flex items-center justify-between">
                  <p className="text-[9px] font-medium text-white truncate max-w-[85%]" title={photos[0].filename}>
                    {photos[0].filename || "Photo 1"}
                  </p>
                </div>
              </div>
            ) : null}

            {photos.length > 1 ? (
              <div 
                className="group relative rounded-2xl overflow-hidden border border-border/50 bg-background/40 shadow-sm hover:border-primary/30 transition-all duration-300 flex flex-col aspect-[4/3] cursor-pointer"
                onClick={() => setIsGalleryOpen(true)}
              >
                <img 
                  src={photos[1].url} 
                  alt={photos[1].filename || "Cover 2"} 
                  className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
                />
                
                {photos.length > 2 ? (
                  <div className="absolute inset-0 bg-black/65 backdrop-blur-xs flex flex-col items-center justify-center text-white transition-all group-hover:bg-black/75">
                    <span className="text-base font-black">+{photos.length - 2}</span>
                    <span className="text-[9px] font-bold text-white/80">View All</span>
                  </div>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        const updated = photos.filter((_, i) => i !== 1);
                        setValue("photos", updated, { shouldDirty: true });
                      }}
                      className="absolute top-1.5 right-1.5 p-1 rounded-full bg-black/60 hover:bg-destructive hover:scale-110 text-white opacity-0 group-hover:opacity-100 transition-all duration-200 cursor-pointer z-10"
                    >
                      <X className="w-3 h-3" />
                    </button>
                    <div className="absolute inset-x-0 bottom-0 bg-black/50 backdrop-blur-xs px-2 py-1 flex items-center justify-between">
                      <p className="text-[9px] font-medium text-white truncate max-w-[85%]" title={photos[1].filename}>
                        {photos[1].filename || "Photo 2"}
                      </p>
                    </div>
                  </>
                )}
              </div>
            ) : null}
          </div>

          <Dialog open={isGalleryOpen} onOpenChange={setIsGalleryOpen}>
            <DialogContent className="sm:max-w-2xl rounded-3xl border-border/60 bg-card p-6 shadow-xl max-h-[85vh] overflow-y-auto">
              <DialogHeader className="flex flex-row items-center justify-between pb-3 border-b border-border/40">
                <DialogTitle className="text-base font-bold text-foreground">
                  All Gallery & Cover Photos ({photos.length})
                </DialogTitle>
              </DialogHeader>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-4">
                {photos.map((photo: PhotoType, index: number) => (
                  <div
                    key={photo.url || index}
                    className="group relative rounded-2xl overflow-hidden border border-border/50 bg-background/40 shadow-sm aspect-[4/3]"
                  >
                    <img
                      src={photo.url}
                      alt={photo.filename || `Photo ${index + 1}`}
                      className="object-cover w-full h-full"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const updated = photos.filter((_, i) => i !== index);
                        setValue("photos", updated, { shouldDirty: true });
                        if (updated.length === 0) setIsGalleryOpen(false);
                      }}
                      className="absolute top-2 right-2 p-1.5 rounded-full bg-black/70 hover:bg-destructive text-white opacity-90 group-hover:opacity-100 transition-all cursor-pointer"
                      title="Delete photo"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                    <div className="absolute inset-x-0 bottom-0 bg-black/60 backdrop-blur-xs px-2.5 py-1.5">
                      <p className="text-[10px] font-medium text-white truncate" title={photo.filename}>
                        {photo.filename || `Photo ${index + 1}`}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </DialogContent>
          </Dialog>

          {logo?.url && (
            <Lightbox
              open={isLogoPreviewOpen}
              close={() => setIsLogoPreviewOpen(false)}
              slides={[{ src: logo.url }]}
              render={{
                buttonPrev: () => null,
                buttonNext: () => null,
              }}
            />
          )}

          <input
            ref={photoInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={handlePhotoUpload}
          />
        </div>
      </div>
    </div>
  );
};

interface GeneralInfoSectionProps {
  control: Control<SalonProfileForm>;
  isSaving: boolean;
}

export const GeneralInfoSection: React.FC<GeneralInfoSectionProps> = ({ 
  control, 
}) => {
  return (
    <div className="bg-card/60 backdrop-blur-md border border-border/50 rounded-3xl p-6 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-50 pointer-events-none" />

      <div className="flex items-center gap-2 mb-5 relative z-10">
        <Store className="w-4 h-4 text-primary" />
        <span className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">General Information</span>
        <div className="flex-1 h-px bg-border/50" />
      </div>

      <div className="space-y-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="w-full">
            <TextField
              name="name"
              type="text"
              control={control}
              label="Salon Name"
              placeholder="Enter salon name"
              identifier="salon-name-field"
              rules={{ required: "Salon name is required" }}
              maxLength={50}
              pattern={VALIDATE_PATTERN.alphabet}
              inputPropsClassName="bg-white dark:bg-neutral-900"
            />
          </div>

          <div className="w-full">
            <TextField
              name="owner_name"
              type="text"
              control={control}
              label="Owner Name"
              placeholder="Enter owner name"
              identifier="salon-owner-field"
              rules={{ required: "Owner name is required" }}
              maxLength={50}
              pattern={VALIDATE_PATTERN.alphabet}
              inputPropsClassName="bg-white dark:bg-neutral-900"
            />
          </div>

          <div className="w-full">
            <Select
              name="type"
              control={control}
              label="Salon Type"
              options={TypeOfSalon}
              placeholder="Select Salon Type"
              identifier="salon-type-field"
              rules={{ required: "Salon type is required" }}
              triggerClassName="bg-white dark:bg-neutral-900"
            />
          </div>
        </div>

        <div className="w-full">
          <TextField
            name="about"
            type="text"
            control={control}
            label="About Description"
            placeholder="Describe your salon, specialties, and experience..."
            identifier="salon-about-field"
            multiline
            rows={3}
            maxLength={300}
            inputPropsClassName="bg-white dark:bg-neutral-900"
          />
        </div>
      </div>
    </div>
  );
};
