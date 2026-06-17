import { createFileRoute } from "@tanstack/react-router";
import { RegisterScreen } from "@/components/register-screen";

export const Route = createFileRoute("/register")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Criar conta — VEKTOR A.I" },
      { name: "description", content: "Crie seu workspace VEKTOR A.I em minutos." },
    ],
  }),
  component: RegisterPage,
});

function RegisterPage() {
  return <RegisterScreen />;
}
