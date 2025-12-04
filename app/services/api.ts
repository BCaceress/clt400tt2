// Configuração da API
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8081";

// Classe para gerenciar comunicação com a API
class ApiService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = API_BASE_URL;
  }

  // Método genérico para fazer requisições
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;

    const config: RequestInit = {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Safely handle empty responses (e.g., 204) before parsing JSON
      const contentLength = response.headers.get("content-length");
      if (response.status === 204 || contentLength === "0") {
        return undefined as T;
      }

      const text = await response.text();
      if (!text) {
        return undefined as T;
      }

      return JSON.parse(text) as T;
    } catch (error) {
      console.error("Erro na requisição:", error);
      throw error;
    }
  }

  // Métodos HTTP específicos
  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: "GET" });
  }

  async post<T>(endpoint: string, data: Record<string, unknown>): Promise<T> {
    return this.request<T>(endpoint, {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async put<T>(endpoint: string, data: Record<string, unknown>): Promise<T> {
    return this.request<T>(endpoint, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: "DELETE" });
  }

  // Métodos específicos para OS (Ordem de Serviço)
  async buscarOS(numero: string) {
    return this.get(`/api/os/${numero}`);
  }

  async listarOS() {
    return this.get("/api/os");
  }

  async criarOS(dados: Record<string, unknown>) {
    return this.post("/api/os", dados);
  }

  async atualizarOS(numero: string, dados: Record<string, unknown>) {
    return this.put(`/api/os/${numero}`, dados);
  }

  async excluirOS(numero: string) {
    return this.delete(`/api/os/${numero}`);
  }
}

// Instância singleton do serviço de API
export const apiService = new ApiService();

// Exportar também a classe para casos onde é necessário uma nova instância
export { ApiService };
