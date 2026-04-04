"use client";

import { useState, useRef, useEffect } from "react";

type Task = {
  id: string;
  text: string;
  done: boolean;
  createdAt: number;
};

const STORAGE_KEY = "todo-tasks";

function loadTasks(): Task[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveTasks(tasks: Task[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [input, setInput] = useState("");
  const [filter, setFilter] = useState<"all" | "active" | "done">("all");
  const inputRef = useRef<HTMLInputElement>(null);
  const isComposingRef = useRef(false);

  useEffect(() => {
    setTasks(loadTasks());
  }, []);

  const updateTasks = (next: Task[]) => {
    setTasks(next);
    saveTasks(next);
  };

  const addTask = () => {
    const text = input.trim();
    if (!text) return;
    const newTask: Task = {
      id: crypto.randomUUID(),
      text,
      done: false,
      createdAt: Date.now(),
    };
    updateTasks([newTask, ...tasks]);
    setInput("");
    inputRef.current?.focus();
  };

  const toggleTask = (id: string) => {
    updateTasks(tasks.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));
  };

  const deleteTask = (id: string) => {
    updateTasks(tasks.filter((t) => t.id !== id));
  };

  const filteredTasks = tasks.filter((t) => {
    if (filter === "active") return !t.done;
    if (filter === "done") return t.done;
    return true;
  });

  const activeCount = tasks.filter((t) => !t.done).length;
  const doneCount = tasks.filter((t) => t.done).length;

  return (
    <main className="min-h-screen flex flex-col items-center px-4 py-16 bg-[#f8f7f4]">
      {/* ヘッダー */}
      <div className="w-full max-w-md mb-10 text-center">
        <div className="inline-flex items-center gap-2 mb-1">
          <span className="text-2xl">✓</span>
          <h1 className="text-3xl font-bold tracking-tight text-[#1a1a2e]">
            ToDo リスト
          </h1>
        </div>
        <p className="text-sm text-gray-400">
          {activeCount > 0
            ? `残り ${activeCount} 件のタスク`
            : doneCount > 0
            ? "すべて完了！お疲れ様です"
            : "タスクを追加してみましょう"}
        </p>
      </div>

      {/* 入力エリア */}
      <div className="w-full max-w-md mb-6">
        <div className="flex gap-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onCompositionStart={() => { isComposingRef.current = true; }}
            onCompositionEnd={() => { isComposingRef.current = false; }}
            onKeyDown={(e) => e.key === "Enter" && !isComposingRef.current && addTask()}
            placeholder="新しいタスクを入力..."
            className="flex-1 px-3 py-2 text-sm bg-transparent outline-none text-[#1a1a2e] placeholder:text-gray-300"
          />
          <button
            onClick={addTask}
            disabled={!input.trim()}
            className="px-4 py-2 rounded-xl text-sm font-medium bg-[#1a1a2e] text-white transition-all hover:bg-[#2d2d4e] disabled:opacity-30 disabled:cursor-not-allowed active:scale-95"
          >
            追加
          </button>
        </div>
      </div>

      {/* フィルター */}
      {tasks.length > 0 && (
        <div className="w-full max-w-md mb-4">
          <div className="flex gap-1 bg-white rounded-xl border border-gray-100 p-1 shadow-sm">
            {(
              [
                { key: "all", label: `すべて (${tasks.length})` },
                { key: "active", label: `未完了 (${activeCount})` },
                { key: "done", label: `完了 (${doneCount})` },
              ] as const
            ).map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setFilter(key)}
                className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  filter === key
                    ? "bg-[#1a1a2e] text-white shadow-sm"
                    : "text-gray-400 hover:text-gray-600"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* タスクリスト */}
      <div className="w-full max-w-md space-y-2">
        {filteredTasks.length === 0 && (
          <div className="text-center py-16 text-gray-300 text-sm">
            {filter === "done"
              ? "完了したタスクはありません"
              : filter === "active"
              ? "未完了のタスクはありません"
              : "タスクがありません"}
          </div>
        )}

        {filteredTasks.map((task) => (
          <div
            key={task.id}
            className="task-enter flex items-center gap-3 bg-white rounded-2xl border border-gray-100 px-4 py-3.5 shadow-sm group transition-all hover:shadow-md"
          >
            {/* チェックボックス */}
            <button
              onClick={() => toggleTask(task.id)}
              className={`flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                task.done
                  ? "bg-emerald-400 border-emerald-400"
                  : "border-gray-200 hover:border-emerald-400"
              }`}
              aria-label={task.done ? "未完了に戻す" : "完了にする"}
            >
              {task.done && (
                <svg
                  className="w-2.5 h-2.5 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={3}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              )}
            </button>

            {/* タスクテキスト */}
            <span
              className={`flex-1 text-sm leading-relaxed transition-all ${
                task.done ? "line-through text-gray-300" : "text-[#1a1a2e]"
              }`}
            >
              {task.text}
            </span>

            {/* 削除ボタン */}
            <button
              onClick={() => deleteTask(task.id)}
              className="opacity-0 group-hover:opacity-100 flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-gray-300 hover:text-red-400 hover:bg-red-50 transition-all"
              aria-label="削除"
            >
              <svg
                className="w-3.5 h-3.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        ))}
      </div>

      {/* 完了済みを一括削除 */}
      {doneCount > 0 && (
        <div className="w-full max-w-md mt-6 text-center">
          <button
            onClick={() => updateTasks(tasks.filter((t) => !t.done))}
            className="text-xs text-gray-300 hover:text-red-400 transition-colors underline underline-offset-2"
          >
            完了済みを削除 ({doneCount})
          </button>
        </div>
      )}
    </main>
  );
}
