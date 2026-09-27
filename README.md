# Seletiva Nacional 2025 · WorldSkills Brasil

Quem é quem na competição nacional da WorldSkills Brasil / SENAI de 2025, no mesmo visual de álbum de figurinhas do [Brasil em Shanghai](https://skillex.com.br/). Quem da seletiva depois defendeu o Brasil na WorldSkills Shanghai 2026 traz na figurinha o que conquistou no mundial.

**[Abrir a página](https://guilhermevieirao.github.io/worldskills-br-2025-dashboard/)**

## O que tem

- **Álbum:** uma página por setor da WorldSkills, com uma tinta por setor. Em cada ocupação ficam as figurinhas dos competidores e, numa caixa, a equipe de avaliação e oficina. Quem não tem ocupação (coordenação, delegados técnicos, chefes de equipe, organização e comunicação) fica em crachás, na página da comissão.
- **Mundial:** 146 registros da seletiva, de 132 pessoas, ligados ao que elas fizeram em Shanghai:
  - 58 competidores, com a medalha, a posição e a nota, e o Best of Nation;
  - 60 integrantes das equipes de ocupação (experts e intérpretes), com o resultado do Brasil na ocupação;
  - 14 integrantes da comissão da delegação.

  Prata e bronze viram figurinhas brilhantes, e a Excelência ganha o aro dourado. Quem já competiu em edições anteriores da WorldSkills tem o selo de ex-competidor.
- **Números do recorte:** tudo acompanha os filtros. São eles:
  - o resumo;
  - as medalhas em Shanghai;
  - os perfis;
  - o mapa e a tabela por estado;
  - as regiões e os setores;
  - "da seletiva ao mundial" ocupação por ocupação;
  - as ocupações, as instituições e os locais de competição;
  - os ex-competidores da WorldSkills.

  Tocar num número filtra o álbum.
- **Busca:** nome, instituição, ocupação, local, delegação e empresa. Também encontra a ocupação pelo número (com ou sem `#`), pelo nome em inglês e pela função no mundial ("expert", "intérprete").
- **Filtros:**
  - perfil, instituição, ocupação, local de competição, setor, estado, região, resultado em Shanghai e formato da ocupação;
  - grupos combináveis, com contagem;
  - "Foram a Shanghai" e "Ex-competidores da WorldSkills".

  Cada filtro ativo vira uma etiqueta com ×.
- **Verso da figurinha:** traz o que a pessoa fez no mundial e as edições anteriores da WorldSkills. Traz também os dados da seletiva: perfil, ocupação e número, instituição, delegação, empresa, local, estado e setor, além dos outros papéis da mesma pessoa. Tem link direto (`#p123`).
- **Fotos:** o verso mostra o recorte de credenciamento e, quando existe, a foto original enviada em resolução máxima (até 6000×4000).
- **Visões:** figurinhas ou lista ordenável, e cópia do recorte em CSV.

Ninguém foi acrescentado: a página mostra só os 943 registros do painel público. A informação do mundial entra apenas para quem já está nele.

## Publicação

O GitHub Pages publica o branch `gh-pages`, que tem só o site:
- `index.html`;
- os pacotes de fotos em `fotos/`;
- `404.html`, `robots.txt`, `sitemap.xml`, `llms.txt`, a imagem de prévia `og.jpg` e o favicon;
- `worldskills-br-2025-dashboard.html`, que redireciona o endereço antigo, inclusive o link direto de cada pessoa.

O código-fonte fica no `main`, fora do ar.

O arquivo `worldskills-br-2025-dashboard.html` do `main` é a versão independente. Ele traz dados, miniaturas, fontes e ícone embutidos e abre sem internet.

## Dados

- **Participantes (`data/pessoas.json`):** os campos do [painel público "Quem é Quem"](https://app.powerbi.com/view?r=eyJrIjoiZjU5YzMwMmEtNTQzZS00MzEzLThhZTYtMGQ4M2Y4ODAxY2YwIiwidCI6IjZkNmJjYzNmLWJkYTEtNGY1NC1hZjFkLTg2ZDRiN2Q0ZTZiOCJ9) (Power BI):
  - nome, instituição, perfil, ocupação e número da ocupação;
  - local, delegação, empresa e foto de credenciamento.

  Três registros trazem uma data no campo "empresa", no lugar do nome da empresa; essas datas não entram na página. Campos pessoais do modelo de origem (CPF, e-mail, celular e data de nascimento) nunca foram extraídos.
- **Mundial (`data/mundial.json`):** gerado a partir do `data.json` do álbum [Resultado Brasil na WorldSkills 2026 Shangai](https://github.com/guilhermevieirao/Resultado-Brasil-na-WorldSkills-2026-Shangai). O álbum já guarda os registros de cada pessoa da delegação na etapa nacional, conferidos por nome e foto.
- **Fotos:** todas são publicadas sem recompressão. O endereço do painel (terminado em `_accreditation`) entrega o recorte 3:4 de 600×800. O mesmo endereço sem esse sufixo entrega a foto que a pessoa enviou, maior em 735 das 870 fotos.
  - Na página independente vão as miniaturas 240×320.
  - No site, as figurinhas trocam a miniatura pelo recorte 600×800, e o verso oferece a original.
- **Contornos dos estados (`data/brmap.json`):** [@svg-maps/brazil](https://github.com/VictorCazanave/svg-maps/tree/master/packages/brazil), de Victor Cazanave (CC BY 4.0).

## Estrutura

```
page.template.html                 → página, estilos e scripts (fonte)
build.py                           → monta a versão independente e o site (em site/)
worldskills-br-2025-dashboard.html → versão independente (gerada)
site/                              → worktree do branch gh-pages (gerado, fora do main)
tools/build_mundial.py             → liga a seletiva ao mundial (gera data/mundial.json)
tools/favicon.png, tools/og.jpg    → ícone e imagem de prévia do link
data/                              → pessoas.json, mundial.json, brmap.json

fetch.mjs                          → coleta os registros de origem
fotos_raw.py                       → baixa os recortes de credenciamento (data/raw)
fotos_orig.py                      → baixa as fotos originais em resolução máxima (data/orig)
fotos_hq.py                        → gera as miniaturas (data/thumbs)
pack_originals*.py                 → empacotam as fotos em .zip
```

## Como gerar e publicar

Pré-requisitos: Python 3.10+ com Pillow (`pip install Pillow`). Para refazer os dados do zero, também Node.js 18+.

Uma vez, crie a pasta do site ligada ao branch `gh-pages`:

```bash
git worktree add site gh-pages
```

A cada mudança:

```bash
python tools/build_mundial.py
python build.py
```

O primeiro comando lê `../worldskills-brasil/app/data.json` ou o caminho passado. O segundo gera a versão independente e o site em `site/`.

Depois, faça commit e push nos dois branches: `main`, na raiz, e `gh-pages`, dentro de `site/`.

Para refazer dados e fotos do zero, antes rode:

```bash
node fetch.mjs
python fotos_raw.py
python fotos_orig.py
python fotos_hq.py
```

## Licença

Uso pessoal / educacional. Os dados pertencem à WorldSkills Brasil e ao SENAI. Os resultados do mundial vêm de results.worldskills.org. Página independente, sem vínculo oficial.
