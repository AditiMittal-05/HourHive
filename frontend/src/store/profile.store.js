import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useProfileStore = create()(
  persist(
    (set) => ({
      avatar: null,
      skills: [],
      bio: "",
      resumeFileName: null,
      resumeData: null,
      setAvatar: (avatar) => set({ avatar }),
      setBio: (bio) => set({ bio }),
      setSkills: (skills) => set({ skills }),
      addSkill: (skill) =>
        set((s) => ({ skills: [...s.skills.filter((sk) => sk !== skill), skill] })),
      removeSkill: (skill) =>
        set((s) => ({ skills: s.skills.filter((sk) => sk !== skill) })),
      setResume: (fileName, data) => set({ resumeFileName: fileName, resumeData: data }),
      clearResume: () => set({ resumeFileName: null, resumeData: null }),
    }),
    { name: "hourhive-profile" }
  )
);
