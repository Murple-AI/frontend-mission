import { beforeEach, describe, expect, it } from "vitest";

import { resetFiles, type FileItem } from "../handlers";

const API_URL = "http://localhost/api/files";

beforeEach(() => resetFiles());

describe("API 기능 검증", () => {
  it("폴더 및 파일 리스트 조회 (GET /api/files)", async () => {
    const response = await fetch(API_URL);
    expect(response.status).toBe(200);

    const data: FileItem[] = await response.json();
    expect(Array.isArray(data)).toBe(true);
  });

  it("새 파일 생성 (POST /api/files)", async () => {
    const newFile: FileItem = { id: "", type: "file", path: "/NewFile.txt" };
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newFile),
    });

    expect(response.status).toBe(201);
    const createdFile: FileItem = await response.json();
    expect(createdFile.id).toBeTruthy();
    expect(createdFile.path).toBe(newFile.path);
  });

  it("새 폴더 생성 (POST /api/files)", async () => {
    const newFolder: FileItem = { id: "", type: "folder", path: "/NewFolder" };
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newFolder),
    });

    expect(response.status).toBe(201);
    const createdFolder: FileItem = await response.json();
    expect(createdFolder.id).toBeTruthy();
    expect(createdFolder.path).toBe(newFolder.path);
  });

  it("파일 이름 수정 (PUT /api/files/:id)", async () => {
    const filesResponse = await fetch(API_URL);
    const files: FileItem[] = await filesResponse.json();
    const fileToRename = files.find((file) => file.type === "file");

    if (!fileToRename) throw new Error("No file found to rename");

    const updatedPath = "/Documents/renamed.tex";
    const response = await fetch(`${API_URL}/${fileToRename.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path: updatedPath }),
    });

    expect(response.status).toBe(200);
    const updatedFile: FileItem = await response.json();
    expect(updatedFile.path).toBe(updatedPath);
  });

  it("파일 이동 (PUT /api/files/:id)", async () => {
    const filesResponse = await fetch(API_URL);
    const files: FileItem[] = await filesResponse.json();
    const fileToMove = files.find((file) => file.type === "file");

    if (!fileToMove) throw new Error("No file found to move");

    const newPath = "/Photos/moved-file.txt";
    const response = await fetch(`${API_URL}/${fileToMove.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path: newPath }),
    });

    expect(response.status).toBe(200);
    const movedFile: FileItem = await response.json();
    expect(movedFile.path).toBe(newPath);
  });
  it("폴더 이동 (PUT /api/files/:id)", async () => {
    const filesResponse = await fetch(API_URL);
    const files: FileItem[] = await filesResponse.json();
    const folderToMove = files.find((file) => file.type === "folder");

    if (!folderToMove) throw new Error("No folder found to move");

    const newPath = "/Documents/moved-folder";
    const response = await fetch(`${API_URL}/${folderToMove.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path: newPath }),
    });

    expect(response.status).toBe(200);
    const movedFolder: FileItem = await response.json();
    expect(movedFolder.path).toBe(newPath);
  });

  it("동일한 이름의 파일 이동 방지 (PUT /api/files/:id)", async () => {
    const filesResponse = await fetch(API_URL);
    const files: FileItem[] = await filesResponse.json();
    const fileToMove = files.find(
      (file) => file.type === "file" && file.path === "/main.tex"
    );
    const existingFile = files.find(
      (file) => file.path === "/Documents/introduction.tex"
    );

    if (!fileToMove || !existingFile) throw new Error("No valid files found");

    const response = await fetch(`${API_URL}/${fileToMove.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path: existingFile.path }),
    });

    expect(response.status).toBe(409);
  });

  it("파일 삭제 (DELETE /api/files/:id)", async () => {
    const filesResponse = await fetch(API_URL);
    const files: FileItem[] = await filesResponse.json();
    const fileToDelete = files.find((file) => file.type === "file");

    if (!fileToDelete) throw new Error("No file found to delete");

    const response = await fetch(`${API_URL}/${fileToDelete.id}`, {
      method: "DELETE",
    });

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.message).toBe("Deleted");

    // 삭제 후 다시 조회하여 확인
    const updatedResponse = await fetch(API_URL);
    const updatedFiles: FileItem[] = await updatedResponse.json();
    expect(
      updatedFiles.find((file) => file.id === fileToDelete.id)
    ).toBeFalsy();
  });

  it("존재하지 않는 파일 삭제 방지 (DELETE /api/files/:id)", async () => {
    const response = await fetch(`${API_URL}/nonexistent-id`, {
      method: "DELETE",
    });

    expect(response.status).toBe(404);
  });
});
