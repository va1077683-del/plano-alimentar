# 📱 Plano Alimentar — PWA

App de acompanhamento de calorias que funciona como aplicativo no Android.

---

## 🚀 Como colocar no ar (GitHub Pages)

### Passo 1 — Criar repositório
1. Acesse [github.com](https://github.com) e faça login
2. Clique em **"New"** (botão verde no canto superior esquerdo)
3. Nome do repositório: `plano-alimentar`
4. Deixe como **Public**
5. Clique em **"Create repository"**

### Passo 2 — Subir os arquivos
Na página do repositório recém-criado, clique em **"uploading an existing file"**

Arraste todos estes arquivos de uma vez:
- `index.html`
- `style.css`
- `app.js`
- `sw.js`
- `manifest.json`
- `icon-192.png`
- `icon-512.png`

Clique em **"Commit changes"**

### Passo 3 — Ativar GitHub Pages
1. Vá em **Settings** (aba no topo do repositório)
2. No menu lateral, clique em **Pages**
3. Em "Source", selecione **Deploy from a branch**
4. Branch: **main** → pasta: **/ (root)**
5. Clique em **Save**

Aguarde ~2 minutos e seu app estará em:
```
https://SEU_USUARIO.github.io/plano-alimentar/
```

---

## 📲 Instalar no Android como app

1. Abra o link acima no **Chrome** do Android
2. Toque nos **3 pontinhos** (menu do Chrome)
3. Toque em **"Adicionar à tela inicial"**
4. Confirme

Pronto! O app aparece na sua tela inicial igual a qualquer outro app.

---

## 🤖 Configurar a IA (busca automática de calorias)

O app usa a API da Anthropic para buscar calorias de alimentos não cadastrados.

1. Acesse [console.anthropic.com](https://console.anthropic.com)
2. Crie uma conta (gratuita para começar)
3. Vá em **API Keys** e crie uma chave
4. No app, toque no **ícone ⚙️** no canto superior direito
5. Cole a chave no campo "Chave da API Anthropic"
6. Salve

> Sem a chave, o app funciona normalmente — você só preenche as calorias manualmente para alimentos não cadastrados.

---

## ✨ Funcionalidades

- ✅ Registro de refeições por tipo (café, almoço, lanche, jantar, ceia)
- ✅ Cálculo automático de calorias (gramas × kcal/100g)
- ✅ Meta diária com barra de progresso
- ✅ Gasto basal ajustável por tipo de treino
- ✅ Busca de calorias por IA para alimentos novos
- ✅ Banco de alimentos com +40 itens pré-cadastrados do seu Excel
- ✅ Histórico de pesagem com estatísticas
- ✅ Funciona offline
- ✅ Dados salvos no celular (localStorage)

---

## 📊 Lógica de treino (igual ao Excel)

| Treino | Meta (kcal) | Basal (kcal) |
|--------|------------|--------------|
| Nenhum | 1800 | 2200 |
| Musculação | 1800 | 2750 |
| Futebol | 1800 | 2800 |
| Caminhada | 1800 | 2600 |
| Musc + Caminhada | 1800 | 2800 |
| Musc + Futebol | 1950 | 3100 |
