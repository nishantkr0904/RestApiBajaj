# BFHL — Hierarchy Analyzer

REST API and frontend for the SRM Full Stack Engineering Challenge. Accepts an array of node edge strings (`X->Y`), processes hierarchical relationships, and returns structured insights including trees, cycles, invalid entries, and duplicates.

## Tech Stack

- **Backend:** Node.js, Express, CORS
- **Frontend:** HTML, CSS, JavaScript (vanilla)

## Project Structure

```
REST-API/
├── backend/
│   ├── index.js          # Express server with POST /bfhl
│   ├── package.json
│   ├── render.yaml       # Render deployment config
│   └── node_modules/
├── frontend/
│   └── index.html        # Single-page UI
└── README.md
```

## Getting Started

### Backend

```bash
cd backend
npm install
npm start
```

Server runs at `http://localhost:3000`.

### Frontend

Open `frontend/index.html` in your browser. Update the `API_URL` variable inside the file to point to your deployed backend URL when hosting.

## API

### `POST /bfhl`

**Request:**

```json
{
  "data": ["A->B", "A->C", "B->D", "C->E", "E->F", "X->Y", "Y->Z", "Z->X"]
}
```

**Response:**

```json
{
  "user_id": "nishantkumar_09042006",
  "email_id": "nishant_k@srmap.edu.in",
  "college_roll_number": "AP23110010593",
  "hierarchies": [...],
  "invalid_entries": [],
  "duplicate_edges": [],
  "summary": {
    "total_trees": 1,
    "total_cycles": 1,
    "largest_tree_root": "A"
  }
}
```

### `GET /bfhl`

Returns `{ "operation_code": 1 }`.

## Deployment

### Backend (Render)

1. Connect your GitHub repo to [Render](https://render.com)
2. Set **Root Directory** to `backend`
3. **Build Command:** `npm install`
4. **Start Command:** `npm start`

### Frontend

Host `frontend/index.html` on any static hosting (Netlify, Vercel, GitHub Pages). Update `API_URL` to your deployed backend URL.
