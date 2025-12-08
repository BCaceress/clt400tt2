import { useRouter } from "next/navigation";

/**
 * Hook para navegação e cancelamento padronizado
 */
export const useNavigation = () => {
  const router = useRouter();

  const cancelarERedirecionarParaHome = () => {
    if (typeof window !== "undefined") {
      window.location.href = "/";
    } else {
      router.push("/");
    }
  };

  return { cancelarERedirecionarParaHome };
};
