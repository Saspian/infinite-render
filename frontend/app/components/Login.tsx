import { useState, FormEvent, ChangeEvent, useEffect } from "react";

type ChildProps = {
  setLogin: React.Dispatch<React.SetStateAction<boolean>>;
};
export default function LoginPage({ setLogin }: ChildProps) {
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<boolean>(false);

  useEffect(() => {
    const isLogged = localStorage.getItem("logged")
    if (isLogged) {
      setLogin(JSON.parse(isLogged));
    }
  })

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (
      process.env.NEXT_PUBLIC_USERNAME === username &&
      process.env.NEXT_PUBLIC_PASSWORD === password
    ) {
      setLogin(true);
      localStorage.setItem("logged", JSON.stringify(true))
    } else {
      setLogin(false);
      setError(true);
    }
    console.log({ username, password });
  };

  return (
    <div className="w-full max-w-sm bg-white text-neutral-900 dark:bg-input dark:text-neutral-100 rounded-2xl shadow-lg p-8 animate-slide-up delay-100">
      <h1 className="text-2xl font-semibold text-center mb-6 text-black dark:text-neutral-100">
        Login
      </h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            setUsername(e.target.value)
          }
          className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-gray-400"
          required
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            setPassword(e.target.value)
          }
          className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-gray-400"
          required
        />

        <button
          type="submit"
          className="w-full bg-black text-white py-2 rounded-lg hover:bg-gray-800 transition cursor-pointer"
        >
          Login
        </button>
      </form>
      {error && (
        <p className="text-red-500 cursor-pointer text-center">
          Invalid credentials
        </p>
      )}
    </div>
  );
}
