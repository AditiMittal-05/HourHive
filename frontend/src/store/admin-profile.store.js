import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useAdminProfileStore = create()(
  persist(
    (set) => ({
      avatar: null,
      bio: "",
      phone: "",
      location: "",
      linkedin: "",
      github: "",
      portfolio: "",
      timezone: "Asia/Kolkata",
      language: "English",
      notifyApprovals: true,
      notifySystemAlerts: true,
      notifyNewUsers: true,
      notifyWeeklyReport: false,
      setAvatar: (avatar) => set({ avatar }),
      setBio: (bio) => set({ bio }),
      patch: (fields) => set((s) => ({ ...s, ...fields })),
    }),
    { name: "hourhive-admin-profile" }
  )
);
