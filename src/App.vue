<template>
  <div class="p-4 font-sans">
    <h1 class="mb-4 text-lg font-bold">File Explorer</h1>
    <ul>
      <li
        v-for="file in files"
        :key="file.id"
        class="flex cursor-pointer items-center rounded p-1 hover:bg-gray-100"
      >
        <span v-if="file.type === 'folder'">📁</span>
        <span v-else>📄</span>
        <span class="ml-2">{{ file.path }}</span>
      </li>
    </ul>

    <div class="mt-4 flex gap-2">
      <button
        @click="createFile"
        class="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
      >
        Create File
      </button>
      <button
        @click="createFolder"
        class="rounded bg-green-500 px-4 py-2 text-white hover:bg-green-600"
      >
        Create Folder
      </button>
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
