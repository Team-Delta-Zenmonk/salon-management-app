import React from "react";
import type { Control, UseFormSetValue } from "react-hook-form";
import { useWatch } from "react-hook-form";
import type { SalonProfileForm } from "../../schema/my-profile.schema";
import TextField from "../../../../components/form/textfield";
import Select from "../../../../components/form/select";
import { TypeOfSalon } from "../constants/salon.constants";
import { uploadImages } from "../../../../features/upload-images/upload-images.service";
import { VALIDATE_PATTERN } from "../../../../common/validate-pattern";
import { Store, Sparkles, X, Image as ImageIcon, Loader2 } from "lucide-react";
import { Button } from "../../../../components/ui/button";

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
  const logoInputRef = React.useRef<HTMLInputElement | null>(null);
  const photoInputRef = React.useRef<HTMLInputElement | null>(null);

  return (
    <div className="bg-card/60 backdrop-blur-md border border-border/50 rounded-3xl p-6 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-50 pointer-events-none" />

      {/* Section Header */}
      <div className="flex items-center gap-2 mb-5 relative z-10">
        <Sparkles className="w-4 h-4 text-primary" />
        <span className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">Salon Branding & Media</span>
        <div className="flex-1 h-px bg-border/50" />
      </div>

      <div className="space-y-6 relative z-10">
        {/* Logo Section */}
        <div className="flex items-center gap-6">
          <div className="relative w-20 h-20 rounded-2xl overflow-hidden border border-border/50 bg-background/40 flex items-center justify-center shadow-md hover:border-primary/20 transition-all duration-300 group shrink-0">
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

        {/* Cover Photos Section */}
        <div className="space-y-2.5">
          <div className="space-y-0.5">
            <p className="text-xs font-bold text-foreground">Gallery & Cover Photos</p>
            <p className="text-[10px] text-muted-foreground/80 leading-relaxed">
              These images will be displayed on client-facing booking pages.
            </p>
          </div>

          {/* Scrollable grid if there are multiple images */}
          <div className="max-h-[260px] overflow-y-auto pr-1.5 space-y-3 custom-scrollbar">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {/* Add Cover Image Button - Placed at the Start */}
              <button
                type="button"
                onClick={() => photoInputRef.current?.click()}
                disabled={photosUploading || isSaving}
                className="aspect-[4/3] rounded-xl border-2 border-dashed border-border/60 hover:border-primary/50 bg-background/30 hover:bg-background/60 flex flex-col items-center justify-center text-muted-foreground hover:text-primary gap-1 transition-all duration-250 cursor-pointer p-2"
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

              {photos.map((photo: PhotoType, index: number) => (
                <div 
                  key={photo.url || index}
                  className="group relative rounded-xl overflow-hidden border border-border/50 bg-background/40 shadow-sm hover:border-primary/30 transition-all duration-300 flex flex-col aspect-[4/3]"
                >
                  <div className="relative w-full h-full overflow-hidden bg-muted">
                    <img 
                      src={photo.url} 
                      alt={photo.filename || "Cover Thumbnail"} 
                      className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const updated = photos.filter((p: PhotoType) => p.url !== photo.url);
                        setValue("photos", updated, { shouldDirty: true });
                      }}
                      className="absolute top-1.5 right-1.5 p-1 rounded-full bg-black/60 hover:bg-destructive hover:scale-110 text-white opacity-0 group-hover:opacity-100 transition-all duration-200 cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                    </button>
                    {/* Filename display overlay at the bottom */}
                    <div className="absolute inset-x-0 bottom-0 bg-black/50 backdrop-blur-xs px-2 py-1 flex items-center justify-between">
                      <p className="text-[9px] font-medium text-white truncate max-w-[85%]" title={photo.filename}>
                        {photo.filename || `Photo ${index + 1}`}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <input
            ref={photoInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={async (e) => {
              const files = e.target.files;
              if (!files?.length) return;
              setPhotosUploading(true);
              try {
                const uploadedData: Array<{ url: string; filename: string }> = [];
                for (const file of Array.from(files)) {
                  const result = await uploadImages(file);
                  uploadedData.push(result);
                }
                setValue("photos", [...photos, ...uploadedData], { shouldDirty: true });
              } catch {
                console.error("Photos upload failed");
              } finally {
                setPhotosUploading(false);
              }
            }}
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

      {/* Section Header */}
      <div className="flex items-center gap-2 mb-5 relative z-10">
        <Store className="w-4 h-4 text-primary" />
        <span className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">General Information</span>
        <div className="flex-1 h-px bg-border/50" />
      </div>

      <div className="space-y-6 relative z-10">
        {/* Row 1: Name, Owner Name, Salon Type in 3 columns - No prefix icons */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Salon Name */}
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

          {/* Owner Name */}
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

          {/* Salon Type */}
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

        {/* About Description */}
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
