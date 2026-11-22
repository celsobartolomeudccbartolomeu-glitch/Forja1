# 🔥 FORJA — Onde o código ganha forma

> **Comunidade de programação, IDE web e biblioteca tech.**  
> Desenvolvido inteiramente no telemóvel Android usando Acode, TrebEdit e Termux.

[![Netlify Status](https://api.netlify.com/api/v1/badges/SEU-ID-DO-NETLIFY/deploy-status)](https://app.netlify.com/sites/forja/deploys)

## 🚀 Sobre o Projeto

O FORJA é uma plataforma onde programadores autodidatas podem partilhar projetos, trechos de código e vídeos. Inclui uma **IDE integrada** que suporta JavaScript, HTML e a linguagem experimental **FORJA·lang** (com palavras-chave em português).

### ✨ Funcionalidades Principais
-   **Comunidade:** Publicação de projetos, snippets de código e vídeos.
-   **IDE Web:** Editor com realce de sintaxe, consola isolada e pré-visualização HTML ao vivo.
-   **FORJA·lang:** Interpretador demo com sintaxe em PT (`var`, `mostra`, `se`, `enquanto`).
-   **Biblioteca Tech:** Livros recomendados e dicas práticas para desenvolvimento mobile.
-   **Modo Demo Local:** Funciona 100% offline via `localStorage` sem necessidade de servidor.
-   **Supabase Ready:** Preparado para autenticação real, base de dados e storage de vídeos.

## 🛠️ Stack Tecnológica

| Tecnologia | Uso |
| :--- | :--- |
| **HTML5 / CSS3** | Estrutura semântica e design responsivo dark-mode |
| **JavaScript (Vanilla)** | Lógica completa, interpretador e manipulação DOM |
| **Supabase** | Auth, PostgreSQL, Storage e Realtime (opcional) |
| **Termux + Python** | Servidor de desenvolvimento local (`http.server`) |
| **Acode / TrebEdit** | Editores de código no Android |
| **Netlify** | Hospedagem estática e CI/CD |

## 📱 Desenvolvimento Mobile

Este projeto prova que é possível construir aplicações web complexas apenas com um telemóvel:

1.  **Edição:** Código escrito no **Acode** ou **TrebEdit**.
2.  **Teste Local:** Servidor Python no **Termux**:
    ```bash
    cd ~/storage/shared/Download/forja
    python -m http.server 9000
    # Abrir no navegador: http://localhost:9000
    ```
3.  **Versionamento:** Git via Termux para push direto ao GitHub.
4.  **Deploy:** Push para `main` dispara build automático no Netlify.

## ⚙️ Configuração do Supabase (Opcional)

Para ativar a base de dados real e autenticação:

1.  Crie um projeto no [Supabase](https://supabase.com).
2.  Vá ao **SQL Editor** e execute o ficheiro [`schema.sql`](schema.sql).
3.  Copie o **Project URL** e a **anon public key**.
4.  Atualize o ficheiro [`config.js`](config.js):
    ```js
    window.FORJA_CONFIG = {
      supabaseUrl: "https://xyz.supabase.co",
      supabaseAnonKey: "sua-chave-anon-aqui"
    };
    ```
5.  Faça commit e push. O Netlify atualizará automaticamente.

> ⚠️ **Segurança:** Nunca coloque a `service_role key` no `config.js`. Use apenas a chave anónima pública.

## 📂 Estrutura do Projeto
