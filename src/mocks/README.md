# 📘 API 스펙 문서

## **1. 개요**

이 API는 파일 및 폴더 관리 기능을 제공합니다. 폴더 및 파일을 계층 구조(Tree)로 관리하며, 생성, 수정, 이동 및 삭제 기능을 지원합니다.

## **2. API 목록**

| 메서드 | 엔드포인트       | 설명                             |
| ------ | ---------------- | -------------------------------- |
| GET    | `/api/files`     | 폴더 및 파일 리스트 조회         |
| POST   | `/api/files`     | 새 파일 또는 폴더 생성           |
| PUT    | `/api/files/:id` | 파일 또는 폴더 이름 수정 및 이동 |
| DELETE | `/api/files/:id` | 파일 또는 폴더 삭제              |

---

## **3. API 상세**

### **1️⃣ 폴더 및 파일 리스트 조회**

**🔹 Request**

```http
GET /api/files HTTP/1.1
Host: example.com
```

**🔹 Response**

```json
HTTP/1.1 200 OK
Content-Type: application/json

[
  { "id": "1", "type": "folder", "path": "/Documents" },
  { "id": "2", "type": "file", "path": "/Documents/file.txt" }
]
```

**🔹 설명**

- `type`: `folder` 또는 `file`
- `path`: 루트를 포함한 전체 경로

---

### **2️⃣ 새 파일 또는 폴더 생성**

**🔹 Request**

```http
POST /api/files HTTP/1.1
Content-Type: application/json

{
  "type": "file",
  "path": "/NewFile.txt"
}
```

**🔹 Response (성공)**

```json
HTTP/1.1 201 Created
Content-Type: application/json

{
  "id": "3",
  "type": "file",
  "path": "/NewFile.txt"
}
```

**🔹 Response (에러: 이미 존재하는 경우)**

```json
HTTP/1.1 409 Conflict
Content-Type: application/json

{
  "message": "File or folder with this path already exists"
}
```


---

### **3️⃣ 파일 또는 폴더 이름 수정 및 이동**

**🔹 Request**

```http
PUT /api/files/3 HTTP/1.1
Content-Type: application/json

{
  "path": "/Documents/UpdatedFile.txt"
}
```

**🔹 Response (성공)**

```json
HTTP/1.1 200 OK
Content-Type: application/json

{
  "id": "3",
  "type": "file",
  "path": "/Documents/UpdatedFile.txt"
}
```

**🔹 Response (에러: 동일한 이름이 존재할 경우)**

```json
HTTP/1.1 409 Conflict
Content-Type: application/json

{
  "message": "File already exists at this path"
}
```

**🔹 설명**

- `path` 값을 변경하여 이동 가능 (단, 동일한 위치에 같은 이름이 있으면 오류 발생)

---

### **4️⃣ 파일 또는 폴더 삭제**

**🔹 Request**

```http
DELETE /api/files/3 HTTP/1.1
```

**🔹 Response (성공)**

```json
HTTP/1.1 200 OK
Content-Type: application/json

{
  "message": "Deleted"
}
```

**🔹 Response (에러: 존재하지 않는 경우)**

```json
HTTP/1.1 404 Not Found
Content-Type: application/json

{
  "message": "File not found"
}
```

**🔹 설명**

- 폴더를 삭제하면 하위 폴더 및 파일도 함께 삭제됨
