import { useEffect, useMemo, useState } from "react";
import {
  clearToken,
  getToken,
  loginUser,
  registerUser,
  listTasks,
  createTask,
  updateTask,
  deleteTask,
  toggleTask,
} from "./api";

function ErrorBox({ message }) {
  if (!message) return null;
  return (
    <div style={{ background: "#ffd7d7", padding: 10, borderRadius: 8, marginBottom: 12 }}>
      {message}
    </div>
  );
}

function Auth({ onAuth }) {
  const [mode, setMode] = useState("login"); // login | register
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  async function submit(e) {
    e.preventDefault();
    setErr("");
    setLoading(true);
    try {
      if (mode === "register") {
        await registerUser(username, password);
        // após registrar, faz login automaticamente
      }
      const res = await loginUser(username, password);
      onAuth(res.access_token);
    } catch (e2) {
      setErr(e2?.response?.data?.error || "Erro ao autenticar");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={styles.card}>
      <h2 style={{ marginTop: 0 }}>{mode === "login" ? "Login" : "Criar conta"}</h2>
      <ErrorBox message={err} />
      <form onSubmit={submit} style={{ display: "grid", gap: 10 }}>
        <label style={styles.label}>
          Usuário
          <input
            style={styles.input}
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="username"
          />
        </label>
        <label style={styles.label}>
          Senha
          <input
            style={styles.input}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete={mode === "login" ? "current-password" : "new-password"}
          />
        </label>

        <button style={styles.primaryBtn} disabled={loading || !username || !password}>
          {loading ? "Aguarde..." : mode === "login" ? "Entrar" : "Cadastrar"}
        </button>
      </form>

      <div style={{ marginTop: 12 }}>
        <button
          style={styles.linkBtn}
          onClick={() => setMode(mode === "login" ? "register" : "login")}
          type="button"
        >
          {mode === "login" ? "Criar uma conta" : "Já tenho conta"}
        </button>
      </div>
    </div>
  );
}

function TaskForm({ onCreate }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("pendente");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  async function submit(e) {
    e.preventDefault();
    setErr("");
    setLoading(true);
    try {
      await onCreate({ title, description, status });
      setTitle("");
      setDescription("");
      setStatus("pendente");
    } catch (e2) {
      setErr(e2?.response?.data?.error || "Erro ao criar tarefa");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={styles.card}>
      <h3 style={{ marginTop: 0 }}>Nova tarefa</h3>
      <ErrorBox message={err} />
      <form onSubmit={submit} style={{ display: "grid", gap: 10 }}>
        <label style={styles.label}>
          Título
          <input style={styles.input} value={title} onChange={(e) => setTitle(e.target.value)} />
        </label>

        <label style={styles.label}>
          Descrição
          <textarea
            style={{ ...styles.input, minHeight: 70 }}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </label>

        <label style={styles.label}>
          Status
          <select style={styles.input} value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="pendente">pendente</option>
            <option value="concluida">concluida</option>
          </select>
        </label>

        <button style={styles.primaryBtn} disabled={loading || !title.trim()}>
          {loading ? "Criando..." : "Criar"}
        </button>
      </form>
    </div>
  );
}

function TaskItem({ task, onToggle, onDelete, onSave }) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description || "");
  const [status, setStatus] = useState(task.status);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => {
    setTitle(task.title);
    setDescription(task.description || "");
    setStatus(task.status);
  }, [task]);

  async function save() {
    setErr("");
    setLoading(true);
    try {
      await onSave(task.id, { title, description, status });
      setEditing(false);
    } catch (e2) {
      setErr(e2?.response?.data?.error || "Erro ao salvar");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={styles.taskCard}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
        <div style={{ flex: 1 }}>
          {!editing ? (
            <>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <strong style={{ fontSize: 16 }}>{task.title}</strong>
                <span style={styles.badge(task.status)}>
                  {task.status === "concluida" ? "Concluída" : "Pendente"}
                </span>
              </div>
              {task.description ? (
                <div style={{ marginTop: 6, whiteSpace: "pre-wrap", opacity: 0.9 }}>
                  {task.description}
                </div>
              ) : null}
              <div style={{ marginTop: 8, fontSize: 12, opacity: 0.7 }}>
                Atualizada: {new Date(task.updated_at).toLocaleString()}
              </div>
            </>
          ) : (
            <div style={{ display: "grid", gap: 8 }}>
              <ErrorBox message={err} />
              <input style={styles.input} value={title} onChange={(e) => setTitle(e.target.value)} />
              <textarea
                style={{ ...styles.input, minHeight: 60 }}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
              <select style={styles.input} value={status} onChange={(e) => setStatus(e.target.value)}>
                <option value="pendente">pendente</option>
                <option value="concluida">concluida</option>
              </select>
            </div>
          )}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 8, minWidth: 140 }}>
          <button style={styles.secondaryBtn} onClick={() => onToggle(task.id)}>
            Alternar status
          </button>

          {!editing ? (
            <button style={styles.secondaryBtn} onClick={() => setEditing(true)}>
              Editar
            </button>
          ) : (
            <button style={styles.primaryBtn} disabled={loading || !title.trim()} onClick={save}>
              {loading ? "Salvando..." : "Salvar"}
            </button>
          )}

          <button style={styles.dangerBtn} onClick={() => onDelete(task.id)}>
            Excluir
          </button>

          {editing ? (
            <button style={styles.linkBtn} onClick={() => setEditing(false)} type="button">
              Cancelar
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function TaskList() {
  const [filters, setFilters] = useState({
    status: "", // "", pendente, concluida
    q: "",
    sort: "created_at",
    order: "desc",
    page: 1,
    per_page: 5,
  });

  const [data, setData] = useState(null); // retorno do backend
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const params = useMemo(() => {
    const p = {
      page: filters.page,
      per_page: filters.per_page,
      sort: filters.sort,
      order: filters.order,
    };
    if (filters.status) p.status = filters.status;
    if (filters.q.trim()) p.q = filters.q.trim();
    return p;
  }, [filters]);

  async function refresh() {
    setErr("");
    setLoading(true);
    try {
      const res = await listTasks(params);
      setData(res);
    } catch (e2) {
      setErr(e2?.response?.data?.error || "Erro ao listar tarefas");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.page, params.per_page, params.status, params.sort, params.order]); // q fica por botão

  async function onCreate(payload) {
    await createTask(payload);
    setFilters((f) => ({ ...f, page: 1 }));
    await refresh();
  }

  async function onSave(id, payload) {
    await updateTask(id, payload);
    await refresh();
  }

  async function onDelete(id) {
    if (!confirm("Excluir esta tarefa?")) return;
    await deleteTask(id);

    // se a página ficou vazia, tenta voltar uma página
    if (data?.items?.length === 1 && filters.page > 1) {
      setFilters((f) => ({ ...f, page: f.page - 1 }));
    } else {
      await refresh();
    }
  }

  async function onToggle(id) {
    await toggleTask(id);
    await refresh();
  }

  function applySearch() {
    setFilters((f) => ({ ...f, page: 1 }));
    refresh();
  }

  return (
    <div style={{ display: "grid", gap: 14 }}>
      <div style={styles.card}>
        <h2 style={{ marginTop: 0 }}>Minhas tarefas</h2>

        <div style={styles.filtersGrid}>
          <label style={styles.label}>
            Status
            <select
              style={styles.input}
              value={filters.status}
              onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value, page: 1 }))}
            >
              <option value="">todos</option>
              <option value="pendente">pendente</option>
              <option value="concluida">concluida</option>
            </select>
          </label>

          <label style={styles.label}>
            Busca
            <div style={{ display: "flex", gap: 8 }}>
              <input
                style={styles.input}
                value={filters.q}
                onChange={(e) => setFilters((f) => ({ ...f, q: e.target.value }))}
                placeholder="título ou descrição..."
              />
              <button style={styles.secondaryBtn} onClick={applySearch} type="button">
                Buscar
              </button>
            </div>
          </label>

          <label style={styles.label}>
            Ordenar por
            <select
              style={styles.input}
              value={filters.sort}
              onChange={(e) => setFilters((f) => ({ ...f, sort: e.target.value, page: 1 }))}
            >
              <option value="created_at">created_at</option>
              <option value="updated_at">updated_at</option>
              <option value="title">title</option>
              <option value="status">status</option>
              <option value="id">id</option>
            </select>
          </label>

          <label style={styles.label}>
            Ordem
            <select
              style={styles.input}
              value={filters.order}
              onChange={(e) => setFilters((f) => ({ ...f, order: e.target.value, page: 1 }))}
            >
              <option value="desc">desc</option>
              <option value="asc">asc</option>
            </select>
          </label>

          <label style={styles.label}>
            Por página
            <select
              style={styles.input}
              value={filters.per_page}
              onChange={(e) => setFilters((f) => ({ ...f, per_page: Number(e.target.value), page: 1 }))}
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
            </select>
          </label>
        </div>

        <div style={{ display: "flex", gap: 10, alignItems: "center", marginTop: 8 }}>
          <button style={styles.secondaryBtn} onClick={refresh} type="button">
            Recarregar
          </button>
          {loading ? <span style={{ opacity: 0.8 }}>Carregando...</span> : null}
        </div>

        <div style={{ marginTop: 10 }}>
          <ErrorBox message={err} />
        </div>
      </div>

      <TaskForm onCreate={onCreate} />

      <div style={styles.card}>
        <h3 style={{ marginTop: 0 }}>Lista</h3>

        {data?.items?.length ? (
          <div style={{ display: "grid", gap: 10 }}>
            {data.items.map((t) => (
              <TaskItem
                key={t.id}
                task={t}
                onToggle={onToggle}
                onDelete={onDelete}
                onSave={onSave}
              />
            ))}
          </div>
        ) : (
          <div style={{ opacity: 0.85 }}>
            {loading ? "Carregando..." : "Nenhuma tarefa encontrada."}
          </div>
        )}

        <div style={styles.paginationBar}>
          <button
            style={styles.secondaryBtn}
            onClick={() => setFilters((f) => ({ ...f, page: Math.max(1, f.page - 1) }))}
            disabled={!data?.has_prev}
            type="button"
          >
            Anterior
          </button>

          <div style={{ opacity: 0.85 }}>
            Página <strong>{data?.page || filters.page}</strong> de{" "}
            <strong>{data?.total_pages ?? "?"}</strong> — Total:{" "}
            <strong>{data?.total_items ?? "?"}</strong>
          </div>

          <button
            style={styles.secondaryBtn}
            onClick={() => setFilters((f) => ({ ...f, page: f.page + 1 }))}
            disabled={!data?.has_next}
            type="button"
          >
            Próxima
          </button>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [token, setTokenState] = useState(getToken());

  function onAuth(accessToken) {
    localStorage.setItem("token", accessToken);
    setTokenState(accessToken);
  }

  function logout() {
    clearToken();
    setTokenState(null);
  }

  return (
    <div style={styles.page}>
      <div style={styles.topbar}>
        <div style={{ fontWeight: 800 }}>To-Do 3A</div>
        {token ? (
          <button style={styles.secondaryBtn} onClick={logout} type="button">
            Sair
          </button>
        ) : null}
      </div>

      <div style={styles.container}>
        {!token ? <Auth onAuth={onAuth} /> : <TaskList />}
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "#0b1020",
    color: "#e8ecff",
    fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, Noto Sans",
  },
  topbar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "14px 18px",
    borderBottom: "1px solid rgba(255,255,255,0.08)",
    position: "sticky",
    top: 0,
    backdropFilter: "blur(8px)",
    background: "rgba(11,16,32,0.85)",
  },
  container: {
    maxWidth: 980,
    margin: "0 auto",
    padding: 18,
  },
  card: {
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 14,
    padding: 14,
  },
  taskCard: {
    background: "rgba(0,0,0,0.15)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 14,
    padding: 12,
  },
  label: { display: "grid", gap: 6, fontSize: 13, opacity: 0.95 },
  input: {
    padding: "10px 10px",
    borderRadius: 10,
    border: "1px solid rgba(255,255,255,0.12)",
    background: "rgba(0,0,0,0.22)",
    color: "#e8ecff",
    outline: "none",
  },
  primaryBtn: {
    padding: "10px 12px",
    borderRadius: 10,
    border: "1px solid rgba(255,255,255,0.14)",
    background: "rgba(106,155,255,0.35)",
    color: "#fff",
    cursor: "pointer",
    fontWeight: 650,
  },
  secondaryBtn: {
    padding: "10px 12px",
    borderRadius: 10,
    border: "1px solid rgba(255,255,255,0.14)",
    background: "rgba(255,255,255,0.06)",
    color: "#fff",
    cursor: "pointer",
    fontWeight: 600,
  },
  dangerBtn: {
    padding: "10px 12px",
    borderRadius: 10,
    border: "1px solid rgba(255,255,255,0.14)",
    background: "rgba(255,90,90,0.25)",
    color: "#fff",
    cursor: "pointer",
    fontWeight: 650,
  },
  linkBtn: {
    padding: 0,
    border: "none",
    background: "transparent",
    color: "#b9c6ff",
    cursor: "pointer",
    textDecoration: "underline",
    fontWeight: 600,
  },
  filtersGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: 12,
    marginTop: 8,
  },
  paginationBar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 10,
    marginTop: 14,
  },
  badge: (status) => ({
    padding: "4px 10px",
    borderRadius: 999,
    fontSize: 12,
    border: "1px solid rgba(255,255,255,0.14)",
    background:
      status === "concluida" ? "rgba(80, 200, 120, 0.22)" : "rgba(255, 200, 80, 0.18)",
  }),
};
