
# Front-End – Gerenciador de Tarefas

Este projeto é o Front-End de uma aplicação de gerenciamento de tarefas (To-Do),
desenvolvido para consumir uma API REST com autenticação JWT.
O foco principal do projeto é a integração com o Back-End e o funcionamento da aplicação,
não o design visual.

🔗 Back-End da aplicação:
https://github.com/AndreReis34/API-de-Tarefas 


---

## Tecnologias utilizadas

- JavaScript
- React
- Vite
- HTML
- CSS
---


## Configuração da API

Antes de rodar o projeto, é necessário configurar a URL do Back-End.
No arquivo onde a API é configurada, ajuste a constante:

```javascript
const  API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
```

## Como rodar o projeto
1️⃣ Instalar dependências

>  `npm install`

2️⃣ Rodar em ambiente de desenvolvimento

>  `npm run dev`

O projeto ficará disponível no endereço exibido no terminal
(normalmente http://localhost:5173).