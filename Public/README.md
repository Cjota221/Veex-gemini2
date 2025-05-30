# VEEX - Aplicativo de Gestão de Produção

VEEX é um aplicativo web híbrido focado em ser um sistema completo de controle de produção, precificação e gestão financeira para pequenos, médios e grandes negócios.

## 🚀 Visão Geral

O objetivo é fornecer uma ferramenta intuitiva, com visual moderno e design amigável, para otimizar os processos produtivos e a gestão financeira de empresas que trabalham com produção física.

## ✨ Funcionalidades Principais (Planejadas)

* Dashboard com resumo geral
* Gerenciamento de Modelos de Produtos
* Controle de Insumos
* Acompanhamento de Ordens de Produção
* Registro de Custos Fixos e Variáveis
* Calculadora de Preço de Venda
* Relatórios Gerenciais
* Controle Financeiro (Entradas e Saídas)
* Configurações do Sistema

## 🛠️ Tecnologias Utilizadas

* HTML5
* CSS3 (com variáveis, Flexbox, Grid)
* JavaScript Puro (ES6+ Modules)
* Design Responsivo
* Preparado para PWA (Progressive Web App) com funcionalidade Offline básica

## 🎨 Estilo Visual

* Contraste entre azul escuro (`--primary-dark-blue`, `--secondary-dark-blue`) e pink (`--accent-pink`).
* Layout em cards visuais e interativos.
* Fundo com leve degradê.
* Ícones modernos e tipografia legível (Poppins).

## 📁 Estrutura do Projeto

Consulte a estrutura de pastas detalhada no código-fonte ou na documentação inicial. Os arquivos HTML parciais das seções (Dashboard, Modelos, etc.) devem ser colocados na pasta `/pages/`.

## ⚙️ Como Executar

1.  Certifique-se de ter todos os arquivos e pastas conforme a estrutura definida.
2.  Crie os arquivos SVG de ícones na pasta `/assets/icons/` e a imagem placeholder em `/assets/img-modelos/`.
3.  Crie a pasta `/pages/` e adicione os arquivos HTML parciais (ex: `dashboard.html`, `modelos.html`).
4.  Abra o arquivo `index.html` em seu navegador.
    * Para testar a funcionalidade do Service Worker e a navegação baseada em hash corretamente, é **altamente recomendado** usar um servidor local (como o "Live Server" do VSCode, `python -m http.server`, ou similar). Abrir o `index.html` diretamente do sistema de arquivos (`file:///`) pode causar problemas com requisições fetch para arquivos locais e com o service worker.

## 🤝 Próximos Passos

* Popular a pasta `/assets/icons/` com todos os SVGs necessários.
* Criar a imagem `placeholder-modelo.png` em `/assets/img-modelos/`.
* Desenvolver o conteúdo e a lógica para todos os módulos restantes (`insumos.js`, `producao.js`, etc.) e seus respectivos HTMLs em `/pages/`.
* Implementar o carregamento de dados a partir dos arquivos `.json` na pasta `/data/` ou de uma futura API.
* Adicionar persistência de dados (ex: IndexedDB para offline, ou backend).
* Refinar estilos e funcionalidades de acordo com as necessidades.

---
