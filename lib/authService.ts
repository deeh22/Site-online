export const authService = {
  async getCurrentUser() {
    return null;
  },

  async signIn(email: string, password: string) {
    return { user: null, error: "Login ainda não configurado" };
  },

  async signUp(email: string, password: string, name: string) {
    return { user: null, error: "Cadastro ainda não configurado" };
  },

  async signOut() {
    return { error: null };
  }
};
