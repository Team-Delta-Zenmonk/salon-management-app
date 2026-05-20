import React from "react";
import { Box, Typography, Grid, Avatar } from "@mui/material";
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
import { MapContainer, TileLayer, Marker, Tooltip as MapTooltip } from "react-leaflet";
import PersonIcon from "@mui/icons-material/Person";
import EmailIcon from "@mui/icons-material/Email";
import PhoneIcon from "@mui/icons-material/Phone";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import LanguageIcon from "@mui/icons-material/Language";
import LaunchIcon from "@mui/icons-material/Launch";
import ContentCutIcon from "@mui/icons-material/ContentCut";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import styles from "./profile-view-mode.module.scss";

interface ProfileViewModeProps {
  salon: any;
  lightboxOpen: boolean;
  setLightboxOpen: (open: boolean) => void;
  lightboxIndex: number;
  setLightboxIndex: (index: number) => void;
}

const ProfileViewMode: React.FC<ProfileViewModeProps> = ({
  salon,
  lightboxOpen,
  setLightboxOpen,
  lightboxIndex,
  setLightboxIndex
}) => {
  const lightboxSlides = salon?.photos?.map((photo: any) => ({ src: photo.url })) || [];

  return (
    <>
      <Box
        onClick={() => {
          if (salon?.photos && salon.photos.length > 0) {
            setLightboxIndex(0);
            setLightboxOpen(true);
          }
        }}
        className={styles.bannerContainer}
        sx={{
          backgroundImage: salon?.photos && salon.photos.length > 0
            ? `url(${salon.photos[0].url})`
            : "linear-gradient(135deg, var(--primary-900) 0%, var(--primary-800) 100%)",
          cursor: (salon?.photos && salon.photos.length > 0) ? "pointer" : "default"
        }}
      >
        {salon?.type && (
          <Box className={styles.categoryBadge}>
            <ContentCutIcon sx={{ fontSize: 14 }} />
            {salon.type} Category
          </Box>
        )}

        {salon?.photos && salon.photos.length > 1 && (
          <Box className={styles.photosCountBadge}>
            <PhotoCameraIcon sx={{ fontSize: 14 }} />
            +{salon.photos.length - 1} More
          </Box>
        )}
      </Box>

      <Box className={styles.detailsWrapper}>
        <Box className={styles.headerContainer}>
          <Box className={styles.logoBox}>
            {salon?.logo ? (
              <Box
                component="img"
                src={salon.logo}
                alt="Salon Logo"
                sx={{
                  width: "100%",
                  height: "100%",
                  borderRadius: "12px",
                  objectFit: "cover"
                }}
              />
            ) : (
              <Avatar
                sx={{
                  width: "100%",
                  height: "100%",
                  borderRadius: "12px",
                  bgcolor: "primary.50",
                  color: "primary.600",
                  fontSize: "2rem",
                  fontWeight: "bold"
                }}
              >
                {(salon?.name || "S").charAt(0).toUpperCase()}
              </Avatar>
            )}
          </Box>

          <Box className={styles.titleAndOwnerBox}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
              <Typography variant="h5" fontWeight="bold" color="text.primary" textTransform="capitalize">
                {salon?.name || "-"}
              </Typography>
              {salon?.type && (
                <Box
                  sx={{
                    backgroundColor: "success.light",
                    color: "success.dark",
                    border: "1px solid",
                    borderColor: "var(--success-200)",
                    borderRadius: "6px",
                    px: 1.5,
                    py: 0.25,
                    fontSize: "0.75rem",
                    fontWeight: "600",
                    textTransform: "capitalize"
                  }}
                >
                  {salon.type}
                </Box>
              )}
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mt: 0.5, color: "text.secondary" }}>
              <PersonIcon sx={{ fontSize: 16, color: "primary.main" }} />
              <Typography variant="paragraphSm" color="text.secondary">
                Managed by{" "}
                <Typography component="span" variant="paragraphSm" fontWeight="600" color="text.primary">
                  {salon?.owner_name || "-"}
                </Typography>
              </Typography>
            </Box>
          </Box>
        </Box>

        <Box className={styles.contactDetailsCard}>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Box>
                <Typography
                  variant="paragraphXs"
                  fontWeight="bold"
                  color="text.secondary"
                  sx={{ textTransform: "uppercase", letterSpacing: 0.5, display: "block", mb: 0.5 }}
                >
                  Registered Email
                </Typography>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, color: "text.primary" }}>
                  <EmailIcon sx={{ fontSize: 18, color: "primary.main" }} />
                  <Typography variant="paragraphMd" sx={{ wordBreak: "break-all" }}>{salon?.email || "-"}</Typography>
                </Box>
              </Box>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <Box>
                <Typography
                  variant="paragraphXs"
                  fontWeight="bold"
                  color="text.secondary"
                  sx={{ textTransform: "uppercase", letterSpacing: 0.5, display: "block", mb: 0.5 }}
                >
                  Contact Number
                </Typography>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, color: "text.primary" }}>
                  <PhoneIcon sx={{ fontSize: 18, color: "primary.main" }} />
                  <Typography variant="paragraphMd">
                    {salon?.phone ? `+91 ${salon.phone}` : "-"}
                  </Typography>
                </Box>
              </Box>
            </Grid>

            <Grid size={{ xs: 12 }}>
              <Box>
                <Typography
                  variant="paragraphXs"
                  fontWeight="bold"
                  color="text.secondary"
                  sx={{ textTransform: "uppercase", letterSpacing: 0.5, display: "block", mb: 0.5 }}
                >
                  Primary Address
                </Typography>
                <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1, color: "text.primary" }}>
                  <LocationOnIcon sx={{ fontSize: 18, color: "primary.main", mt: 0.25 }} />
                  <Typography variant="paragraphMd" sx={{ wordBreak: "break-word" }}>{salon?.address || "-"}</Typography>
                </Box>
              </Box>
            </Grid>
          </Grid>

          {salon?.map_link && (
            <Box sx={{ pt: 2, mt: 2, borderTop: "1px solid", borderColor: "var(--secondary-200)", display: "flex" }}>
              <Box
                component="a"
                href={salon.map_link}
                target="_blank"
                rel="noopener noreferrer"
                sx={{
                  color: "primary.main",
                  fontWeight: "600",
                  fontSize: "0.875rem",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 0.5,
                  textDecoration: "none",
                  "&:hover": { color: "primary.dark" }
                }}
              >
                <LanguageIcon sx={{ fontSize: 16, color: "primary.main" }} />
                View on Google Maps
                <LaunchIcon sx={{ fontSize: 12, ml: 0.25, color: "primary.main" }} />
              </Box>
            </Box>
          )}
        </Box>

        <Box sx={{ mb: 4 }}>
          <Typography
            variant="paragraphXs"
            fontWeight="bold"
            color="text.secondary"
            sx={{ textTransform: "uppercase", letterSpacing: 0.5, display: "block", mb: 1 }}
          >
            About Our Salon
          </Typography>
          <Typography
            variant="paragraphMd"
            color="text.secondary"
            sx={{ lineHeight: 1.6, wordBreak: "break-word", whiteSpace: "pre-wrap" }}
          >
            {salon?.about || "No description provided."}
          </Typography>
        </Box>

        {(() => {
          const lat = salon?.latitude ? parseFloat(salon.latitude) : 28.6139;
          const lng = salon?.longitude ? parseFloat(salon.longitude) : 77.2090;
          return (
            <Box sx={{ mt: 4, pt: 4, borderTop: "1px solid", borderColor: "divider" }}>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 2 }}>
                <Box>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <LocationOnIcon sx={{ color: "primary.main" }} />
                    <Typography variant="h6" fontWeight="bold" color="text.primary">
                      Location & Map Integration
                    </Typography>
                  </Box>
                  <Typography variant="paragraphSm" color="text.secondary" sx={{ mt: 0.5 }}>
                    Clicking anywhere on the map simulator updates coordinates.
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ borderRadius: "16px", overflow: "hidden", border: "1px solid", borderColor: "var(--border-color)", height: 300, zIndex: 1 }}>
                <MapContainer
                  center={[lat, lng]}
                  zoom={15}
                  style={{ height: "100%", width: "100%" }}
                  zoomControl={true}
                  dragging={false}
                  doubleClickZoom={false}
                  scrollWheelZoom={false}
                  boxZoom={false}
                  keyboard={false}
                >
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution="&copy; OpenStreetMap contributors"
                  />
                  <Marker position={[lat, lng]}>
                    <MapTooltip permanent direction="top" className="leaflet-tooltip-custom">
                      {salon?.name || "Salon HQ"}
                    </MapTooltip>
                  </Marker>
                </MapContainer>
              </Box>
            </Box>
          );
        })()}
      </Box>

      <Lightbox
        open={lightboxOpen}
        close={() => setLightboxOpen(false)}
        index={lightboxIndex}
        slides={lightboxSlides}
        styles={{
          container: { backgroundColor: "rgba(0, 0, 0, 0.9)" },
        }}
        render={{
          slide: ({ slide }: any) => (
            <div className="w-full h-full flex items-center justify-center p-4">
              <img
                src={slide.src}
                alt=""
                className="max-w-full max-h-full object-contain w-full h-full"
              />
            </div>
          ),
        }}
      />
    </>
  );
};

export default ProfileViewMode;
