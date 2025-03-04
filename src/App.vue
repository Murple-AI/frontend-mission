<template>
  <div style="padding: 16px; font-family: Arial, sans-serif">
    <h1 style="font-size: 18px; font-weight: bold; margin-bottom: 16px">
      File Explorer
    </h1>
    <ul>
      <li
        v-for="file in files"
        :key="file.id"
        style="
          padding: 4px;
          cursor: pointer;
          display: flex;
          align-items: center;
        "
      >
        <span v-if="file.type === 'folder'">📁</span>
        <span v-else>📄</span>

        <span style="margin-left: 8px">{{ file.path }}</span>
      </li>
    </ul>

    <div style="margin-top: 16px; display: flex; gap: 8px">
      <button @click="createFile">새 파일</button>
      <button @click="createFolder">새 폴더</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useQuery, useMutation, useQueryClient } from "@tanstack/vue-query";
import type { FileItem } from "./mocks/handlers";

const queryClient = useQueryClient();

const fetchFiles = async () => {
  const response = await fetch("http://localhost/api/files");
  return response.json() as Promise<FileItem[]>;
};

const { data: files } = useQuery({ queryKey: ["files"], queryFn: fetchFiles });

const createFileMutation = useMutation({
  mutationFn: async () => {
    const response = await fetch("http://localhost/api/files", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "file", path: `/NewFile-${Date.now()}` }),
    });
    return response.json();
  },
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ["files"] });
  },
});

const createFolderMutation = useMutation({
  mutationFn: async () => {
    const response = await fetch("http://localhost/api/files", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "folder",
        path: `/NewFolder-${Date.now()}`,
      }),
    });
    return response.json();
  },
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ["files"] });
  },
});

const createFile = () => createFileMutation.mutate();
const createFolder = () => createFolderMutation.mutate();
</script>
