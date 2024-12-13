import { http, HttpResponse } from "msw";

export type FileItem = {
  id: string;
  type: "folder" | "file";
  path: string;
};
const INITIAL_FILES: FileItem[] = [
  { id: crypto.randomUUID(), type: "folder", path: "/Documents" },
  { id: crypto.randomUUID(), type: "folder", path: "/Photos" },
  {
    id: crypto.randomUUID(),
    type: "file",
    path: "/Documents/introduction.tex",
  },
  { id: crypto.randomUUID(), type: "file", path: "/Photos/sample.png" },
  { id: crypto.randomUUID(), type: "file", path: "/main.tex" },
];

let files: FileItem[] = structuredClone(INITIAL_FILES);
export const resetFiles = () => {
  files = structuredClone(INITIAL_FILES);
};

const delay = (ms: number, stdDev: number = ms * 0.1) => {
  const gaussianRandom = () => {
    let u = 1 - Math.random(); // (0,1] 범위의 난수
    let v = Math.random(); // [0,1) 범위의 난수
    return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
  };

  const randomMs = Math.max(0, ms + gaussianRandom() * stdDev); // 음수 방지
  return new Promise((resolve) => setTimeout(resolve, randomMs));
};

export const handlers = [
  // 폴더 및 파일 리스트 조회
  http.get<never, FileItem[]>("http://localhost/api/files", async () => {
    await delay(500);
    return HttpResponse.json(files);
  }),

  // 파일/폴더 생성
  http.post<FileItem, FileItem>(
    "http://localhost/api/files",
    async ({ request }) => {
      await delay(500);
      try {
        const newFile = await request.json();
        if (!newFile.type || !newFile.path) {
          return HttpResponse.json(
            { message: "Invalid data: type and path are required" },
            { status: 400 }
          );
        }
        if (files.some((file) => file.path === newFile.path)) {
          return HttpResponse.json(
            { message: "File already exists at this path" },
            { status: 409 }
          );
        }
        newFile.id = crypto.randomUUID();
        files.push(newFile);

        return HttpResponse.json(newFile, { status: 201 });
      } catch (error) {
        return HttpResponse.json(
          { message: "Invalid request body" },
          { status: 400 }
        );
      }
    }
  ),

  // 파일/폴더 수정 (이름 변경 및 이동)
  http.put<Partial<FileItem>, FileItem>(
    "http://localhost/api/files/:id",
    async ({ params, request }) => {
      await delay(500);
      try {
        const { id } = params;
        const updatedFile = await request.json();
        const targetFile = files.find((file) => file.id === id);
        const index = files.findIndex((file) => file.id === id);

        if (!targetFile) {
          return HttpResponse.json(
            { message: "File not found" },
            { status: 404 }
          );
        }

        if (updatedFile.path) {
          const existingFile = files.find(
            (file) => file.path === updatedFile.path && file.id !== id
          );
          if (existingFile) {
            return HttpResponse.json(
              { message: "File already exists at this path" },
              { status: 409 }
            );
          }
          // 폴더
          if (targetFile.type === "folder") {
            const pathToMove = targetFile.path;
            files = files.map((file) => {
              if (file.path.startsWith(pathToMove)) {
                const updatedPath = updatedFile.path + file.path.slice(pathToMove.length);
                if (files.some((f) => f.path === updatedPath)) {
                  return file;
                }
                return {
                  ...file,
                  path: updatedFile.path + file.path.slice(pathToMove.length),
                };
              }
              return file;
            });
          }
        }

        files[index] = { ...files[index], ...updatedFile };
        return HttpResponse.json(files[index]);
      } catch (error) {
        return HttpResponse.json(
          { message: "Invalid request body" },
          { status: 400 }
        );
      }
    }
  ),

  // 파일/폴더 삭제 (하위 파일/폴더 포함)
  http.delete<never, { message: string }>(
    "http://localhost/api/files/:id",
    async ({ params }) => {
      await delay(500);
      const { id } = params;
      const targetFile = files.find((file) => file.id === id);

      if (!targetFile) {
        return HttpResponse.json(
          { message: "File not found" },
          { status: 404 }
        );
      }

      // 하위 폴더 및 파일도 삭제
      const pathToDelete = targetFile.path;
      files = files.filter((file) => !file.path.startsWith(pathToDelete));

      return HttpResponse.json({ message: "Deleted" });
    }
  ),
];
