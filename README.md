# Seletiva Nacional 2025 · WorldSkills Brasil

Quem é quem na competição nacional da WorldSkills Brasil / SENAI de 2025, no mesmo visual de álbum de figurinhas do [Brasil em Shanghai](https://skillex.com.br/). Quem da seletiva depois defendeu o Brasil na WorldSkills Shanghai 2026 traz na figurinha o que conquistou no mundial.

**[Abrir a página](https://guilhermevieirao.github.io/worldskills-br-2025-dashboard/worldskills-br-2025-dashboard.html)**

## O que tem

- **Álbum:** uma página por setor da WorldSkills, com uma tinta por setor. Em cada ocupação ficam as figurinhas dos competidores e, numa caixa, a equipe de avaliação e oficina. Quem não tem ocupação (coordenação, delegados técnicos, chefes de equipe, organização e comunicação) fica em crachás, na página da comissão.
- **Mundial:** 146 registros da seletiva, de 132 pessoas, ligados ao que elas fizeram em Shanghai:
  - 58 competidores, com a medalha, a posição e a nota, e o Best of Nation;
  - 60 integrantes das equipes de ocupação (experts e intérpretes), com o resultado do Brasil na ocupação;
  - 14 integrantes da comissão da delegação.

  Prata e bronze viram figurinhas brilhantes, e a Excelência ganha o aro dourado. Quem já competiu em edições anteriores da WorldSkills tem o selo de ex-competidor.
- **Números:** medalhas em Shanghai de quem saiu da seletiva, perfis, mapa por estado, ocupações e instituições. Tudo filtra o álbum.
- **Busca e filtros:** nome, instituição, ocupação (também pelo número, com ou sem `#`, e em inglês) e função no mundial ("expert", "intérprete"). Há filtros por perfil, instituição, ocupação, estado, grupo e "Foram a Shanghai".
- **Visões:** figurinhas ou lista ordenável. Cada pessoa abre no verso da figurinha, com link direto (`#p123`).
- **Outros recursos:** botão para copiar o recorte atual em CSV.
- **Funciona offline:** dados, fotos, fontes e ícone estão dentro do próprio HTML.

Ninguém foi acrescentado: a página mostra só os 943 registros do painel público. A informação do mundial entra apenas para quem já está nele.

## Dados

- **Participantes (`data/pessoas.json`):** nome, instituição, perfil, ocupação, número da ocupação, delegação e foto de credenciamento, como no painel público "Quem é Quem".
  - A página não usa os campos "empresa" e "local". Em alguns registros, "empresa" traz datas.
  - Campos pessoais do modelo de origem (CPF, e-mail, celular e data de nascimento) nunca foram extraídos.
- **Mundial (`data/mundial.json`):** gerado a partir do `data.json` do álbum [Resultado Brasil na WorldSkills 2026 Shangai](https://github.com/guilhermevieirao/Resultado-Brasil-na-WorldSkills-2026-Shangai). O álbum já guarda os registros de cada pessoa da delegação na etapa nacional, conferidos por nome e foto.
- **Contornos dos estados (`data/brmap.json`):** [@svg-maps/brazil](https://github.com/VictorCazanave/svg-maps/tree/master/packages/brazil), de Victor Cazanave (CC BY 4.0).
- **Fotos:** miniaturas 240×320 das fotos de credenciamento, para manter o HTML em cerca de 15 MB. As originais não ficam no repositório.

## Estrutura

```
worldskills-br-2025-dashboard.html → página final (gerada, não editar à mão)
page.template.html                 → página, estilos e scripts (fonte)
build.py                           → monta a página final com tudo embutido
tools/build_mundial.py             → liga a seletiva ao mundial (gera data/mundial.json)
tools/favicon.png                  → ícone
data/                              → pessoas.json, mundial.json, brmap.json

fetch.mjs                          → coleta os registros de origem
fotos_raw.py / fotos_hq.py         → baixam as fotos e geram as miniaturas (data/thumbs)
pack_originals*.py                 → empacotam as fotos originais em .zip
```

## Como gerar

Pré-requisitos: Python 3.10+. Para refazer as fotos do zero: Node.js 18+ e Pillow (`pip install Pillow`).

```bash
python tools/build_mundial.py    # lê ../worldskills-brasil/app/data.json (ou o caminho passado)
python build.py                  # gera worldskills-br-2025-dashboard.html
```

Para refazer os dados e as fotos do zero, antes rode:

```bash
node fetch.mjs
python fotos_raw.py
python fotos_hq.py
```

## Licença

Uso pessoal / educacional. Os dados pertencem à WorldSkills Brasil e ao SENAI. Os resultados do mundial vêm de results.worldskills.org. Página independente, sem vínculo oficial.
