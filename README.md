<div align="center">

# ⚔️ RIFT DRAFT - Sorteador de Times de League of Legends

**O sorteador de equipes definitivo para partidas personalizadas com os amigos em Summoner's Rift.**

Cadastre seus amigos, defina o Elo de cada um e faça sorteios perfeitamente equilibrados ou no modo caos!

[![GitHub Pages](https://img.shields.io/badge/Demo-Online_no_GitHub_Pages-0ac8b9?style=for-the-badge&logo=github)](https://gaicos.github.io/sorteadorde-time/)
[![League of Legends](https://img.shields.io/badge/Tema-League_of_Legends_Hextech-c8aa6e?style=for-the-badge&logo=riotgames)](https://github.com/Gaicos/sorteadorde-time)
[![JavaScript](https://img.shields.io/badge/Vanilla_JS-ES6+-f7df1e?style=for-the-badge&logo=javascript&logoColor=black)](https://github.com/Gaicos/sorteadorde-time)

<br/>

<img src="https://raw.githubusercontent.com/RiotGames/developer-relations/master/branding/hextech/assets/hextech-wallpaper-1920x1080.jpg" alt="Summoners Rift Banner" width="100%" style="border-radius: 8px; border: 2px solid #c8aa6e; box-shadow: 0 0 20px rgba(200, 170, 110, 0.4);" />

</div>

---

## 📌 Sumário
- [Sobre o Projeto](#-sobre-o-projeto)
- [Funcionalidades Principais](#-funcionalidades-principais)
- [Telas e Modos](#-telas-e-modos)
- [Como Jogar e Usar](#-como-jogar-e-usar)
- [Mapa de Comandos Git (Como Subir no GitHub)](#-mapa-de-comandos-git)
- [Como Ativar o GitHub Pages](#-como-ativar-o-site-online-grátis-github-pages)
- [Tecnologias Utilizadas](#-tecnologias-utilizadas)
- [Autor](#-autor)

---

## 📖 Sobre o Projeto

Quem joga partidas personalizadas (in-house) de League of Legends com amigos sabe como é difícil:
1. Conseguir dividir os times sem que ninguém reclame que ficou fraco.
2. Definir quem vai em cada rota (*Top, Jungle, Mid, ADC, Suporte*).
3. Ter que digitar tudo do zero toda vez no Discord.

O **Rift Draft** resolve tudo isso com uma interface inspirada na tecnologia **Hextech** oficial da Riot Games, com som, animações e algoritmos de balanceamento de MMR!

---

## ⚡ Funcionalidades Principais

- 👥 **Cadastro de Amigos & Roster Salvo**:
  - Cadastre todos os amigos do seu grupo com seus respectivos nicks.
  - Selecione o **Elo** de cada amigo (do 🪙 Ferro ao 👑 Desafiante).
  - Altere o elo diretamente na lista quando seu amigo subir ou descer de ranking.
  - **Checkbox de Presença**: Cadastre 15 ou 20 amigos e apenas marque no checkbox quem está na call jogando hoje!
  - Os amigos ficam salvos automaticamente no navegador (`localStorage`).

- ⚖️ **Sorteio Balanceado por Elo**:
  - Algoritmo que calcula as permutações dos jogadores selecionados e entrega duas equipes com **MMR e força média equilibrados**.
  - Exibe a tag de equilíbrio (*Diferença de MMR: 0 - Equilíbrio Perfeito*).
  - Switch para alternar entre **Sorteio por Elo** e **Aleatório Puro**.

- 🎮 **Modos 5x5, 4x4 e Livre**:
  - **5 vs 5**: 10 invocadores com atribuição das 5 rotas oficiais.
  - **4 vs 4**: 8 invocadores (Top, Jungle, Mid e Bot).
  - **Livre**: qualquer número par de jogadores.
  - Os excedentes vão automaticamente para o **Banco de Reservas / Espectadores**.

- 🗡️ **Sorteio de Rotas (Lanes)**:
  - Distribui automaticamente as rotas com ícones estilizados:
    - 🗡️ **TOP** (Topo)
    - 🌿 **JG** (Selva)
    - ⚡ **MID** (Meio)
    - 🏹 **ADC** (Atirador)
    - 🛡️ **SUP** (Suporte)

- 🔊 **Efeitos Sonoros Integrados (Web Audio API)**:
  - Sons sintetizados direto no navegador (sem carregar áudios externos pesados):
    - Clique metálico de botão.
    - Giro rápido de invocadores.
    - Acorde triunfal de *Lock-In* na revelação das equipes.
    - Botão de mutar/desmutar a qualquer momento.

- 📋 **Inscrição em Massa**:
  - Copie uma lista inteira de nomes do Discord ou WhatsApp e cole tudo de uma vez.

- 💬 **Exportação Pronta para o Discord**:
  - Botão de 1 clique que gera a mensagem formatada com emojis, lanes, elos e dados de MMR para colar no chat da galera:
  
  ```markdown
  ⚔️ **CONFRONTO EM SUMMONER'S RIFT** ⚔️
  *Modo:* 5x5 • *Sorteio:* Equilibrado por Elo ⚖️

  🟦 **LADO AZUL** (MMR: 28 • Média: Ouro)
  🗡️ **TOP**: Zeus [💠 Diamante]
  🌿 **JG**: Oner [🔷 Platina]
  ⚡ **MID**: Faker [👑 Desafiante]
  🏹 **ADC**: Gumayusi [💠 Diamante]
  🛡️ **SUP**: Keria [🔮 Mestre]

  🟥 **LADO VERMELHO** (MMR: 28 • Média: Ouro)
  🗡️ **TOP**: Doran [💠 Diamante]
  🌿 **JG**: Peanut [🔮 Mestre]
  ⚡ **MID**: Chovy [👑 Desafiante]
  🏹 **ADC**: Ruler [💠 Diamante]
  🛡️ **SUP**: Lehends [🔷 Platina]

  ⚖️ *Diferença de MMR: 0 (Equilíbrio Perfeito!)*
  ```

---

## 🕹️ Como Jogar e Usar

1. **Cadastre seus amigos**: Digite o Nick e selecione o Elo, depois clique em **+ Cadastrar**.
2. **Defina quem vai jogar**: Marque a caixinha ao lado do nome dos amigos que estão na partida hoje.
3. **Escolha o modo**: Selecione `5 vs 5`, `4 vs 4` ou `Livre`.
4. **Clique em SORTEAR POR ELO**: Assista à animação Hextech e confira a divisão de Lado Azul vs Lado Vermelho!
5. **Envie para o grupo**: Clique em **Copiar p/ Discord** e cole no canal de texto da call.

---

## 🗺️ Mapa de Comandos Git

> **Memorize a regra da caixa de entrega:**
> 1. `git init` ➜ Constrói a caixa vazia.
> 2. `git add .` ➜ Coloca todos os arquivos dentro da caixa.
> 3. `git commit -m "..."` ➜ Fecha a caixa e cola a etiqueta com a mensagem.
> 4. `git branch -M main` ➜ Dá o nome oficial para a sua esteira principal.
> 5. `git remote add origin URL` ➜ Coloca o endereço do destinatário (GitHub).
> 6. `git push -u origin main` ➜ Envia o caminhão para a nuvem!

### 🔹 Sequência Completa (Primeira vez que sobe o projeto):

Abra o terminal (Git Bash, PowerShell ou Prompt de Comando) na pasta do projeto e execute:

```bash
# 1. Inicia o Git na pasta
git init

# 2. Adiciona todos os arquivos para a fila de envio
git add .

# 3. Cria o primeiro registro (commit) com uma mensagem
git commit -m "feat: Sorteador de equipes de League of Legends Hextech"

# 4. Garante que o nome da branch principal seja 'main'
git branch -M main

# 5. Conecta sua pasta local ao seu repositório no GitHub
git remote add origin https://github.com/Gaicos/sorteadorde-time.git

# 6. Envia tudo para o GitHub
git push -u origin main --force
```

### 🔁 Sequência do Dia a Dia (Quando fizer qualquer alteração no código):

Depois que o repositório já estiver configurado, você só precisa de **3 comandos** para atualizar o site:

```bash
git add .
git commit -m "Atualizando estilos e correções"
git push
```

---

## 🌐 Como Ativar o Site Online Grátis (GitHub Pages)

Depois de fazer o push para o GitHub, você pode deixar o site online para todos os seus amigos acessarem pelo celular ou PC sem pagar nada:

1. Acesse seu repositório: [https://github.com/Gaicos/sorteadorde-time](https://github.com/Gaicos/sorteadorde-time)
2. Clique na aba **Settings** (Configurações) no topo.
3. No menu lateral esquerdo, clique em **Pages**.
4. Em **Build and deployment** > **Branch**:
   - Selecione a branch `main`.
   - Mantenha a pasta como `/ (root)`.
   - Clique em **Save**.
5. Aguarde cerca de 1 a 2 minutos. Atualize a página e você verá o link oficial:
   👉 **`https://gaicos.github.io/sorteadorde-time/`**

---

## 🛠️ Tecnologias Utilizadas

- **HTML5**: Estrutura semântica e acessível.
- **CSS3 Moderno**: Efeitos visuais Hextech, animações com keyframes, Glassmorphism, CSS Grid e Flexbox responsivo.
- **JavaScript Puro (Vanilla)**:
  - Algoritmo de Fisher-Yates para embaralhamento.
  - Algoritmo de minimização de delta para balanceamento por Elo.
  - **Web Audio API** para efeitos sonoros procedurais sem dependências externas.
  - **LocalStorage** para persistência dos amigos e preferências.

---

## 👤 Autor

Desenvolvido por **[Gaicos](https://github.com/Gaicos)**.  
Inspirado no universo de League of Legends da Riot Games. ⚔️
