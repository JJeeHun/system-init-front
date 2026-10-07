import { Route, Routes } from "react-router-dom"

export default function App() {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <main className="flex min-h-screen items-center justify-center bg-slate-50">
            <div className="text-center">
              <h1 className="text-2xl font-semibold text-slate-900">system-init-front</h1>
              <p className="mt-2 text-sm text-slate-600">Frontend environment is ready.</p>
            </div>
          </main>
        }
      />
    </Routes>
  )
}
